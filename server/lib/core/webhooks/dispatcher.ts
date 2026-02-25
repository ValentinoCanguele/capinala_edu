/**
 * WebhookDispatcher — ao ocorrer evento, chamar URLs configuradas por escola (POST com payload).
 * Implementação: enfileirar ou chamar fetch; em produção usar fila.
 */
import { emit, on } from '@/lib/core/events/bus'

const webhookUrlsByEvent = new Map<string, string[]>() // event -> URLs

export function registerWebhook(event: string, url: string): void {
  const list = webhookUrlsByEvent.get(event) ?? []
  if (!list.includes(url)) list.push(url)
  webhookUrlsByEvent.set(event, list)
}

export function unregisterWebhook(event: string, url: string): void {
  const list = webhookUrlsByEvent.get(event) ?? []
  const i = list.indexOf(url)
  if (i >= 0) list.splice(i, 1)
}

export async function dispatchWebhook(event: string, payload: unknown): Promise<void> {
  const urls = webhookUrlsByEvent.get(event)
  if (!urls?.length) return
  const body = JSON.stringify({ event, payload, timestamp: new Date().toISOString() })
  await Promise.allSettled(
    urls.map((url) =>
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
    )
  )
}

/** Subscrever eventos internos e reenviar para webhooks. */
export function attachWebhooksToEventBus(): void {
  const events = ['aluno.criado', 'turma.criada']
  for (const event of events) {
    on(event, (payload) => {
      void dispatchWebhook(event, payload)
    })
  }
}
