/**
 * Sidebar principal: grupos (Principal, Pedagógico, Cadastros, Finanças, Sistema)
 * e visibilidade por papel. getSidebarGroupsForRole(papel) devolve apenas grupos
 * com itens visíveis para esse papel.
 */

import type { Papel } from '@/lib/permissoes'

export type SidebarPapel = Papel

export type SidebarItem = {
  to: string
  label: string
  /** Papéis que podem ver este item; omitir = todos */
  roles?: readonly SidebarPapel[]
}

export type SidebarGroup = {
  id: string
  title: string
  items: SidebarItem[]
}

const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    id: 'principal',
    title: 'Principal',
    items: [
      { to: '/', label: 'Início' },
    ],
  },
  {
    id: 'pedagogico',
    title: 'Pedagógico',
    items: [
      { to: '/turmas', label: 'Turmas', roles: ['admin', 'direcao', 'professor'] },
      { to: '/notas', label: 'Notas', roles: ['admin', 'direcao', 'professor'] },
      { to: '/recuperacao', label: 'Recuperação', roles: ['admin', 'direcao', 'professor'] },
      { to: '/pautas', label: 'Pautas', roles: ['admin', 'direcao', 'professor'] },
      { to: '/atas', label: 'Atas de Conselho', roles: ['admin', 'direcao', 'professor'] },
      { to: '/frequencia', label: 'Frequência', roles: ['admin', 'direcao', 'professor'] },
      { to: '/configuracoes', label: 'Configurações Académicas', roles: ['admin', 'direcao', 'professor'] },
      { to: '/boletim', label: 'Boletim', roles: ['admin', 'direcao', 'professor'] },
      { to: '/horarios', label: 'Horários', roles: ['admin', 'direcao', 'professor', 'aluno'] },
      { to: '/comunicados', label: 'Comunicados' },
      { to: '/ocorrencias', label: 'Ocorrências', roles: ['admin', 'direcao', 'professor'] },
      { to: '/disciplinas', label: 'Disciplinas', roles: ['admin', 'direcao', 'professor'] },
      { to: '/matrizes', label: 'Matrizes', roles: ['admin', 'direcao'] },
    ],
  },
  {
    id: 'cadastros',
    title: 'Cadastros',
    items: [
      { to: '/alunos', label: 'Alunos', roles: ['admin', 'direcao', 'professor'] },
      { to: '/anos-letivos', label: 'Anos letivos', roles: ['admin', 'direcao'] },
      { to: '/salas', label: 'Salas', roles: ['admin', 'direcao'] },
    ],
  },
  {
    id: 'financas',
    title: 'Finanças',
    items: [
      { to: '/financas', label: 'Finanças', roles: ['admin', 'direcao'] },
    ],
  },
  {
    id: 'sistema',
    title: 'Sistema',
    items: [
      { to: '/auditoria', label: 'Auditoria', roles: ['admin', 'direcao'] },
      { to: '/modulos', label: 'Módulos', roles: ['admin'] },
      { to: '/perfil', label: 'Perfil', roles: ['admin', 'direcao', 'professor', 'responsavel'] },
      { to: '/meu-perfil', label: 'Meu perfil', roles: ['aluno'] },
      { to: '/meu-boletim', label: 'Meu boletim', roles: ['aluno'] },
      { to: '/aulas-hoje', label: 'Aulas de hoje', roles: ['aluno'] },
      { to: '/presencas', label: 'Presenças', roles: ['aluno'] },
      { to: '/meus-filhos', label: 'Meus filhos', roles: ['responsavel'] },
      { to: '/arquivos', label: 'Arquivos', roles: ['admin', 'direcao', 'professor'] },
      { to: '/utilizadores', label: 'Utilizadores', roles: ['admin', 'direcao'] },
    ],
  },
]

function itemVisibleForRole(item: SidebarItem, papel: string | undefined): boolean {
  if (!item.roles) return true
  return !!papel && item.roles.includes(papel as SidebarPapel)
}

/**
 * Devolve grupos da sidebar com apenas os itens visíveis para o papel.
 * Grupos sem itens visíveis são omitidos.
 */
export function getSidebarGroupsForRole(papel: string | undefined): SidebarGroup[] {
  return SIDEBAR_GROUPS.map((group) => {
    const items = group.items.filter((item) => itemVisibleForRole(item, papel))
    return { ...group, items }
  }).filter((g) => g.items.length > 0)
}
