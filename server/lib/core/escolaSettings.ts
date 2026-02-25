/**
 * EscolaSettings — ler/gravar configurações por escola (nome, logo, ano letivo padrão, timezone).
 * Implementação: em memória; em produção usar tabela escola_config.
 */
const settingsByEscola = new Map<string, Record<string, unknown>>()

export function getEscolaSetting(escolaId: string, key: string): unknown {
  return settingsByEscola.get(escolaId)?.[key] ?? null
}

export function setEscolaSetting(escolaId: string, key: string, value: unknown): void {
  const cur = settingsByEscola.get(escolaId) ?? {}
  settingsByEscola.set(escolaId, { ...cur, [key]: value })
}

export function getAllEscolaSettings(escolaId: string): Record<string, unknown> {
  return { ...(settingsByEscola.get(escolaId) ?? {}) }
}
