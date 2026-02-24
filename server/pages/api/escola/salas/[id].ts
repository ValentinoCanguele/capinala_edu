import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as horariosService from '@/lib/escola/services/horarios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string
  if (!id) return jsonError(res, 'ID é obrigatório', 400)

  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      const sala = await horariosService.getSala(user, id)
      if (!sala) return jsonError(res, 'Sala não encontrada', 404)
      jsonSuccess(res, sala)
    })
  }
  if (req.method === 'PUT') {
    return requireAuth(req, res, async (user) => {
      if (user.papel !== 'admin' && user.papel !== 'direcao') {
        return jsonError(res, 'Sem permissão', 403)
      }
      const { nome, capacidade } = req.body ?? {}
      const data: { nome?: string; capacidade?: number } = {}
      if (typeof nome === 'string') data.nome = nome
      if (typeof capacidade === 'number') data.capacidade = capacidade
      if (Object.keys(data).length === 0) {
        return jsonError(res, 'Envie nome e/ou capacidade para atualizar', 400)
      }
      try {
        const updated = await horariosService.updateSala(user, id, data)
        if (!updated) return jsonError(res, 'Sala não encontrada', 404)
        jsonSuccess(res, updated)
      } catch (e) {
        jsonError(res, e instanceof Error ? e.message : 'Erro ao atualizar sala', 500)
      }
    })
  }
  if (req.method === 'DELETE') {
    return requireAuth(req, res, async (user) => {
      if (user.papel !== 'admin' && user.papel !== 'direcao') {
        return jsonError(res, 'Sem permissão', 403)
      }
      const ok = await horariosService.deleteSala(user, id)
      if (!ok) return jsonError(res, 'Sala não encontrada', 404)
      jsonSuccess(res, { ok: true })
    })
  }
  res.setHeader('Allow', 'GET, PUT, DELETE')
  return jsonError(res, 'Method not allowed', 405)
}
