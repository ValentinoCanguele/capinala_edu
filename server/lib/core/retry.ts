/**
 * RetryPolicy — wrapper para operações com retry exponencial.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxAttempts?: number; baseMs?: number } = {}
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3
  const baseMs = options.baseMs ?? 200
  let lastError: unknown
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn()
    } catch (e) {
      lastError = e
      if (i < maxAttempts - 1) {
        await new Promise((r) => setTimeout(r, baseMs * Math.pow(2, i)))
      }
    }
  }
  throw lastError
}
