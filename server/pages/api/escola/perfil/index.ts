import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import { getPerfil, updatePerfil } from '@/lib/escola/services/perfil'
import { perfilUpdateSchema } from '@/lib/escola/schemas/perfil'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      const perfil = await getPerfil(user, user.pessoaId)
      if (!perfil) return jsonError(res, 'Perfil não encontrado', 404)
      jsonSuccess(res, perfil)
    })
  }
  if (req.method === 'PUT') {
    return requireAuth(req, res, async (user) => {
      const parsed = perfilUpdateSchema.safeParse(req.body)
      if (!parsed.success) {
        return jsonError(res, parsed.error.flatten().message as unknown as string, 400)
      }
      const perfil = await updatePerfil(user, user.pessoaId, parsed.data)
      if (!perfil) return jsonError(res, 'Perfil não encontrado', 404)
      jsonSuccess(res, perfil)
    })
  }
  res.setHeader('Allow', 'GET, PUT')
  return jsonError(res, 'Method not allowed', 405)
}
