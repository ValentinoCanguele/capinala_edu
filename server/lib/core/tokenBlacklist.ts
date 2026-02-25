/**
 * TokenBlacklist — ao logout, registar token na blacklist; requireAuth rejeita tokens na blacklist.
 * Implementação em memória; para produção pode usar Redis ou tabela DB.
 */
const blacklist = new Set<string>()

export function blacklistAdd(tokenOrJti: string): void {
  blacklist.add(tokenOrJti)
}

export function blacklistHas(tokenOrJti: string): boolean {
  return blacklist.has(tokenOrJti)
}

export function blacklistRemove(tokenOrJti: string): void {
  blacklist.delete(tokenOrJti)
}
