import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as aulasService from '@/lib/escola/services/aulas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return jsonError(res, 'Method not allowed', 405)
  }
  const turmaId = req.query.turmaId as string
  const dataAula = req.query.dataAula as string
  if (!turmaId || !dataAula) {
    return jsonError(res, 'turmaId e dataAula são obrigatórios', 400)
  }
  return requireAuth(req, res, async (user) => {
    try {
      const list = await aulasService.listAulasByTurmaAndDate(user, turmaId, dataAula)
      jsonSuccess(res, list)
    } catch (e) {
      jsonError(res, e instanceof Error ? e.message : 'Erro ao listar aulas', 500)
    }
  })
}
