/**
 * ErrorReporter — capturar exceções; log + opcional envio para serviço externo (ex: Sentry).
 */
export function reportError(error: unknown, context?: Record<string, unknown>): void {
  if (process.env.NODE_ENV !== 'test') {
    console.error('[ErrorReporter]', error, context ?? '')
  }
}
