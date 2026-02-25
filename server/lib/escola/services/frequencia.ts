import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import {
  montarResumoFrequencia,
  type ResumoFrequencia,
} from '../regras/frequencia_rules'
import { criarAlerta } from './audit'

type StatusFrequencia = 'presente' | 'falta' | 'justificada'

function getEscolaId(user: AuthUser): string {
  if (user.escolaId) return user.escolaId
  throw new Error('Usuário sem escola definida')
}

export async function getFrequenciaByAula(user: AuthUser, aulaId: string) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    `SELECT f.id, f.aula_id AS "aulaId", f.aluno_id AS "alunoId", f.status, p.nome AS "alunoNome"
     FROM frequencia f
     JOIN aulas a ON a.id = f.aula_id
     JOIN turmas t ON t.id = a.turma_id
     JOIN alunos al ON al.id = f.aluno_id
     JOIN pessoas p ON p.id = al.pessoa_id
     WHERE f.aula_id = $1 AND t.escola_id = $2
     ORDER BY p.nome`,
    [aulaId, escolaId]
  )
  return result.rows.map((r) => ({
    id: r.id,
    aulaId: r.aulaId,
    alunoId: r.alunoId,
    alunoNome: r.alunoNome,
    status: r.status,
  }))
}

export async function saveFrequenciaBatch(
  user: AuthUser,
  aulaId: string,
  items: { alunoId: string; status: StatusFrequencia }[]
) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  for (const item of items) {
    await db.query(
      `INSERT INTO frequencia (aula_id, aluno_id, status)
       SELECT $1, $2, $3::status_frequencia
       WHERE EXISTS (
         SELECT 1 FROM aulas a
         JOIN turmas t ON t.id = a.turma_id
         WHERE a.id = $1 AND t.escola_id = $4
       )
       ON CONFLICT (aula_id, aluno_id)
       DO UPDATE SET status = $3::status_frequencia`,
      [aulaId, item.alunoId, item.status, escolaId]
    )
  }

  // Verificar alertas de frequência após salvar
  await verificarAlertasFrequencia(user, aulaId)

  return { saved: items.length }
}

/**
 * Resumo de frequência por aluno numa turma (todas as disciplinas).
 * Retorna % presença, total aulas, faltas, etc.
 */
export async function getResumoFrequencia(
  user: AuthUser,
  turmaId: string,
  disciplinaId?: string
): Promise<ResumoFrequencia[]> {
  const db = getDb()
  const escolaId = getEscolaId(user)

  let discFilter = ''
  const params: unknown[] = [turmaId, escolaId]
  if (disciplinaId) {
    params.push(disciplinaId)
    discFilter = `AND a.disciplina_id = $${params.length}`
  }

  const result = await db.query(
    `SELECT
       m.aluno_id AS "alunoId",
       p.nome AS "alunoNome",
       COUNT(f.id) AS "totalAulas",
       COUNT(f.id) FILTER (WHERE f.status = 'presente') AS "presencas",
       COUNT(f.id) FILTER (WHERE f.status = 'falta') AS "faltas",
       COUNT(f.id) FILTER (WHERE f.status = 'justificada') AS "justificadas"
     FROM matriculas m
     JOIN alunos al ON al.id = m.aluno_id
     JOIN pessoas p ON p.id = al.pessoa_id
     JOIN turmas t ON t.id = m.turma_id
     LEFT JOIN aulas a ON a.turma_id = t.id ${discFilter}
     LEFT JOIN frequencia f ON f.aula_id = a.id AND f.aluno_id = m.aluno_id
     WHERE m.turma_id = $1 AND t.escola_id = $2
     GROUP BY m.aluno_id, p.nome
     ORDER BY p.nome`,
    params
  )

  return result.rows.map((r) =>
    montarResumoFrequencia(
      r.alunoId,
      Number(r.totalAulas),
      Number(r.presencas),
      Number(r.faltas),
      Number(r.justificadas)
    )
  )
}

/**
 * Relatório de frequência para uma turma inteira.
 */
