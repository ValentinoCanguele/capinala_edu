/**
 * Cliente para as APIs do módulo escola (Studio).
 * Em dev o Vite faz proxy de /api para o Studio (porta 8082).
 */
import { getAuthHeader } from '@/lib/auth'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

export type ApiError = { message: string }

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data?: T; error?: ApiError }> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options.headers,
    },
    credentials: 'include',
  })
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
