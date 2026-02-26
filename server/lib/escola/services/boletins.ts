import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import { getEscolaId } from '../core/authContext'
import {
  calcularPercentagemPresenca,
  nivelRiscoFrequencia,
} from '../regras/frequencia_rules'
import {
  classificarNota,
  resultadoTrimestral,
  calcularMFA,
  calcularResultadoFinal,
  aplicarArredondamento,
  mediaSimples,
  ResultadoFinal
} from '../regras/medias'
import { getConfigPedagogica } from './configuracoes'


interface TrimestreDetalhe {
  valor: number | null
  mac: number | null
  npp: number | null
  ne: number | null
  classificacao: string | null
  resultado: string
}

interface DisciplinaBoletim {
  disciplinaId: string
  nome: string
  detalhesPorTrimestre: Record<number, TrimestreDetalhe>
  mediaFinal: number | null
  classificacaoFinal: string | null
  resultadoFinal: ResultadoFinal | null
  aprovado: boolean
}

interface FrequenciaBoletim {
  totalAulas: number
  presencas: number
  faltas: number
  justificadas: number
  percentagem: number
  nivelRisco: string
}

export async function getBoletim(user: AuthUser, alunoId: string, anoLetivoId?: string) {
  const db = getDb()
  const escolaId = getEscolaId(user)

  // Verificar que o aluno existe na escola
  const alunoCheck = await db.query(
    'SELECT 1 FROM alunos WHERE id = $1 AND escola_id = $2',
    [alunoId, escolaId]
  )
  if (alunoCheck.rows.length === 0) return null

  // Dados do aluno
  const alunoInfo = await db.query(
    `SELECT p.nome, p.email, p.data_nascimento AS "dataNascimento"
     FROM alunos a JOIN pessoas p ON p.id = a.pessoa_id WHERE a.id = $1`,
    [alunoId]
  )
  const aluno = alunoInfo.rows[0]

  // Matrículas
  const matriculas = await db.query(
    `SELECT m.turma_id AS "turmaId", t.nome AS "turmaNome",
            al.nome AS "anoLetivoNome", t.ano_letivo_id AS "anoLetivoId"
     FROM matriculas m
     JOIN turmas t ON t.id = m.turma_id
     JOIN anos_letivos al ON al.id = t.ano_letivo_id
     WHERE m.aluno_id = $1 AND t.escola_id = $2
     ${anoLetivoId ? 'AND t.ano_letivo_id = $3' : ''}
     ORDER BY al.data_inicio DESC`,
    anoLetivoId ? [alunoId, escolaId, anoLetivoId] : [alunoId, escolaId]
  )

  // Obter configurações pedagógicas (usar o primeiro ano letivo da matrícula se não fornecido)
  const mainAnoLetivoId = anoLetivoId || (matriculas.rows[0]?.anoLetivoId)
  const config = mainAnoLetivoId ? await getConfigPedagogica(user, mainAnoLetivoId) : null

  // Buscar exames
  const examesResult = await db.query(
    `SELECT disciplina_id AS "disciplinaId", valor, tipo
     FROM exames WHERE aluno_id = $1`,
    [alunoId]
  )
  const examesMap: Record<string, number> = {}
  for (const row of examesResult.rows) {
    examesMap[row.disciplinaId] = Number(row.valor)
  }

  // Buscar TODAS as notas do aluno organizadas por turma > disciplina > trimestre
  const disciplinasMap: Record<string, DisciplinaBoletim> = {}

  for (const mat of matriculas.rows) {
    const notas = await db.query(
      `SELECT n.disciplina_id AS "disciplinaId", d.nome AS "disciplinaNome",
              p.numero AS "trimestre", n.valor, n.mac, n.npp, n.ne
       FROM notas n
       JOIN disciplinas d ON d.id = n.disciplina_id
       JOIN periodos p ON p.id = n.periodo_id
       WHERE n.aluno_id = $1 AND n.turma_id = $2
       ORDER BY d.nome, p.numero`,
      [alunoId, mat.turmaId]
    )

    for (const row of notas.rows) {
      const key = row.disciplinaId
      if (!disciplinasMap[key]) {
        disciplinasMap[key] = {
          disciplinaId: key,
          nome: row.disciplinaNome,
          detalhesPorTrimestre: {},
          mediaFinal: null,
          classificacaoFinal: null,
          resultadoFinal: null,
          aprovado: false,
        }
      }

      const media = Number(row.valor)
      disciplinasMap[key].detalhesPorTrimestre[row.trimestre] = {
        valor: aplicarArredondamento(media, config?.tipoArredondamento, config?.casasDecimais),
        mac: row.mac != null ? Number(row.mac) : null,
        npp: row.npp != null ? Number(row.npp) : null,
        ne: row.ne != null ? Number(row.ne) : null,
        classificacao: classificarNota(media),
        resultado: resultadoTrimestral(media, config?.minimaAprovacaoDireta),
      }
    }
  }

  // Calcular média final por disciplina
  for (const disc of Object.values(disciplinasMap)) {
    const mfaInputs: { valor: number | null; peso: number }[] = []

    for (const tri of [1, 2, 3]) {
      const detalhe = disc.detalhesPorTrimestre[tri]
      const peso = tri === 1 ? (config?.pesoT1 || 1) : tri === 2 ? (config?.pesoT2 || 1) : (config?.pesoT3 || 1)
      mfaInputs.push({ valor: detalhe?.valor ?? null, peso })
    }

    disc.mediaFinal = aplicarArredondamento(calcularMFA(mfaInputs) || 0, config?.tipoArredondamento, config?.casasDecimais)
    disc.classificacaoFinal = classificarNota(disc.mediaFinal)

    // Decisão Final
    const resultado = calcularResultadoFinal(disc.mediaFinal, {
      minimaAprovacao: config?.minimaAprovacaoDireta || 10,
      minimaExame: config?.minimaAcessoExame || 7
    })

    disc.resultadoFinal = resultado
    disc.aprovado = resultado === 'Aprovado'
  }

  // Calcular frequência
  let frequencia: FrequenciaBoletim | null = null
  if (matriculas.rows.length > 0) {
    const turmaId = matriculas.rows[0].turmaId
    const freqResult = await db.query(
      `SELECT
         COUNT(f.id) AS "totalAulas",
         COUNT(f.id) FILTER (WHERE f.status = 'presente') AS "presencas",
         COUNT(f.id) FILTER (WHERE f.status = 'falta') AS "faltas",
         COUNT(f.id) FILTER (WHERE f.status = 'justificada') AS "justificadas"
       FROM aulas a
       LEFT JOIN frequencia f ON f.aula_id = a.id AND f.aluno_id = $1
       WHERE a.turma_id = $2`,
      [alunoId, turmaId]
    )

    if (freqResult.rows.length > 0) {
      const fr = freqResult.rows[0]
      const totalAulas = Number(fr.totalAulas)
      const presencas = Number(fr.presencas)
      const faltas = Number(fr.faltas)
      const justificadas = Number(fr.justificadas)
      const percentagem = calcularPercentagemPresenca(presencas, justificadas, totalAulas)

      frequencia = {
        totalAulas,
        presencas,
        faltas,
        justificadas,
        percentagem,
        nivelRisco: nivelRiscoFrequencia(percentagem),
      }
    }
  }

  // Média geral do aluno
  const todasMedias = Object.values(disciplinasMap)
    .map((d) => d.mediaFinal)
    .filter((m): m is number => m !== null)
  const mediaGeral = mediaSimples(todasMedias, config?.tipoArredondamento, config?.casasDecimais) || 0
  const classificacaoGeral = classificarNota(mediaGeral)
  const aprovadoGeral = (mediaGeral >= (config?.minimaAprovacaoDireta || 10)) && (!frequencia || frequencia.percentagem >= 75)

  return {
    alunoId,
    alunoNome: aluno?.nome ?? '',
    alunoEmail: aluno?.email ?? '',
    turmas: matriculas.rows.map((r) => ({
      turmaId: r.turmaId,
      turmaNome: r.turmaNome,
      anoLetivoNome: r.anoLetivoNome,
      anoLetivoId: r.anoLetivoId,
    })),
    disciplinas: Object.values(disciplinasMap).map((d) => ({
      disciplinaId: d.disciplinaId,
      nome: d.nome,
      detalhesPorTrimestre: d.detalhesPorTrimestre,
      mediaFinal: d.mediaFinal,
      classificacaoFinal: d.classificacaoFinal,
      aprovado: d.aprovado,
    })),
    frequencia,
    resumo: {
      mediaGeral,
      classificacaoGeral,
      aprovadoGeral,
      totalDisciplinas: Object.keys(disciplinasMap).length,
      disciplinasAprovadas: Object.values(disciplinasMap).filter((d) => d.aprovado).length,
      disciplinasReprovadas: Object.values(disciplinasMap).filter((d) => !d.aprovado && d.mediaFinal !== null).length,
    },
  }
}

