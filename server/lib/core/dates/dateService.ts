/**
 * DateService — funções centralizadas: hoje em ISO, início/fim do mês; timezone por escola (futuro).
 */
export function hojeISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function inicioDoMes(ref: Date = new Date()): string {
  const y = ref.getFullYear()
  const m = String(ref.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}-01`
}

export function fimDoMes(ref: Date = new Date()): string {
  const d = new Date(ref.getFullYear(), ref.getMonth() + 1, 0)
  return d.toISOString().slice(0, 10)
}

export function parseDateISO(str: string): Date {
  return new Date(str + 'T12:00:00Z')
}
