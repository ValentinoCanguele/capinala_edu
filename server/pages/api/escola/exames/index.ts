import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import { assertPermissao, PAPEIS_GESTAO } from '@/lib/escola/permissoes'
import * as examesService from '@/lib/escola/services/exames'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        return requireAuth(req, res, async (user) => {
            const { turmaId, disciplinaId } = req.query
            try {
                const list = await examesService.listExames(user, {
                    turmaId: turmaId as string,
                    disciplinaId: disciplinaId as string
                })
                jsonSuccess(res, list)
            } catch (e) {
                jsonError(res, e instanceof Error ? e.message : 'Erro ao listar exames', 500)
            }
        })
    }

    if (req.method === 'POST') {
        return requireAuth(req, res, async (user) => {
            try {
                assertPermissao(user, PAPEIS_GESTAO, 'lançar nota de exame')
            } catch (e) {
                return jsonError(res, e instanceof Error ? e.message : 'Sem permissão', 403)
            }
            try {
                const ok = await examesService.upsertExame(user, req.body)
                jsonSuccess(res, { ok })
            } catch (e) {
                jsonError(res, e instanceof Error ? e.message : 'Erro ao lançar exame', 500)
            }
        })
    }

    if (req.method === 'DELETE') {
        return requireAuth(req, res, async (user) => {
            try {
                assertPermissao(user, PAPEIS_GESTAO, 'eliminar exame')
            } catch (e) {
                return jsonError(res, e instanceof Error ? e.message : 'Sem permissão', 403)
            }
            const { id } = req.query
            if (!id) return jsonError(res, 'ID é obrigatório', 400)
            try {
                const ok = await examesService.deleteExame(user, id as string)
                if (!ok) return jsonError(res, 'Exame não encontrado', 404)
                jsonSuccess(res, { ok })
            } catch (e) {
                jsonError(res, e instanceof Error ? e.message : 'Erro ao eliminar exame', 500)
            }
        })
    }

    res.setHeader('Allow', 'GET, POST, DELETE')
    return jsonError(res, 'Method not allowed', 405)
}
