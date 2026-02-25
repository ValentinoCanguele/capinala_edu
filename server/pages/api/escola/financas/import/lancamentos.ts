import type { NextApiRequest, NextApiResponse } from 'next'
import { requireAuth } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'
import { importLancamentosCsv } from '@/lib/escola/services/financas/importCsv'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return jsonError(res, 'Method not allowed', 405)
  }
  return requireAuth(req, res, async (user) => {
    const body = req.body
    const csv =
      typeof body?.csv === 'string'
        ? body.csv
        : typeof body === 'string'
          ? body
          : null
    if (!csv || !csv.trim()) {
      return jsonError(res, 'Corpo da requisição deve conter "csv" (texto CSV)', 400)
    }
    const MAX_CSV_CHARS = 2 * 1024 * 1024
    const MAX_CSV_LINES = 5000
    if (csv.length > MAX_CSV_CHARS) {
      return jsonError(
        res,
        `Ficheiro demasiado grande (máx. ${MAX_CSV_CHARS / 1024 / 1024} MB). Divida o ficheiro ou reduza o número de linhas.`,
        400
      )
    }
    const lineCount = (csv.match(/\n/g)?.length ?? 0) + 1
    if (lineCount > MAX_CSV_LINES + 1) {
      return jsonError(
        res,
        `Demasiadas linhas (máx. ${MAX_CSV_LINES} linhas de dados). Divida o ficheiro.`,
        400
      )
    }
    try {
      const result = await importLancamentosCsv(user, csv)
      jsonSuccess(res, result)
    } catch (e) {
      jsonError(
        res,
        e instanceof Error ? e.message : 'Erro ao importar CSV',
        500
      )
    }
  })
}
