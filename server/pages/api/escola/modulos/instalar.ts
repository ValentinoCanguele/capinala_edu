import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as modulosService from '@/lib/escola/services/modulos'
import { moduloInstalarSchema } from '@/lib/escola/schemas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return jsonError(res, 'Method not allowed', 405)
  }
  return requireAuth(req, res, async (user) => {
    const parsed = moduloInstalarSchema.safeParse(req.body)
    if (!parsed.success) {
      const msg = parsed.error.flatten().message
      return jsonError(res, typeof msg === 'string' ? msg : 'Dados inválidos', 400)
    }
    try {
      const modulo = await modulosService.installModulo(user, parsed.data.chave)
      jsonSuccess(res, modulo, 201)
    } catch (e) {
      if (e instanceof Error && e.message.includes('Sem permissão')) {
        return jsonError(res, e.message, 403)
      }
      if (e instanceof Error && e.message.includes('já está instalado')) {
        return jsonError(res, e.message, 409)
      }
      if (e instanceof Error && e.message.includes('não existe no catálogo')) {
        return jsonError(res, e.message, 404)
      }
      jsonError(res, e instanceof Error ? e.message : 'Erro ao instalar módulo', 500)
    }
  })
}
