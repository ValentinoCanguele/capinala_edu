import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import { listPermissoes } from '@/lib/escola/services/permissoesService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return jsonError(res, 'Method not allowed', 405)
  }
  return requireAuth(req, res, async (user) => {
    const list = await listPermissoes(user)
    jsonSuccess(res, list)
  })
}
