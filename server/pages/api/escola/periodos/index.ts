import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as periodosService from '@/lib/escola/services/periodos'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return jsonError(res, 'Method not allowed', 405)
  }
  const anoLetivoId = req.query.anoLetivoId as string
  if (!anoLetivoId) return jsonError(res, 'anoLetivoId é obrigatório', 400)
  return requireAuth(req, res, async (user) => {
    try {
      const list = await periodosService.listPeriodosByAnoLetivo(user, anoLetivoId)
      jsonSuccess(res, list)
    } catch (e) {
      jsonError(res, e instanceof Error ? e.message : 'Erro ao listar períodos', 500)
    }
  })
}
