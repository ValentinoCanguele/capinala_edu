/**
 * Permissões granulares por papel.
 * Definição centralizada de quem pode fazer o quê.
 */
import type { AuthUser } from '@/lib/db'

type Papel = AuthUser['papel']

export const PAPEIS_ADMIN: Papel[] = ['admin', 'direcao']
const PAPEIS_GESTAO: Papel[] = ['admin', 'direcao', 'professor']
const TODOS_PAPEIS: Papel[] = ['admin', 'direcao', 'professor', 'responsavel', 'aluno']

/* ── Helpers ── */

function isPapel(user: AuthUser, papeis: Papel[]): boolean {
  return papeis.includes(user.papel)
}

/**
 * Lança erro se o utilizador não tem permissão.
 */
export function assertPermissao(user: AuthUser, papeis: Papel[], acao: string): void {
  if (!isPapel(user, papeis)) {
    throw new Error(`Sem permissão para ${acao} (papel: ${user.papel})`)
  }
}

/* ── Alunos ── */

export function canCreateAluno(user: AuthUser): boolean {
  return isPapel(user, PAPEIS_ADMIN)
}

export function canDeleteAluno(user: AuthUser): boolean {
  return isPapel(user, PAPEIS_ADMIN)
}

export function canViewAlunos(user: AuthUser): boolean {
  return isPapel(user, TODOS_PAPEIS)
}

/* ── Turmas ── */

export function canCreateTurma(user: AuthUser): boolean {
  return isPapel(user, PAPEIS_ADMIN)
}

export function canDeleteTurma(user: AuthUser): boolean {
  return isPapel(user, PAPEIS_ADMIN)
}

export function canManageTurmaAlunos(user: AuthUser): boolean {
  return isPapel(user, PAPEIS_ADMIN)
}

/* ── Disciplinas ── */

export function canManageDisciplinas(user: AuthUser): boolean {
  return isPapel(user, PAPEIS_GESTAO)
}

/* ── Notas ── */

export function canLancarNotas(user: AuthUser): boolean {
  return isPapel(user, PAPEIS_GESTAO)
}

export function canViewNotas(user: AuthUser): boolean {
  return isPapel(user, TODOS_PAPEIS)
}

/* ── Boletim ── */

export function canVerBoletim(user: AuthUser): boolean {
  return isPapel(user, TODOS_PAPEIS)
}

/* ── Frequência ── */

export function canRegistarFrequencia(user: AuthUser): boolean {
  return isPapel(user, PAPEIS_GESTAO)
}

export function canViewFrequencia(user: AuthUser): boolean {
  return isPapel(user, TODOS_PAPEIS)
}

export function canViewRelatorioFrequencia(user: AuthUser): boolean {
  return isPapel(user, PAPEIS_GESTAO)
}

/* ── Horários ── */

export function canManageHorarios(user: AuthUser): boolean {
  return isPapel(user, PAPEIS_ADMIN)
}

export function canViewHorarios(user: AuthUser): boolean {
  return isPapel(user, TODOS_PAPEIS)
}

/* ── Comunicados ── */

export function canCreateComunicado(user: AuthUser): boolean {
  return isPapel(user, PAPEIS_GESTAO)
}

export function canDeleteComunicado(user: AuthUser, autorId?: string): boolean {
  if (isPapel(user, PAPEIS_ADMIN)) return true
  return autorId === user.userId
}

export function canViewComunicados(user: AuthUser): boolean {
  return isPapel(user, TODOS_PAPEIS)
}

/* ── Salas ── */

export function canManageSalas(user: AuthUser): boolean {
  return isPapel(user, PAPEIS_ADMIN)
}

/* ── Dashboard ── */

export function canViewDashboard(user: AuthUser): boolean {
  return isPapel(user, PAPEIS_GESTAO)
}

/* ── Audit ── */

export function canViewAuditLog(user: AuthUser): boolean {
  return isPapel(user, PAPEIS_ADMIN)
}

/* ── Responsáveis — acesso restrito ── */

/**
 * Verifica se o responsável pode ver dados de um aluno específico.
 * Esta verificação deve ser feita a nível de serviço (via BD).
 */
export function isResponsavel(user: AuthUser): boolean {
  return user.papel === 'responsavel'
}

export function isAluno(user: AuthUser): boolean {
  return user.papel === 'aluno'
}

export function isProfessor(user: AuthUser): boolean {
  return user.papel === 'professor'
}

export function isAdmin(user: AuthUser): boolean {
  return isPapel(user, PAPEIS_ADMIN)
}

/* ── Módulos do sistema (Definições) ── */

export function canManageModulos(user: AuthUser): boolean {
  return user.papel === 'admin'
}

/* ── Nano: checagens simples por papel ── */

export function canEditComunicado(user: AuthUser, autorId: string): boolean {
  if (isPapel(user, PAPEIS_ADMIN)) return true
  return autorId === user.userId
}

export function canAcederAuditoria(user: AuthUser): boolean {
  return canViewAuditLog(user)
}

export function canGerirUtilizadores(user: AuthUser): boolean {
  return isPapel(user, PAPEIS_ADMIN)
}

export function canGerirFinancas(user: AuthUser): boolean {
  return isPapel(user, PAPEIS_ADMIN)
}

export function canVerRelatorioFrequencia(user: AuthUser): boolean {
  return isPapel(user, PAPEIS_GESTAO)
}
