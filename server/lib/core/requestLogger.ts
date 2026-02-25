/**
 * RequestLogger — log estruturado por request (method, path, userId, duration, status).
 */
import type { NextApiRequest, NextApiResponse } from 'next'

export interface RequestLogContext {
  method: string
  path: string
  userId?: string
  statusCode: number
  durationMs: number
}

export function logRequest(context: RequestLogContext): void {
  const msg = [
    context.method,
    context.path,
    context.statusCode,
    `${context.durationMs}ms`,
    context.userId ? `user=${context.userId}` : '',
  ]
    .filter(Boolean)
    .join(' ')
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[request] ${msg}`)
  }
}

export function createRequestLogger(req: NextApiRequest, res: NextApiResponse) {
  const start = Date.now()
  return (userId?: string) => {
    const durationMs = Date.now() - start
    logRequest({
      method: req.method ?? 'GET',
      path: req.url ?? '/',
      userId,
      statusCode: res.statusCode,
      durationMs,
    })
  }
}
