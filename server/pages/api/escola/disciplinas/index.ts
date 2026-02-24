import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as disciplinasService from '@/lib/escola/services/disciplinas'
import { disciplinaCreateSchema } from '@/lib/escola/schemas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      try {
        const list = await disciplinasService.listDisciplinas(user)
        jsonSuccess(res, list)
      } catch (e) {
        jsonError(res, e instanceof Error ? e.message : 'Erro ao listar disciplinas', 500)
      }
    })
  }
  if (req.method === 'POST') {
    return requireAuth(req, res, async (user) => {
      const parsed = disciplinaCreateSchema.safeParse(req.body)
      if (!parsed.success) {
        const msg = parsed.error.flatten().message
        return jsonError(res, typeof msg === 'string' ? msg : 'Dados inválidos', 400)
      }
      try {
        const created = await disciplinasService.createDisciplina(user, parsed.data)
        jsonSuccess(res, created, 201)
      } catch (e) {
        jsonError(res, e instanceof Error ? e.message : 'Erro ao criar disciplina', 500)
      }
    })
  }
  res.setHeader('Allow', 'GET, POST')
  return jsonError(res, 'Method not allowed', 405)
}