export async function getRelatorioTurma(
  user: AuthUser,
  turmaId: string
): Promise<{
  turmaId: string
  turmaNome: string
  resumos: (ResumoFrequencia & { alunoNome: string })[]
  mediaPresenca: number
  totalEmRisco: number
}> {
  const db = getDb()
  const escolaId = getEscolaId(user)

  const turmaResult = await db.query(
    `SELECT t.nome FROM turmas t WHERE t.id = $1 AND t.escola_id = $2`,
    [turmaId, escolaId]
  )
  const turmaNome = turmaResult.rows[0]?.nome ?? ''

  const resumoResult = await db.query(
    `SELECT
       m.aluno_id AS "alunoId",
       p.nome AS "alunoNome",
       COUNT(f.id) AS "totalAulas",
       COUNT(f.id) FILTER (WHERE f.status = 'presente') AS "presencas",
       COUNT(f.id) FILTER (WHERE f.status = 'falta') AS "faltas",
       COUNT(f.id) FILTER (WHERE f.status = 'justificada') AS "justificadas"
     FROM matriculas m
     JOIN alunos al ON al.id = m.aluno_id
     JOIN pessoas p ON p.id = al.pessoa_id
     JOIN turmas t ON t.id = m.turma_id
     LEFT JOIN aulas a ON a.turma_id = t.id
     LEFT JOIN frequencia f ON f.aula_id = a.id AND f.aluno_id = m.aluno_id
     WHERE m.turma_id = $1 AND t.escola_id = $2
     GROUP BY m.aluno_id, p.nome
     ORDER BY p.nome`,
    [turmaId, escolaId]
  )

  const resumos = resumoResult.rows.map((r) => ({
    ...montarResumoFrequencia(
      r.alunoId,
      Number(r.totalAulas),
      Number(r.presencas),
      Number(r.faltas),
      Number(r.justificadas)
    ),
    alunoNome: r.alunoNome,
  }))

  const mediaPresenca =
    resumos.length > 0
      ? Math.round(resumos.reduce((acc, r) => acc + r.percentagemPresenca, 0) / resumos.length * 10) / 10
      : 100

  const totalEmRisco = resumos.filter((r) => r.emRisco).length

  return { turmaId, turmaNome, resumos, mediaPresenca, totalEmRisco }
}

/**
 * Resumo de frequência para um aluno (próprio ou filho do responsável).
 * Verifica permissão: user é o aluno ou responsável desse aluno.
 */
export async function getResumoFrequenciaAluno(
  user: AuthUser,
  alunoId: string,
  anoLetivoId?: string
): Promise<{
  alunoId: string
  alunoNome: string
  totais: ResumoFrequencia
  porTurma: (ResumoFrequencia & { turmaId: string; turmaNome: string })[]
} | null> {
  const db = getDb()
  const escolaId = user.escolaId
  if (!escolaId) return null

  const alunoCheck = await db.query(
    'SELECT a.id, p.nome FROM alunos a JOIN pessoas p ON p.id = a.pessoa_id WHERE a.id = $1 AND a.escola_id = $2',
    [alunoId, escolaId]
  )
  if (alunoCheck.rows.length === 0) return null
  const alunoNome = alunoCheck.rows[0].nome

  const isOwn =
    user.papel === 'aluno' &&
    (await db.query('SELECT 1 FROM alunos WHERE id = $1 AND pessoa_id = $2', [alunoId, user.pessoaId]))
      .rows.length > 0
  const isResponsavel =
    user.papel === 'responsavel' &&
    (await db.query(
      `SELECT 1 FROM vinculo_responsavel_aluno v
       JOIN responsaveis r ON r.id = v.responsavel_id WHERE v.aluno_id = $1 AND r.pessoa_id = $2`,
      [alunoId, user.pessoaId]
    )).rows.length > 0
  const isAdminOrDirecao = user.papel === 'admin' || user.papel === 'direcao'
  if (!isOwn && !isResponsavel && !isAdminOrDirecao) return null

  let anoFilter = ''
  const params: unknown[] = [alunoId]
  if (anoLetivoId) {
    params.push(anoLetivoId)
    anoFilter = `AND t.ano_letivo_id = $${params.length}`
  }

  const result = await db.query(
    `SELECT
       m.turma_id AS "turmaId",
       t.nome AS "turmaNome",
       COUNT(f.id) AS "totalAulas",
       COUNT(f.id) FILTER (WHERE f.status = 'presente') AS "presencas",
       COUNT(f.id) FILTER (WHERE f.status = 'falta') AS "faltas",
       COUNT(f.id) FILTER (WHERE f.status = 'justificada') AS "justificadas"
     FROM matriculas m
     JOIN turmas t ON t.id = m.turma_id
     LEFT JOIN aulas a ON a.turma_id = m.turma_id
     LEFT JOIN frequencia f ON f.aula_id = a.id AND f.aluno_id = m.aluno_id
     WHERE m.aluno_id = $1 ${anoFilter}
     GROUP BY m.turma_id, t.nome
     ORDER BY t.nome`,
    params
  )

  const porTurma = result.rows.map((r) => ({
    ...montarResumoFrequencia(
      alunoId,
      Number(r.totalAulas),
      Number(r.presencas),
      Number(r.faltas),
      Number(r.justificadas)
    ),
    turmaId: r.turmaId,
    turmaNome: r.turmaNome,
  }))

  const totais = porTurma.reduce(
    (acc, t) => ({
      alunoId,
      totalAulas: acc.totalAulas + t.totalAulas,
      presencas: acc.presencas + t.presencas,
      faltas: acc.faltas + t.faltas,
      justificadas: acc.justificadas + t.justificadas,
      percentagemPresenca: 0,
      emRisco: false,
    }),
    { alunoId, totalAulas: 0, presencas: 0, faltas: 0, justificadas: 0, percentagemPresenca: 0, emRisco: false }
  )
  totais.percentagemPresenca =
    totais.totalAulas > 0
      ? Math.round(
          ((totais.presencas + totais.justificadas) / totais.totalAulas) * 1000
        ) / 10
      : 100
  totais.emRisco = totais.percentagemPresenca < 75

  return { alunoId, alunoNome, totais, porTurma }
}

