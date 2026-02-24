import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as alunosService from '@/lib/escola/services/alunos'
import { canDeleteAluno } from '@/lib/escola/permissoes'
import { alunoUpdateSchema } from '@/lib/escola/schemas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string
  if (!id) return jsonError(res, 'ID é obrigatório', 400)

  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      const aluno = await alunosService.getAluno(user, id)
      if (!aluno) return jsonError(res, 'Aluno não encontrado', 404)
      jsonSuccess(res, aluno)
    })
  }
  if (req.method === 'PUT') {
    return requireAuth(req, res, async (user) => {
      const parsed = alunoUpdateSchema.safeParse(req.body)
      if (!parsed.success) {
        const msg = parsed.error.flatten().message
        return jsonError(res, typeof msg === 'string' ? msg : 'Dados inválidos', 400)
      }
      const updated = await alunosService.updateAluno(user, id, parsed.data)
      if (!updated) return jsonError(res, 'Aluno não encontrado', 404)
      jsonSuccess(res, updated)
    })
  }
  if (req.method === 'DELETE') {
    return requireAuth(req, res, async (user) => {
      if (!canDeleteAluno(user)) return jsonError(res, 'Sem permissão', 403)
      const ok = await alunosService.deleteAluno(user, id)
      if (!ok) return jsonError(res, 'Aluno não encontrado', 404)
      jsonSuccess(res, { ok: true })
    })
  }
  res.setHeader('Allow', 'GET, PUT, DELETE')
  return jsonError(res, 'Method not allowed', 405)
}
