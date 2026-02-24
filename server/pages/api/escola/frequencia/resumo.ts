import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import { getResumoFrequencia, getRelatorioTurma } from '@/lib/escola/services/frequencia'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        return requireAuth(req, res, async (user) => {
            const turmaId = req.query.turmaId as string
            const disciplinaId = req.query.disciplinaId as string | undefined
            const tipo = req.query.tipo as string | undefined

            if (!turmaId) {
                return jsonError(res, 'turmaId é obrigatório', 400)
            }

            try {
                if (tipo === 'relatorio') {
                    const relatorio = await getRelatorioTurma(user, turmaId)
                    return jsonSuccess(res, relatorio)
                }
                const resumos = await getResumoFrequencia(user, turmaId, disciplinaId)
                jsonSuccess(res, resumos)
            } catch (e) {
                jsonError(res, e instanceof Error ? e.message : 'Erro ao obter resumo de frequência', 500)
            }
        })
    }
    res.setHeader('Allow', 'GET')
    return jsonError(res, 'Method not allowed', 405)
}
