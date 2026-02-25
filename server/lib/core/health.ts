/**
 * HealthCheck — verificar DB e estado do serviço para load balancer e monitorização.
 * Usado por /api/health.
 */
import { getDb } from '@/lib/db'
import { checkIntegrations } from '@/lib/core/integrations/health'

export interface HealthResult {
  ok: boolean
  service: string
  db?: 'ok' | 'error'
  dbLatencyMs?: number
  integrations?: Array<{ name: string; ok: boolean; latencyMs?: number; message?: string }>
  timestamp: string
}

export async function runHealthCheck(): Promise<HealthResult> {
  const result: HealthResult = {
    ok: true,
    service: 'gestao-escolar-api',
    timestamp: new Date().toISOString(),
  }

  try {
    const start = Date.now()
    const db = getDb()
    await db.query('SELECT 1')
    result.db = 'ok'
    result.dbLatencyMs = Date.now() - start
  } catch {
    result.db = 'error'
    result.ok = false
  }

  try {
    result.integrations = await checkIntegrations()
  } catch {
    result.integrations = []
  }

  return result
}
