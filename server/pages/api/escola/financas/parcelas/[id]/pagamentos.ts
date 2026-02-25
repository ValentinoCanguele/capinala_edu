import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as parcelasService from '@/lib/escola/services/financas/parcelas'
import { pagamentoCreateSchema } from '@/lib/escola/schemas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const parcelaId = req.query.id as string
  if (!parcelaId) return jsonError(res, 'ID da parcela é obrigatório', 400)

  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      try {
        const list = await parcelasService.listPagamentosByParcela(user, parcelaId)
        jsonSuccess(res, list)
      } catch (e) {
        jsonError(res, e instanceof Error ? e.message : 'Erro ao listar pagamentos', 500)
      }
    })
  }
  if (req.method === 'POST') {
    return requireAuth(req, res, async (user) => {
      const parsed = pagamentoCreateSchema.safeParse({ ...req.body, parcelaId })
      if (!parsed.success) {
        const msg = parsed.error.flatten().message
        return jsonError(res, typeof msg === 'string' ? msg : 'Dados inválidos', 400)
      }
      try {
        const updated = await parcelasService.registrarPagamento(user, parsed.data)
        if (!updated) return jsonError(res, 'Parcela não encontrada', 404)
        jsonSuccess(res, updated, 200)
      } catch (e) {
        jsonError(res, e instanceof Error ? e.message : 'Erro ao registar pagamento', 500)
      }
    })
  }
  res.setHeader('Allow', 'GET, POST')
  return jsonError(res, 'Method not allowed', 405)
}
