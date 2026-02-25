import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import * as modulosService from '@/lib/escola/services/modulos'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return requireAuth(req, res, async (user) => {
      try {
        const catalogo = req.query.catalogo === '1'
        if (catalogo) {
          const data = await modulosService.listModulosComDisponiveis(user)
          jsonSuccess(res, data)
        } else {
          const list = await modulosService.listModulos(user)
          jsonSuccess(res, list)
        }
      } catch (e) {
        jsonError(res, e instanceof Error ? e.message : 'Erro ao listar módulos', 500)
      }
    })
  }
  res.setHeader('Allow', 'GET')
  return jsonError(res, 'Method not allowed', 405)
}
