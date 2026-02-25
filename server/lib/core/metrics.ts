/**
 * MetricsCollector — contadores simples em memória (requests, erros).
 */
const counters = new Map<string, number>()

export function incrementCounter(name: string, delta = 1): void {
  counters.set(name, (counters.get(name) ?? 0) + delta)
}

export function getCounter(name: string): number {
  return counters.get(name) ?? 0
}

export function getSnapshot(): Record<string, number> {
  return Object.fromEntries(counters)
}
