import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import { assertPermissao, PAPEIS_ADMIN } from '@/lib/escola/permissoes'
import * as atasService from '@/lib/escola/services/atas'
import { ataCreateSchema } from '@/lib/escola/schemas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        return requireAuth(req, res, async (user) => {
            const { turmaId, periodoId } = req.query
            try {
                const list = await atasService.listAtas(user, {
                    turmaId: turmaId as string,
                    periodoId: periodoId as string
                })
                jsonSuccess(res, list)
            } catch (e) {
                jsonError(res, e instanceof Error ? e.message : 'Erro ao listar atas', 500)
            }
        })
    }

    if (req.method === 'POST') {
        return requireAuth(req, res, async (user) => {
            try {
                assertPermissao(user, PAPEIS_ADMIN, 'criar ata')
            } catch (e) {
                return jsonError(res, e instanceof Error ? e.message : 'Sem permissão', 403)
            }
            const parsed = ataCreateSchema.safeParse(req.body)
            if (!parsed.success) {
                return jsonError(res, parsed.error.issues[0].message, 400)
            }
            try {
                const created = await atasService.createAta(user, parsed.data)
                jsonSuccess(res, created, 201)
            } catch (e) {
                jsonError(res, e instanceof Error ? e.message : 'Erro ao criar ata', 500)
            }
        })
    }

    res.setHeader('Allow', 'GET, POST')
    return jsonError(res, 'Method not allowed', 405)
}
