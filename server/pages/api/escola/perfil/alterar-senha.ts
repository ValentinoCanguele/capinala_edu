import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import { alterarSenha } from '@/lib/escola/services/perfil'
import { alterarSenhaSchema } from '@/lib/escola/schemas/perfil'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return jsonError(res, 'Method not allowed', 405)
  }
  return requireAuth(req, res, async (user) => {
    const parsed = alterarSenhaSchema.safeParse(req.body)
    if (!parsed.success) {
      return jsonError(res, parsed.error.flatten().message as unknown as string, 400)
    }
    const ok = await alterarSenha(user, user.pessoaId, parsed.data)
    if (!ok) return jsonError(res, 'Senha atual incorreta ou utilizador inválido', 400)
    jsonSuccess(res, { ok: true })
  })
}
