import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

/**
 * Estado vazio reutilizável para listas e tabelas.
 * Ícone opcional, título, descrição e ação (ex.: botão "Criar").
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
      role="status"
      aria-label={title}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-studio-muted text-studio-foreground-lighter">
        {icon ?? <Inbox className="h-6 w-6" />}
      </div>
      <h3 className="mt-3 text-sm font-medium text-studio-foreground">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-studio-foreground-light max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
