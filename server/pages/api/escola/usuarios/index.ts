import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import { listUsuarios, createUsuario } from '@/lib/escola/services/usuarios'
import { usuarioCreateSchema } from '@/lib/escola/schemas/usuario'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      const escolaId = (req.query.escolaId as string) || undefined
      const list = await listUsuarios(user, escolaId ?? null)
      jsonSuccess(res, list)
    })
  }
  if (req.method === 'POST') {
    return requireAuth(req, res, async (user) => {
      const parsed = usuarioCreateSchema.safeParse(req.body)
      if (!parsed.success) {
        return jsonError(res, parsed.error.flatten().message as unknown as string, 400)
      }
      const created = await createUsuario(user, parsed.data)
      if (!created) return jsonError(res, 'Falha ao criar utilizador', 400)
      jsonSuccess(res, created, 201)
    })
  }
  res.setHeader('Allow', 'GET, POST')
  return jsonError(res, 'Method not allowed', 405)
}
