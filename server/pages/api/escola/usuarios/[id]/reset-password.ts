import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import { resetPassword } from '@/lib/escola/services/usuarios'
import { resetPasswordSchema } from '@/lib/escola/schemas/usuario'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return jsonError(res, 'Method not allowed', 405)
  }
  const id = req.query.id as string
  if (!id) return jsonError(res, 'id é obrigatório', 400)
  return requireAuth(req, res, async (user) => {
    const parsed = resetPasswordSchema.safeParse(req.body)
    if (!parsed.success) {
      return jsonError(res, parsed.error.flatten().message as unknown as string, 400)
    }
    const ok = await resetPassword(user, id, parsed.data.novaSenha)
    if (!ok) return jsonError(res, 'Utilizador não encontrado', 404)
    jsonSuccess(res, { ok: true })
  })
}
