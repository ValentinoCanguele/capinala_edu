import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as relatoriosService from '@/lib/escola/services/financas/relatorios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return jsonError(res, 'Method not allowed', 405)
  }
  const anoLetivoId = req.query.anoLetivoId as string | undefined
  const dataReferencia = req.query.dataReferencia as string | undefined
  return requireAuth(req, res, async (user) => {
    try {
      const list = await relatoriosService.getInadimplencia(
        user,
        anoLetivoId,
        dataReferencia
      )
      jsonSuccess(res, list)
    } catch (e) {
      jsonError(
        res,
        e instanceof Error ? e.message : 'Erro ao obter inadimplência',
        500
      )
    }
  })
}
