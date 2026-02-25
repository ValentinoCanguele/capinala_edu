import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonError } from '@/lib/apiWrapper'
import { getDocumento, deleteDocumento } from '@/lib/escola/services/documentos'
import * as fs from 'fs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string
  if (!id) return jsonError(res, 'id é obrigatório', 400)
  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      const doc = await getDocumento(user, id)
      if (!doc) {
        res.status(404).end()
        return
      }
      const buf = fs.readFileSync(doc.filepath)
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${encodeURIComponent(doc.nomeFicheiro)}"`
      )
      res.setHeader('Content-Type', doc.tipoMime || 'application/octet-stream')
      res.send(buf)
    })
  }
  if (req.method === 'DELETE') {
    return requireAuth(req, res, async (user) => {
      const ok = await deleteDocumento(user, id)
      if (!ok) return jsonError(res, 'Documento não encontrado', 404)
      res.status(204).end()
    })
  }
  res.setHeader('Allow', 'GET, DELETE')
  return jsonError(res, 'Method not allowed', 405)
}
