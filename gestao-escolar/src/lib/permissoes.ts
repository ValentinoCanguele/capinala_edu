/**
 * Camada de permissões no frontend — espelho do server/lib/escola/permissoes.ts.
 * Usar para esconder na UI o que o backend recusaria (botões, links, secções).
 * A autoridade para APIs continua a ser o backend.
 */

export type Papel = 'admin' | 'direcao' | 'professor' | 'responsavel' | 'aluno'

const PAPEIS_ADMIN: Papel[] = ['admin', 'direcao']
const PAPEIS_GESTAO: Papel[] = ['admin', 'direcao', 'professor']
const TODOS_PAPEIS: Papel[] = ['admin', 'direcao', 'professor', 'responsavel', 'aluno']

function isPapel(papel: string | undefined, papeis: Papel[]): boolean {
  return !!papel && papeis.includes(papel as Papel)
}

/* ── Alunos ── */
export function canCreateAluno(papel: string | undefined): boolean {
  return isPapel(papel, PAPEIS_ADMIN)
}

export function canDeleteAluno(papel: string | undefined): boolean {
  return isPapel(papel, PAPEIS_ADMIN)
}

export function canViewAlunos(papel: string | undefined): boolean {
  return isPapel(papel, TODOS_PAPEIS)
}

/* ── Turmas ── */
export function canCreateTurma(papel: string | undefined): boolean {
  return isPapel(papel, PAPEIS_ADMIN)
}

export function canDeleteTurma(papel: string | undefined): boolean {
  return isPapel(papel, PAPEIS_ADMIN)
}

export function canManageTurmaAlunos(papel: string | undefined): boolean {
  return isPapel(papel, PAPEIS_ADMIN)
}

/* ── Disciplinas ── */
export function canManageDisciplinas(papel: string | undefined): boolean {
  return isPapel(papel, PAPEIS_GESTAO)
}

/* ── Notas ── */
export function canLancarNotas(papel: string | undefined): boolean {
  return isPapel(papel, PAPEIS_GESTAO)
}

export function canViewNotas(papel: string | undefined): boolean {
  return isPapel(papel, TODOS_PAPEIS)
}

/* ── Boletim ── */
export function canVerBoletim(papel: string | undefined): boolean {
  return isPapel(papel, TODOS_PAPEIS)
}

/* ── Frequência ── */
export function canRegistarFrequencia(papel: string | undefined): boolean {
  return isPapel(papel, PAPEIS_GESTAO)
}

export function canViewFrequencia(papel: string | undefined): boolean {
  return isPapel(papel, TODOS_PAPEIS)
}

export function canViewRelatorioFrequencia(papel: string | undefined): boolean {
  return isPapel(papel, PAPEIS_GESTAO)
}

/* ── Horários ── */
export function canManageHorarios(papel: string | undefined): boolean {
  return isPapel(papel, PAPEIS_ADMIN)
}

export function canViewHorarios(papel: string | undefined): boolean {
  return isPapel(papel, TODOS_PAPEIS)
}

/* ── Comunicados ── */
export function canCreateComunicado(papel: string | undefined): boolean {
  return isPapel(papel, PAPEIS_GESTAO)
}

/** Editar comunicado: admin/direção ou autor (userId === autorId). */
export function canEditComunicado(
  papel: string | undefined,
  userId: string | undefined,
  autorId: string | undefined
): boolean {
  if (isPapel(papel, PAPEIS_ADMIN)) return true
  return !!userId && !!autorId && userId === autorId
}

/** Eliminar comunicado: admin/direção ou autor. */
export function canDeleteComunicado(
  papel: string | undefined,
  userId: string | undefined,
  autorId: string | undefined
): boolean {
  if (isPapel(papel, PAPEIS_ADMIN)) return true
  return !!userId && !!autorId && userId === autorId
}

export function canViewComunicados(papel: string | undefined): boolean {
  return isPapel(papel, TODOS_PAPEIS)
}

/* ── Salas ── */
export function canManageSalas(papel: string | undefined): boolean {
  return isPapel(papel, PAPEIS_ADMIN)
}

/* ── Dashboard ── */
export function canViewDashboard(papel: string | undefined): boolean {
  return isPapel(papel, PAPEIS_GESTAO)
}

/* ── Audit ── */
export function canViewAuditLog(papel: string | undefined): boolean {
  return isPapel(papel, PAPEIS_ADMIN)
}

/* ── Identidade ── */
export function isResponsavel(papel: string | undefined): boolean {
  return papel === 'responsavel'
}

export function isAluno(papel: string | undefined): boolean {
  return papel === 'aluno'
}

export function isProfessor(papel: string | undefined): boolean {
  return papel === 'professor'
}

export function isAdmin(papel: string | undefined): boolean {
  return isPapel(papel, PAPEIS_ADMIN)
}

/* ── Módulos (Definições) ── */
export function canManageModulos(papel: string | undefined): boolean {
  return papel === 'admin'
}

/* ── Utilizadores ── */
export function canGerirUtilizadores(papel: string | undefined): boolean {
  return isPapel(papel, PAPEIS_ADMIN)
}

/* ── Atas de conselho ── */
export function canManageAtas(papel: string | undefined): boolean {
  return isPapel(papel, PAPEIS_ADMIN)
}

/* ── Ocorrências disciplinares ── */
export function canManageOcorrencias(papel: string | undefined): boolean {
  return isPapel(papel, PAPEIS_GESTAO)
}

/* ── Finanças ── */
export function canGerirFinancas(papel: string | undefined): boolean {
  return isPapel(papel, PAPEIS_ADMIN)
}
