/**
 * DataSanitizer — sanitização central (trim, normalizar) antes de persistir; complementar ao Zod.
 */
export function trimString(s: unknown): string {
  if (s == null) return ''
  return String(s).trim()
}

export function normalizeDateISO(s: unknown): string | null {
  if (s == null || s === '') return null
  const str = String(s).trim()
  const d = new Date(str)
  if (Number.isNaN(d.getTime())) return null
  return d.toISOString().slice(0, 10)
}
