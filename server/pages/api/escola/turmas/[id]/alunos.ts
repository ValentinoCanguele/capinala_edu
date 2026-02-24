import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as matriculasService from '@/lib/escola/services/matriculas'
import { matriculaCreateSchema } from '@/lib/escola/schemas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const turmaId = req.query.id as string
  if (!turmaId) return jsonError(res, 'ID da turma é obrigatório', 400)

  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      try {
        const list = await matriculasService.listMatriculasByTurma(user, turmaId)
        jsonSuccess(res, list)
      } catch (e) {
        jsonError(res, e instanceof Error ? e.message : 'Erro ao listar alunos da turma', 500)
      }
    })
  }

  if (req.method === 'POST') {
    return requireAuth(req, res, async (user) => {
      const parsed = matriculaCreateSchema.safeParse({ ...req.body, turmaId })
      if (!parsed.success) return jsonError(res, 'alunoId é obrigatório', 400)
      try {
        const created = await matriculasService.createMatricula(user, parsed.data)
        if (!created) return jsonError(res, 'Aluno ou turma não encontrados', 404)
        jsonSuccess(res, created, 201)
      } catch (e) {
        jsonError(res, e instanceof Error ? e.message : 'Erro ao inscrever aluno', 500)
      }
    })
  }

  if (req.method === 'DELETE') {
    return requireAuth(req, res, async (user) => {
      const alunoId = (req.query.alunoId as string) || (req.body?.alunoId as string)
      if (!alunoId) return jsonError(res, 'alunoId é obrigatório', 400)
      try {
        const ok = await matriculasService.deleteMatricula(user, alunoId, turmaId)
        if (!ok) return jsonError(res, 'Matrícula não encontrada', 404)
        jsonSuccess(res, { ok: true })
      } catch (e) {
        jsonError(res, e instanceof Error ? e.message : 'Erro ao remover matrícula', 500)
      }
    })
  }

  res.setHeader('Allow', 'GET, POST, DELETE')
  return jsonError(res, 'Method not allowed', 405)
}
