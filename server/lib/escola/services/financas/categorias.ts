import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import type { CategoriaFinanceiraCreate, CategoriaFinanceiraUpdate } from '../../schemas'

function getEscolaId(user: AuthUser): string {
  if (user.escolaId) return user.escolaId
  throw new Error('Usuário sem escola definida')
}

export async function listCategoriasFinanceiras(user: AuthUser) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    `SELECT id, nome, tipo, ordem, ativo, created_at AS "createdAt"
     FROM categorias_financeiras
     WHERE escola_id = $1
     ORDER BY tipo, ordem, nome`,
    [escolaId]
  )
  return result.rows.map((r) => ({
    id: r.id,
    nome: r.nome,
    tipo: r.tipo,
    ordem: r.ordem,
    ativo: r.ativo,
    createdAt: r.createdAt ? String(r.createdAt).slice(0, 19) : '',
  }))
}

export async function createCategoriaFinanceira(user: AuthUser, data: CategoriaFinanceiraCreate) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    `INSERT INTO categorias_financeiras (escola_id, nome, tipo, ordem, ativo)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, nome, tipo, ordem, ativo, created_at AS "createdAt"`,
    [escolaId, data.nome, data.tipo, data.ordem ?? 0, data.ativo ?? true]
  )
  const row = result.rows[0]
  return {
    id: row.id,
    nome: row.nome,
    tipo: row.tipo,
    ordem: row.ordem,
    ativo: row.ativo,
    createdAt: row.createdAt ? String(row.createdAt).slice(0, 19) : '',
  }
}

export async function getCategoriaFinanceira(user: AuthUser, id: string) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    `SELECT id, nome, tipo, ordem, ativo, created_at AS "createdAt"
     FROM categorias_financeiras
     WHERE id = $1 AND escola_id = $2`,
    [id, escolaId]
  )
  if (result.rows.length === 0) return null
  const r = result.rows[0]
  return {
    id: r.id,
    nome: r.nome,
    tipo: r.tipo,
    ordem: r.ordem,
    ativo: r.ativo,
    createdAt: r.createdAt ? String(r.createdAt).slice(0, 19) : '',
  }
}

export async function updateCategoriaFinanceira(
  user: AuthUser,
  id: string,
  data: CategoriaFinanceiraUpdate
) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const fields: string[] = []
  const values: unknown[] = []
  let pos = 1
  if (data.nome !== undefined) {
    fields.push(`nome = $${pos++}`)
    values.push(data.nome)
  }
  if (data.tipo !== undefined) {
    fields.push(`tipo = $${pos++}`)
    values.push(data.tipo)
  }
  if (data.ordem !== undefined) {
    fields.push(`ordem = $${pos++}`)
    values.push(data.ordem)
  }
  if (data.ativo !== undefined) {
    fields.push(`ativo = $${pos++}`)
    values.push(data.ativo)
  }
  if (fields.length === 0) {
    return getCategoriaFinanceira(user, id)
  }
  values.push(id, escolaId)
  const result = await db.query(
    `UPDATE categorias_financeiras
     SET ${fields.join(', ')}
     WHERE id = $${pos} AND escola_id = $${pos + 1}
     RETURNING id, nome, tipo, ordem, ativo, created_at AS "createdAt"`,
    values
  )
  if (result.rows.length === 0) return null
  const r = result.rows[0]
  return {
    id: r.id,
    nome: r.nome,
    tipo: r.tipo,
    ordem: r.ordem,
    ativo: r.ativo,
    createdAt: r.createdAt ? String(r.createdAt).slice(0, 19) : '',
  }
}

export async function deleteCategoriaFinanceira(user: AuthUser, id: string) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    `DELETE FROM categorias_financeiras WHERE id = $1 AND escola_id = $2 RETURNING id`,
    [id, escolaId]
  )
  return result.rowCount !== null && result.rowCount > 0
}
