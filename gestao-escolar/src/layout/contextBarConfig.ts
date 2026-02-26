/**
 * Barra contextual (segunda barra à esquerda): links verticais por contexto (rota + papel).
 * Aparece entre a sidebar principal e o <main> quando existem itens para pathname + papel.
 * Itens de criação são filtrados por permissão (ex.: Adicionar aluno só se canCreateAluno).
 */

import { canCreateAluno, type Papel } from '@/lib/permissoes'

export type ContextBarItem = {
  to: string
  label: string
}

export type ContextBarEntry = {
  /** Path prefix que ativa este contexto (ex: /alunos, /financas) */
  pathPrefix: string
  /** Papéis que veem esta barra; omitir = todos os autenticados */
  roles?: readonly Papel[]
  items: ContextBarItem[]
}

const CONTEXT_BAR_ENTRIES: ContextBarEntry[] = [
  {
    pathPrefix: '/alunos',
    roles: ['admin', 'direcao', 'professor'],
    items: [
      { to: '/alunos', label: 'Ver lista' },
      { to: '/alunos?acao=novo', label: 'Adicionar aluno' },
      { to: '/boletim', label: 'Ver boletim' },
      { to: '/perfil', label: 'Ver perfil' },
    ],
  },
  {
    pathPrefix: '/',
    roles: ['aluno'],
    items: [
      { to: '/meu-perfil', label: 'Meu perfil' },
      { to: '/meu-boletim', label: 'Meu boletim' },
      { to: '/meu-boletim', label: 'Trabalhos académicos' },
      { to: '/aulas-hoje', label: 'Aulas de hoje' },
      { to: '/horarios', label: 'Horário' },
      { to: '/comunicados', label: 'Comunicados' },
    ],
  },
  {
    pathPrefix: '/',
    roles: ['responsavel'],
    items: [
      { to: '/meus-filhos', label: 'Meus filhos' },
      { to: '/meu-boletim', label: 'Boletim do filho' },
      { to: '/comunicados', label: 'Comunicados' },
    ],
  },
  {
    pathPrefix: '/financas',
    roles: ['admin', 'direcao'],
    items: [
      { to: '/financas/dashboard', label: 'Visão geral' },
      { to: '/financas/categorias', label: 'Categorias' },
      { to: '/financas/lancamentos', label: 'Lançamentos' },
      { to: '/financas/parcelas', label: 'Parcelas' },
      { to: '/financas/relatorios', label: 'Relatórios' },
      { to: '/financas/configuracao', label: 'Configuração' },
    ],
  },
]

/**
 * Devolve itens da barra contextual para o pathname e papel atuais.
 * Só inclui entradas cujo pathPrefix corresponda e o papel tenha acesso.
 * Itens de criação (ex.: Adicionar aluno) são filtrados por permissão.
 */
export function getContextBarItems(pathname: string, papel: string | undefined): ContextBarItem[] {
  const base = pathname.split('?')[0]
  for (const entry of CONTEXT_BAR_ENTRIES) {
    const matchesPath =
      entry.pathPrefix === '/'
        ? base === '/'
        : base === entry.pathPrefix || base.startsWith(entry.pathPrefix + '/')
    if (!matchesPath) continue
    if (entry.roles && (!papel || !entry.roles.includes(papel as Papel))) continue
    let items = entry.items
    if (entry.pathPrefix === '/alunos') {
      items = items.filter((item) => {
        if (item.to === '/alunos?acao=novo') return canCreateAluno(papel)
        return true
      })
    }
    return items
  }
  return []
}
