/**
 * Idempotency — guardar chave de idempotência (X-Idempotency-Key); evitar duplicar criação em retries.
 * Implementação em memória com TTL; produção: Redis ou tabela DB.
 */
interface Entry {
  responseStatus: number
  responseBody: unknown
  expiresAt: number
}

const store = new Map<string, Entry>()
const TTL_MS = 24 * 60 * 60 * 1000 // 24h

export function getIdempotencyResult(key: string): { status: number; body: unknown } | null {
  const e = store.get(key)
  if (!e) return null
  if (Date.now() >= e.expiresAt) {
    store.delete(key)
    return null
  }
  return { status: e.responseStatus, body: e.responseBody }
}

export function setIdempotencyResult(key: string, status: number, body: unknown): void {
  store.set(key, {
    responseStatus: status,
    responseBody: body,
    expiresAt: Date.now() + TTL_MS,
  })
}

export function getIdempotencyKeyFromRequest(req: { headers?: { [key: string]: string | string[] | undefined } }): string | null {
  const h = req.headers?.['x-idempotency-key']
  if (typeof h === 'string' && h.trim().length > 0) return h.trim()
  return null
}
