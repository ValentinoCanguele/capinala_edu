import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as notasService from '@/lib/escola/services/notas'
import { notaSchema } from '@/lib/escola/schemas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      const turmaId = req.query.turmaId as string
      const periodoId = req.query.periodoId as string
      const disciplinaId = req.query.disciplinaId as string | undefined
      if (!turmaId || !periodoId) {
        return jsonError(res, 'turmaId e periodoId são obrigatórios', 400)
      }
      try {
        const list = await notasService.getNotasByTurmaPeriodo(user, turmaId, periodoId, disciplinaId)
        jsonSuccess(res, list)
      } catch (e) {
        jsonError(res, e instanceof Error ? e.message : 'Erro ao listar notas', 500)
      }
    })
  }
  if (req.method === 'POST') {
    return requireAuth(req, res, async (user) => {
      const parsed = notaSchema.safeParse(req.body)
      if (!parsed.success) {
        const msg = parsed.error.flatten().message
        return jsonError(res, typeof msg === 'string' ? msg : 'Dados inválidos', 400)
      }
      try {
        const created = await notasService.upsertNota(user, parsed.data)
        jsonSuccess(res, created ?? parsed.data, 201)
      } catch (e) {
        jsonError(res, e instanceof Error ? e.message : 'Erro ao salvar nota', 500)
      }
    })
  }
  res.setHeader('Allow', 'GET, POST')
  return jsonError(res, 'Method not allowed', 405)
}
