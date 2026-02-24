import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as turmasService from '@/lib/escola/services/turmas'
import { canDeleteTurma } from '@/lib/escola/permissoes'
import { turmaUpdateSchema } from '@/lib/escola/schemas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string
  if (!id) return jsonError(res, 'ID é obrigatório', 400)

  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      const turma = await turmasService.getTurma(user, id)
      if (!turma) return jsonError(res, 'Turma não encontrada', 404)
      jsonSuccess(res, turma)
    })
  }
  if (req.method === 'PUT') {
    return requireAuth(req, res, async (user) => {
      const parsed = turmaUpdateSchema.safeParse(req.body)
      if (!parsed.success) {
        const msg = parsed.error.flatten().message
        return jsonError(res, typeof msg === 'string' ? msg : 'Dados inválidos', 400)
      }
      const updated = await turmasService.updateTurma(user, id, parsed.data)
      if (!updated) return jsonError(res, 'Turma não encontrada', 404)
      jsonSuccess(res, updated)
    })
  }
  if (req.method === 'DELETE') {
    return requireAuth(req, res, async (user) => {
      if (!canDeleteTurma(user)) return jsonError(res, 'Sem permissão', 403)
      const ok = await turmasService.deleteTurma(user, id)
      if (!ok) return jsonError(res, 'Turma não encontrada', 404)
      jsonSuccess(res, { ok: true })
    })
  }
  res.setHeader('Allow', 'GET, PUT, DELETE')
  return jsonError(res, 'Method not allowed', 405)
}
