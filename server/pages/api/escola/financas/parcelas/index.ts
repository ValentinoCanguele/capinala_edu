import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as parcelasService from '@/lib/escola/services/financas/parcelas'
import { parcelaCreateSchema } from '@/lib/escola/schemas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      try {
        const anoLetivoId = req.query.anoLetivoId as string | undefined
        const alunoId = req.query.alunoId as string | undefined
        const responsavelId = req.query.responsavelId as string | undefined
        const status = req.query.status as string | undefined
        const dataInicio = req.query.dataInicio as string | undefined
        const dataFim = req.query.dataFim as string | undefined
        const list = await parcelasService.listParcelas(user, {
          anoLetivoId,
          alunoId,
          responsavelId,
          status,
          dataInicio,
          dataFim,
        })
        jsonSuccess(res, list)
      } catch (e) {
        jsonError(res, e instanceof Error ? e.message : 'Erro ao listar parcelas', 500)
      }
    })
  }
  if (req.method === 'POST') {
    return requireAuth(req, res, async (user) => {
      const parsed = parcelaCreateSchema.safeParse(req.body)
      if (!parsed.success) {
        const msg = parsed.error.flatten().message
        return jsonError(res, typeof msg === 'string' ? msg : 'Dados inválidos', 400)
      }
      try {
        const created = await parcelasService.createParcela(user, parsed.data)
        jsonSuccess(res, created, 201)
      } catch (e) {
        jsonError(res, e instanceof Error ? e.message : 'Erro ao criar parcela', 500)
      }
    })
  }
  res.setHeader('Allow', 'GET, POST')
  return jsonError(res, 'Method not allowed', 405)
}
