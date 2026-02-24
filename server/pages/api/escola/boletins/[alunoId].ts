import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as boletinsService from '@/lib/escola/services/boletins'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return jsonError(res, 'Method not allowed', 405)
  }
  const alunoId = req.query.alunoId as string
  if (!alunoId) return jsonError(res, 'alunoId é obrigatório', 400)
  const anoLetivoId = req.query.anoLetivoId as string | undefined
  return requireAuth(req, res, async (user) => {
    const boletim = await boletinsService.getBoletim(user, alunoId, anoLetivoId)
    if (!boletim) return jsonError(res, 'Aluno não encontrado', 404)
    jsonSuccess(res, boletim)
  })
}
