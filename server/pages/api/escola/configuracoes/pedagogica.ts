import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as configService from '@/lib/escola/services/configuracoes'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        return requireAuth(req, res, async (user) => {
            const { anoLetivoId } = req.query
            if (!anoLetivoId) return jsonError(res, 'anoLetivoId é obrigatório', 400)
            try {
                const config = await configService.getConfigPedagogica(user, anoLetivoId as string)
                jsonSuccess(res, config)
            } catch (e) {
                jsonError(res, e instanceof Error ? e.message : 'Erro ao obter configuração', 500)
            }
        })
    }

    if (req.method === 'POST' || req.method === 'PATCH' || req.method === 'PUT') {
        return requireAuth(req, res, async (user) => {
            try {
                const config = await configService.updateConfigPedagogica(user, req.body)
                jsonSuccess(res, config)
            } catch (e) {
                jsonError(res, e instanceof Error ? e.message : 'Erro ao atualizar configuração', 500)
            }
        })
    }

    res.setHeader('Allow', 'GET, POST, PATCH, PUT')
    return jsonError(res, 'Method not allowed', 405)
}
