import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Captura erros de render nos filhos e mostra fallback em vez de tela branca.
 * O erro é registado na consola para debug.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error, errorInfo.componentStack)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="min-h-[250px] flex flex-col items-center justify-center p-8 bg-studio-bg/50 backdrop-blur-sm rounded-2xl border border-red-200 dark:border-red-900/30 shadow-soft animate-fade-in group">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" strokeWidth={1.5} />
          </div>
          <p className="text-base font-semibold text-studio-foreground mb-1">Algo correu mal inesperadamente.</p>
          <p className="text-sm text-studio-foreground-light mb-6 max-w-md text-center">
            A aplicação detetou um erro de carregamento: <br />
            <span className="font-mono text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 px-1 py-0.5 rounded mt-2 inline-block">
              {this.state.error.message}
            </span>
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="flex items-center gap-2 px-4 py-2 bg-studio-bg text-studio-foreground-light border border-studio-border hover:bg-studio-muted hover:text-studio-foreground transition-all rounded-lg font-medium text-sm focus:outline-none focus:ring-2 focus:ring-studio-brand"
          >
            Tentar novamente
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
