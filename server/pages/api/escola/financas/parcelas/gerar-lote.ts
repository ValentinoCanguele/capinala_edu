import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import { gerarParcelasLoteSchema } from '@/lib/escola/schemas'
import * as parcelasService from '@/lib/escola/services/financas/parcelas'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return jsonError(res, 'Method not allowed', 405)
  }
  return requireAuth(req, res, async (user) => {
    const parsed = gerarParcelasLoteSchema.safeParse(req.body)
    if (!parsed.success) {
      const msg = parsed.error.flatten().message
      return jsonError(
        res,
        typeof msg === 'string' ? msg : 'Dados inválidos',
        400
      )
    }
    try {
      const result = await parcelasService.gerarParcelasLote(user, parsed.data)
      jsonSuccess(res, result, 201)
    } catch (e) {
      jsonError(
        res,
        e instanceof Error ? e.message : 'Erro ao gerar parcelas em lote',
        500
      )
    }
  })
}
