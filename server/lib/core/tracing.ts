/**
 * Tracing — traceId por request; propagar em headers e logs para correlacionar chamadas.
 */
const TRACE_HEADER = 'x-trace-id'

export function getTraceId(req: { headers?: { [key: string]: string | string[] | undefined } }): string {
  const h = req.headers?.[TRACE_HEADER]
  if (typeof h === 'string' && h.trim()) return h.trim()
  return `tr-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function traceIdHeader(): string {
  return TRACE_HEADER
}
