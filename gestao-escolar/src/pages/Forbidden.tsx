import { Link } from 'react-router-dom'
import { Home, ShieldX, ArrowLeft } from 'lucide-react'

/**
 * Página 403 — Acesso negado (Item 77 — Refinamento Frontend).
 * Mostrada quando o utilizador não tem permissão para o recurso.
 */
export default function Forbidden() {
  return (
    <div
      className="min-h-[60vh] flex flex-col items-center justify-center px-4 animate-fade-in text-center"
      role="alert"
      aria-labelledby="forbidden-title"
    >
      <ShieldX className="w-16 h-16 text-studio-foreground-lighter mb-4" aria-hidden />
      <h1 id="forbidden-title" className="text-2xl font-bold text-studio-foreground tracking-tight mb-2">
        Acesso negado
      </h1>
      <p className="text-studio-foreground-light max-w-sm mx-auto mb-8">
        Não tem permissão para aceder a esta página. Se acredita que isto é um erro, contacte o administrador.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center gap-2 px-4 py-2 border border-studio-border rounded-lg text-studio-foreground-light hover:text-studio-foreground hover:bg-studio-muted transition-colors font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar atrás
        </button>
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-studio-brand text-white rounded-lg hover:bg-studio-brand-hover transition-colors shadow-soft font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
        >
          <Home className="w-4 h-4" />
          Painel Inicial
        </Link>
      </div>
    </div>
  )
}
