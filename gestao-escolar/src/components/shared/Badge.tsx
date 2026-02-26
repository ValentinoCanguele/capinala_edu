import { type ReactNode } from 'react'
import { truncateText } from '@/utils/formatters'

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand'

interface BadgeProps {
    children: ReactNode
    variant?: BadgeVariant
    pulse?: boolean
    className?: string
    truncate?: number
}

const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    danger: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
    info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    brand: 'bg-studio-brand/10 text-studio-brand border-studio-brand/20',
    neutral: 'bg-studio-muted text-studio-foreground-light border-studio-border',
}

const pulseColors: Record<BadgeVariant, string> = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    brand: 'bg-studio-brand',
    neutral: 'bg-studio-foreground-lighter',
}

/**
 * Super Badge B2B
 * Suporta truncamento automático, coloração semântica e micro-animação (Pulse).
 */
export function Badge({ children, variant = 'neutral', pulse = false, className = '', truncate }: BadgeProps) {
    const content = typeof children === 'string' && truncate ? truncateText(children, truncate) : children

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border shadow-sm whitespace-nowrap ${variantStyles[variant]} ${className}`}
            title={typeof children === 'string' && truncate ? children : undefined}
        >
            {pulse && (
                <span className="relative flex h-1.5 w-1.5">
                    <span className={`animate-pulse-fast absolute inline-flex h-full w-full rounded-full opacity-75 ${pulseColors[variant]}`}></span>
                    <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${pulseColors[variant]}`}></span>
                </span>
            )}
            {content}
        </span>
    )
}
