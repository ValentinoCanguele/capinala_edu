/**
 * Helpers para localStorage e sessionStorage com prefixo e TTL opcional.
 * Útil para preferências (tema, sidebar colapsada, pageSize) e rascunhos.
 */

const PREFIX = 'gestao-escolar'

function keyWithPrefix(key: string): string {
  return `${PREFIX}:${key}`
}

export type StorageBackend = 'local' | 'session'

function getStore(backend: StorageBackend): Storage {
  if (typeof window === 'undefined') {
    throw new Error('storage is only available in the browser')
  }
  return backend === 'session' ? sessionStorage : localStorage
}

/**
 * Lê um item como JSON. Devolve undefined se não existir ou for inválido.
 */
export function getItem<T>(key: string, backend: StorageBackend = 'local'): T | undefined {
  try {
    const raw = getStore(backend).getItem(keyWithPrefix(key))
    if (raw == null) return undefined
    return JSON.parse(raw) as T
  } catch {
    return undefined
  }
}

/**
 * Guarda um item como JSON.
 */
export function setItem<T>(key: string, value: T, backend: StorageBackend = 'local'): void {
  try {
    getStore(backend).setItem(keyWithPrefix(key), JSON.stringify(value))
  } catch {
    // quota exceeded or disabled
  }
}

/**
 * Remove um item.
 */
export function removeItem(key: string, backend: StorageBackend = 'local'): void {
  try {
    getStore(backend).removeItem(keyWithPrefix(key))
  } catch {
    // ignore
  }
}

export interface ItemWithExpiry<T> {
  value: T
  expiry: number
}

/**
 * Lê um item com TTL. Se passou o tempo (expiry), remove e devolve undefined.
 */
export function getItemWithExpiry<T>(
  key: string,
  backend: StorageBackend = 'local'
): T | undefined {
  try {
    const raw = getStore(backend).getItem(keyWithPrefix(key))
    if (raw == null) return undefined
    const parsed = JSON.parse(raw) as ItemWithExpiry<T>
    if (typeof parsed.expiry === 'number' && Date.now() > parsed.expiry) {
      removeItem(key, backend)
      return undefined
    }
    return parsed.value
  } catch {
    return undefined
  }
}

/**
 * Guarda um item com TTL em milissegundos.
 */
export function setItemWithExpiry<T>(
  key: string,
  value: T,
  ttlMs: number,
  backend: StorageBackend = 'local'
): void {
  try {
    const item: ItemWithExpiry<T> = {
      value,
      expiry: Date.now() + ttlMs,
    }
    getStore(backend).setItem(keyWithPrefix(key), JSON.stringify(item))
  } catch {
    // quota exceeded or disabled
  }
}
