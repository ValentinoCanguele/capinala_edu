import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as comunicadosService from '@/lib/escola/services/comunicados'
import { comunicadoCreateSchema } from '@/lib/escola/schemas/comunicado'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        return requireAuth(req, res, async (user) => {
            try {
                const list = await comunicadosService.listComunicados(user)
                jsonSuccess(res, list)
            } catch (e) {
                jsonError(res, e instanceof Error ? e.message : 'Erro ao listar comunicados', 500)
            }
        })
    }
    if (req.method === 'POST') {
        return requireAuth(req, res, async (user) => {
            if (user.papel !== 'admin' && user.papel !== 'direcao' && user.papel !== 'professor') {
                return jsonError(res, 'Sem permissão', 403)
            }
            const parsed = comunicadoCreateSchema.safeParse(req.body)
            if (!parsed.success) {
                return jsonError(res, 'Dados inválidos', 400)
            }
            try {
                const created = await comunicadosService.createComunicado(user, parsed.data)
                jsonSuccess(res, created, 201)
            } catch (e) {
                jsonError(res, e instanceof Error ? e.message : 'Erro ao criar comunicado', 500)
            }
        })
    }
    res.setHeader('Allow', 'GET, POST')
    return jsonError(res, 'Method not allowed', 405)
}
