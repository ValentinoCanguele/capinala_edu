import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as notasService from '@/lib/escola/services/notas'
import * as turmasService from '@/lib/escola/services/turmas'
import * as periodosService from '@/lib/escola/services/periodos'
import { notaBatchSchema } from '@/lib/escola/schemas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return jsonError(res, 'Method not allowed', 405)
  }
  return requireAuth(req, res, async (user) => {
    const parsed = notaBatchSchema.safeParse(req.body)
    if (!parsed.success) {
      const msg = parsed.error.flatten().message
      return jsonError(res, typeof msg === 'string' ? msg : 'Dados inválidos', 400)
    }
    let { periodoId, bimestre, ...rest } = parsed.data
    if (!periodoId && bimestre != null) {
      const turma = await turmasService.getTurma(user, rest.turmaId)
      if (!turma?.anoLetivoId) return jsonError(res, 'Turma não encontrada', 404)
      const periodos = await periodosService.getOrCreatePeriodosForAno(user, turma.anoLetivoId)
      const periodo = periodos.find((p) => p.numero === bimestre)
      periodoId = periodo?.id ?? null
    }
    if (!periodoId) {
      return jsonError(res, 'periodoId ou bimestre (1-4) é obrigatório', 400)
    }
    try {
      const result = await notasService.saveNotasBatch(user, { ...rest, periodoId })
      jsonSuccess(res, result)
    } catch (e) {
      jsonError(res, e instanceof Error ? e.message : 'Erro ao salvar notas', 500)
    }
  })
}
