/**
 * Configuração centralizada de rotas, breadcrumbs e second bar.
 * Fonte única para labels e tabs; Layout e secondBarConfig derivam daqui.
 */

export type SecondBarItem = { label: string; to: string }

export type NavItemConfig = {
  to: string
  label: string
  /** Apenas estes papéis veem o item; omitir = todos */
  roles?: readonly ('admin' | 'direcao' | 'responsavel')[]
}

/** Itens do menu lateral (sem ícones; Layout adiciona ícones por path). */
export const navItemsConfig: NavItemConfig[] = [
  { to: '/', label: 'Início' },
  { to: '/alunos', label: 'Alunos' },
  { to: '/turmas', label: 'Turmas' },
  { to: '/notas', label: 'Notas' },
  { to: '/recuperacao', label: 'Recuperação' },
  { to: '/pautas', label: 'Pautas' },
  { to: '/atas', label: 'Atas de Conselho' },
  { to: '/frequencia', label: 'Frequência' },
  { to: '/configuracoes', label: 'Configurações Académicas' },
  { to: '/boletim', label: 'Boletim' },
  { to: '/horarios', label: 'Horários' },
  { to: '/comunicados', label: 'Comunicados' },
  { to: '/ocorrencias', label: 'Ocorrências' },
  { to: '/disciplinas', label: 'Disciplinas' },
  { to: '/anos-letivos', label: 'Anos letivos' },
  { to: '/salas', label: 'Salas' },
  { to: '/matrizes', label: 'Matrizes', roles: ['admin', 'direcao'] },
  { to: '/auditoria', label: 'Auditoria', roles: ['admin', 'direcao'] },
  { to: '/financas', label: 'Finanças', roles: ['admin', 'direcao'] },
  { to: '/modulos', label: 'Módulos', roles: ['admin'] },
  { to: '/perfil', label: 'Perfil' },
  { to: '/meu-boletim', label: 'Meu boletim' },
  { to: '/presencas', label: 'Presenças' },
  { to: '/meus-filhos', label: 'Meus filhos', roles: ['responsavel'] },
  { to: '/arquivos', label: 'Arquivos' },
  { to: '/utilizadores', label: 'Utilizadores', roles: ['admin', 'direcao'] },
]

/** Labels por segmento de path para breadcrumbs. Segmentos aninhados (ex: dashboard sob financas) têm chave composta. */
const segmentLabels: Record<string, string> = {
  alunos: 'Alunos',
  turmas: 'Turmas',
  notas: 'Notas',
  pautas: 'Pautas',
  recuperacao: 'Recuperação',
  atas: 'Atas',
  frequencia: 'Frequência',
  configuracoes: 'Definições Académicas',
  boletim: 'Boletim',
  horarios: 'Horários',
  comunicados: 'Comunicados',
  ocorrencias: 'Ocorrências',
  disciplinas: 'Disciplinas',
  'anos-letivos': 'Anos letivos',
  salas: 'Salas',
  matrizes: 'Matrizes Curriculares',
  auditoria: 'Auditoria',
  financas: 'Finanças',
  dashboard: 'Visão geral',
  categorias: 'Categorias',
  lancamentos: 'Lançamentos',
  parcelas: 'Parcelas',
  relatorios: 'Relatórios',
  configuracao: 'Configuração',
  modulos: 'Módulos',
  perfil: 'Perfil',
  'meu-boletim': 'Meu boletim',
  presencas: 'Presenças',
  'meus-filhos': 'Meus filhos',
  arquivos: 'Arquivos',
  utilizadores: 'Utilizadores',
}

/** Second bar: path base (ou prefixo) -> tabs. Inclui sub-rotas de /financas. */
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
  '/notas': [
    { label: 'Lançamento', to: '/notas' },
    { label: 'Recuperação', to: '/recuperacao' },
    { label: 'Pauta Geral', to: '/pautas' },
    { label: 'Atas de Conselho', to: '/atas' },
  ],
  '/pautas': [
    { label: 'Visão Geral', to: '/pautas' },
    { label: 'Recuperação', to: '/recuperacao' },
    { label: 'Lançamento', to: '/notas' },
    { label: 'Atas de Conselho', to: '/atas' },
  ],
  '/recuperacao': [
    { label: 'Exames', to: '/recuperacao' },
    { label: 'Lançamento de Notas', to: '/notas' },
    { label: 'Pauta Geral', to: '/pautas' },
  ],
  '/atas': [
    { label: 'Histórico de Atas', to: '/atas' },
    { label: 'Pauta Geral', to: '/pautas' },
  ],
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
  '/ocorrencias': [
    { label: 'Histórico Disciplinar', to: '/ocorrencias' },
    { label: 'Pendentes', to: '/ocorrencias?resolvido=false' },
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
  '/matrizes': [
    { label: 'Explorador', to: '/matrizes' },
    { label: 'Nova Matriz', to: '/matrizes?acao=novo' },
  ],
  '/auditoria': [
    { label: 'Log', to: '/auditoria' },
    { label: 'Alertas', to: '/auditoria' },
  ],
  '/financas': [
    { label: 'Visão geral', to: '/financas/dashboard' },
    { label: 'Categorias', to: '/financas/categorias' },
    { label: 'Lançamentos', to: '/financas/lancamentos' },
    { label: 'Parcelas', to: '/financas/parcelas' },
    { label: 'Relatórios', to: '/financas/relatorios' },
    { label: 'Configuração', to: '/financas/configuracao' },
  ],
  '/modulos': [{ label: 'Módulos', to: '/modulos' }],
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

export function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split('/').filter(Boolean)
  const crumbs: { label: string; href: string }[] = [{ label: 'Início', href: '/' }]
  let acc = ''
  for (const seg of segments) {
    acc += `/${seg}`
    const label = segmentLabels[seg] ?? seg
    crumbs.push({ label, href: acc })
  }
  return crumbs
}
