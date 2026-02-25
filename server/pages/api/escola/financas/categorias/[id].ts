import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as categoriasService from '@/lib/escola/services/financas/categorias'
import { categoriaFinanceiraUpdateSchema } from '@/lib/escola/schemas'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string
  if (!id) return jsonError(res, 'ID é obrigatório', 400)

  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      const cat = await categoriasService.getCategoriaFinanceira(user, id)
      if (!cat) return jsonError(res, 'Categoria não encontrada', 404)
      jsonSuccess(res, cat)
    })
  }
  if (req.method === 'PUT') {
    return requireAuth(req, res, async (user) => {
      const parsed = categoriaFinanceiraUpdateSchema.safeParse(req.body)
      if (!parsed.success) {
        const msg = parsed.error.flatten().message
        return jsonError(res, typeof msg === 'string' ? msg : 'Dados inválidos', 400)
      }
      const updated = await categoriasService.updateCategoriaFinanceira(user, id, parsed.data)
      if (!updated) return jsonError(res, 'Categoria não encontrada', 404)
      jsonSuccess(res, updated)
    })
  }
  if (req.method === 'DELETE') {
    return requireAuth(req, res, async (user) => {
      const ok = await categoriasService.deleteCategoriaFinanceira(user, id)
      if (!ok) return jsonError(res, 'Categoria não encontrada', 404)
      jsonSuccess(res, { ok: true })
    })
  }
  res.setHeader('Allow', 'GET, PUT, DELETE')
  return jsonError(res, 'Method not allowed', 405)
}
