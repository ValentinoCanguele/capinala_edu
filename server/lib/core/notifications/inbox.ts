/**
 * NotificationInbox — criar/ler notificações in-app por usuário.
 * Implementação em memória; para produção usar tabela notificacoes.
 */
export interface Notification {
  id: string
  userId: string
  titulo: string
  mensagem: string
  lida: boolean
  createdAt: string
}

const store: Notification[] = []
let idCounter = 0

function nextId(): string {
  idCounter += 1
  return `notif-${idCounter}-${Date.now()}`
}

export function createNotification(
  userId: string,
  titulo: string,
  mensagem: string
): Notification {
  const n: Notification = {
    id: nextId(),
    userId,
    titulo,
    mensagem,
    lida: false,
    createdAt: new Date().toISOString(),
  }
  store.push(n)
  return n
}

export function listNotificationsByUser(userId: string, limit = 50): Notification[] {
  return store
    .filter((n) => n.userId === userId)
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
    .slice(0, limit)
}

export function markAsRead(notificationId: string, userId: string): boolean {
  const n = store.find((x) => x.id === notificationId && x.userId === userId)
  if (n) n.lida = true
  return !!n
}
