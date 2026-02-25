import type { NextApiRequest, NextApiResponse } from 'next'
import { runHealthCheck } from '@/lib/core/health'

export default async function handler(_req: NextApiRequest, res: NextApiResponse) {
  const result = await runHealthCheck()
  res.status(result.ok ? 200 : 503).json(result)
}
