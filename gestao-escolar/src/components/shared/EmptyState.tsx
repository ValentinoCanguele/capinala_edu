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
  /**
   * Tom do estado vazio (ajusta cores de borda/fundo/ícone).
   * neutral (default) | info | success | warning | danger
   */
  tone?: 'neutral' | 'info' | 'success' | 'warning' | 'danger'
  /**
   * Tamanho do bloco (padding/altura sugerida).
   * sm | md (default) | lg
   */
  size?: 'sm' | 'md' | 'lg'
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
  tone = 'neutral',
  size = 'md',
}: EmptyStateProps) {
  const toneClasses: Record<NonNullable<EmptyStateProps['tone']>, string> = {
    neutral: 'border-studio-border/60 hover:border-studio-brand/40 bg-studio-muted/5',
    info: 'border-blue-500/30 hover:border-blue-500/60 bg-blue-500/5',
    success: 'border-emerald-500/30 hover:border-emerald-500/60 bg-emerald-500/5',
    warning: 'border-amber-500/40 hover:border-amber-500/60 bg-amber-500/5',
    danger: 'border-red-500/40 hover:border-red-500/70 bg-red-500/5',
  }

  const iconToneClasses: Record<NonNullable<EmptyStateProps['tone']>, string> = {
    neutral:
      'bg-studio-muted text-studio-foreground-lighter group-hover:bg-studio-brand/10 group-hover:text-studio-brand',
    info: 'bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20',
    success: 'bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20',
    danger: 'bg-red-500/10 text-red-500 group-hover:bg-red-500/20',
  }

  const sizeClasses: Record<NonNullable<EmptyStateProps['size']>, string> = {
    sm: 'p-6 sm:p-8',
    md: 'p-8 sm:p-12',
    lg: 'py-16 px-8 sm:px-16',
  }
  const actionNode =
    action ?? (actionLabel && onAction ? (
      <Button onClick={onAction} variant="secondary" size="sm" className="group-hover:variant-primary">
        {actionLabel}
      </Button>
    ) : null)

  return (
    <div
      className={`flex flex-col items-center justify-center text-center border-2 border-dashed rounded-3xl transition-all duration-500 group animate-fade-in ${toneClasses[tone]} ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label={title}
    >
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-2xl mb-4 group-hover:scale-110 transition-all duration-500 shadow-sm ${iconToneClasses[tone]}`}
      >
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
