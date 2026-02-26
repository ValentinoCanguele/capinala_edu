import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import { assertPermissao, PAPEIS_ADMIN, PAPEIS_GESTAO } from '@/lib/escola/permissoes'
import * as frequenciaService from '@/lib/escola/services/frequencia'

/**
 * GET  — Lista justificativas (opcional ?alunoId=).
 *        Requer PAPEIS_GESTAO (admin, direção, professor).
 * POST — Corpo: { aluno_id, motivo, data_inicio?, data_fim?, descricao? } → criar justificativa (PAPEIS_GESTAO).
 *        Ou ?action=approve&id= com corpo { acao: 'deferido'|'indeferido' } → aprovar/rejeitar (PAPEIS_ADMIN).
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      try {
        assertPermissao(user, PAPEIS_GESTAO, 'listar justificativas')
      } catch (e) {
        return jsonError(res, e instanceof Error ? e.message : 'Sem permissão', 403)
      }
      try {
        const alunoId = (req.query.alunoId as string) || undefined
        const list = await frequenciaService.getJustificativas(user, alunoId)
        return jsonSuccess(res, list)
      } catch (e) {
        return jsonError(res, e instanceof Error ? e.message : 'Erro ao listar justificativas', 500)
      }
    })
  }

  if (req.method === 'POST') {
    return requireAuth(req, res, async (user) => {
      const action = req.query.action as string | undefined
      const id = req.query.id as string | undefined

      if (action === 'approve' && id) {
        try {
          assertPermissao(user, PAPEIS_ADMIN, 'aprovar/rejeitar justificativa')
        } catch (e) {
          return jsonError(res, e instanceof Error ? e.message : 'Sem permissão', 403)
        }
        const acao = req.body?.acao as string
        if (acao !== 'deferido' && acao !== 'indeferido') {
          return jsonError(res, 'acao deve ser "deferido" ou "indeferido"', 400)
        }
        try {
          await frequenciaService.processarAprovacaoJustificativa(user, id, acao as 'deferido' | 'indeferido')
          return jsonSuccess(res, { ok: true })
        } catch (e) {
          return jsonError(res, e instanceof Error ? e.message : 'Erro ao processar aprovação', 500)
        }
      }

      try {
        assertPermissao(user, PAPEIS_GESTAO, 'criar justificativa')
      } catch (e) {
        return jsonError(res, e instanceof Error ? e.message : 'Sem permissão', 403)
      }
      const body = req.body as Record<string, unknown>
      const aluno_id = body?.aluno_id as string
      const motivo = body?.motivo as string
      if (!aluno_id || !motivo) {
        return jsonError(res, 'aluno_id e motivo são obrigatórios', 400)
      }
      try {
        const created = await frequenciaService.createJustificativa(user, {
          aluno_id,
          motivo,
          data_inicio: (body?.data_inicio as string) || undefined,
          data_fim: (body?.data_fim as string) || undefined,
          descricao: (body?.descricao as string) || undefined,
          aula_id: (body?.aula_id as string) || undefined,
        })
        return jsonSuccess(res, created, 201)
      } catch (e) {
        return jsonError(res, e instanceof Error ? e.message : 'Erro ao criar justificativa', 500)
      }
    })
  }

  res.setHeader('Allow', 'GET, POST')
  return jsonError(res, 'Method not allowed', 405)
}
