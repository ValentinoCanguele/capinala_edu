import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as horariosService from '@/lib/escola/services/horarios'
import { horarioUpdateSchema } from '@/lib/escola/schemas/horario'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const id = req.query.id as string

    if (req.method === 'PUT') {
        return requireAuth(req, res, async (user) => {
            if (user.papel !== 'admin' && user.papel !== 'direcao') {
                return jsonError(res, 'Sem permissão', 403)
            }
            const parsed = horarioUpdateSchema.safeParse(req.body)
            if (!parsed.success) {
                return jsonError(res, 'Dados inválidos', 400)
            }
            try {
                const updated = await horariosService.updateHorario(user, id, parsed.data)
                if (!updated) return jsonError(res, 'Horário não encontrado', 404)
                jsonSuccess(res, updated)
            } catch (e) {
                jsonError(res, e instanceof Error ? e.message : 'Erro ao atualizar horário', 500)
            }
        })
    }
    if (req.method === 'DELETE') {
        return requireAuth(req, res, async (user) => {
            if (user.papel !== 'admin' && user.papel !== 'direcao') {
                return jsonError(res, 'Sem permissão', 403)
            }
            try {
                const deleted = await horariosService.deleteHorario(user, id)
                if (!deleted) return jsonError(res, 'Horário não encontrado', 404)
                jsonSuccess(res, { ok: true })
            } catch (e) {
                jsonError(res, e instanceof Error ? e.message : 'Erro ao eliminar horário', 500)
            }
        })
    }
    res.setHeader('Allow', 'PUT, DELETE')
    return jsonError(res, 'Method not allowed', 405)
}
