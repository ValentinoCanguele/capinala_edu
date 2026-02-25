import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as modulosService from '@/lib/escola/services/modulos'
import { moduloUpdateSchema } from '@/lib/escola/schemas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string
  if (!id) return jsonError(res, 'ID é obrigatório', 400)

  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      try {
        const modulo = await modulosService.getModulo(user, id)
        if (!modulo) return jsonError(res, 'Módulo não encontrado', 404)
        jsonSuccess(res, modulo)
      } catch (e) {
        jsonError(res, e instanceof Error ? e.message : 'Erro ao obter módulo', 500)
      }
    })
  }

  if (req.method === 'PATCH') {
    return requireAuth(req, res, async (user) => {
      const parsed = moduloUpdateSchema.safeParse(req.body)
      if (!parsed.success) {
        const msg = parsed.error.flatten().message
        return jsonError(res, typeof msg === 'string' ? msg : 'Dados inválidos', 400)
      }
      try {
        const updated = await modulosService.updateModulo(user, id, parsed.data)
        jsonSuccess(res, updated)
      } catch (e) {
        if (e instanceof Error && e.message.includes('Sem permissão')) {
          return jsonError(res, e.message, 403)
        }
        jsonError(res, e instanceof Error ? e.message : 'Erro ao atualizar módulo', 500)
      }
    })
  }

  res.setHeader('Allow', 'GET, PATCH')
  return jsonError(res, 'Method not allowed', 405)
}
