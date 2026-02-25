import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as parcelasService from '@/lib/escola/services/financas/parcelas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string
  if (!id) return jsonError(res, 'ID é obrigatório', 400)

  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      const parcela = await parcelasService.getParcela(user, id)
      if (!parcela) return jsonError(res, 'Parcela não encontrada', 404)
      jsonSuccess(res, parcela)
    })
  }
  res.setHeader('Allow', 'GET')
  return jsonError(res, 'Method not allowed', 405)
}
