import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as aulasService from '@/lib/escola/services/aulas'

const bodySchema = z.object({
  turmaId: z.string().uuid(),
  disciplinaId: z.string().uuid(),
  dataAula: z.string().min(1),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return jsonError(res, 'Method not allowed', 405)
  }
  const parsed = bodySchema.safeParse(req.body)
  if (!parsed.success) {
    return jsonError(res, 'Dados inválidos', 400)
  }
  return requireAuth(req, res, async (user) => {
    try {
      const aulaId = await aulasService.getOrCreateAula(
        user,
        parsed.data.turmaId,
        parsed.data.disciplinaId,
        parsed.data.dataAula
      )
      if (!aulaId) return jsonError(res, 'Turma não encontrada', 404)
      jsonSuccess(res, { aulaId }, 201)
    } catch (e) {
      jsonError(res, e instanceof Error ? e.message : 'Erro ao criar aula', 500)
    }
  })
}
