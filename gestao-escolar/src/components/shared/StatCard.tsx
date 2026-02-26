import { type ReactNode } from 'react'

interface StatCardProps {
    title: string
    value: string | number
    subtitle?: ReactNode
    icon?: ReactNode
    trend?: {
        value: string | number
        label?: string
        direction: 'up' | 'down' | 'neutral'
    }
    loading?: boolean
    className?: string
    onClick?: () => void
}

/**
 * Metric Card Premium B2B
 * Substitui divs colados no Dashboard por cartões interativos que suportam
 * métricas de tendência, Loading State ('shimmer'), e efeitos Hover p/ Links.
 */
export function StatCard({ title, value, subtitle, icon, trend, loading = false, className = '', onClick }: StatCardProps) {
    const isInteractive = !!onClick

    return (
        <div
            onClick={isInteractive ? onClick : undefined}
            className={`relative p-6 overflow-hidden bg-studio-bg rounded-xl border border-studio-border/80 shadow-soft group 
        ${isInteractive ? 'cursor-pointer hover:border-studio-brand/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300' : ''} 
        ${className}`}
            role={isInteractive ? 'button' : 'article'}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 overflow-hidden pr-4">
                    <h3 className="text-sm font-medium text-studio-foreground-light truncate mb-1">
                        {title}
                    </h3>
                    {loading ? (
                        <div className="h-8 w-24 rounded-md skeleton-bg mt-1 mb-2" />
                    ) : (
                        <div className="text-2xl font-semibold text-studio-foreground mb-1 leading-tight tracking-tight tabular-nums">
                            {value}
                        </div>
                    )}

                    {!loading && (subtitle || trend) && (
                        <div className="flex items-center gap-2 mt-2">
                            {trend && (
                                <span
                                    className={`inline-flex items-center text-xs font-medium px-1.5 py-0.5 rounded ${trend.direction === 'up'
                                            ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400'
                                            : trend.direction === 'down'
                                                ? 'text-red-700 bg-red-50 dark:bg-red-500/10 dark:text-red-400'
                                                : 'text-studio-foreground-lighter bg-studio-muted'
                                        }`}
                                >
                                    {trend.direction === 'up' ? '↗' : trend.direction === 'down' ? '↘' : '→'} {trend.value}
                                </span>
                            )}
                            {subtitle && <p className="text-xs text-studio-foreground-lighter truncate">{subtitle}</p>}
                        </div>
                    )}
                </div>

                {icon && (
                    <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-xl bg-studio-muted/50 text-studio-foreground-light transition-transform duration-300 ${isInteractive ? 'group-hover:scale-110 group-hover:bg-studio-brand/10 group-hover:text-studio-brand' : ''}`}>
                        {icon}
                    </div>
                )}
            </div>

            {isInteractive && (
                <div className="absolute inset-x-0 bottom-0 h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left bg-gradient-to-r from-studio-brand to-cyan-500" />
            )}
        </div>
    )
}
