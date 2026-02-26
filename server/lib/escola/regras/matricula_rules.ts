/**
 * Regras de negócio para matrículas.
 * Nano funções: duplicados, mesmo ano, capacidade da turma, etc.
 */
import type { Pool } from 'pg'
import { validarAlunoPertenceEscola } from './validacoes'

export type ResultadoMatricula = { valido: true } | { valido: false; erro: string }

/**
 * Verifica se o aluno já está matriculado nesta turma (evita duplicado).
 */
export async function alunoJaMatriculadoNaTurma(
  db: Pool,
  alunoId: string,
  turmaId: string
): Promise<boolean> {
  const r = await db.query(
    'SELECT 1 FROM matriculas WHERE aluno_id = $1 AND turma_id = $2 LIMIT 1',
    [alunoId, turmaId]
  )
  return r.rows.length > 0
}

/**
 * Valida se é possível inscrever o aluno na turma:
 * - aluno pertence à escola
 * - turma pertence à escola (via validacoes)
 * - aluno ainda não está matriculado nesta turma
 */
export async function validarPodeMatricular(
  db: Pool,
  alunoId: string,
  turmaId: string,
  escolaId: string
): Promise<ResultadoMatricula> {
  const vAluno = await validarAlunoPertenceEscola(db, alunoId, escolaId)
  if (!vAluno.valido) return vAluno

  const jaMatriculado = await alunoJaMatriculadoNaTurma(db, alunoId, turmaId)
  if (jaMatriculado) {
    return { valido: false, erro: 'O aluno já está matriculado nesta turma.' }
  }

  const r = await db.query(
    'SELECT 1 FROM turmas WHERE id = $1 AND escola_id = $2',
    [turmaId, escolaId]
  )
  if (r.rows.length === 0) {
    return { valido: false, erro: 'Turma não encontrada nesta escola.' }
  }

  return { valido: true }
}
