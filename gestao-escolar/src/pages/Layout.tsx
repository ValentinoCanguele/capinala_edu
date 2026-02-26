/**
 * Layout principal — arquitetura visual e navegação estilo Supabase Studio.
 * - Sidebar: colapsável (só ícones) com expansão no hover (transition + shadow).
 * - Header: breadcrumbs + toggle dark/light + menu utilizador.
 * - Second Bar: tabs contextuais por rota (ex: /alunos → Lista | Adicionar).
 * Variáveis CSS --studio-* em theme/variables.css (dark/light).
 */
import { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import {
  Home,
  Users,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  FileText,
  Clock,
  Megaphone,
  BookMarked,
  Calendar,
  DoorOpen,
  History as HistoryIcon,
  Layers,
  Sun,
  Moon,
  LogOut,
  Table,
  Settings2,
  TrendingUp,
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
  HelpCircle,
  Bell,
  User,
  FolderOpen,
  Shield,
  ShieldAlert,
  DollarSign,
  Puzzle,
  Search,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useQueryClient, type QueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { prefetchFinancasDashboard } from '@/data/escola/financasQueries'
import {
  prefetchAlunos,
  prefetchAnosLetivos,
  prefetchAtas,
  prefetchComunicados,
  prefetchDashboardStats,
  prefetchDisciplinas,
  prefetchHorarios,
  prefetchMatrizes,
  prefetchModulos,
  prefetchOcorrencias,
  prefetchSalas,
  prefetchTurmas,
  prefetchUsuarios,
} from '@/data/escola/queries'
import {
  getSecondBarItems,
  isSecondBarItemActive,
  getActiveSecondBarLabel,
} from '@/layout/secondBarConfig'
import { getSidebarGroupsForRole } from '@/layout/sidebarConfig'
import { getContextBarItems } from '@/layout/contextBarConfig'
import { filterSecondBarByRole } from '@/layout/secondBarPermissions'
import { getBreadcrumbs } from '@/config/routes'
import { getItem, setItem } from '@/lib/storage'

const SIDEBAR_COLLAPSED_KEY_LEGACY = 'gestao-escolar-sidebar-collapsed'
const SIDEBAR_COLLAPSED_STORAGE_KEY = 'sidebar-collapsed'

function getInitialSidebarCollapsed(): boolean {
  if (typeof window === 'undefined') return false
  const fromStorage = getItem<boolean>(SIDEBAR_COLLAPSED_STORAGE_KEY)
  if (fromStorage !== undefined) return fromStorage
  try {
    const raw = localStorage.getItem(SIDEBAR_COLLAPSED_KEY_LEGACY)
    if (raw === 'true' || raw === 'false') {
      const value = raw === 'true'
      setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, value)
      localStorage.removeItem(SIDEBAR_COLLAPSED_KEY_LEGACY)
      return value
    }
  } catch {
    // ignore
  }
  return false
}
const SIDEBAR_WIDTH_EXPANDED = 'w-56'
const SIDEBAR_WIDTH_COLLAPSED = 'w-16'
const LOGO_URL = '/logo.png'

const pathToIcon: Record<string, typeof Home> = {
  '/': Home,
  '/alunos': Users,
  '/turmas': BookOpen,
  '/notas': ClipboardList,
  '/recuperacao': TrendingUp,
  '/pautas': Table,
  '/atas': HistoryIcon,
  '/frequencia': CalendarCheck,
  '/configuracoes': Settings2,
  '/boletim': FileText,
  '/horarios': Clock,
  '/comunicados': Megaphone,
  '/ocorrencias': ShieldAlert,
  '/disciplinas': BookMarked,
  '/anos-letivos': Calendar,
  '/salas': DoorOpen,
  '/matrizes': Layers,
  '/auditoria': HistoryIcon,
  '/financas': DollarSign,
  '/modulos': Puzzle,
  '/perfil': User,
  '/meu-boletim': FileText,
  '/presencas': CalendarCheck,
  '/meus-filhos': Users,
  '/arquivos': FolderOpen,
  '/utilizadores': Shield,
  '/meu-perfil': User,
  '/aulas-hoje': CalendarCheck,
}

const CONTEXT_BAR_WIDTH = 'w-44'

/** Ícones para itens da barra contextual (por path ou path+query). */
const contextBarPathToIcon: Record<string, typeof Home> = {
  '/alunos': Users,
  '/boletim': FileText,
  '/perfil': User,
  '/meu-perfil': User,
  '/meu-boletim': FileText,
  '/aulas-hoje': CalendarCheck,
  '/horarios': Clock,
  '/comunicados': Megaphone,
  '/meus-filhos': Users,
  '/financas/dashboard': TrendingUp,
  '/financas/categorias': BookMarked,
  '/financas/lancamentos': ClipboardList,
  '/financas/parcelas': FileText,
  '/financas/relatorios': FileText,
  '/financas/configuracao': Settings2,
}

const SIDEBAR_PREFETCH: Record<string, (queryClient: QueryClient) => void> = {
  '/': prefetchDashboardStats,
  '/alunos': prefetchAlunos,
  '/turmas': prefetchTurmas,
  '/comunicados': prefetchComunicados,
  '/anos-letivos': prefetchAnosLetivos,
  '/disciplinas': prefetchDisciplinas,
  '/salas': prefetchSalas,
  '/modulos': prefetchModulos,
  '/utilizadores': prefetchUsuarios,
  '/financas': prefetchFinancasDashboard,
  '/ocorrencias': prefetchOcorrencias,
  '/atas': prefetchAtas,
  '/matrizes': prefetchMatrizes,
  '/horarios': prefetchHorarios,
}

export default function Layout() {
  const queryClient = useQueryClient()
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const crumbs = getBreadcrumbs(location.pathname)
    const pageTitle = crumbs.length > 0 ? crumbs[crumbs.length - 1].label : 'Início'
    document.title = `${pageTitle} — Gestão Escolar`
  }, [location.pathname])
  const [logoError, setLogoError] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [acercaOpen, setAcercaOpen] = useState(false)
  const acercaCloseRef = useRef<HTMLButtonElement>(null)

  const [isCollapsed, setCollapsedState] = useState(getInitialSidebarCollapsed)
  const [hoverExpanded, setHoverExpanded] = useState(false)

  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value)
    setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, value)
  }, [])

  const isSidebarNarrow = isCollapsed && !hoverExpanded
  const sidebarWidth = isSidebarNarrow ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED
  const isSidebarHoverExpanded = isCollapsed && hoverExpanded

  const breadcrumbs = getBreadcrumbs(location.pathname)
  const secondBarItems = useMemo(
    () =>
      filterSecondBarByRole(
        getSecondBarItems(location.pathname),
        location.pathname,
        user?.papel
      ),
    [location.pathname, user?.papel]
  )
  const hasSecondBar = secondBarItems.length > 0
  const currentSearch = location.search
  const activeSecondBarLabel = getActiveSecondBarLabel(location.pathname, currentSearch)
  const contextBarItems = getContextBarItems(location.pathname, user?.papel)
  const hasContextBar = contextBarItems.length > 0

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Escape
      if (e.key === 'Escape') {
        setUserMenuOpen(false)
        setNotificationsOpen(false)
        setHelpOpen(false)
        setAcercaOpen(false)
        setCommandPaletteOpen(false)
      }

      // Cmd/Ctrl + K para Command Palette (Search Global)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen((prev) => !prev)
      }

      // Atalho Global de Busca com '/' (sem estar focado em input/textarea/select)
      const target = document.activeElement as HTMLElement | null
      const isInField = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.tagName === 'SELECT' || target?.getAttribute('contenteditable') === 'true'
      if (e.key === '/' && !isInField) {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className="min-h-screen flex bg-studio-bg-alt selection:bg-studio-brand/20">
      {/* Skip link: acessibilidade — foco visível ao navegar por teclado */}
      <a
        href="#main-content"
        className="skip-link"
      >
        Saltar para o conteúdo
      </a>
      {/* Sidebar: retrai para ícones; no hover expande com transition e shadow (estilo Studio) */}
      <aside
        className={`sidebar-transition ${sidebarWidth} flex-shrink-0 bg-studio-sidebar-bg flex flex-col border-r border-studio-border overflow-hidden transition-[width,box-shadow] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isSidebarHoverExpanded ? 'z-20 shadow-glass' : 'z-10'}`}
        onMouseEnter={() => isCollapsed && setHoverExpanded(true)}
        onMouseLeave={() => setHoverExpanded(false)}
        aria-label="Menu principal"
      >
        <div className="flex items-center justify-between border-b border-studio-border min-h-[3.5rem]">
          <Link to="/" className="flex items-center gap-2 py-3 pl-3 pr-2 min-w-0 rounded-md hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 focus-visible:ring-offset-studio-sidebar-bg">
            {!logoError ? (
              <img
                src={LOGO_URL}
                alt="Gestão Escolar"
                className="flex-shrink-0 w-8 h-8 rounded-md object-contain"
                decoding="async"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="flex-shrink-0 w-8 h-8 rounded-md bg-studio-brand/20 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-studio-brand" />
              </div>
            )}
            {!isSidebarNarrow && (
              <h1 className="text-studio-sidebar-text font-semibold text-sm tracking-tight truncate">
                Gestão Escolar
              </h1>
            )}
          </Link>
          {!isSidebarNarrow && (
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              className="p-2 rounded-md text-studio-sidebar-muted hover:bg-studio-sidebar-hover hover:text-studio-sidebar-text transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 focus-visible:ring-offset-studio-sidebar-bg"
              title="Recolher menu"
              aria-label="Recolher menu"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        <nav className="flex-1 p-2 overflow-y-auto" aria-label="Menu principal">
          {getSidebarGroupsForRole(user?.papel).map((group) => (
            <div key={group.id} className="space-y-0.5">
              {!isSidebarNarrow && (
                <div className="px-3 pt-3 pb-1.5">
                  <span className="text-xs font-medium uppercase tracking-wider text-studio-sidebar-text-muted">
                    {group.title}
                  </span>
                </div>
              )}
              {group.items.map(({ to, label }) => {
                const Icon = pathToIcon[to] ?? Home
                const isActive =
                  to === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(to)
                const onPrefetch = SIDEBAR_PREFETCH[to]
                return (
                  <NavLink
                    key={to}
                    to={to}
                    title={isSidebarNarrow ? label : undefined}
                    onMouseEnter={() => onPrefetch?.(queryClient)}
                    className={`flex items-center gap-2 rounded-md text-sm font-medium transition-colors ${isSidebarNarrow ? 'justify-center px-0 py-2.5' : 'px-3 py-2'
                      } ${isActive
                        ? 'bg-studio-sidebar-active text-studio-brand'
                        : 'text-studio-sidebar-text hover:bg-studio-sidebar-hover hover:text-studio-sidebar-text'
                      } focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 focus-visible:ring-offset-studio-sidebar-bg`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!isSidebarNarrow && <span className="truncate">{label}</span>}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-studio-border space-y-1">
          {isSidebarNarrow ? (
            <div
              className="px-2 py-2 flex justify-center"
              title={user?.papel}
            >
              <span className="text-studio-sidebar-muted text-xs uppercase truncate max-w-full">
                {user?.papel?.slice(0, 1)}
              </span>
            </div>
          ) : (
            <div className="px-3 py-2 text-studio-sidebar-muted text-xs uppercase tracking-wider">
              {user?.papel}
            </div>
          )}
          <button
            type="button"
            onClick={logout}
            title="Terminar sessão"
            aria-label="Terminar sessão"
            className={`flex items-center gap-2 w-full rounded-md text-sm text-studio-sidebar-text hover:bg-studio-sidebar-hover transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 focus-visible:ring-offset-studio-sidebar-bg ${isSidebarNarrow ? 'justify-center px-0 py-2' : 'px-3 py-2'
              }`}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!isSidebarNarrow && <span>Sair</span>}
          </button>
          {isSidebarNarrow && (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              className="flex items-center justify-center w-full py-2 rounded-md text-studio-sidebar-muted hover:bg-studio-sidebar-hover hover:text-studio-sidebar-text transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 focus-visible:ring-offset-studio-sidebar-bg"
              title="Expandir menu"
              aria-label="Expandir menu"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Barra contextual (entre sidebar e main): links do módulo/contexto atual */}
      {hasContextBar && (
        <aside
          className={`${CONTEXT_BAR_WIDTH} flex-shrink-0 bg-studio-muted/30 border-r border-studio-border flex flex-col py-3 px-2 overflow-y-auto transition-[width] duration-300`}
          aria-label="Ações do contexto"
        >
          <nav className="flex flex-col gap-0.5">
            {contextBarItems.map(({ to, label }) => {
              const itemPath = to.split('?')[0]
              const itemQuery = to.includes('?') ? to.slice(to.indexOf('?')) : ''
              const isActive =
                to === '/'
                  ? location.pathname === '/' && !location.search
                  : location.pathname === itemPath && (itemQuery ? location.search === itemQuery : !location.search)
              const ContextIcon = contextBarPathToIcon[itemPath] ?? pathToIcon[itemPath] ?? Home
              return (
                <NavLink
                  key={`${to}-${label}`}
                  to={to}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-studio-sidebar-active text-studio-brand'
                      : 'text-studio-foreground-light hover:bg-studio-muted hover:text-studio-foreground'
                  } focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2`}
                >
                  <ContextIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{label}</span>
                </NavLink>
              )
            })}
          </nav>
        </aside>
      )}

      {/* Área principal */}
      <main id="main-content" className="flex-1 flex flex-col min-w-0" tabIndex={-1}>
        <header className="h-14 flex-shrink-0 bg-studio-bg/80 backdrop-blur-md border-b border-studio-border flex items-center px-4 sm:px-6 gap-3 z-10 sticky top-0">
          {/* Logo + Home */}
          <Link
            to="/"
            className="flex-shrink-0 flex items-center gap-2 rounded-lg py-1.5 pr-2 -ml-1 hover:bg-studio-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 focus-visible:ring-offset-studio-bg"
            title="Ir para início"
          >
            {!logoError ? (
              <img
                src={LOGO_URL}
                alt=""
                className="w-7 h-7 rounded-md object-contain"
                decoding="async"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-7 h-7 rounded bg-studio-brand/20 flex items-center justify-center">
                <Home className="w-4 h-4 text-studio-brand" />
              </div>
            )}
            <span className="hidden md:inline text-sm font-medium text-studio-foreground">Início</span>
          </Link>
          <span className={`flex-shrink-0 w-px h-5 bg-studio-border ${location.pathname === '/' ? 'hidden' : 'hidden sm:block'}`} aria-hidden />
          {/* Breadcrumbs: ocultos na home para evitar redundância com logo "Início" */}
          {location.pathname !== '/' && (
            <nav className="flex items-center gap-1.5 text-sm text-studio-foreground-light min-w-0" aria-label="Navegação">
              {breadcrumbs.map((crumb, i) => (
                <span key={crumb.href} className="flex items-center gap-1.5 min-w-0">
                  {i > 0 && (
                    <span className="text-studio-foreground-lighter flex-shrink-0" aria-hidden>/</span>
                  )}
                  {i === breadcrumbs.length - 1 && !activeSecondBarLabel ? (
                    <span className="font-medium text-studio-foreground truncate">
                      {crumb.label}
                    </span>
                  ) : i === breadcrumbs.length - 1 && activeSecondBarLabel ? (
                    <span className="truncate">
                      <NavLink to={crumb.href} className="hover:text-studio-foreground transition-colors">
                        {crumb.label}
                      </NavLink>
                      <span className="text-studio-foreground-lighter flex-shrink-0 mx-1" aria-hidden>/</span>
                      <span className="font-medium text-studio-foreground">{activeSecondBarLabel}</span>
                    </span>
                  ) : (
                    <NavLink
                      to={crumb.href}
                      className="truncate hover:text-studio-foreground transition-colors"
                    >
                      {crumb.label}
                    </NavLink>
                  )}
                </span>
              ))}
            </nav>
          )}
          {/* Search Palette (Simulado) */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 items-center">
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              className="flex items-center justify-between w-full h-9 px-3 text-sm text-studio-foreground-lighter bg-studio-muted/50 border border-studio-border hover:border-studio-brand/50 hover:text-studio-foreground transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-studio-brand group"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                <span>Pesquisar alunos, finanças...</span>
              </div>
              <div className="flex flex-shrink-0 items-center gap-1 font-sans">
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium text-studio-foreground-light bg-studio-bg border border-studio-border rounded shadow-sm opacity-80 group-hover:opacity-100 transition-opacity">⌘</kbd>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-medium text-studio-foreground-light bg-studio-bg border border-studio-border rounded shadow-sm opacity-80 group-hover:opacity-100 transition-opacity">K</kbd>
              </div>
            </button>
          </div>

          <div className="flex-1 md:hidden" />

          {/* Zona direita: notificações + ajuda + tema (agrupados) | utilizador (destacado) */}
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-0.5 sm:gap-1" role="group" aria-label="Ações globais">
              {/* Notificações */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setNotificationsOpen((o) => !o); setUserMenuOpen(false) }}
                  className="relative p-2 rounded-md text-studio-foreground-light hover:bg-studio-muted hover:text-studio-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 focus-visible:ring-offset-studio-bg"
                  title="Notificações"
                  aria-label="Notificações"
                  aria-expanded={notificationsOpen}
                  aria-haspopup="true"
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-2 right-2 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 border border-studio-bg"></span>
                  </span>
                </button>
                {notificationsOpen && (
                  <>
                    <div className="fixed inset-0 z-10" aria-hidden onClick={() => setNotificationsOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 py-2 w-72 rounded-lg border border-studio-border bg-studio-bg shadow-lg z-20">
                      <div className="px-3 py-2 text-xs font-medium text-studio-foreground-lighter border-b border-studio-border">
                        Notificações
                      </div>
                      <div className="px-3 py-6 flex flex-col items-center gap-2 text-sm text-studio-foreground-light">
                        <Bell className="w-8 h-8 text-studio-foreground-lighter/60" strokeWidth={1.25} />
                        <span>Sem notificações novas.</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
              {/* Ajuda */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setHelpOpen((o) => !o); setUserMenuOpen(false); setNotificationsOpen(false) }}
                  className="p-2 rounded-md text-studio-foreground-light hover:bg-studio-muted hover:text-studio-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 focus-visible:ring-offset-studio-bg"
                  title="Ajuda"
                  aria-label="Ajuda"
                  aria-expanded={helpOpen}
                  aria-haspopup="true"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
                {helpOpen && (
                  <>
                    <div className="fixed inset-0 z-10" aria-hidden onClick={() => setHelpOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 py-1 w-48 rounded-lg border border-studio-border bg-studio-bg shadow-lg z-20">
                      <div className="px-3 py-2 text-xs text-studio-foreground-lighter border-b border-studio-border">
                        Ajuda
                      </div>
                  <a
                    href="https://github.com/ValentinoCanguele/capinala_edu/blob/main/docs/FRONTEND-NAVEGACAO-PERMISSOES.md"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setHelpOpen(false)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-studio-foreground hover:bg-studio-muted transition-colors"
                  >
                    Documentação
                  </a>
                      <button
                        type="button"
                        onClick={() => { setHelpOpen(false); setAcercaOpen(true) }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-studio-foreground hover:bg-studio-muted transition-colors"
                      >
                        Acerca
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* Tema */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-studio-foreground-light hover:bg-studio-muted hover:text-studio-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 focus-visible:ring-offset-studio-bg"
              title={theme === 'dark' ? 'Mudar para claro' : 'Mudar para escuro'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {theme === 'dark' ? 'Claro' : 'Escuro'}
              </span>
            </button>
          </div>
          {/* Menu utilizador (ligeiramente destacado) */}
          <div className="relative pl-1 sm:pl-2 border-l border-studio-border">
            <button
              type="button"
              onClick={() => { setUserMenuOpen((o) => !o); setNotificationsOpen(false); setHelpOpen(false) }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium text-studio-foreground bg-studio-muted/60 hover:bg-studio-muted border border-studio-border/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 focus-visible:ring-offset-studio-bg"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <span className="font-medium">{user?.papel}</span>
              <ChevronDown className={`w-4 h-4 text-studio-foreground-lighter transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 py-1 w-56 rounded-xl border border-studio-border bg-studio-bg shadow-glass z-20 overflow-hidden">
                  <div className="px-3 py-2 text-xs text-studio-foreground-lighter border-b border-studio-border">
                    Sessão
                  </div>
                  <div className="px-3 py-2 text-sm text-studio-foreground">
                    {user?.papel}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUserMenuOpen(false)
                      logout()
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-studio-foreground hover:bg-studio-muted transition-colors"
                    aria-label="Terminar sessão"
                  >
                    <LogOut className="w-4 h-4" />
                    Terminar sessão
                  </button>
                </div>
              </>
            )}
          </div>
          {/* Modal Acerca */}
          {acercaOpen && (
            <>
              <div className="fixed inset-0 z-30 bg-black/40" aria-hidden onClick={() => setAcercaOpen(false)} />
              <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-40 w-full max-w-sm rounded-lg border border-studio-border bg-studio-bg p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="acerca-title">
                <h2 id="acerca-title" className="text-lg font-semibold text-studio-foreground mb-2">Gestão Escolar</h2>
                <p className="text-sm text-studio-foreground-light mb-4">Sistema de gestão escolar. Módulo Escola — base alinhada ao Supabase Studio.</p>
                <p className="text-xs text-studio-foreground-lighter mb-4">Versão 1.0</p>
                <button
                  ref={acercaCloseRef}
                  type="button"
                  onClick={() => setAcercaOpen(false)}
                  className="w-full px-4 py-2 rounded-md text-sm font-medium bg-studio-brand text-white hover:bg-studio-brand-hover transition-colors"
                >
                  Fechar
                </button>
              </div>
            </>
          )}
          {/* Command Palette (Global Search) */}
          {commandPaletteOpen && (
            <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] sm:pt-[15vh]">
              <div
                className="fixed inset-0 bg-studio-bg/80 backdrop-blur-sm transition-opacity animate-fade-in"
                aria-hidden="true"
                onClick={() => setCommandPaletteOpen(false)}
              />
              <div
                className="relative w-full max-w-xl bg-studio-bg rounded-xl shadow-2xl ring-1 ring-studio-border overflow-hidden animate-slide-up"
                role="dialog"
                aria-modal="true"
              >
                <div className="flex items-center border-b border-studio-border px-4 py-3">
                  <Search className="w-5 h-5 text-studio-foreground-lighter mr-3" />
                  <input
                    type="text"
                    className="flex-1 bg-transparent border-0 focus:ring-0 text-studio-foreground placeholder:text-studio-foreground-lighter sm:text-lg focus:outline-none"
                    placeholder="Pesquisar página, aluno, ou ação..."
                    autoFocus
                  />
                  <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-medium text-studio-foreground-lighter bg-studio-muted border border-studio-border rounded-md">ESC</kbd>
                </div>
                <div className="max-h-72 overflow-y-auto p-2">
                  <div className="px-3 py-2 text-xs font-semibold text-studio-foreground-lighter uppercase tracking-wider">
                    Ações Rápidas
                  </div>
                  <Link
                    to="/alunos"
                    onClick={() => setCommandPaletteOpen(false)}
                    className="flex items-center w-full px-3 py-2.5 text-sm text-studio-foreground hover:bg-studio-muted/50 hover:text-studio-brand rounded-lg transition-colors group"
                  >
                    <Users className="w-4 h-4 mr-3 text-studio-foreground-lighter group-hover:text-studio-brand" />
                    Listar Turmas e Alunos
                  </Link>
                  <Link
                    to="/financas"
                    onClick={() => setCommandPaletteOpen(false)}
                    className="flex items-center w-full px-3 py-2.5 text-sm text-studio-foreground hover:bg-studio-muted/50 hover:text-studio-brand rounded-lg transition-colors group"
                  >
                    <DollarSign className="w-4 h-4 mr-3 text-studio-foreground-lighter group-hover:text-studio-brand" />
                    Consultar Finanças
                  </Link>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* Second Bar: tabs contextuais da rota ativa; padding alinhado ao header (px-4 sm:px-6) */}
        {hasSecondBar && (
          <div
            className="flex-shrink-0 min-h-[2.75rem] border-b border-studio-border px-4 sm:px-6 flex items-stretch bg-studio-muted/50"
            role="navigation"
            aria-label="Sub-navegação da secção"
          >
            <nav className="second-bar-nav flex items-center gap-0.5 -mb-px overflow-x-auto overflow-y-hidden min-w-0">
              {secondBarItems.map((item) => {
                const isActive = isSecondBarItemActive(
                  item,
                  location.pathname,
                  currentSearch
                )
                return (
                  <NavLink
                    key={`${item.to}-${item.label}`}
                    to={item.to}
                    aria-current={isActive ? 'page' : undefined}
                    className={`px-3 py-2.5 text-sm font-medium border-b-2 transition-[color,border-color] duration-150 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 focus-visible:ring-offset-studio-muted rounded-t-md ${isActive
                      ? 'border-studio-brand text-studio-brand'
                      : 'border-transparent text-studio-foreground-light hover:text-studio-foreground hover:border-studio-border'
                      }`}
                  >
                    {item.label}
                  </NavLink>
                )
              })}
            </nav>
          </div>
        )}

        <div className="flex-1 min-h-0 p-4 sm:p-6 overflow-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
