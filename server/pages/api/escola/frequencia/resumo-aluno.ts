import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import { getResumoFrequenciaAluno } from '@/lib/escola/services/frequencia'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return jsonError(res, 'Method not allowed', 405)
  }
  const alunoId = req.query.alunoId as string
  if (!alunoId) return jsonError(res, 'alunoId é obrigatório', 400)
  const anoLetivoId = (req.query.anoLetivoId as string) || undefined
  return requireAuth(req, res, async (user) => {
    const resumo = await getResumoFrequenciaAluno(user, alunoId, anoLetivoId)
    if (!resumo) return jsonError(res, 'Aluno não encontrado ou sem permissão', 404)
    jsonSuccess(res, resumo)
  })
}
