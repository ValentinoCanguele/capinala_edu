import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import type { AnoLetivoCreate, AnoLetivoUpdate } from '../schemas'

function getEscolaId(user: AuthUser): string {
  if (user.escolaId) return user.escolaId
  throw new Error('Usuário sem escola definida')
}

export async function listAnosLetivos(user: AuthUser) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    `SELECT id, nome, data_inicio AS "dataInicio", data_fim AS "dataFim"
     FROM anos_letivos WHERE escola_id = $1 ORDER BY data_inicio DESC`,
    [escolaId]
  )
  return result.rows.map((r) => ({
    id: r.id,
    nome: r.nome,
    dataInicio: String(r.dataInicio).slice(0, 10),
    dataFim: String(r.dataFim).slice(0, 10),
  }))
}

export async function createAnoLetivo(user: AuthUser, data: AnoLetivoCreate) {
  const db = getDb()
  const escolaId = data.escolaId ?? getEscolaId(user)
  const result = await db.query(
    `INSERT INTO anos_letivos (escola_id, nome, data_inicio, data_fim)
     VALUES ($1, $2, $3::date, $4::date)
     RETURNING id, nome, data_inicio AS "dataInicio", data_fim AS "dataFim"`,
    [escolaId, data.nome, data.dataInicio, data.dataFim]
  )
  const r = result.rows[0]
  return {
    id: r.id,
    nome: r.nome,
    dataInicio: String(r.dataInicio).slice(0, 10),
    dataFim: String(r.dataFim).slice(0, 10),
  }
}

export async function getAnoLetivo(user: AuthUser, id: string) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    `SELECT id, nome, data_inicio AS "dataInicio", data_fim AS "dataFim"
     FROM anos_letivos WHERE id = $1 AND escola_id = $2`,
    [id, escolaId]
  )
  if (result.rows.length === 0) return null
  const r = result.rows[0]
  return {
    id: r.id,
    nome: r.nome,
    dataInicio: String(r.dataInicio).slice(0, 10),
    dataFim: String(r.dataFim).slice(0, 10),
  }
}

export async function updateAnoLetivo(user: AuthUser, id: string, data: AnoLetivoUpdate) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const updates: string[] = []
  const values: unknown[] = []
  let i = 1
  if (data.nome !== undefined) {
    updates.push(`nome = $${i++}`)
    values.push(data.nome)
  }
  if (data.dataInicio !== undefined) {
    updates.push(`data_inicio = $${i++}::date`)
    values.push(data.dataInicio)
  }
  if (data.dataFim !== undefined) {
    updates.push(`data_fim = $${i++}::date`)
    values.push(data.dataFim)
  }
  if (updates.length === 0) return null
  values.push(id, escolaId)
  const result = await db.query(
    `UPDATE anos_letivos SET ${updates.join(', ')} WHERE id = $${i++} AND escola_id = $${i} RETURNING id, nome, data_inicio AS "dataInicio", data_fim AS "dataFim"`,
    values
  )
  if (result.rows.length === 0) return null
  const r = result.rows[0]
  return {
    id: r.id,
    nome: r.nome,
    dataInicio: String(r.dataInicio).slice(0, 10),
    dataFim: String(r.dataFim).slice(0, 10),
  }
}
