import type { NextApiRequest, NextApiResponse } from 'next'
import { getSnapshot } from '@/lib/core/metrics'

/**
 * GET /api/metrics — snapshot dos contadores em memória (para monitorização).
 * Em produção proteger por auth ou rede interna.
 */
export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  if (_req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: { message: 'Method not allowed' } })
  }
  const snapshot = getSnapshot()
  res.status(200).json({ counters: snapshot, timestamp: new Date().toISOString() })
}
