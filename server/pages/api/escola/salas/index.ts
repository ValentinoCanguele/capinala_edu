import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as horariosService from '@/lib/escola/services/horarios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        return requireAuth(req, res, async (user) => {
            try {
                const list = await horariosService.listSalas(user)
                jsonSuccess(res, list)
            } catch (e) {
                jsonError(res, e instanceof Error ? e.message : 'Erro ao listar salas', 500)
            }
        })
    }
    if (req.method === 'POST') {
        return requireAuth(req, res, async (user) => {
            if (user.papel !== 'admin' && user.papel !== 'direcao') {
                return jsonError(res, 'Sem permissão', 403)
            }
            const { nome, capacidade } = req.body ?? {}
            if (!nome || typeof nome !== 'string') {
                return jsonError(res, 'Nome da sala é obrigatório', 400)
            }
            try {
                const created = await horariosService.createSala(user, { nome, capacidade })
                jsonSuccess(res, created, 201)
            } catch (e) {
                jsonError(res, e instanceof Error ? e.message : 'Erro ao criar sala', 500)
            }
        })
    }
    res.setHeader('Allow', 'GET, POST')
    return jsonError(res, 'Method not allowed', 405)
}
