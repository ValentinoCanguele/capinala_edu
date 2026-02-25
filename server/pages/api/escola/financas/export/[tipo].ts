import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonError } from '@/lib/apiWrapper'
import * as exportCsv from '@/lib/escola/services/financas/exportCsv'

const TIPOS = ['lancamentos', 'parcelas', 'inadimplencia'] as const

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return jsonError(res, 'Method not allowed', 405)
  }
  const tipo = req.query.tipo as string
  if (!TIPOS.includes(tipo as (typeof TIPOS)[number])) {
    return jsonError(res, 'tipo deve ser: lancamentos, parcelas ou inadimplencia', 400)
  }
  return requireAuth(req, res, async (user) => {
    try {
      const format = (req.query.format as string) || 'csv'
      if (format !== 'csv') {
        return jsonError(res, 'Formato não suportado. Use format=csv', 400)
      }
      let csv = ''
      const dataInicio = req.query.dataInicio as string
      const dataFim = req.query.dataFim as string
      if (tipo === 'lancamentos') {
        if (!dataInicio || !dataFim) {
          return jsonError(res, 'dataInicio e dataFim são obrigatórios', 400)
        }
        csv = await exportCsv.exportLancamentosCsv(user, dataInicio, dataFim)
      } else if (tipo === 'parcelas') {
        csv = await exportCsv.exportParcelasCsv(user, {
          anoLetivoId: req.query.anoLetivoId as string,
          status: req.query.status as string,
          dataInicio,
          dataFim,
        })
      } else {
        csv = await exportCsv.exportInadimplenciaCsv(
          user,
          req.query.anoLetivoId as string
        )
      }
      const filename = `financas-${tipo}-${new Date().toISOString().slice(0, 10)}.csv`
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`
      )
      res.status(200).send('\uFEFF' + csv)
    } catch (e) {
      jsonError(
        res,
        e instanceof Error ? e.message : 'Erro ao exportar',
        500
      )
    }
  })
}
