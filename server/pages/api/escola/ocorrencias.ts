import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import { assertPermissao, PAPEIS_GESTAO } from '@/lib/escola/permissoes'
import * as ocorrenciasService from '@/lib/escola/services/ocorrencias'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    return requireAuth(req, res, async (user) => {
        switch (req.method) {
            case 'GET':
                try {
                    const { alunoId, turmaId, resolvido } = req.query
                    const result = await ocorrenciasService.getOcorrencias(user, {
                        alunoId: alunoId as string,
                        turmaId: turmaId as string,
                        resolvido: resolvido !== undefined ? resolvido === 'true' : undefined
                    })
                    return jsonSuccess(res, result)
                } catch (e: any) {
                    return jsonError(res, e.message, 500)
                }

            case 'POST':
                try {
                    assertPermissao(user, PAPEIS_GESTAO, 'criar ocorrência')
                } catch (e: any) {
                    return jsonError(res, e.message, 403)
                }
                try {
                    const result = await ocorrenciasService.createOcorrencia(user, req.body)
                    return jsonSuccess(res, result)
                } catch (e: any) {
                    return jsonError(res, e.message, 500)
                }

            case 'PATCH':
                try {
                    assertPermissao(user, PAPEIS_GESTAO, 'resolver ocorrência')
                } catch (e: any) {
                    return jsonError(res, e.message, 403)
                }
                try {
                    const { id, resolvido } = req.body
                    if (!id) return jsonError(res, 'ID is required', 400)
                    const result = await ocorrenciasService.resolveOcorrencia(user, id, resolvido === 'true' || resolvido === true)
                    return jsonSuccess(res, result)
                } catch (e: any) {
                    return jsonError(res, e.message, 500)
                }

            case 'DELETE':
                try {
                    assertPermissao(user, PAPEIS_GESTAO, 'eliminar ocorrência')
                } catch (e: any) {
                    return jsonError(res, e.message, 403)
                }
                try {
                    const { id } = req.query
                    if (!id) return jsonError(res, 'ID is required', 400)
                    const result = await ocorrenciasService.deleteOcorrencia(user, id as string)
                    return jsonSuccess(res, result)
                } catch (e: any) {
                    return jsonError(res, e.message, 500)
                }

            default:
                res.setHeader('Allow', 'GET, POST, PATCH, DELETE')
                return jsonError(res, 'Method not allowed', 405)
        }
    })
}
