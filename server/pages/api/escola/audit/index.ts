import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import { listarAuditLog } from '@/lib/escola/services/audit'

/**
 * GET /api/escola/audit — lista o log de auditoria da escola.
 * Query: entidade (opcional), limit (opcional, default 50).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return jsonError(res, 'Method not allowed', 405)
  }

  return requireAuth(req, res, async (user) => {
    try {
      const entidade = typeof req.query.entidade === 'string' ? req.query.entidade : undefined
      const limit = req.query.limit !== undefined ? Number(req.query.limit) : 50
      const entries = await listarAuditLog(user, { entidade, limit: Math.min(limit, 200) })
      jsonSuccess(res, entries)
    } catch (e) {
      jsonError(res, e instanceof Error ? e.message : 'Erro ao listar log de auditoria', 500)
    }
  })
}
