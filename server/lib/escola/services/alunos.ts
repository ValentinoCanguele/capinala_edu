import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import type { AlunoCreate, AlunoUpdate } from '../schemas'
import { emit } from '@/lib/core/events/bus'

function getEscolaId(user: AuthUser): string {
  if (user.escolaId) return user.escolaId
  throw new Error('Usuário sem escola definida')
}

export async function listAlunos(user: AuthUser) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    `SELECT a.id, p.nome, p.email, p.data_nascimento AS "dataNascimento"
     FROM alunos a
     JOIN pessoas p ON p.id = a.pessoa_id
     WHERE a.escola_id = $1
     ORDER BY p.nome`,
    [escolaId]
  )
  return result.rows.map((r) => ({
    id: r.id,
    nome: r.nome,
    email: r.email,
    dataNascimento: r.dataNascimento ? String(r.dataNascimento).slice(0, 10) : '',
  }))
}

export async function createAluno(user: AuthUser, data: AlunoCreate) {
  const db = getDb()
  const escolaId = data.escolaId ?? getEscolaId(user)
  const client = await db.connect()
  try {
    const pessoaResult = await client.query(
      `INSERT INTO pessoas (nome, email, data_nascimento)
       VALUES ($1, $2, $3::date)
       RETURNING id`,
      [data.nome, data.email, data.dataNascimento || null]
    )
    const pessoaId = pessoaResult.rows[0].id
    const alunoResult = await client.query(
      `INSERT INTO alunos (pessoa_id, escola_id) VALUES ($1, $2) RETURNING id`,
      [pessoaId, escolaId]
    )
    const aluno = alunoResult.rows[0]
    const out = {
      id: aluno.id,
      nome: data.nome,
      email: data.email,
      dataNascimento: data.dataNascimento ?? '',
    }
    emit('aluno.criado', { aluno: out, escolaId, userId: user.userId })
    return out
  } finally {
    client.release()
  }
}

export async function getAluno(user: AuthUser, id: string) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    `SELECT a.id, p.nome, p.email, p.data_nascimento AS "dataNascimento"
     FROM alunos a
     JOIN pessoas p ON p.id = a.pessoa_id
     WHERE a.id = $1 AND a.escola_id = $2`,
    [id, escolaId]
  )
  if (result.rows.length === 0) return null
  const r = result.rows[0]
  return {
    id: r.id,
    nome: r.nome,
    email: r.email,
    dataNascimento: r.dataNascimento ? String(r.dataNascimento).slice(0, 10) : '',
  }
}

export async function updateAluno(user: AuthUser, id: string, data: AlunoUpdate) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const existing = await db.query(
    'SELECT a.pessoa_id FROM alunos a WHERE a.id = $1 AND a.escola_id = $2',
    [id, escolaId]
  )
  if (existing.rows.length === 0) return null
  const pessoaId = existing.rows[0].pessoa_id
  const updates: string[] = []
  const values: unknown[] = []
  let i = 1
  if (data.nome !== undefined) {
    updates.push(`nome = $${i++}`)
    values.push(data.nome)
  }
  if (data.email !== undefined) {
    updates.push(`email = $${i++}`)
    values.push(data.email)
  }
  if (data.dataNascimento !== undefined) {
    updates.push(`data_nascimento = $${i++}::date`)
    values.push(data.dataNascimento)
  }
  if (updates.length === 0) return getAluno(user, id)
  values.push(pessoaId)
  await db.query(
    `UPDATE pessoas SET ${updates.join(', ')} WHERE id = $${i}`,
    values
  )
  return getAluno(user, id)
}

export async function deleteAluno(user: AuthUser, id: string): Promise<boolean> {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    'DELETE FROM alunos WHERE id = $1 AND escola_id = $2 RETURNING id',
    [id, escolaId]
  )
  return result.rowCount !== null && result.rowCount > 0
}
