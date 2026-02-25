import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import { assertPermissao, PAPEIS_ADMIN } from '../permissoes'

export interface PermissaoItem {
  id: string
  codigo: string
  descricao: string | null
}

export async function listPermissoes(user: AuthUser): Promise<PermissaoItem[]> {
  assertPermissao(user, PAPEIS_ADMIN, 'listar permissões')
  const db = getDb()
  const r = await db.query('SELECT id, codigo, descricao FROM permissoes ORDER BY codigo')
  return r.rows
}

export async function getPermissoesUsuario(user: AuthUser, userId: string): Promise<string[]> {
  assertPermissao(user, PAPEIS_ADMIN, 'ver permissões do utilizador')
  const db = getDb()
  const r = await db.query(
    `SELECT p.codigo FROM usuario_permissoes up
     JOIN permissoes p ON p.id = up.permissao_id
     WHERE up.usuario_id = $1`,
    [userId]
  )
  return r.rows.map((row) => row.codigo)
}

export async function setPermissoesUsuario(
  user: AuthUser,
  userId: string,
  codigos: string[]
): Promise<void> {
  assertPermissao(user, PAPEIS_ADMIN, 'atribuir permissões')
  const db = getDb()
  await db.query('DELETE FROM usuario_permissoes WHERE usuario_id = $1', [userId])
  if (codigos.length === 0) return
  const permIds = await db.query(
    'SELECT id, codigo FROM permissoes WHERE codigo = ANY($1::text[])',
    [codigos]
  )
  const toInsert = permIds.rows.map((p) => [userId, p.id])
  for (const [uid, pid] of toInsert) {
    await db.query('INSERT INTO usuario_permissoes (usuario_id, permissao_id) VALUES ($1, $2)', [
      uid,
      pid,
    ])
  }
}

export async function userHasPermissao(user: AuthUser, codigo: string): Promise<boolean> {
  const db = getDb()
  if (PAPEIS_ADMIN.includes(user.papel)) return true
  const r = await db.query(
    `SELECT 1 FROM usuario_permissoes up
     JOIN permissoes p ON p.id = up.permissao_id
     WHERE up.usuario_id = $1 AND p.codigo = $2`,
    [user.userId, codigo]
  )
  return r.rows.length > 0
}
