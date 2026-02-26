import { Link } from 'react-router-dom'
import { Home, ShieldAlert } from 'lucide-react'

/**
 * Página 403 – Acesso negado (item 77 do catálogo de refinamento).
 */
export default function Forbidden() {
  return (
    <div
      className="min-h-screen bg-studio-bg flex flex-col items-center justify-center px-4 animate-fade-in text-center"
      role="alert"
      aria-live="polite"
    >
      <div className="text-8xl font-bold text-studio-foreground-lighter mb-4 flex items-center justify-center gap-2">
        <ShieldAlert className="w-16 h-16 text-amber-500" aria-hidden />
        403
      </div>
      <h1 className="text-2xl font-bold text-studio-foreground tracking-tight mb-2">
        Acesso negado
      </h1>
      <p className="text-studio-foreground-light max-w-sm mx-auto mb-8">
        Não tem permissão para aceder a este recurso. Contacte o administrador se achar que isto é um erro.
      </p>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2 border border-studio-border rounded-lg text-studio-foreground-light hover:text-studio-foreground hover:bg-studio-muted transition-colors font-medium"
        >
          Voltar atrás
        </button>
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-studio-brand text-white rounded-lg hover:bg-studio-brand-hover transition-colors shadow-soft font-medium"
        >
          <Home className="w-4 h-4" />
          Painel Inicial
        </Link>
      </div>
    </div>
  )
}
