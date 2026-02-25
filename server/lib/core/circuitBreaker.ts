/**
 * CircuitBreaker — desligar chamadas a um recurso após N falhas; reabrir após cooldown.
 */
export interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open'
  failures: number
  lastFailureAt: number | null
}

const breakers = new Map<string, CircuitBreakerState>()

const DEFAULT_FAILURE_THRESHOLD = 5
const DEFAULT_COOLDOWN_MS = 30_000

export function getCircuitBreakerState(key: string): CircuitBreakerState {
  const s = breakers.get(key)
  if (s) return s
  const init: CircuitBreakerState = {
    state: 'closed',
    failures: 0,
    lastFailureAt: null,
  }
  breakers.set(key, init)
  return init
}

export function recordSuccess(key: string): void {
  const s = breakers.get(key)
  if (!s) return
  s.failures = 0
  s.state = 'closed'
}

export function recordFailure(key: string): void {
  const s = getCircuitBreakerState(key)
  s.failures += 1
  s.lastFailureAt = Date.now()
  if (s.failures >= DEFAULT_FAILURE_THRESHOLD) {
    s.state = 'open'
  }
}

export function canAttempt(key: string, options?: { threshold?: number; cooldownMs?: number }): boolean {
  const threshold = options?.threshold ?? DEFAULT_FAILURE_THRESHOLD
  const cooldownMs = options?.cooldownMs ?? DEFAULT_COOLDOWN_MS
  const s = getCircuitBreakerState(key)
  if (s.state === 'closed') return true
  if (s.state === 'open') {
    if (s.lastFailureAt && Date.now() - s.lastFailureAt >= cooldownMs) {
      s.state = 'half-open'
      return true
    }
    return false
  }
  return true
}
