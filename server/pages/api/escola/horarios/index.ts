import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as horariosService from '@/lib/escola/services/horarios'
import { horarioCreateSchema } from '@/lib/escola/schemas/horario'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'GET') {
        return requireAuth(req, res, async (user) => {
            try {
                const turmaId = req.query.turmaId as string | undefined
                const anoLetivoId = req.query.anoLetivoId as string | undefined
                // Se for professor, retorna apenas seus horários
                if (user.papel === 'professor') {
                    const list = await horariosService.listHorariosProfessor(user, anoLetivoId)
                    return jsonSuccess(res, list)
                }
                const list = await horariosService.listHorarios(user, turmaId, anoLetivoId)
                jsonSuccess(res, list)
            } catch (e) {
                jsonError(res, e instanceof Error ? e.message : 'Erro ao listar horários', 500)
            }
        })
    }
    if (req.method === 'POST') {
        return requireAuth(req, res, async (user) => {
            if (user.papel !== 'admin' && user.papel !== 'direcao') {
                return jsonError(res, 'Sem permissão', 403)
            }
            const parsed = horarioCreateSchema.safeParse(req.body)
            if (!parsed.success) {
                return jsonError(res, 'Dados inválidos', 400)
            }
            try {
                const created = await horariosService.createHorario(user, parsed.data)
                jsonSuccess(res, created, 201)
            } catch (e) {
                jsonError(res, e instanceof Error ? e.message : 'Erro ao criar horário', 500)
            }
        })
    }
    res.setHeader('Allow', 'GET, POST')
    return jsonError(res, 'Method not allowed', 405)
}