/**
 * Verifica e cria alertas de frequência para alunos em risco numa aula.
 */
async function verificarAlertasFrequencia(user: AuthUser, aulaId: string): Promise<void> {
  const db = getDb()
  const escolaId = getEscolaId(user)

  // Buscar turmaId da aula
  const aulaResult = await db.query(
    `SELECT a.turma_id FROM aulas a JOIN turmas t ON t.id = a.turma_id WHERE a.id = $1 AND t.escola_id = $2`,
    [aulaId, escolaId]
  )
  if (aulaResult.rows.length === 0) return
  const turmaId = aulaResult.rows[0].turma_id

  // Calcular frequência de cada aluno
  const frequenciaResult = await db.query(
    `SELECT
       m.aluno_id,
       p.nome AS aluno_nome,
       COUNT(f.id) AS total_aulas,
       COUNT(f.id) FILTER (WHERE f.status = 'presente' OR f.status = 'justificada') AS presencas
     FROM matriculas m
     JOIN alunos al ON al.id = m.aluno_id
     JOIN pessoas p ON p.id = al.pessoa_id
     LEFT JOIN aulas a ON a.turma_id = m.turma_id
     LEFT JOIN frequencia f ON f.aula_id = a.id AND f.aluno_id = m.aluno_id
     WHERE m.turma_id = $1
     GROUP BY m.aluno_id, p.nome
     HAVING COUNT(f.id) >= 5`,
    [turmaId]
  )

  for (const row of frequenciaResult.rows) {
    const totalAulas = Number(row.total_aulas)
    const presencas = Number(row.presencas)
    const percentagem = totalAulas > 0 ? Math.round((presencas / totalAulas) * 1000) / 10 : 100

    if (percentagem < 75) {
      // Verificar se já existe alerta ativo para este aluno
      const existente = await db.query(
        `SELECT 1 FROM alertas
         WHERE escola_id = $1 AND aluno_id = $2 AND tipo = 'frequencia' AND resolvido = false`,
        [escolaId, row.aluno_id]
      )
      if (existente.rows.length === 0) {
        await criarAlerta(escolaId!, {
          tipo: 'frequencia',
          severidade: percentagem < 60 ? 'critico' : 'atencao',
          titulo: `Frequência baixa: ${row.aluno_nome}`,
          descricao: `Presença de ${percentagem}% na turma (mínimo 75%)`,
          alunoId: row.aluno_id,
          turmaId,
        })
      }
    }
  }
}
