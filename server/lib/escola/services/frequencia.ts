import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import {
  montarResumoFrequencia,
  type ResumoFrequencia,
} from '../regras/frequencia_rules'
import { getEscolaId } from '../core/authContext'
import { criarAlerta } from './audit'
import { getConfigPedagogica } from './configuracoes'
import { getAnoLetivoByTurma } from './turmas'

type StatusFrequencia = 'presente' | 'falta' | 'justificada'

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
       COUNT(f.id) FILTER (WHERE f.status = 'justificada') AS "justificadas",
       COUNT(f.id) FILTER (WHERE f.status = 'falta' AND EXTRACT(ISODOW FROM a.data_aula) = 1) AS "faltasSegunda",
       COUNT(f.id) FILTER (WHERE f.status = 'falta' AND EXTRACT(ISODOW FROM a.data_aula) = 5) AS "faltasSexta"
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
    tendenciaSexta: Number(r.faltasSexta),
    tendenciaSegunda: Number(r.faltasSegunda)
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

  const totaisAgregados = porTurma.reduce(
    (acc, t) => ({
      totalAulas: acc.totalAulas + t.totalAulas,
      presencas: acc.presencas + t.presencas,
      faltas: acc.faltas + t.faltas,
      justificadas: acc.justificadas + t.justificadas,
    }),
    { totalAulas: 0, presencas: 0, faltas: 0, justificadas: 0 }
  )

  const totais = montarResumoFrequencia(
    alunoId,
    totaisAgregados.totalAulas,
    totaisAgregados.presencas,
    totaisAgregados.faltas,
    totaisAgregados.justificadas
  )

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

/* ── T3.0: Biometria e QR Code ── */

/**
 * Processa um acesso via scanner (QR ou BI).
 * Se houver uma aula a decorrer agora para este aluno, marca presença automaticamente.
 */
export async function processarAcessoQR(user: AuthUser, identifier: string, sentido: 'entrada' | 'saida' = 'entrada') {
  const db = getDb()
  const escolaId = getEscolaId(user)

  // 1. Identificar o aluno pelo ID ou BI
  const alunoResult = await db.query(
    `SELECT a.id, a.pessoa_id, p.nome, p.bi
     FROM alunos a
     JOIN pessoas p ON p.id = a.pessoa_id
     WHERE a.escola_id = $1 AND (a.id::text = $2 OR p.bi = $2 OR p.email = $2)`,
    [escolaId, identifier]
  )
  if (alunoResult.rows.length === 0) throw new Error('Estudante não identificado')
  const aluno = alunoResult.rows[0]

  // 2. Registar no log de acessos bruto
  await db.query(
    `INSERT INTO registros_acesso (escola_id, pessoa_id, sentido, tipo_dispositivo, local)
     VALUES ($1, $2, $3, 'scanner_qr', 'Entrada Principal')`,
    [escolaId, aluno.pessoa_id, sentido]
  )

  // 3. Verificar se há aula agora para este aluno
  const agora = new Date()
  const diaSemana = agora.getDay() // 0=Domingo, 1=Segunda...
  const horaAtual = agora.toTimeString().slice(0, 5) // "HH:MM"

  const horarioResult = await db.query(
    `SELECT h.id, h.turma_id, h.disciplina_id, h.hora_inicio, h.hora_fim
     FROM horarios h
     JOIN matriculas m ON m.turma_id = h.turma_id
     WHERE m.aluno_id = $1 AND h.dia_semana = $2 
       AND $3 BETWEEN h.hora_inicio AND h.hora_fim`,
    [aluno.id, diaSemana, horaAtual]
  )

  let statusFrequencia: StatusFrequencia = 'presente'
  let msgAtraso = ''

  if (horarioResult.rows.length > 0) {
    const h = horarioResult.rows[0]
    const dataHoje = agora.toISOString().split('T')[0]

    // Obter tolerância configurada
    const anoId = await getAnoLetivoByTurma(h.turma_id)
    const config = anoId ? await getConfigPedagogica(user, anoId) : null
    const tolerancia = config?.toleranciaAtrasoMinutos || 15

    // Verificar atraso
    const [hInicio, mInicio] = h.hora_inicio.split(':').map(Number)
    const [hAgora, mAgora] = horaAtual.split(':').map(Number)
    const minutosAtraso = (hAgora * 60 + mAgora) - (hInicio * 60 + mInicio)

    if (minutosAtraso > tolerancia) {
      statusFrequencia = 'falta'
      msgAtraso = `Atraso crítico: ${minutosAtraso}min (Máx: ${tolerancia})`
    } else if (minutosAtraso > 0) {
      msgAtraso = `Entrada com atraso de ${minutosAtraso}min`
    }

    // Criar ou obter a aula de hoje
    const aulaResult = await db.query(
      `INSERT INTO aulas (turma_id, disciplina_id, data_aula)
       VALUES ($1, $2, $3)
       ON CONFLICT (turma_id, disciplina_id, data_aula) DO UPDATE SET created_at = now()
       RETURNING id`,
      [h.turma_id, h.disciplina_id, dataHoje]
    )
    const aulaId = aulaResult.rows[0].id

    // Marcar frequência com rigor de tolerância
    await db.query(
      `INSERT INTO frequencia (aula_id, aluno_id, status)
       VALUES ($1, $2, $3)
       ON CONFLICT (aula_id, aluno_id) DO UPDATE SET status = $3`,
      [aulaId, aluno.id, statusFrequencia]
    )
    aulaMarcada = true
  }

  // 4. Análise de Risco em Tempo Real (Assiduidade)
  const resumoResult = await db.query(
    `SELECT 
           COUNT(f.id) AS total_aulas,
           COUNT(f.id) FILTER (WHERE f.status = 'falta') AS faltas
         FROM frequencia f
         WHERE f.aluno_id = $1`,
    [aluno.id]
  )
  const { total_aulas, faltas } = resumoResult.rows[0]
  const percentagemFaltas = total_aulas > 0 ? (Number(faltas) / Number(total_aulas)) * 100 : 0

  return {
    success: true,
    studentName: aluno.nome,
    timestamp: agora.toISOString(),
    aulaMarcada,
    status: statusFrequencia,
    msgAtraso,
    riskLevel: percentagemFaltas > 25 ? 'CRÍTICO' : percentagemFaltas > 15 ? 'ATENÇÃO' : 'NORMAL',
    absenceRate: Math.round(percentagemFaltas)
  }
}

