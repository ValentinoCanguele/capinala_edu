/**
 * Regras de negócio para alunos.
 * Nano funções para decisões reutilizáveis (pode eliminar, pode editar, etc.).
 */
import type { Pool } from 'pg'

export type ResultadoRegra = { ok: true } | { ok: false; motivo: string }

/**
 * Verifica se o aluno pode ser eliminado: não deve ter matrículas ativas.
 * Opcionalmente pode-se exigir que não tenha notas ou frequência (política da escola).
 */
export async function podeEliminarAluno(
  db: Pool,
  alunoId: string
): Promise<ResultadoRegra> {
  const mat = await db.query(
    'SELECT id FROM matriculas WHERE aluno_id = $1 LIMIT 1',
    [alunoId]
  )
  if (mat.rows.length > 0) {
    return {
      ok: false,
      motivo: 'Não é possível eliminar o aluno: possui matrícula(s) ativa(s). Remova as matrículas primeiro.',
    }
  }
  return { ok: true }
}

/**
 * Conta o número de matrículas do aluno (útil para mensagens ou limites).
 */
export async function contarMatriculasAluno(
  db: Pool,
  alunoId: string
): Promise<number> {
  const r = await db.query(
    'SELECT COUNT(*)::int AS total FROM matriculas WHERE aluno_id = $1',
    [alunoId]
  )
  return r.rows[0]?.total ?? 0
}
