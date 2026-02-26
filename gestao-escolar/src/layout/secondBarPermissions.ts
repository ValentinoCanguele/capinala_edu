/**
 * Filtra itens da second bar por permissão (papel).
 * Esconde tabs de criação/edição quando o utilizador não tem permissão.
 */

import type { SecondBarItem } from '@/config/routes'
import {
  canCreateAluno,
  canCreateTurma,
  canCreateComunicado,
  canManageHorarios,
  canManageDisciplinas,
  canManageSalas,
  canGerirUtilizadores,
  isAdmin,
} from '@/lib/permissoes'

/**
 * Devolve apenas os itens da second bar que o utilizador pode ver para o pathname e papel.
 */
export function filterSecondBarByRole(
  items: SecondBarItem[],
  _pathname: string,
  papel: string | undefined
): SecondBarItem[] {
  return items.filter((item) => {
    const toPath = item.to.split('?')[0]
    const hasNovo = item.to.includes('acao=novo')
    if (!hasNovo) return true
    // Tabs "Adicionar" / "Novo" por rota
    if (toPath === '/alunos') return canCreateAluno(papel)
    if (toPath === '/turmas') return canCreateTurma(papel)
    if (toPath === '/comunicados') return canCreateComunicado(papel)
    if (toPath === '/horarios') return canManageHorarios(papel)
    if (toPath === '/disciplinas') return canManageDisciplinas(papel)
    if (toPath === '/anos-letivos') return isAdmin(papel)
    if (toPath === '/salas') return canManageSalas(papel)
    if (toPath === '/matrizes') return isAdmin(papel)
    if (toPath === '/utilizadores') return canGerirUtilizadores(papel)
    return true
  })
}
