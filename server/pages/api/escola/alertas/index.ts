import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import { listarAlertasAtivos, resolverAlerta } from '@/lib/escola/services/audit'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        return requireAuth(req, res, async (user) => {
            try {
                const alertas = await listarAlertasAtivos(user)
                jsonSuccess(res, alertas)
            } catch (e) {
                jsonError(res, e instanceof Error ? e.message : 'Erro ao listar alertas', 500)
            }
        })
    }
    if (req.method === 'PATCH') {
        return requireAuth(req, res, async (user) => {
            const { alertaId } = req.body ?? {}
            if (!alertaId) return jsonError(res, 'alertaId é obrigatório', 400)
            try {
                const resolvido = await resolverAlerta(user, alertaId)
                if (!resolvido) return jsonError(res, 'Alerta não encontrado', 404)
                jsonSuccess(res, { ok: true })
            } catch (e) {
                jsonError(res, e instanceof Error ? e.message : 'Erro ao resolver alerta', 500)
            }
        })
    }
    res.setHeader('Allow', 'GET, PATCH')
    return jsonError(res, 'Method not allowed', 405)
}
