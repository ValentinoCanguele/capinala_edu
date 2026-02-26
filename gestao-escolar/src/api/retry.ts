/**
 * Wrapper para pedidos com retry exponencial (útil para falhas de rede ou 5xx).
 * Não substitui o client principal; usar em chamadas críticas (ex.: envio em lote).
 */

export interface RetryOptions {
  /** Número máximo de tentativas (incluindo a primeira) */
  attempts?: number
  /** Atraso base em ms; dobra a cada tentativa (ex.: 500 → 1000 → 2000) */
  delayMs?: number
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  attempts: 3,
  delayMs: 500,
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Executa uma função assíncrona e repete em caso de falha (throw ou rejeição).
 * Útil para falhas de rede (Failed to fetch) ou timeouts; backoff exponencial entre tentativas.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { attempts, delayMs } = { ...DEFAULT_OPTIONS, ...options }
  let lastError: unknown
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err
      if (attempt === attempts) throw err
      await sleep(delayMs * Math.pow(2, attempt - 1))
    }
  }
  throw lastError
}
