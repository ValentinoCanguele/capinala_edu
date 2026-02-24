import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as comunicadosService from '@/lib/escola/services/comunicados'
import { comunicadoUpdateSchema } from '@/lib/escola/schemas/comunicado'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string
  if (!id) return jsonError(res, 'ID é obrigatório', 400)

  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      const comunicado = await comunicadosService.getComunicado(user, id)
      if (!comunicado) return jsonError(res, 'Comunicado não encontrado', 404)
      jsonSuccess(res, comunicado)
    })
  }
  if (req.method === 'PUT') {
    return requireAuth(req, res, async (user) => {
      const parsed = comunicadoUpdateSchema.safeParse(req.body)
      if (!parsed.success) {
        return jsonError(res, 'Dados inválidos', 400)
      }
      const updated = await comunicadosService.updateComunicado(user, id, parsed.data)
      if (!updated) return jsonError(res, 'Comunicado não encontrado ou sem permissão', 404)
      jsonSuccess(res, updated)
    })
  }
  if (req.method === 'DELETE') {
    return requireAuth(req, res, async (user) => {
      const ok = await comunicadosService.deleteComunicado(user, id)
      if (!ok) return jsonError(res, 'Comunicado não encontrado ou sem permissão', 404)
      jsonSuccess(res, { ok: true })
    })
  }
  res.setHeader('Allow', 'GET, PUT, DELETE')
  return jsonError(res, 'Method not allowed', 405)
}
