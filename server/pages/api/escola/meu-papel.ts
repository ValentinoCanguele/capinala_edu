import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET')
      return jsonError(res, 'Method not allowed', 405)
    }
    return requireAuth(req, res, async (user) => {
      jsonSuccess(res, {
        papel: user.papel,
        userId: user.userId,
        pessoaId: user.pessoaId,
        escolaId: user.escolaId,
      })
    })
  } catch (err) {
    if (!res.writableEnded) {
      jsonError(res, err instanceof Error ? err.message : 'Erro no servidor', 503)
    }
  }
}
