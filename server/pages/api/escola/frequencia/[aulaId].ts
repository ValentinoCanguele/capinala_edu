import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as frequenciaService from '@/lib/escola/services/frequencia'

const bodySchema = z.object({
  items: z.array(
    z.object({
      alunoId: z.string().uuid(),
      status: z.enum(['presente', 'falta', 'justificada']),
    })
  ),
})

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const aulaId = req.query.aulaId as string
  if (!aulaId) return jsonError(res, 'aulaId é obrigatório', 400)

  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      try {
        const list = await frequenciaService.getFrequenciaByAula(user, aulaId)
        jsonSuccess(res, list)
      } catch (e) {
        jsonError(res, e instanceof Error ? e.message : 'Erro ao listar frequência', 500)
      }
    })
  }
  if (req.method === 'POST') {
    return requireAuth(req, res, async (user) => {
      const parsed = bodySchema.safeParse(req.body)
      if (!parsed.success) {
        return jsonError(res, 'Dados inválidos', 400)
      }
      try {
        const result = await frequenciaService.saveFrequenciaBatch(user, aulaId, parsed.data.items)
        jsonSuccess(res, result)
      } catch (e) {
        jsonError(res, e instanceof Error ? e.message : 'Erro ao salvar frequência', 500)
      }
    })
  }
  res.setHeader('Allow', 'GET, POST')
  return jsonError(res, 'Method not allowed', 405)
}
