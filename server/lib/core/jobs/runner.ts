/**
 * JobRunner — executar um job (função async) com log e captura de erros.
 */
export interface JobRunResult {
  ok: boolean
  durationMs: number
  error?: string
}

export async function runJob(name: string, fn: () => Promise<void>): Promise<JobRunResult> {
  const start = Date.now()
  try {
    await fn()
    return { ok: true, durationMs: Date.now() - start }
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e)
    if (process.env.NODE_ENV !== 'test') {
      console.error(`[JobRunner] ${name} error:`, error)
    }
    return { ok: false, durationMs: Date.now() - start, error }
  }
}
