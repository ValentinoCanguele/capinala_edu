/**
 * FeatureFlags — ler flags por escola ou global (env ou DB).
 */
export function isEnabled(flag: string, _escolaId?: string | null): boolean {
  const envKey = `FF_${flag.toUpperCase().replace(/-/g, '_')}`
  const v = process.env[envKey]
  return v === '1' || v === 'true' || v === 'yes'
}
