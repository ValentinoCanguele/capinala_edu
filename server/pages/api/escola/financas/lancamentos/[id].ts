import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as lancamentosService from '@/lib/escola/services/financas/lancamentos'
import { lancamentoUpdateSchema } from '@/lib/escola/schemas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string
  if (!id) return jsonError(res, 'ID é obrigatório', 400)

  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      const lanc = await lancamentosService.getLancamento(user, id)
      if (!lanc) return jsonError(res, 'Lançamento não encontrado', 404)
      jsonSuccess(res, lanc)
    })
  }
  if (req.method === 'PUT') {
    return requireAuth(req, res, async (user) => {
      const parsed = lancamentoUpdateSchema.safeParse(req.body)
      if (!parsed.success) {
        const msg = parsed.error.flatten().message
        return jsonError(res, typeof msg === 'string' ? msg : 'Dados inválidos', 400)
      }
      const updated = await lancamentosService.updateLancamento(user, id, parsed.data)
      if (!updated) return jsonError(res, 'Lançamento não encontrado', 404)
      jsonSuccess(res, updated)
    })
  }
  if (req.method === 'DELETE') {
    return requireAuth(req, res, async (user) => {
      const ok = await lancamentosService.deleteLancamento(user, id)
      if (!ok) return jsonError(res, 'Lançamento não encontrado', 404)
      jsonSuccess(res, { ok: true })
    })
  }
  res.setHeader('Allow', 'GET, PUT, DELETE')
  return jsonError(res, 'Method not allowed', 405)
}
