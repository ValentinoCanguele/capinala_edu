import { Link } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-studio-bg flex flex-col items-center justify-center px-4 animate-fade-in text-center">
            <div className="text-9xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-studio-brand to-purple-600 mb-4 animate-pulse">
                404
            </div>
            <h1 className="text-2xl font-bold text-studio-foreground tracking-tight mb-2">
                Página não encontrada
            </h1>
            <p className="text-studio-foreground-light max-w-sm mx-auto mb-8">
                Lamentamos, mas a página que tenta aceder não existe, foi movida ou não tem permissões para a visualizar.
            </p>
            <div className="flex items-center gap-4">
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-2 px-4 py-2 border border-studio-border rounded-lg text-studio-foreground-light hover:text-studio-foreground hover:bg-studio-muted transition-colors font-medium"
                >
                    <ArrowLeft className="w-4 h-4" />
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
