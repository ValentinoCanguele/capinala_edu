import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import type { DisciplinaCreate, DisciplinaUpdate } from '../schemas'

function getEscolaId(user: AuthUser): string {
  if (user.escolaId) return user.escolaId
  throw new Error('Usuário sem escola definida')
}

export async function listDisciplinas(user: AuthUser) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    'SELECT id, nome FROM disciplinas WHERE escola_id = $1 ORDER BY nome',
    [escolaId]
  )
  return result.rows
}

export async function createDisciplina(user: AuthUser, data: DisciplinaCreate) {
  const db = getDb()
  const escolaId = data.escolaId ?? getEscolaId(user)
  const result = await db.query(
    'INSERT INTO disciplinas (escola_id, nome) VALUES ($1, $2) RETURNING id, nome',
    [escolaId, data.nome]
  )
  return result.rows[0]
}

export async function getDisciplina(user: AuthUser, id: string) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    'SELECT id, nome FROM disciplinas WHERE id = $1 AND escola_id = $2',
    [id, escolaId]
  )
  return result.rows[0] ?? null
}

export async function updateDisciplina(user: AuthUser, id: string, data: DisciplinaUpdate) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  if (data.nome !== undefined) {
    await db.query('UPDATE disciplinas SET nome = $1 WHERE id = $2 AND escola_id = $3', [
      data.nome,
      id,
      escolaId,
    ])
  }
  return getDisciplina(user, id)
}

export async function deleteDisciplina(user: AuthUser, id: string): Promise<boolean> {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    'DELETE FROM disciplinas WHERE id = $1 AND escola_id = $2 RETURNING id',
    [id, escolaId]
  )
  return result.rowCount !== null && result.rowCount > 0
}