export async function getJustificativas(user: AuthUser, alunoId?: string) {
  const db = getDb()
  const escolaId = getEscolaId(user)

  let query = `
    SELECT j.*, p.nome as "alunoNome", a.data_aula as "dataAula"
    FROM justificativas_falta j
    JOIN alunos al ON al.id = j.aluno_id
    JOIN pessoas p ON p.id = al.pessoa_id
    LEFT JOIN aulas a ON a.id = j.aula_id
    WHERE j.escola_id = $1
  `
  const params: any[] = [escolaId]
  if (alunoId) {
    params.push(alunoId)
    query += ` AND j.aluno_id = $2`
  }
  query += ` ORDER BY j.data_submissao DESC`

  const result = await db.query(query, params)
  return result.rows
}

export async function createJustificativa(user: AuthUser, data: {
  aluno_id: string,
  motivo: string,
  aula_id?: string,
  data_inicio?: string,
  data_fim?: string,
  descricao?: string,
  documento_url?: string
}) {
  const db = getDb()
  const escolaId = getEscolaId(user)

  // 1. Inserir justificação
  const result = await db.query(
    `INSERT INTO justificativas_falta (escola_id, aluno_id, aula_id, motivo, descricao, data_inicio, data_fim)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [escolaId, data.aluno_id, data.aula_id || null, data.motivo, data.descricao || '', data.data_inicio || null, data.data_fim || null]
  )
  const j = result.rows[0]

  // 2. Se for aprovado automaticamente (ex: admin inserindo) ou em auditoria, 
  // já podemos marcar as faltas como justificadas se houver datas.
  // Por agora deixamos como 'pendente' e criamos uma função de aprovação.

  return j
}

export async function processarAprovacaoJustificativa(user: AuthUser, id: string, acao: 'deferido' | 'indeferido') {
  const db = getDb()
  const escolaId = getEscolaId(user)

  await db.query('BEGIN')
  try {
    // 1. Atualizar status
    const upd = await db.query(
      `UPDATE justificativas_falta SET parecer_direcao = $1 WHERE id = $2 AND escola_id = $3 RETURNING *`,
      [acao, id, escolaId]
    )
    if (upd.rowCount === 0) throw new Error('Justificativa não encontrada')
    const j = upd.rows[0]

    if (acao === 'deferido') {
      // 2. Limpar faltas (Update frequency status to 'justificada')
      if (j.aula_id) {
        await db.query(
          `UPDATE frequencia SET status = 'justificada' WHERE aula_id = $1 AND aluno_id = $2 AND status = 'falta'`,
          [j.aula_id, j.aluno_id]
        )
      } else if (j.data_inicio && j.data_fim) {
        await db.query(
          `UPDATE frequencia f
                     SET status = 'justificada'
                     FROM aulas a
                     WHERE f.aula_id = a.id
                       AND f.aluno_id = $1
                       AND f.status = 'falta'
                       AND a.data_aula BETWEEN $2 AND $3`,
          [j.aluno_id, j.data_inicio, j.data_fim]
        )
      }
    }

    await db.query('COMMIT')
    return upd.rows[0]
  } catch (e) {
    await db.query('ROLLBACK')
    throw e
  }
}

export async function getAccessLogs(user: AuthUser, limit = 50) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    `SELECT r.id, p.nome AS "studentName", r.data_hora AS "timestamp", r.sentido, r.tipo_dispositivo AS "type"
     FROM registros_acesso r
     JOIN pessoas p ON p.id = r.pessoa_id
     WHERE r.escola_id = $1
     ORDER BY r.data_hora DESC
     LIMIT $2`,
    [escolaId, limit]
  )
  return result.rows
}
