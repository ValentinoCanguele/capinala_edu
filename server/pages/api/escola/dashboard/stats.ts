import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as dashboardService from '@/lib/escola/services/dashboard'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        return requireAuth(req, res, async (user) => {
            try {
                const stats = await dashboardService.getDashboardStats(user)
                jsonSuccess(res, stats)
            } catch (e) {
                jsonError(res, e instanceof Error ? e.message : 'Erro ao obter estatísticas', 500)
            }
        })
    }
    res.setHeader('Allow', 'GET')
    return jsonError(res, 'Method not allowed', 405)
}
