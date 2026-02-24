import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as periodosService from '@/lib/escola/services/periodos'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return jsonError(res, 'Method not allowed', 405)
  }
  const anoLetivoId = typeof req.body?.anoLetivoId === 'string' ? req.body.anoLetivoId : null
  if (!anoLetivoId) return jsonError(res, 'anoLetivoId é obrigatório', 400)
  return requireAuth(req, res, async (user) => {
    try {
      const list = await periodosService.getOrCreatePeriodosForAno(user, anoLetivoId)
      jsonSuccess(res, list)
    } catch (e) {
      jsonError(res, e instanceof Error ? e.message : 'Erro ao criar períodos', 500)
    }
  })
}
