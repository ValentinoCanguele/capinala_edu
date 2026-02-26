import { type HTMLAttributes } from 'react'

export type IndicatorStatus = 'online' | 'offline' | 'warning' | 'error' | 'dnd'

interface StatusIndicatorProps extends HTMLAttributes<HTMLSpanElement> {
    status?: IndicatorStatus
    ping?: boolean
    size?: 'sm' | 'md' | 'lg'
}

const statusColors: Record<IndicatorStatus, string> = {
    online: 'bg-emerald-500',
    offline: 'bg-studio-border',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    dnd: 'bg-rose-500 rounded-full border border-white dark:border-studio-bg relative before:content-[""] before:absolute before:border-t-2 before:w-1.5 before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:border-white',
}

const sizeClasses = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
}

/**
 * StatusIndicator
 * Ponto minúsculo colorido para indicar o estado do servidor, aluno, funcionário.
 * Suporta animação "Ping" e Múltiplos Tamanhos.
 */
export function StatusIndicator({ status = 'online', ping = false, size = 'md', className = '', ...props }: StatusIndicatorProps) {
    return (
        <span className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`} {...props}>
            {ping && (
                <span
                    className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-pulse-fast ${statusColors[status].split(' ')[0]}`}
                />
            )}
            <span className={`relative inline-flex rounded-full h-full w-full ${statusColors[status]} transition-colors duration-300`} />
        </span>
    )
}
