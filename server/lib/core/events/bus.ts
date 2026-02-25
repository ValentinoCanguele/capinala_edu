/**
 * EventBus — publicar/subscrever eventos internos (ex: aluno.criado, parcela.paga).
 * Desacoplar serviços.
 */
type Listener = (payload: unknown) => void | Promise<void>

const listeners = new Map<string, Listener[]>()

export function emit(event: string, payload?: unknown): void {
  const list = listeners.get(event)
  if (!list?.length) return
  for (const fn of list) {
    try {
      void Promise.resolve(fn(payload))
    } catch (e) {
      if (process.env.NODE_ENV !== 'test') {
        console.error(`[EventBus] ${event} listener error:`, e)
      }
    }
  }
}

export function on(event: string, fn: Listener): () => void {
  const list = listeners.get(event) ?? []
  list.push(fn)
  listeners.set(event, list)
  return () => {
    const idx = list.indexOf(fn)
    if (idx >= 0) list.splice(idx, 1)
  }
}

export function eventNames(): string[] {
  return [...listeners.keys()]
}
