/**
 * EscolaContext — obter e validar escola_id a partir do AuthUser.
 * Garantir que todas as queries de domínio são filtradas por escola.
 */
import type { AuthUser } from '@/lib/db'

export function getEscolaIdOrThrow(user: AuthUser): string {
  if (user.escolaId) return user.escolaId
  throw new Error('Usuário sem escola definida')
}

export function getEscolaId(user: AuthUser): string | null {
  return user.escolaId ?? null
}

export function hasEscola(user: AuthUser): boolean {
  return user.escolaId != null && user.escolaId !== ''
}
