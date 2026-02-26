/**
 * Validadores de contexto reutilizáveis (turma, aluno, período, disciplina).
 * Recebem o client/pool para não acoplar regras ao módulo de DB.
 * Retornam { valido, erro? } para composição nos serviços.
 */
import type { Pool } from 'pg'

export type ResultadoValidacao = { valido: true } | { valido: false; erro: string }

/**
 * Verifica se a turma existe e pertence à escola.
 * Retorna ano_letivo_id quando válido (útil para encadear validação de período).
 */
export async function validarTurmaPertenceEscola(
  db: Pool,
  turmaId: string,
  escolaId: string
): Promise<ResultadoValidacao & { anoLetivoId?: string }> {
  const r = await db.query(
    'SELECT ano_letivo_id FROM turmas WHERE id = $1 AND escola_id = $2',
    [turmaId, escolaId]
  )
  if (r.rows.length === 0) {
    return { valido: false, erro: 'Turma não encontrada nesta escola' }
  }
  return { valido: true, anoLetivoId: r.rows[0].ano_letivo_id }
}

/**
 * Verifica se o aluno está matriculado na turma.
 */
export async function validarAlunoMatriculadoTurma(
  db: Pool,
  alunoId: string,
  turmaId: string
): Promise<ResultadoValidacao> {
  const r = await db.query(
    'SELECT 1 FROM matriculas WHERE aluno_id = $1 AND turma_id = $2',
    [alunoId, turmaId]
  )
  if (r.rows.length === 0) {
    return { valido: false, erro: 'Aluno não está matriculado nesta turma' }
  }
  return { valido: true }
}

/**
 * Verifica se o período pertence ao ano letivo.
 */
export async function validarPeriodoDoAnoLetivo(
  db: Pool,
  periodoId: string,
  anoLetivoId: string
): Promise<ResultadoValidacao> {
  const r = await db.query(
    'SELECT 1 FROM periodos WHERE id = $1 AND ano_letivo_id = $2',
    [periodoId, anoLetivoId]
  )
  if (r.rows.length === 0) {
    return { valido: false, erro: 'Período não pertence ao ano letivo desta turma' }
  }
  return { valido: true }
}

/**
 * Verifica se a disciplina está associada à turma (turma_disciplina).
 */
export async function validarDisciplinaNaTurma(
  db: Pool,
  turmaId: string,
  disciplinaId: string,
  escolaId: string
): Promise<ResultadoValidacao> {
  const r = await db.query(
    `SELECT 1 FROM turma_disciplina td
     JOIN turmas t ON t.id = td.turma_id
     WHERE td.turma_id = $1 AND td.disciplina_id = $2 AND t.escola_id = $3`,
    [turmaId, disciplinaId, escolaId]
  )
  if (r.rows.length === 0) {
    return { valido: false, erro: 'Disciplina não está associada a esta turma' }
  }
  return { valido: true }
}

/**
 * Contexto completo para lançamento de nota: turma na escola, aluno matriculado, período do ano.
 */
export async function validarContextoNota(
  db: Pool,
  escolaId: string,
  alunoId: string,
  turmaId: string,
  periodoId: string
): Promise<ResultadoValidacao> {
  const vTurma = await validarTurmaPertenceEscola(db, turmaId, escolaId)
  if (!vTurma.valido) return vTurma

  const vMat = await validarAlunoMatriculadoTurma(db, alunoId, turmaId)
  if (!vMat.valido) return vMat

  const vPeriodo = await validarPeriodoDoAnoLetivo(db, periodoId, vTurma.anoLetivoId!)
  if (!vPeriodo.valido) return vPeriodo

  return { valido: true }
}

/**
 * Verifica se o aluno pertence à escola.
 */
export async function validarAlunoPertenceEscola(
  db: Pool,
  alunoId: string,
  escolaId: string
): Promise<ResultadoValidacao> {
  const r = await db.query(
    'SELECT 1 FROM alunos WHERE id = $1 AND escola_id = $2',
    [alunoId, escolaId]
  )
  if (r.rows.length === 0) {
    return { valido: false, erro: 'Aluno não encontrado nesta escola' }
  }
  return { valido: true }
}
