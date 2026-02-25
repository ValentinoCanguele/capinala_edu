/**
 * EnvValidator — validar ao arranque que variáveis críticas existem; falhar rápido se faltar.
 */
const REQUIRED = ['DATABASE_URL', 'JWT_SECRET'] as const

export interface EnvValidationResult {
  valid: boolean
  missing: string[]
}

export function validateEnv(): EnvValidationResult {
  const missing = REQUIRED.filter((key) => !process.env[key]?.trim())
  return {
    valid: missing.length === 0,
    missing: [...missing],
  }
}

export function assertEnv(): void {
  const { valid, missing } = validateEnv()
  if (!valid) {
    throw new Error(`Variáveis de ambiente em falta: ${missing.join(', ')}`)
  }
}
