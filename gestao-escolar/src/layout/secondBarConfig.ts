/**
 * Configuração da second bar (sub-navegação contextual) – estilo Supabase Studio.
 * Usado pelo Layout para tabs e pelo breadcrumb para o segmento ativo.
 */

export type SecondBarItem = { label: string; to: string }

export const secondBarConfig: Record<string, SecondBarItem[]> = {
  '/': [{ label: 'Visão geral', to: '/' }],
  '/alunos': [
    { label: 'Lista', to: '/alunos' },
    { label: 'Adicionar', to: '/alunos?acao=novo' },
  ],
  '/turmas': [
    { label: 'Lista', to: '/turmas' },
    { label: 'Adicionar', to: '/turmas?acao=novo' },
  ],
  '/notas': [{ label: 'Lançamento por turma', to: '/notas' }],
  '/frequencia': [
    { label: 'Registo de presenças', to: '/frequencia' },
    { label: 'Relatório', to: '/frequencia?vista=relatorio' },
  ],
  '/boletim': [{ label: 'Consultar boletins', to: '/boletim' }],
  '/horarios': [
    { label: 'Grade', to: '/horarios' },
    { label: 'Adicionar slot', to: '/horarios?acao=novo' },
  ],
  '/comunicados': [
    { label: 'Todos', to: '/comunicados' },
    { label: 'Novo', to: '/comunicados?acao=novo' },
  ],
  '/disciplinas': [
    { label: 'Lista', to: '/disciplinas' },
    { label: 'Adicionar', to: '/disciplinas?acao=novo' },
  ],
  '/anos-letivos': [
    { label: 'Lista', to: '/anos-letivos' },
    { label: 'Adicionar', to: '/anos-letivos?acao=novo' },
  ],
  '/salas': [
    { label: 'Lista', to: '/salas' },
    { label: 'Adicionar', to: '/salas?acao=novo' },
  ],
  '/auditoria': [
    { label: 'Log', to: '/auditoria' },
    { label: 'Alertas', to: '/auditoria' },
  ],
  '/perfil': [
    { label: 'Dados', to: '/perfil' },
    { label: 'Alterar senha', to: '/perfil' },
  ],
  '/meu-boletim': [{ label: 'Meu boletim', to: '/meu-boletim' }],
  '/presencas': [{ label: 'Resumo', to: '/presencas' }],
  '/meus-filhos': [{ label: 'Lista', to: '/meus-filhos' }],
  '/arquivos': [
    { label: 'Lista', to: '/arquivos' },
    { label: 'Enviar', to: '/arquivos' },
  ],
  '/utilizadores': [
    { label: 'Lista', to: '/utilizadores' },
    { label: 'Novo', to: '/utilizadores?acao=novo' },
  ],
}

export function getSecondBarItems(pathname: string): SecondBarItem[] {
  const base = pathname.split('?')[0]
  if (secondBarConfig[base]) return secondBarConfig[base]
  for (const key of Object.keys(secondBarConfig)) {
    if (key !== '/' && base.startsWith(key)) return secondBarConfig[key]
  }
  return []
}

export function isSecondBarItemActive(
  item: SecondBarItem,
  pathname: string,
  search: string
): boolean {
  const itemPath = item.to.split('?')[0]
  const itemQuery = item.to.includes('?') ? item.to.slice(item.to.indexOf('?')) : ''
  if (itemPath !== pathname) return false
  if (item.to === '/') return pathname === '/' && !search
  if (!itemQuery) return !search
  const params = new URLSearchParams(search)
  const itemParams = new URLSearchParams(itemQuery)
  for (const [key] of itemParams) {
    if (params.get(key) !== itemParams.get(key)) return false
  }
  return true
}

/** Devolve o label do tab ativo na second bar quando não é o primeiro (evita duplicar no breadcrumb). */
export function getActiveSecondBarLabel(pathname: string, search: string): string | null {
  const items = getSecondBarItems(pathname)
  if (items.length === 0) return null
  const active = items.find((item) => isSecondBarItemActive(item, pathname, search))
  if (!active || active === items[0]) return null
  return active.label
}
