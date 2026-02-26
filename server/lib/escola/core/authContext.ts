/**
 * Contexto de autenticação — nano funções centralizadas.
 * Fonte única para getEscolaId e mensagens de erro consistentes.
 */
import type { AuthUser } from '@/lib/db'

const MSG_SEM_ESCOLA = 'Usuário sem escola definida'

/**
 * Obtém o escolaId do utilizador autenticado.
 * Lança se o utilizador não tiver escola (ex.: admin global sem contexto).
 */
export function getEscolaId(user: AuthUser): string {
  if (user.escolaId) return user.escolaId
  throw new Error(MSG_SEM_ESCOLA)
}

/**
 * Obtém escolaId ou null se não definido (útil para listagens que aceitam contexto opcional).
 */
export function getEscolaIdOrNull(user: AuthUser): string | null {
  return user.escolaId ?? null
}

/**
 * Verifica se o utilizador tem escola definida (ex.: antes de mostrar ações de escola).
 */
export function temEscola(user: AuthUser): boolean {
  return user.escolaId != null && user.escolaId !== ''
}
