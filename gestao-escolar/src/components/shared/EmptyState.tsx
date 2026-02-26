import { type ReactNode } from 'react'
import { Inbox } from 'lucide-react'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  /** Botão gerado por actionLabel + onAction quando ambos definidos */
  actionLabel?: string
  onAction?: () => void
  /** Ação custom (elemento React, ex.: <Button>); usado quando actionLabel/onAction não chegam */
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
  actionLabel,
  onAction,
  action,
  className = '',
}: EmptyStateProps) {
  const actionNode =
    action ?? (actionLabel && onAction ? (
      <Button onClick={onAction} variant="secondary" size="sm" className="group-hover:variant-primary">
        {actionLabel}
      </Button>
    ) : null)

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center border-2 border-dashed border-studio-border/60 hover:border-studio-brand/40 rounded-3xl bg-studio-muted/5 transition-all duration-500 group animate-fade-in ${className}`}
      role="status"
      aria-label={title}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-studio-muted text-studio-foreground-lighter mb-4 group-hover:scale-110 group-hover:bg-studio-brand/10 group-hover:text-studio-brand transition-all duration-500 shadow-sm">
        {icon ?? <Inbox className="h-8 w-8" strokeWidth={1.5} />}
      </div>
      <h3 className="text-base font-semibold text-studio-foreground">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-studio-foreground-light max-w-sm mx-auto">
          {description}
        </p>
      )}
      {actionNode && <div className="mt-8">{actionNode}</div>}
    </div>
  )
}
