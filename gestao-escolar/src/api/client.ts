/**
 * Cliente para as APIs do módulo escola (Studio).
 * Em dev o Vite faz proxy de /api para o Studio (porta 8082).
 * Em 401 (não autorizado) limpa o token e emite evento para o AuthContext atualizar.
 */
import { getAuthHeader, clearToken } from '@/lib/auth'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized'

/** Timeout em ms para evitar que o login fique parado se o backend não responder */
const REQUEST_TIMEOUT_MS = 20000

export type ApiError = { message: string }

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: ApiError }> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  let res: Response
  try {
    res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...options.headers,
      },
      credentials: 'include',
    })
  } catch (err) {
    clearTimeout(timeoutId)
    const isAbort = err instanceof Error && err.name === 'AbortError'
    return {
      error: {
        message: isAbort
          ? 'Servidor não respondeu. Verifique se o backend está a correr (porta 8082).'
          : err instanceof Error ? err.message : 'Erro de ligação.',
      },
    }
  }
  clearTimeout(timeoutId)
  if (res.status === 401) {
    clearToken()
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(AUTH_UNAUTHORIZED_EVENT))
    }
    return { error: { message: 'Sessão expirada. Inicie sessão novamente.' } }
  }
  const json = await res.json().catch(() => ({}))
  if (!res.ok) {
    return { error: json?.error ?? { message: res.statusText } }
  }
  return { data: json as T }
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}

/** Base path das APIs escola (sem host, para usar com proxy) */
export const ESCOLA_API = '/api/escola'
