import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}

/**
 * Cabeçalho de página consistente: título, subtítulo e ações (ex.: botão "Novo").
 */
export default function PageHeader({
  title,
  subtitle,
  actions,
  className = '',
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 ${className}`}
    >
      <div>
        <h2 className="text-2xl font-semibold text-studio-foreground">{title}</h2>
        {subtitle && (
          <p className="text-studio-foreground-light text-sm mt-0.5">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex-shrink-0">{actions}</div>}
    </div>
  )
}
