import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import type { MatriculaCreate } from '../schemas'

function getEscolaId(user: AuthUser): string {
  if (user.escolaId) return user.escolaId
  throw new Error('Usuário sem escola definida')
}

export async function listMatriculasByTurma(user: AuthUser, turmaId: string) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    `SELECT m.id, m.aluno_id AS "alunoId", m.turma_id AS "turmaId", p.nome AS "alunoNome"
     FROM matriculas m
     JOIN alunos a ON a.id = m.aluno_id
     JOIN pessoas p ON p.id = a.pessoa_id
     JOIN turmas t ON t.id = m.turma_id
     WHERE m.turma_id = $1 AND t.escola_id = $2
     ORDER BY p.nome`,
    [turmaId, escolaId]
  )
  return result.rows
}

export async function createMatricula(user: AuthUser, data: MatriculaCreate) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  await db.query(
    `INSERT INTO matriculas (aluno_id, turma_id)
     SELECT $1, $2
     WHERE EXISTS (SELECT 1 FROM alunos a WHERE a.id = $1 AND a.escola_id = $3)
     AND EXISTS (SELECT 1 FROM turmas t WHERE t.id = $2 AND t.escola_id = $3)`,
    [data.alunoId, data.turmaId, escolaId]
  )
  const r = await db.query(
    'SELECT id, aluno_id AS "alunoId", turma_id AS "turmaId" FROM matriculas WHERE aluno_id = $1 AND turma_id = $2',
    [data.alunoId, data.turmaId]
  )
  return r.rows[0] ?? null
}

export async function deleteMatricula(user: AuthUser, alunoId: string, turmaId: string): Promise<boolean> {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    `DELETE FROM matriculas m
     USING turmas t
     WHERE m.turma_id = t.id AND m.aluno_id = $1 AND m.turma_id = $2 AND t.escola_id = $3
     RETURNING m.id`,
    [alunoId, turmaId, escolaId]
  )
  return result.rowCount !== null && result.rowCount > 0
}
