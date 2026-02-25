import { Component, type ErrorInfo, type ReactNode } from 'react'

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
        <div className="min-h-[200px] flex flex-col items-center justify-center p-6 bg-studio-muted/30 rounded-lg border border-studio-border">
          <p className="text-sm font-medium text-studio-foreground mb-1">Algo correu mal nesta página.</p>
          <p className="text-xs text-studio-foreground-light mb-4 max-w-md text-center">
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="btn-secondary text-sm"
          >
            Tentar novamente
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
