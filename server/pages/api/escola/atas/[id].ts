import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import { assertPermissao, PAPEIS_ADMIN } from '@/lib/escola/permissoes'
import * as atasService from '@/lib/escola/services/atas'
import { ataUpdateSchema } from '@/lib/escola/schemas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = req.query.id as string
    if (!id) return jsonError(res, 'ID é obrigatório', 400)

    if (req.method === 'GET') {
        return requireAuth(req, res, async (user) => {
            try {
                const item = await atasService.getAta(user, id)
                if (!item) return jsonError(res, 'Ata não encontrada', 404)
                jsonSuccess(res, item)
            } catch (e) {
                jsonError(res, e instanceof Error ? e.message : 'Erro ao obter ata', 500)
            }
        })
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
        return requireAuth(req, res, async (user) => {
            try {
                assertPermissao(user, PAPEIS_ADMIN, 'atualizar ata')
            } catch (e) {
                return jsonError(res, e instanceof Error ? e.message : 'Sem permissão', 403)
            }
            const parsed = ataUpdateSchema.safeParse(req.body)
            if (!parsed.success) {
                return jsonError(res, parsed.error.issues[0].message, 400)
            }
            try {
                const item = await atasService.updateAta(user, id, parsed.data)
                if (!item) return jsonError(res, 'Ata não encontrada', 404)
                jsonSuccess(res, item)
            } catch (e) {
                jsonError(res, e instanceof Error ? e.message : 'Erro ao atualizar ata', 500)
            }
        })
    }

    if (req.method === 'DELETE') {
        return requireAuth(req, res, async (user) => {
            try {
                assertPermissao(user, PAPEIS_ADMIN, 'eliminar ata')
            } catch (e) {
                return jsonError(res, e instanceof Error ? e.message : 'Sem permissão', 403)
            }
            try {
                const ok = await atasService.deleteAta(user, id)
                if (!ok) return jsonError(res, 'Ata não encontrada', 404)
                jsonSuccess(res, { ok: true })
            } catch (e) {
                jsonError(res, e instanceof Error ? e.message : 'Erro ao eliminar ata', 500)
            }
        })
    }

    res.setHeader('Allow', 'GET, PATCH, PUT, DELETE')
    return jsonError(res, 'Method not allowed', 405)
}
