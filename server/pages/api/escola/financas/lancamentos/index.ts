import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as lancamentosService from '@/lib/escola/services/financas/lancamentos'
import { lancamentoCreateSchema } from '@/lib/escola/schemas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      try {
        const tipo = req.query.tipo as string | undefined
        const dataInicio = req.query.dataInicio as string | undefined
        const dataFim = req.query.dataFim as string | undefined
        const categoriaId = req.query.categoriaId as string | undefined
        const anoLetivoId = req.query.anoLetivoId as string | undefined
        const list = await lancamentosService.listLancamentos(user, {
          tipo: tipo === 'entrada' || tipo === 'saida' ? tipo : undefined,
          dataInicio,
          dataFim,
          categoriaId,
          anoLetivoId,
        })
        jsonSuccess(res, list)
      } catch (e) {
        jsonError(res, e instanceof Error ? e.message : 'Erro ao listar lançamentos', 500)
      }
    })
  }
  if (req.method === 'POST') {
    return requireAuth(req, res, async (user) => {
      const parsed = lancamentoCreateSchema.safeParse(req.body)
      if (!parsed.success) {
        const msg = parsed.error.flatten().message
        return jsonError(res, typeof msg === 'string' ? msg : 'Dados inválidos', 400)
      }
      try {
        const created = await lancamentosService.createLancamento(user, parsed.data)
        jsonSuccess(res, created, 201)
      } catch (e) {
        jsonError(res, e instanceof Error ? e.message : 'Erro ao criar lançamento', 500)
      }
    })
  }
  res.setHeader('Allow', 'GET, POST')
  return jsonError(res, 'Method not allowed', 405)
}
