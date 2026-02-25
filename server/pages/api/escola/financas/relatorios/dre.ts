import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as relatoriosService from '@/lib/escola/services/financas/relatorios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return jsonError(res, 'Method not allowed', 405)
  }
  const dataInicio = req.query.dataInicio as string
  const dataFim = req.query.dataFim as string
  if (!dataInicio || !dataFim) {
    return jsonError(res, 'dataInicio e dataFim são obrigatórios', 400)
  }
  return requireAuth(req, res, async (user) => {
    try {
      const dre = await relatoriosService.getDRESimplificado(
        user,
        dataInicio,
        dataFim
      )
      jsonSuccess(res, dre)
    } catch (e) {
      jsonError(
        res,
        e instanceof Error ? e.message : 'Erro ao obter DRE',
        500
      )
    }
  })
}
