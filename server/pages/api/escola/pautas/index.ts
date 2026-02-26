import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as boletinsService from '@/lib/escola/services/boletins'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET')
        return jsonError(res, 'Method not allowed', 405)
    }

    return requireAuth(req, res, async (user) => {
        const { turmaId, periodoId } = req.query

        if (!turmaId || !periodoId) {
            return jsonError(res, 'Parâmetros turmaId e periodoId são obrigatórios', 400)
        }

        try {
            const data = await boletinsService.getPautaGeral(
                user,
                turmaId as string,
                periodoId as string
            )
            jsonSuccess(res, data)
        } catch (e) {
            jsonError(res, e instanceof Error ? e.message : 'Erro ao gerar pauta geral', 500)
        }
    })
}
