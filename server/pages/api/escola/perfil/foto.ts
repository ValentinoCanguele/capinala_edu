import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import {
  getFotoPerfilPath,
  uploadFotoPerfil,
  removeFotoPerfil,
} from '@/lib/escola/services/perfil'
import * as fs from 'fs'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']

export const config = {
  api: { bodyParser: { sizeLimit: '3mb' } },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      const pessoaId = (req.query.pessoaId as string) || user.pessoaId
      const filepath = await getFotoPerfilPath(user, pessoaId)
      if (!filepath) {
        res.status(404).end()
        return
      }
      const buf = fs.readFileSync(filepath)
      const ext = filepath.slice(-4)
      const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg'
      res.setHeader('Content-Type', mime)
      res.setHeader('Cache-Control', 'private, max-age=3600')
      res.send(buf)
    })
  }
  if (req.method === 'POST') {
    return requireAuth(req, res, async (user) => {
      const body = req.body as { image?: string }
      if (!body?.image || typeof body.image !== 'string') {
        return jsonError(res, 'Envie image (base64 data URL)', 400)
      }
      const match = body.image.match(/^data:([^;]+);base64,(.+)$/)
      if (!match) return jsonError(res, 'Formato de imagem inválido', 400)
      const mimeType = match[1]
      if (!ALLOWED_MIME.includes(mimeType)) {
        return jsonError(res, 'Tipo de imagem não permitido (use JPEG, PNG ou WebP)', 400)
      }
      const buffer = Buffer.from(match[2], 'base64')
      const ok = await uploadFotoPerfil(user, user.pessoaId, buffer, mimeType, 'foto.jpg')
      if (!ok) return jsonError(res, 'Falha ao guardar foto', 400)
      jsonSuccess(res, { ok: true })
    })
  }
  if (req.method === 'DELETE') {
    return requireAuth(req, res, async (user) => {
      await removeFotoPerfil(user, user.pessoaId)
      jsonSuccess(res, { ok: true })
    })
  }
  res.setHeader('Allow', 'GET, POST, DELETE')
  return jsonError(res, 'Method not allowed', 405)
}
