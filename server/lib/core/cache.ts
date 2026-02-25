/**
 * CacheService — cache em memória para dados pouco voláteis (TTL configurável).
 * Ex.: lista de anos letivos, config por escola.
 */
interface Entry<T> {
  value: T
  expiresAt: number
}

const store = new Map<string, Entry<unknown>>()

const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5 min

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key) as Entry<T> | undefined
  if (!entry) return null
  if (Date.now() >= entry.expiresAt) {
    store.delete(key)
    return null
  }
  return entry.value
}

export function cacheSet<T>(key: string, value: T, ttlMs: number = DEFAULT_TTL_MS): void {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  })
}

export function cacheDelete(key: string): void {
  store.delete(key)
}

export function cacheDeleteByPrefix(prefix: string): void {
  for (const k of store.keys()) {
    if (k.startsWith(prefix)) store.delete(k)
  }
}
