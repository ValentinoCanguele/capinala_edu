import { randomUUID } from 'crypto'
import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import * as fs from 'fs'
import * as path from 'path'
import { isAdmin } from '../permissoes'

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), 'uploads', 'documentos')
const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_MIME = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export interface DocumentoRow {
  id: string
  titulo: string
  nomeFicheiro: string
  tipoMime: string | null
  tamanho: number | null
  createdAt: string
  pessoaId: string | null
  alunoId: string | null
}

async function canAccessPessoaDocumentos(user: AuthUser, pessoaId: string): Promise<boolean> {
  if (user.pessoaId === pessoaId) return true
  return isAdmin(user)
}

async function canAccessAlunoDocumentos(user: AuthUser, alunoId: string): Promise<boolean> {
  const db = getDb()
  if (user.papel === 'aluno') {
    const r = await db.query('SELECT 1 FROM alunos WHERE id = $1 AND pessoa_id = $2', [
      alunoId,
      user.pessoaId,
    ])
    return r.rows.length > 0
  }
  if (user.papel === 'responsavel') {
    const r = await db.query(
      `SELECT 1 FROM vinculo_responsavel_aluno v
       JOIN responsaveis r ON r.id = v.responsavel_id WHERE v.aluno_id = $1 AND r.pessoa_id = $2`,
      [alunoId, user.pessoaId]
    )
    return r.rows.length > 0
  }
  return isAdmin(user)
}

export async function listDocumentos(
  user: AuthUser,
  filters: { pessoaId?: string; alunoId?: string }
): Promise<DocumentoRow[]> {
  const db = getDb()
  if (filters.pessoaId) {
    if (!(await canAccessPessoaDocumentos(user, filters.pessoaId))) return []
    const r = await db.query(
      `SELECT id, titulo, nome_ficheiro AS "nomeFicheiro", tipo_mime AS "tipoMime", tamanho,
              created_at AS "createdAt", pessoa_id AS "pessoaId", aluno_id AS "alunoId"
       FROM documentos WHERE pessoa_id = $1 ORDER BY created_at DESC`,
      [filters.pessoaId]
    )
    return r.rows
  }
  if (filters.alunoId) {
    if (!(await canAccessAlunoDocumentos(user, filters.alunoId))) return []
    const r = await db.query(
      `SELECT id, titulo, nome_ficheiro AS "nomeFicheiro", tipo_mime AS "tipoMime", tamanho,
              created_at AS "createdAt", pessoa_id AS "pessoaId", aluno_id AS "alunoId"
       FROM documentos WHERE aluno_id = $1 ORDER BY created_at DESC`,
      [filters.alunoId]
    )
    return r.rows
  }
  return []
}

function ensureDir(): string {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  return UPLOAD_DIR
}

export async function uploadDocumento(
  user: AuthUser,
  buffer: Buffer,
  mimeType: string,
  originalName: string,
  opts: { pessoaId?: string; alunoId?: string; titulo: string }
): Promise<DocumentoRow | null> {
  if (!opts.titulo?.trim()) return null
  if (!ALLOWED_MIME.includes(mimeType) || buffer.length > MAX_SIZE) return null
  const pessoaId = opts.pessoaId || (opts.alunoId ? null : user.pessoaId)
  const alunoId = opts.alunoId || null
  if (pessoaId && !(await canAccessPessoaDocumentos(user, pessoaId))) return null
  if (alunoId && !(await canAccessAlunoDocumentos(user, alunoId))) return null
  if (!pessoaId && !alunoId) return null

  const dir = ensureDir()
  const id = randomUUID()
  const ext = path.extname(originalName) || '.bin'
  const safeName = `${id}${ext}`
  const filepath = path.join(dir, safeName)
  fs.writeFileSync(filepath, buffer)

  const db = getDb()
  await db.query(
    `INSERT INTO documentos (id, pessoa_id, aluno_id, titulo, nome_ficheiro, tipo_mime, tamanho, caminho)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, pessoaId, alunoId, opts.titulo.trim(), originalName, mimeType, buffer.length, filepath]
  )
  const row = await db.query(
    `SELECT id, titulo, nome_ficheiro AS "nomeFicheiro", tipo_mime AS "tipoMime", tamanho,
            created_at AS "createdAt", pessoa_id AS "pessoaId", aluno_id AS "alunoId"
     FROM documentos WHERE id = $1`,
    [id]
  )
  return row.rows[0] ?? null
}

export async function getDocumento(
  user: AuthUser,
  documentoId: string
): Promise<{ filepath: string; nomeFicheiro: string; tipoMime: string | null } | null> {
  const db = getDb()
  const r = await db.query(
    'SELECT caminho, nome_ficheiro AS "nomeFicheiro", tipo_mime AS "tipoMime", pessoa_id AS "pessoaId", aluno_id AS "alunoId" FROM documentos WHERE id = $1',
    [documentoId]
  )
  const row = r.rows[0]
  if (!row || !fs.existsSync(row.caminho)) return null
  if (row.pessoaId && !(await canAccessPessoaDocumentos(user, row.pessoaId))) return null
  if (row.alunoId && !(await canAccessAlunoDocumentos(user, row.alunoId))) return null
  return { filepath: row.caminho, nomeFicheiro: row.nomeFicheiro, tipoMime: row.tipoMime }
}

export async function deleteDocumento(user: AuthUser, documentoId: string): Promise<boolean> {
  const doc = await getDocumento(user, documentoId)
  if (!doc) return false
  try {
    fs.unlinkSync(doc.filepath)
  } catch {
    // ignore
  }
  const db = getDb()
  await db.query('DELETE FROM documentos WHERE id = $1', [documentoId])
  return true
}
