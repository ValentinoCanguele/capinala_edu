/**
 * NotificationDispatcher — encaminhar evento "nova notificação" para canal (in-app, email, push).
 */
import { createNotification } from './inbox'

export type NotificationChannel = 'in_app' | 'email' | 'push'

export interface DispatchOptions {
  userId: string
  titulo: string
  mensagem: string
  channels?: NotificationChannel[]
}

export async function dispatchNotification(options: DispatchOptions): Promise<void> {
  const channels = options.channels ?? ['in_app']
  if (channels.includes('in_app')) {
    createNotification(options.userId, options.titulo, options.mensagem)
  }
  // email / push: integrar quando houver gateway
}
