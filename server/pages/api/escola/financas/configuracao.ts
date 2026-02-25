import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as configService from '@/lib/escola/services/financas/configuracao'
import { configuracaoFinanceiraUpdateSchema } from '@/lib/escola/schemas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      try {
        const config = await configService.getConfiguracaoFinanceira(user)
        jsonSuccess(res, config)
      } catch (e) {
        jsonError(res, e instanceof Error ? e.message : 'Erro ao obter configuração', 500)
      }
    })
  }
  if (req.method === 'PUT') {
    return requireAuth(req, res, async (user) => {
      const parsed = configuracaoFinanceiraUpdateSchema.safeParse(req.body)
      if (!parsed.success) {
        const msg = parsed.error.flatten().message
        return jsonError(res, typeof msg === 'string' ? msg : 'Dados inválidos', 400)
      }
      try {
        const updated = await configService.updateConfiguracaoFinanceira(user, parsed.data)
        jsonSuccess(res, updated)
      } catch (e) {
        jsonError(res, e instanceof Error ? e.message : 'Erro ao atualizar configuração', 500)
      }
    })
  }
  res.setHeader('Allow', 'GET, PUT')
  return jsonError(res, 'Method not allowed', 405)
}
