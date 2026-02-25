import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import { getUsuario, updateUsuario } from '@/lib/escola/services/usuarios'
import { usuarioUpdateSchema } from '@/lib/escola/schemas/usuario'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string
  if (!id) return jsonError(res, 'id é obrigatório', 400)
  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      const usuario = await getUsuario(user, id)
      if (!usuario) return jsonError(res, 'Utilizador não encontrado', 404)
      jsonSuccess(res, usuario)
    })
  }
  if (req.method === 'PUT') {
    return requireAuth(req, res, async (user) => {
      const parsed = usuarioUpdateSchema.safeParse(req.body)
      if (!parsed.success) {
        return jsonError(res, parsed.error.flatten().message as unknown as string, 400)
      }
      const updated = await updateUsuario(user, id, parsed.data)
      if (!updated) return jsonError(res, 'Utilizador não encontrado', 404)
      jsonSuccess(res, updated)
    })
  }
  res.setHeader('Allow', 'GET, PUT')
  return jsonError(res, 'Method not allowed', 405)
}
