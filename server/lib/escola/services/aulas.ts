import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'

function getEscolaId(user: AuthUser): string {
  if (user.escolaId) return user.escolaId
  throw new Error('Usuário sem escola definida')
}

export async function listAulasByTurmaAndDate(user: AuthUser, turmaId: string, dataAula: string) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    `SELECT a.id, a.turma_id AS "turmaId", a.disciplina_id AS "disciplinaId", a.data_aula AS "dataAula"
     FROM aulas a
     JOIN turmas t ON t.id = a.turma_id
     WHERE a.turma_id = $1 AND a.data_aula = $2::date AND t.escola_id = $3`,
    [turmaId, dataAula, escolaId]
  )
  return result.rows.map((r) => ({
    id: r.id,
    turmaId: r.turmaId,
    disciplinaId: r.disciplinaId,
    dataAula: String(r.dataAula).slice(0, 10),
  }))
}

export async function getOrCreateAula(user: AuthUser, turmaId: string, disciplinaId: string, dataAula: string) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const existing = await db.query(
    `SELECT a.id FROM aulas a
     JOIN turmas t ON t.id = a.turma_id
     WHERE a.turma_id = $1 AND a.disciplina_id = $2 AND a.data_aula = $3::date AND t.escola_id = $4`,
    [turmaId, disciplinaId, dataAula, escolaId]
  )
  if (existing.rows.length > 0) return existing.rows[0].id
  const insert = await db.query(
    `INSERT INTO aulas (turma_id, disciplina_id, data_aula)
     SELECT $1, $2, $3::date
     WHERE EXISTS (SELECT 1 FROM turmas t WHERE t.id = $1 AND t.escola_id = $4)
     RETURNING id`,
    [turmaId, disciplinaId, dataAula, escolaId]
  )
  return insert.rows[0]?.id ?? null
}
