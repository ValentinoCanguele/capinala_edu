/**
 * Layout principal — arquitetura visual e navegação estilo Supabase Studio.
 * - Sidebar: colapsável (só ícones) com expansão no hover (transition + shadow).
 * - Header: breadcrumbs + toggle dark/light + menu utilizador.
 * - Second Bar: tabs contextuais por rota (ex: /alunos → Lista | Adicionar).
 * Variáveis CSS --studio-* em theme/variables.css (dark/light).
 */
import { useState, useCallback, useEffect } from 'react'
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
  History,
  Banknote,
  Sun,
  Moon,
  LogOut,
  PanelLeftClose,
  PanelLeft,
  ChevronDown,
  HelpCircle,
  Bell,
  Settings,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import {
  getSecondBarItems,
  isSecondBarItemActive,
  getActiveSecondBarLabel,
} from '@/layout/secondBarConfig'
import { ErrorBoundary } from '@/components/ErrorBoundary'

const SIDEBAR_COLLAPSED_KEY = 'gestao-escolar-sidebar-collapsed'
const SIDEBAR_WIDTH_EXPANDED = 'w-56'
const SIDEBAR_WIDTH_COLLAPSED = 'w-16'
const LOGO_URL = '/logo.png'

const navItems = [
  { to: '/', label: 'Início', icon: Home },
  { to: '/alunos', label: 'Alunos', icon: Users },
  { to: '/turmas', label: 'Turmas', icon: BookOpen },
  { to: '/notas', label: 'Notas', icon: ClipboardList },
  { to: '/frequencia', label: 'Frequência', icon: CalendarCheck },
  { to: '/boletim', label: 'Boletim', icon: FileText },
  { to: '/horarios', label: 'Horários', icon: Clock },
  { to: '/comunicados', label: 'Comunicados', icon: Megaphone },
  { to: '/disciplinas', label: 'Disciplinas', icon: BookMarked },
  { to: '/anos-letivos', label: 'Anos letivos', icon: Calendar },
  { to: '/salas', label: 'Salas', icon: DoorOpen },
  { to: '/financas', label: 'Finanças', icon: Banknote },
  { to: '/auditoria', label: 'Auditoria', icon: History },
  { to: '/definicoes/modulos', label: 'Definições', icon: Settings },
]

const SEGMENT_LABELS: Record<string, string> = {
  alunos: 'Alunos',
  turmas: 'Turmas',
  notas: 'Notas',
  frequencia: 'Frequência',
  boletim: 'Boletim',
  horarios: 'Horários',
  comunicados: 'Comunicados',
  disciplinas: 'Disciplinas',
  'anos-letivos': 'Anos letivos',
  salas: 'Salas',
  financas: 'Finanças',
  categorias: 'Categorias',
  lancamentos: 'Lançamentos',
  configuracao: 'Configuração',
  parcelas: 'Parcelas',
  relatorios: 'Relatórios',
  auditoria: 'Auditoria',
  definicoes: 'Definições',
  modulos: 'Módulos',
}

function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split('/').filter(Boolean)
  const crumbs: { label: string; href: string }[] = [{ label: 'Início', href: '/' }]
  let acc = ''
  for (const seg of segments) {
    acc += `/${seg}`
    crumbs.push({ label: SEGMENT_LABELS[seg] ?? seg, href: acc })
  }
  return crumbs
}

