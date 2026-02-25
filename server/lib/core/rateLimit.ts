/**
 * RateLimiter — limite de requests por chave (IP ou userId) em memória.
 * Evitar abuso em login e APIs pesadas.
 */
const store = new Map<string, { count: number; resetAt: number }>()

const DEFAULT_WINDOW_MS = 60_000
const DEFAULT_MAX = 100

export interface RateLimitOptions {
  windowMs?: number
  max?: number
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions = {}
): { allowed: boolean; remaining: number; resetAt: number } {
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS
  const max = options.max ?? DEFAULT_MAX
  const now = Date.now()
  const entry = store.get(key)

  if (!entry) {
    const resetAt = now + windowMs
    store.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: max - 1, resetAt }
  }

  if (now >= entry.resetAt) {
    const resetAt = now + windowMs
    store.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: max - 1, resetAt }
  }

  entry.count += 1
  const allowed = entry.count <= max
  return {
    allowed,
    remaining: Math.max(0, max - entry.count),
    resetAt: entry.resetAt,
  }
}

/** Limpar entradas expiradas (pode ser chamado periodicamente). */
export function pruneRateLimitStore(): void {
  const now = Date.now()
  for (const [k, v] of store.entries()) {
    if (now >= v.resetAt) store.delete(k)
  }
}