export interface PautaGeralRow {
  alunoId: string
  alunoNome: string
  notas: Record<string, number> // disciplinaId -> valor
  mediaGeral: number | null
  aprovado: boolean
}

export async function getPautaGeral(user: AuthUser, turmaId: string, periodoId: string) {
  const db = getDb()
  const escolaId = getEscolaId(user)

  // 1. Alunos da turma
  const alunosResult = await db.query(
    `SELECT a.id, p.nome
     FROM matriculas m
     JOIN alunos a ON a.id = m.aluno_id
     JOIN pessoas p ON p.id = a.pessoa_id
     WHERE m.turma_id = $1 AND a.escola_id = $2
     ORDER BY p.nome`,
    [turmaId, escolaId]
  )
  const alunos = alunosResult.rows

  // 2. Disciplinas vinculadas à turma (através de turma_disciplina ou horários)
  // Nota: De acordo com o sistema, usamos turma_disciplina se existir, senão disciplinas globais.
  // Vamos buscar as disciplinas que têm pelo menos um horário ou uma nota nesta turma.
  const disciplinasResult = await db.query(
    `SELECT DISTINCT d.id, d.nome
     FROM disciplinas d
     LEFT JOIN turma_disciplina td ON td.disciplina_id = d.id
     LEFT JOIN horarios h ON h.disciplina_id = d.id
     WHERE (td.turma_id = $1 OR h.turma_id = $1) AND d.escola_id = $2
     ORDER BY d.nome`,
    [turmaId, escolaId]
  )
  const disciplinas = disciplinasResult.rows

  // 3. Notas do período
  const notasResult = await db.query(
    `SELECT aluno_id AS "alunoId", disciplina_id AS "disciplinaId", valor
     FROM notas
     WHERE turma_id = $1 AND periodo_id = $2`,
    [turmaId, periodoId]
  )
  const notasMap = new Map<string, Record<string, number>>()
  for (const n of notasResult.rows) {
    if (!notasMap.has(n.alunoId)) notasMap.set(n.alunoId, {})
    notasMap.get(n.alunoId)![n.disciplinaId] = Number(n.valor)
  }

  // 4. Montar linhas
  const rows: PautaGeralRow[] = alunos.map((aluno) => {
    const alunoNotas = notasMap.get(aluno.id) || {}
    const vals = Object.values(alunoNotas)
    const mediaGeral = vals.length > 0 ? mediaSimples(vals) : null

    return {
      alunoId: aluno.id,
      alunoNome: aluno.nome,
      notas: alunoNotas,
      mediaGeral,
      aprovado: mediaGeral !== null && mediaGeral >= 10,
    }
  })

  return {
    turmaId,
    periodoId,
    disciplinas,
    rows,
  }
}