export default function Layout() {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  const [isCollapsed, setCollapsedState] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true'
    } catch {
      return false
    }
  })
  const [hoverExpanded, setHoverExpanded] = useState(false)

  const setCollapsed = useCallback((value: boolean) => {
    setCollapsedState(value)
    try {
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(value))
    } catch {
      // ignore
    }
  }, [])

  const isSidebarNarrow = isCollapsed && !hoverExpanded
  const sidebarWidth = isSidebarNarrow ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED
  const isSidebarHoverExpanded = isCollapsed && hoverExpanded

  const breadcrumbs = getBreadcrumbs(location.pathname)
  const secondBarItems = getSecondBarItems(location.pathname)
  const hasSecondBar = secondBarItems.length > 0
  const currentSearch = location.search
  const activeSecondBarLabel = getActiveSecondBarLabel(location.pathname, currentSearch)

  useEffect(() => {
    if (!userMenuOpen && !notificationsOpen && !helpOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false)
        setNotificationsOpen(false)
        setHelpOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [userMenuOpen, notificationsOpen, helpOpen])

  return (
    <div className="min-h-screen flex bg-studio-bg-alt">
      {/* Sidebar: retrai para ícones; no hover expande com transition e shadow (estilo Studio) */}
      <aside
        className={`${sidebarWidth} flex-shrink-0 bg-studio-sidebar-bg flex flex-col border-r border-white/10 overflow-hidden transition-[width,box-shadow] duration-200 ease-out ${isSidebarHoverExpanded ? 'z-20 shadow-xl' : 'z-10'}`}
        onMouseEnter={() => isCollapsed && setHoverExpanded(true)}
        onMouseLeave={() => setHoverExpanded(false)}
        aria-label="Menu principal"
      >
        <div className="flex items-center justify-between border-b border-white/10 min-h-[3.25rem]">
          <Link to="/" className="flex items-center gap-2 py-3 pl-3 pr-2 min-w-0 rounded-md hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 focus-visible:ring-offset-studio-sidebar-bg">
            {!logoError ? (
              <img
                src={LOGO_URL}
                alt="Gestão Escolar"
                className="flex-shrink-0 w-8 h-8 rounded-md object-contain"
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

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => {
            const isActive =
              to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(to)
            return (
              <NavLink
                key={to}
                to={to}
                title={isSidebarNarrow ? label : undefined}
                className={`flex items-center gap-2 rounded-md text-sm font-medium transition-colors ${isSidebarNarrow ? 'justify-center px-0 py-2.5' : 'px-3 py-2'
                  } ${isActive
                    ? 'bg-studio-sidebar-active text-studio-brand'
                    : 'text-studio-sidebar-text hover:bg-studio-sidebar-hover hover:text-studio-sidebar-text'
                  }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!isSidebarNarrow && <span className="truncate">{label}</span>}
              </NavLink>
            )
          })}
        </nav>

        <div className="p-2 border-t border-white/10 space-y-0.5">
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
            className={`flex items-center gap-2 w-full rounded-md text-sm text-studio-sidebar-text hover:bg-studio-sidebar-hover transition-colors ${isSidebarNarrow ? 'justify-center px-0 py-2' : 'px-3 py-2'
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

      {/* Área principal */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-14 flex-shrink-0 bg-studio-bg border-b border-studio-border flex items-center px-4 sm:px-6 gap-3">
          {/* Logo + Home */}
          <Link
            to="/"
            className="flex-shrink-0 flex items-center gap-2 rounded-md py-1.5 pr-2 -ml-1 hover:bg-studio-muted/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 focus-visible:ring-offset-studio-bg"
            title="Ir para início"
            aria-label="Ir para início"
          >
            {!logoError ? (
              <img src={LOGO_URL} alt="" className="w-7 h-7 rounded object-contain" onError={() => setLogoError(true)} />
            ) : (
              <div className="w-7 h-7 rounded bg-studio-brand/20 flex items-center justify-center">
                <Home className="w-4 h-4 text-studio-brand" />
              </div>
            )}
          </Link>
          <span className="flex-shrink-0 w-px h-5 bg-studio-border" aria-hidden />
          {/* Breadcrumbs */}
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
          <div className="flex-1 min-w-2" />
          {/* Notificações */}
          <div className="relative">
            <button
              type="button"
              onClick={() => { setNotificationsOpen((o) => !o); setUserMenuOpen(false) }}
              className="p-2 rounded-md text-studio-foreground-light hover:bg-studio-muted hover:text-studio-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 focus-visible:ring-offset-studio-bg"
              title="Notificações"
              aria-label="Notificações"
              aria-expanded={notificationsOpen}
            >
              <Bell className="w-4 h-4" />
            </button>
            {notificationsOpen && (
              <>
                <div className="fixed inset-0 z-10" aria-hidden onClick={() => setNotificationsOpen(false)} />
                <div className="absolute right-0 top-full mt-1 py-2 w-72 rounded-md border border-studio-border bg-studio-bg shadow-lg z-20">
                  <div className="px-3 py-2 text-xs font-medium text-studio-foreground-lighter border-b border-studio-border">
                    Notificações
                  </div>
                  <div className="px-3 py-4 text-sm text-studio-foreground-light text-center">
                    Sem notificações novas.
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
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            {helpOpen && (
              <>
                <div className="fixed inset-0 z-10" aria-hidden onClick={() => setHelpOpen(false)} />
                <div className="absolute right-0 top-full mt-1 py-1 w-48 rounded-md border border-studio-border bg-studio-bg shadow-lg z-20">
                  <div className="px-3 py-2 text-xs text-studio-foreground-lighter border-b border-studio-border">
                    Ajuda
                  </div>
                  <button
                    type="button"
                    onClick={() => setHelpOpen(false)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-studio-foreground hover:bg-studio-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-inset rounded"
                    aria-label="Fechar e ir para documentação (em breve)"
                  >
                    Documentação
                  </button>
                  <button
                    type="button"
                    onClick={() => setHelpOpen(false)}
                    className="flex items-center gap-2 w-full px-3 py-2 text-left text-sm text-studio-foreground hover:bg-studio-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-inset rounded"
                    aria-label="Fechar e ver acerca (em breve)"
                  >
                    Acerca
                  </button>
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-studio-foreground-light hover:bg-studio-muted hover:text-studio-foreground transition-colors"
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
          <div className="relative">
            <button
              type="button"
              onClick={() => { setUserMenuOpen((o) => !o); setNotificationsOpen(false); setHelpOpen(false) }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm text-studio-foreground-light hover:bg-studio-muted hover:text-studio-foreground transition-colors"
              aria-expanded={userMenuOpen}
              aria-haspopup="true"
            >
              <span className="font-medium">{user?.papel}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 py-1 w-48 rounded-md border border-studio-border bg-studio-bg shadow-lg z-20">
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
                  >
                    <LogOut className="w-4 h-4" />
                    Terminar sessão
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Second Bar: tabs contextuais da rota ativa (ex: /alunos → Lista | Adicionar) */}
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
                    className={`px-3 py-2.5 text-sm font-medium border-b-2 transition-[color,border-color] duration-150 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 focus-visible:ring-offset-studio-muted rounded-t-md ${
                      isActive
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

        <div className="flex-1 p-4 sm:p-6 overflow-auto">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  )
}
