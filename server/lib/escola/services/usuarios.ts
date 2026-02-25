import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import type { UsuarioCreate, UsuarioUpdate } from '../schemas/usuario'
import { assertPermissao } from '../permissoes'
import { PAPEIS_ADMIN } from '../permissoes'

export interface UsuarioListItem {
  id: string
  userId: string
  pessoaId: string
  nome: string
  email: string
  papel: string
  escolaId: string | null
  escolaNome: string | null
  bi: string | null
  fotoUrl: string | null
}

export async function listUsuarios(user: AuthUser, escolaId?: string | null): Promise<UsuarioListItem[]> {
  assertPermissao(user, PAPEIS_ADMIN, 'listar utilizadores')
  const db = getDb()
  const params: unknown[] = []
  let schoolFilter = ''
  if (escolaId) {
    params.push(escolaId)
    schoolFilter = `AND u.escola_id = $${params.length}`
  }
  const result = await db.query(
    `SELECT u.id AS "userId", u.pessoa_id AS "pessoaId", p.nome, p.email, p.bi, p.foto_caminho AS "fotoCaminho",
            u.escola_id AS "escolaId", e.nome AS "escolaNome", u.papel
     FROM usuarios u
     JOIN pessoas p ON p.id = u.pessoa_id
     LEFT JOIN escolas e ON e.id = u.escola_id
     WHERE 1=1 ${schoolFilter}
     ORDER BY p.nome`,
    params
  )
  return result.rows.map((r) => ({
    id: r.pessoaId,
    userId: r.userId,
    pessoaId: r.pessoaId,
    nome: r.nome,
    email: r.email,
    papel: r.papel,
    escolaId: r.escolaId,
    escolaNome: r.escolaNome,
    bi: r.bi ?? null,
    fotoUrl: r.fotoCaminho ? `/api/escola/perfil/foto?pessoaId=${r.pessoaId}` : null,
  }))
}

export async function getUsuario(
  user: AuthUser,
  userId: string
): Promise<(UsuarioListItem & { dataNascimento: string | null; telefone: string | null }) | null> {
  assertPermissao(user, PAPEIS_ADMIN, 'ver utilizador')
  const db = getDb()
  const r = await db.query(
    `SELECT u.id AS "userId", u.pessoa_id AS "pessoaId", p.nome, p.email, p.data_nascimento AS "dataNascimento",
            p.telefone, p.bi, p.foto_caminho AS "fotoCaminho", u.escola_id AS "escolaId", e.nome AS "escolaNome", u.papel
     FROM usuarios u
     JOIN pessoas p ON p.id = u.pessoa_id
     LEFT JOIN escolas e ON e.id = u.escola_id
     WHERE u.id = $1`,
    [userId]
  )
  const row = r.rows[0]
  if (!row) return null
  return {
    id: row.pessoaId,
    userId: row.userId,
    pessoaId: row.pessoaId,
    nome: row.nome,
    email: row.email,
    papel: row.papel,
    escolaId: row.escolaId,
    escolaNome: row.escolaNome,
    bi: row.bi ?? null,
    fotoUrl: row.fotoCaminho ? `/api/escola/perfil/foto?pessoaId=${row.pessoaId}` : null,
    dataNascimento: row.dataNascimento ? String(row.dataNascimento).slice(0, 10) : null,
    telefone: row.telefone ?? null,
  }
}

export async function createUsuario(user: AuthUser, data: UsuarioCreate): Promise<UsuarioListItem | null> {
  assertPermissao(user, PAPEIS_ADMIN, 'criar utilizador')
  const db = getDb()
  const escolaId = data.escolaId ?? user.escolaId ?? null
  const client = await db.connect()
  try {
    const pessoaResult = await client.query(
      `INSERT INTO pessoas (nome, email, data_nascimento, telefone, bi)
       VALUES ($1, $2, NULL, $3, $4)
       RETURNING id`,
      [data.nome, data.email, data.telefone || null, data.bi || null]
    )
    const pessoaId = pessoaResult.rows[0].id
    const usuarioResult = await client.query(
      `INSERT INTO usuarios (pessoa_id, escola_id, papel, password_hash)
       VALUES ($1, $2, $3::papel_enum, $4)
       RETURNING id`,
      [pessoaId, escolaId, data.papel, data.password]
    )
    const userId = usuarioResult.rows[0].id
    const list = await listUsuarios(user, escolaId ?? undefined)
    return list.find((u) => u.userId === userId) ?? null
  } finally {
    client.release()
  }
}

export async function updateUsuario(
  user: AuthUser,
  userId: string,
  data: UsuarioUpdate
): Promise<UsuarioListItem | null> {
  assertPermissao(user, PAPEIS_ADMIN, 'atualizar utilizador')
  const db = getDb()
  const u = await db.query('SELECT pessoa_id FROM usuarios WHERE id = $1', [userId])
  if (u.rows.length === 0) return null
  const pessoaId = u.rows[0].pessoa_id
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
  if (data.telefone !== undefined) {
    updates.push(`telefone = $${i++}`)
    values.push(data.telefone ?? null)
  }
  if (data.bi !== undefined) {
    updates.push(`bi = $${i++}`)
    values.push(data.bi ?? null)
  }
  if (updates.length > 0) {
    values.push(pessoaId)
    await db.query(`UPDATE pessoas SET ${updates.join(', ')} WHERE id = $${i}`, values)
  }
  if (data.papel !== undefined || data.escolaId !== undefined) {
    const up: string[] = []
    const v: unknown[] = []
    let j = 1
    if (data.papel !== undefined) {
      up.push(`papel = $${j++}`)
      v.push(data.papel)
    }
    if (data.escolaId !== undefined) {
      up.push(`escola_id = $${j++}`)
      v.push(data.escolaId)
    }
    if (up.length > 0) {
      v.push(userId)
      await db.query(`UPDATE usuarios SET ${up.join(', ')} WHERE id = $${j}`, v)
    }
  }
  return getUsuario(user, userId)
}

export async function resetPassword(user: AuthUser, userId: string, novaSenha: string): Promise<boolean> {
  assertPermissao(user, PAPEIS_ADMIN, 'resetar senha')
  const db = getDb()
  const r = await db.query('UPDATE usuarios SET password_hash = $1 WHERE id = $2 RETURNING 1', [
    novaSenha,
    userId,
  ])
  return r.rowCount !== null && r.rowCount > 0
}
