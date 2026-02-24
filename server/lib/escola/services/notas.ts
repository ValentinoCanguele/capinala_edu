import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import type { NotaInput, NotaBatchInput } from '../schemas'
import { validarNota } from '../regras/medias'
import { registarAudit } from './audit'

function getEscolaId(user: AuthUser): string {
  if (user.escolaId) return user.escolaId
  throw new Error('Usuário sem escola definida')
}

/**
 * Valida que o aluno pertence à turma e que o período pertence ao ano letivo da turma.
 */
async function validarContextoNota(
  db: ReturnType<typeof getDb>,
  escolaId: string,
  alunoId: string,
  turmaId: string,
  periodoId: string
): Promise<{ valido: boolean; erro?: string }> {
  // Verificar que a turma pertence à escola
  const turmaCheck = await db.query(
    'SELECT ano_letivo_id FROM turmas WHERE id = $1 AND escola_id = $2',
    [turmaId, escolaId]
  )
  if (turmaCheck.rows.length === 0) {
    return { valido: false, erro: 'Turma não encontrada nesta escola' }
  }

  // Verificar que o aluno está matriculado na turma
  const matriculaCheck = await db.query(
    'SELECT 1 FROM matriculas WHERE aluno_id = $1 AND turma_id = $2',
    [alunoId, turmaId]
  )
  if (matriculaCheck.rows.length === 0) {
    return { valido: false, erro: 'Aluno não está matriculado nesta turma' }
  }

  // Verificar que o período pertence ao ano letivo da turma
  const anoLetivoId = turmaCheck.rows[0].ano_letivo_id
  const periodoCheck = await db.query(
    'SELECT 1 FROM periodos WHERE id = $1 AND ano_letivo_id = $2',
    [periodoId, anoLetivoId]
  )
  if (periodoCheck.rows.length === 0) {
    return { valido: false, erro: 'Período não pertence ao ano letivo desta turma' }
  }

  return { valido: true }
}

export async function upsertNota(user: AuthUser, data: NotaInput) {
  const db = getDb()
  const escolaId = getEscolaId(user)

  // Validar valor
  const vNota = validarNota(data.valor)
  if (!vNota.valido) throw new Error(vNota.erro)

  // Validar contexto
  const vContexto = await validarContextoNota(db, escolaId, data.alunoId, data.turmaId, data.periodoId)
  if (!vContexto.valido) throw new Error(vContexto.erro)

  // Buscar valor anterior para audit
  const anterior = await db.query(
    'SELECT valor FROM notas WHERE aluno_id = $1 AND turma_id = $2 AND disciplina_id = $3 AND periodo_id = $4',
    [data.alunoId, data.turmaId, data.disciplinaId, data.periodoId]
  )
  const valorAnterior = anterior.rows[0]?.valor ?? null

  // Upsert
  await db.query(
    `INSERT INTO notas (aluno_id, turma_id, disciplina_id, periodo_id, valor)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (aluno_id, turma_id, disciplina_id, periodo_id)
     DO UPDATE SET valor = $5`,
    [data.alunoId, data.turmaId, data.disciplinaId, data.periodoId, data.valor]
  )

  // Audit log
  await registarAudit(user, {
    acao: 'lancar_nota',
    entidade: 'notas',
    entidadeId: data.alunoId,
    dadosAntes: valorAnterior !== null ? { valor: Number(valorAnterior) } : undefined,
    dadosDepois: { valor: data.valor, turmaId: data.turmaId, disciplinaId: data.disciplinaId, periodoId: data.periodoId },
  })

  const r = await db.query(
    'SELECT id, aluno_id AS "alunoId", turma_id AS "turmaId", disciplina_id AS "disciplinaId", periodo_id AS "periodoId", valor FROM notas WHERE aluno_id = $1 AND turma_id = $2 AND disciplina_id = $3 AND periodo_id = $4',
    [data.alunoId, data.turmaId, data.disciplinaId, data.periodoId]
  )
  return r.rows[0] ?? null
}

export async function saveNotasBatch(user: AuthUser, data: NotaBatchInput) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const disciplinaId = data.disciplinaId ?? (await getFirstDisciplinaForTurma(db, escolaId, data.turmaId))
  if (!disciplinaId) throw new Error('Nenhuma disciplina associada à turma')

  // Validar todas as notas primeiro
  for (const n of data.notas) {
    const vNota = validarNota(n.valor)
    if (!vNota.valido) throw new Error(`Nota inválida para aluno: ${vNota.erro}`)
  }

  let saved = 0
  for (const n of data.notas) {
    // Buscar valor anterior
    const anterior = await db.query(
      'SELECT valor FROM notas WHERE aluno_id = $1 AND turma_id = $2 AND disciplina_id = $3 AND periodo_id = $4',
      [n.alunoId, data.turmaId, disciplinaId, data.periodoId]
    )

    await db.query(
      `INSERT INTO notas (aluno_id, turma_id, disciplina_id, periodo_id, valor)
       SELECT $1, $2, $3, $4, $5
       WHERE EXISTS (SELECT 1 FROM turmas t WHERE t.id = $2 AND t.escola_id = $6)
       ON CONFLICT (aluno_id, turma_id, disciplina_id, periodo_id)
       DO UPDATE SET valor = $5`,
      [n.alunoId, data.turmaId, disciplinaId, data.periodoId, n.valor, escolaId]
    )

    // Audit por nota alterada
    const valorAnterior = anterior.rows[0]?.valor
    if (valorAnterior !== undefined && Number(valorAnterior) !== n.valor) {
      await registarAudit(user, {
        acao: 'lancar_nota',
        entidade: 'notas',
        entidadeId: n.alunoId,
        dadosAntes: { valor: Number(valorAnterior) },
        dadosDepois: { valor: n.valor },
      })
    }
    saved++
  }
  return { saved }
}

async function getFirstDisciplinaForTurma(db: ReturnType<typeof getDb>, escolaId: string, turmaId: string): Promise<string | null> {
  const r = await db.query(
    `SELECT td.disciplina_id FROM turma_disciplina td
     JOIN turmas t ON t.id = td.turma_id
     WHERE td.turma_id = $1 AND t.escola_id = $2 LIMIT 1`,
    [turmaId, escolaId]
  )
  return r.rows[0]?.disciplina_id ?? null
}

export async function getNotasByTurmaPeriodo(user: AuthUser, turmaId: string, periodoId: string, disciplinaId?: string) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  let query = `
    SELECT n.id, n.aluno_id AS "alunoId", n.turma_id AS "turmaId", n.disciplina_id AS "disciplinaId",
           n.periodo_id AS "periodoId", n.valor, p.nome AS "alunoNome"
    FROM notas n
    JOIN alunos a ON a.id = n.aluno_id
    JOIN pessoas p ON p.id = a.pessoa_id
    JOIN turmas t ON t.id = n.turma_id
    WHERE n.turma_id = $1 AND n.periodo_id = $2 AND t.escola_id = $3
  `
  const params: string[] = [turmaId, periodoId, escolaId]
  if (disciplinaId) {
    params.push(disciplinaId)
    query += ` AND n.disciplina_id = $4`
  }
  query += ' ORDER BY p.nome'
  const result = await db.query(query, params)
  return result.rows
}
