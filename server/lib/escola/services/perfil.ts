import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import type { PerfilUpdate, AlterarSenhaInput } from '../schemas/perfil'
import { isAdmin } from '../permissoes'
import * as fs from 'fs'
import * as path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'uploads', 'perfil')
const MAX_FOTO_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']

function canAccessPessoa(user: AuthUser, pessoaId: string): boolean {
  if (user.pessoaId === pessoaId) return true
  return isAdmin(user)
}

export interface PerfilResponse {
  id: string
  nome: string
  email: string
  dataNascimento: string | null
  telefone: string | null
  bi: string | null
  biEmitidoEm: string | null
  biValidoAte: string | null
  fotoUrl: string | null
}

export async function getPerfil(user: AuthUser, pessoaId: string): Promise<PerfilResponse | null> {
  if (!canAccessPessoa(user, pessoaId)) return null
  const db = getDb()
  const result = await db.query(
    `SELECT id, nome, email, data_nascimento AS "dataNascimento", telefone, bi,
            bi_emitido_em AS "biEmitidoEm", bi_valido_ate AS "biValidoAte", foto_caminho AS "fotoCaminho"
     FROM pessoas WHERE id = $1`,
    [pessoaId]
  )
  const row = result.rows[0]
  if (!row) return null
  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    dataNascimento: row.dataNascimento ? String(row.dataNascimento).slice(0, 10) : null,
    telefone: row.telefone ?? null,
    bi: row.bi ?? null,
    biEmitidoEm: row.biEmitidoEm ? String(row.biEmitidoEm).slice(0, 10) : null,
    biValidoAte: row.biValidoAte ? String(row.biValidoAte).slice(0, 10) : null,
    fotoUrl: row.fotoCaminho ? `/api/escola/perfil/foto?pessoaId=${row.id}` : null,
  }
}

export async function updatePerfil(
  user: AuthUser,
  pessoaId: string,
  data: PerfilUpdate
): Promise<PerfilResponse | null> {
  if (!canAccessPessoa(user, pessoaId)) return null
  const db = getDb()
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
    values.push(data.dataNascimento || null)
  }
  if (data.telefone !== undefined) {
    updates.push(`telefone = $${i++}`)
    values.push(data.telefone || null)
  }
  if (data.bi !== undefined) {
    updates.push(`bi = $${i++}`)
    values.push(data.bi || null)
  }
  if (data.biEmitidoEm !== undefined) {
    updates.push(`bi_emitido_em = $${i++}::date`)
    values.push(data.biEmitidoEm || null)
  }
  if (data.biValidoAte !== undefined) {
    updates.push(`bi_valido_ate = $${i++}::date`)
    values.push(data.biValidoAte || null)
  }
  if (updates.length === 0) return getPerfil(user, pessoaId)
  values.push(pessoaId)
  await db.query(
    `UPDATE pessoas SET ${updates.join(', ')} WHERE id = $${i}`,
    values
  )
  return getPerfil(user, pessoaId)
}

export async function alterarSenha(
  user: AuthUser,
  pessoaId: string,
  data: AlterarSenhaInput
): Promise<boolean> {
  if (user.pessoaId !== pessoaId) return false
  const db = getDb()
  const u = await db.query(
    'SELECT id, password_hash FROM usuarios WHERE pessoa_id = $1 LIMIT 1',
    [pessoaId]
  )
  if (u.rows.length === 0) return false
  const currentHash = u.rows[0].password_hash
  if (currentHash !== data.senhaAtual) return false
  await db.query('UPDATE usuarios SET password_hash = $1 WHERE pessoa_id = $2', [
    data.senhaNova,
    pessoaId,
  ])
  return true
}

function ensureUploadDir(): string {
  const dir = path.join(UPLOAD_DIR)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

export async function uploadFotoPerfil(
  user: AuthUser,
  pessoaId: string,
  buffer: Buffer,
  mimeType: string,
  originalName: string
): Promise<boolean> {
  if (!canAccessPessoa(user, pessoaId)) return false
  if (!ALLOWED_MIME.includes(mimeType) || buffer.length > MAX_FOTO_SIZE) return false
  const ext = mimeType === 'image/png' ? '.png' : mimeType === 'image/webp' ? '.webp' : '.jpg'
  const dir = ensureUploadDir()
  const filename = `${pessoaId}${ext}`
  const filepath = path.join(dir, filename)
  fs.writeFileSync(filepath, buffer)
  const db = getDb()
  await db.query('UPDATE pessoas SET foto_caminho = $1 WHERE id = $2', [filepath, pessoaId])
  return true
}

export async function getFotoPerfilPath(user: AuthUser, pessoaId: string): Promise<string | null> {
  if (!canAccessPessoa(user, pessoaId)) return null
  const db = getDb()
  const r = await db.query('SELECT foto_caminho FROM pessoas WHERE id = $1', [pessoaId])
  const p = r.rows[0]?.foto_caminho
  if (!p || !fs.existsSync(p)) return null
  return p
}

export async function removeFotoPerfil(user: AuthUser, pessoaId: string): Promise<boolean> {
  if (!canAccessPessoa(user, pessoaId)) return false
  const filepath = await getFotoPerfilPath(user, pessoaId)
  if (filepath) fs.unlinkSync(filepath)
  const db = getDb()
  await db.query('UPDATE pessoas SET foto_caminho = NULL WHERE id = $1', [pessoaId])
  return true
}
