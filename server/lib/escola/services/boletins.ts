import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import {
  calcularMedia,
  mediaAprovacao,
  classificarNota,
  resultadoTrimestral,
  mediaFinalAnual,
} from '../regras/medias'
import {
  calcularPercentagemPresenca,
  nivelRiscoFrequencia,
} from '../regras/frequencia_rules'

function getEscolaId(user: AuthUser): string {
  if (user.escolaId) return user.escolaId
  throw new Error('Usuário sem escola definida')
}

interface DisciplinaBoletim {
  disciplinaId: string
  nome: string
  notasPorTrimestre: Record<number, number>
  mediaTrimestres: Record<number, { media: number | null; classificacao: string | null; resultado: string }>
  mediaFinal: number | null
  classificacaoFinal: string | null
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

  // Buscar TODAS as notas do aluno organizadas por turma > disciplina > trimestre
  const disciplinasMap: Record<string, DisciplinaBoletim> = {}

  for (const mat of matriculas.rows) {
    const notas = await db.query(
      `SELECT n.disciplina_id AS "disciplinaId", d.nome AS "disciplinaNome",
              p.numero AS "trimestre", n.valor
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
          notasPorTrimestre: {},
          mediaTrimestres: {},
          mediaFinal: null,
          classificacaoFinal: null,
          aprovado: false,
        }
      }
      disciplinasMap[key].notasPorTrimestre[row.trimestre] = Number(row.valor)
    }
  }

  // Calcular médias por trimestre e média final por disciplina
  for (const disc of Object.values(disciplinasMap)) {
    const trimestres = [1, 2, 3, 4]
    const mediasTrimestres: (number | null)[] = []

    for (const tri of trimestres) {
      const nota = disc.notasPorTrimestre[tri]
      if (nota !== undefined) {
        const media = nota // num cenário simples, a nota = média do trimestre
        disc.mediaTrimestres[tri] = {
          media,
          classificacao: classificarNota(media),
          resultado: resultadoTrimestral(media),
        }
        mediasTrimestres.push(media)
      }
    }

    disc.mediaFinal = mediaFinalAnual(mediasTrimestres)
    disc.classificacaoFinal = classificarNota(disc.mediaFinal)
    disc.aprovado = mediaAprovacao(disc.mediaFinal)
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
  const mediaGeral = calcularMedia(todasMedias)
  const classificacaoGeral = classificarNota(mediaGeral)
  const aprovadoGeral = mediaAprovacao(mediaGeral) && (!frequencia || frequencia.percentagem >= 75)

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
      notasPorTrimestre: d.notasPorTrimestre,
      mediaTrimestres: d.mediaTrimestres,
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
