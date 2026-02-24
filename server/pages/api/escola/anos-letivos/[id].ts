import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as anosLetivosService from '@/lib/escola/services/anosLetivos'
import { anoLetivoUpdateSchema } from '@/lib/escola/schemas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string
  if (!id) return jsonError(res, 'ID é obrigatório', 400)

  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      const ano = await anosLetivosService.getAnoLetivo(user, id)
      if (!ano) return jsonError(res, 'Ano letivo não encontrado', 404)
      jsonSuccess(res, ano)
    })
  }
  if (req.method === 'PUT') {
    return requireAuth(req, res, async (user) => {
      const parsed = anoLetivoUpdateSchema.safeParse(req.body)
      if (!parsed.success) {
        const msg = parsed.error.flatten().message
        return jsonError(res, typeof msg === 'string' ? msg : 'Dados inválidos', 400)
      }
      const updated = await anosLetivosService.updateAnoLetivo(user, id, parsed.data)
      if (!updated) return jsonError(res, 'Ano letivo não encontrado', 404)
      jsonSuccess(res, updated)
    })
  }
  res.setHeader('Allow', 'GET, PUT')
  return jsonError(res, 'Method not allowed', 405)
}
