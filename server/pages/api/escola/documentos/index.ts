import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import { listDocumentos, uploadDocumento } from '@/lib/escola/services/documentos'

const ALLOWED_MIME = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

export const config = { api: { bodyParser: { sizeLimit: '11mb' } } }

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      const pessoaId = (req.query.pessoaId as string) || undefined
      const alunoId = (req.query.alunoId as string) || undefined
      const list = await listDocumentos(user, { pessoaId, alunoId })
      jsonSuccess(res, list)
    })
  }
  if (req.method === 'POST') {
    return requireAuth(req, res, async (user) => {
      const body = req.body as {
        titulo?: string
        pessoaId?: string
        alunoId?: string
        image?: string
        file?: string
        mimeType?: string
        fileName?: string
      }
      const titulo = body.titulo?.trim()
      if (!titulo) return jsonError(res, 'titulo é obrigatório', 400)
      const image = body.image || body.file
      if (!image || typeof image !== 'string') return jsonError(res, 'Envie image ou file (base64)', 400)
      const match = image.match(/^data:([^;]+);base64,(.+)$/)
      const buffer = match ? Buffer.from(match[2], 'base64') : Buffer.from(image, 'base64')
      const mimeType = match ? match[1] : (body.mimeType as string) || 'application/octet-stream'
      if (!ALLOWED_MIME.includes(mimeType)) {
        return jsonError(res, 'Tipo de ficheiro não permitido', 400)
      }
      const fileName = body.fileName || 'documento'
      const doc = await uploadDocumento(user, buffer, mimeType, fileName, {
        titulo,
        pessoaId: body.pessoaId,
        alunoId: body.alunoId,
      })
      if (!doc) return jsonError(res, 'Falha ao guardar documento', 400)
      jsonSuccess(res, doc)
    })
  }
  res.setHeader('Allow', 'GET, POST')
  return jsonError(res, 'Method not allowed', 405)
}
