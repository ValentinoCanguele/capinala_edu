import type { NextApiRequest, NextApiResponse } from 'next'
import { getAuthUser } from '@/lib/auth'
import { refreshTokenFromPayload } from '@/lib/core/tokenRefresh'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'

/**
 * POST /api/auth/refresh — renova o JWT desde que o token atual seja válido.
 * Header: Authorization: Bearer <token>
 * Resposta: { token, expiresIn }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return jsonError(res, 'Method not allowed', 405)
  }

  const user = await getAuthUser(req)
  if (!user) {
    return jsonError(res, 'Não autorizado', 401)
  }

  try {
    const result = await refreshTokenFromPayload({
      sub: user.userId,
      pessoaId: user.pessoaId,
      escolaId: user.escolaId,
      papel: user.papel,
    })
    return jsonSuccess(res, { token: result.token, expiresIn: result.expiresIn })
  } catch {
    return jsonError(res, 'Erro ao renovar token', 500)
  }
}
