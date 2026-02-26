import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as frequenciaService from '@/lib/escola/services/frequencia'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST')
        return jsonError(res, 'Method not allowed', 405)
    }

    return requireAuth(req, res, async (user) => {
        const { identifier, sentido } = req.body

        if (!identifier) {
            return jsonError(res, 'O identificador do aluno é obrigatório', 400)
        }

        try {
            const result = await frequenciaService.processarAcessoQR(
                user,
                identifier as string,
                sentido as 'entrada' | 'saida' || 'entrada'
            )
            jsonSuccess(res, result)
        } catch (e) {
            jsonError(res, e instanceof Error ? e.message : 'Erro ao processar acesso', 500)
        }
    })
}
