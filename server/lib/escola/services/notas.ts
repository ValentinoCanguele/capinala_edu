import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import type { NotaInput, NotaBatchInput } from '../schemas'
import { getEscolaId } from '../core/authContext'
import { validarNota, calcularNotaPelaFormula, aplicarArredondamento } from '../regras/medias'
import { validarContextoNota } from '../regras/validacoes'
import { registarAudit } from './audit'
import { getConfigPedagogica } from './configuracoes'
import { getAnoLetivoByTurma } from './turmas'

export async function upsertNota(user: AuthUser, data: NotaInput) {
  const db = getDb()
  const escolaId = getEscolaId(user)

  // Validar valor principal
  const vNota = validarNota(data.valor)
  if (!vNota.valido) throw new Error(vNota.erro)

  const vContexto = await validarContextoNota(db, escolaId, data.alunoId, data.turmaId, data.periodoId)
  if (!vContexto.valido) throw new Error(vContexto.erro)

  // 1. Obter config para rigor de cálculo
  const anoId = await getAnoLetivoByTurma(data.turmaId)
  const config = anoId ? await getConfigPedagogica(user, anoId) : null

  // 2. Recalcular valor se tiver componentes (MAC/NPP) para garantir fidelidade
  let valorFinal = data.valor
  if (data.mac !== undefined || data.npp !== undefined) {
    const raw = calcularNotaPelaFormula(
      { mac: data.mac || 0, npp: data.npp || 0, ne: data.ne || 0 },
      config?.formulaNotaTrimestral
    )
    valorFinal = aplicarArredondamento(raw, config?.tipoArredondamento, config?.casasDecimais)
  }

  // Buscar valor anterior para audit
  const anterior = await db.query(
    'SELECT valor, mac, npp, ne FROM notas WHERE aluno_id = $1 AND turma_id = $2 AND disciplina_id = $3 AND periodo_id = $4',
    [data.alunoId, data.turmaId, data.disciplinaId, data.periodoId]
  )
  const dadosAnteriores = anterior.rows[0] ?? null

  // Upsert com suporte a notas compostas e auditoria de utilizador
  await db.query(
    `INSERT INTO notas (aluno_id, turma_id, disciplina_id, periodo_id, valor, mac, npp, ne, formula_aplicada, audit_user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (aluno_id, turma_id, disciplina_id, periodo_id)
     DO UPDATE SET 
        valor = $5,
        mac = $6,
        npp = $7,
        ne = $8,
        formula_aplicada = $9,
        audit_user_id = $10,
        updated_at = NOW()`,
    [
      data.alunoId,
      data.turmaId,
      data.disciplinaId,
      data.periodoId,
      valorFinal,
      data.mac || 0,
      data.npp || 0,
      data.ne || 0,
      config?.formulaNotaTrimestral || null,
      user.id
    ]
  )

  // Audit log institucional
  await registarAudit(user, {
    acao: 'lancar_nota',
    entidade: 'notas',
    entidadeId: data.alunoId,
    dadosAntes: dadosAnteriores ? { valor: Number(dadosAnteriores.valor), mac: Number(dadosAnteriores.mac), npp: Number(dadosAnteriores.npp) } : undefined,
    dadosDepois: { valor: valorFinal, mac: data.mac, npp: data.npp, turmaId: data.turmaId, disciplinaId: data.disciplinaId, periodoId: data.periodoId },
  })

  const r = await db.query(
    'SELECT id, aluno_id AS "alunoId", turma_id AS "turmaId", disciplina_id AS "disciplinaId", periodo_id AS "periodoId", valor, mac, npp, ne FROM notas WHERE aluno_id = $1 AND turma_id = $2 AND disciplina_id = $3 AND periodo_id = $4',
    [data.alunoId, data.turmaId, data.disciplinaId, data.periodoId]
  )
  return r.rows[0] ?? null
}

export async function saveNotasBatch(user: AuthUser, data: NotaBatchInput) {
  const db = getDb()
  const escolaId = getEscolaId(user)

  // Se periodoId não vier, tentamos buscar pelo número do bimestre
  let periodoId = data.periodoId
  if (!periodoId && data.bimestre) {
    const pCheck = await db.query(
      'SELECT p.id FROM periodos p JOIN turmas t ON t.ano_letivo_id = p.ano_letivo_id WHERE t.id = $1 AND p.numero = $2',
      [data.turmaId, data.bimestre]
    )
    periodoId = pCheck.rows[0]?.id
  }

  if (!periodoId) throw new Error('Período letivo não identificado para o lançamento')

  const disciplinaId = data.disciplinaId ?? (await getFirstDisciplinaForTurma(db, escolaId, data.turmaId))
  if (!disciplinaId) throw new Error('Nenhuma disciplina associada à turma')

  let saved = 0
  for (const n of data.notas) {
    const vNota = validarNota(n.valor)
    if (!vNota.valido) throw new Error(`Nota inválida para o aluno: ${vNota.erro}`)

    // Upsert em lote com dados de precisão
    await db.query(
      `INSERT INTO notas (aluno_id, turma_id, disciplina_id, periodo_id, valor, mac, npp, ne, audit_user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (aluno_id, turma_id, disciplina_id, periodo_id)
       DO UPDATE SET 
          valor = $5,
          mac = $6,
          npp = $7,
          ne = $8,
          audit_user_id = $9`,
      [n.alunoId, data.turmaId, disciplinaId, periodoId, n.valor, n.mac || 0, n.npp || 0, n.ne || 0, user.id]
    )

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
           n.periodo_id AS "periodoId", n.valor, n.mac, n.npp, n.ne, p.nome AS "alunoNome"
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
