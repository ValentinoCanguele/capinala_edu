import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import {
  getPermissoesUsuario,
  setPermissoesUsuario,
} from '@/lib/escola/services/permissoesService'
import { setPermissoesSchema } from '@/lib/escola/schemas/usuario'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string
  if (!id) return jsonError(res, 'id é obrigatório', 400)
  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      const codigos = await getPermissoesUsuario(user, id)
      jsonSuccess(res, { codigos })
    })
  }
  if (req.method === 'PUT') {
    return requireAuth(req, res, async (user) => {
      const parsed = setPermissoesSchema.safeParse(req.body)
      if (!parsed.success) {
        return jsonError(res, parsed.error.flatten().message as unknown as string, 400)
      }
      await setPermissoesUsuario(user, id, parsed.data.codigos)
      const codigos = await getPermissoesUsuario(user, id)
      jsonSuccess(res, { codigos })
    })
  }
  res.setHeader('Allow', 'GET, PUT')
  return jsonError(res, 'Method not allowed', 405)
}
