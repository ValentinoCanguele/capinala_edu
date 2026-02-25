/**
 * IntegrationHealth — verificar conectividade a serviços externos; expor em health.
 */
export interface IntegrationStatus {
  name: string
  ok: boolean
  latencyMs?: number
  message?: string
}

export async function checkIntegrations(): Promise<IntegrationStatus[]> {
  const results: IntegrationStatus[] = []
  // Placeholder: em produção verificar SMTP, Redis, storage, etc.
  return results
}
