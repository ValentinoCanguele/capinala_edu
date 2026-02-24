import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as disciplinasService from '@/lib/escola/services/disciplinas'
import { disciplinaUpdateSchema } from '@/lib/escola/schemas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string
  if (!id) return jsonError(res, 'ID é obrigatório', 400)

  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      const disc = await disciplinasService.getDisciplina(user, id)
      if (!disc) return jsonError(res, 'Disciplina não encontrada', 404)
      jsonSuccess(res, disc)
    })
  }
  if (req.method === 'PUT') {
    return requireAuth(req, res, async (user) => {
      const parsed = disciplinaUpdateSchema.safeParse(req.body)
      if (!parsed.success) {
        const msg = parsed.error.flatten().message
        return jsonError(res, typeof msg === 'string' ? msg : 'Dados inválidos', 400)
      }
      const updated = await disciplinasService.updateDisciplina(user, id, parsed.data)
      if (!updated) return jsonError(res, 'Disciplina não encontrada', 404)
      jsonSuccess(res, updated)
    })
  }
  if (req.method === 'DELETE') {
    return requireAuth(req, res, async (user) => {
      const ok = await disciplinasService.deleteDisciplina(user, id)
      if (!ok) return jsonError(res, 'Disciplina não encontrada', 404)
      jsonSuccess(res, { ok: true })
    })
  }
  res.setHeader('Allow', 'GET, PUT, DELETE')
  return jsonError(res, 'Method not allowed', 405)
}
