import type { LucideIcon } from 'lucide-react'
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react'

export type AlertVariant = 'info' | 'success' | 'warning' | 'error'

interface AlertProps {
    variant?: AlertVariant
    title?: string
    children: React.ReactNode
    className?: string
    icon?: boolean
}

const variantStyles: Record<AlertVariant, { bg: string, text: string, border: string, icon: string, IconElement: LucideIcon }> = {
    info: { bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-800 dark:text-blue-200', border: 'border-blue-200 dark:border-blue-500/20', icon: 'text-blue-500 dark:text-blue-400', IconElement: Info },
    success: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-800 dark:text-emerald-200', border: 'border-emerald-200 dark:border-emerald-500/20', icon: 'text-emerald-500 dark:text-emerald-400', IconElement: CheckCircle2 },
    warning: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-800 dark:text-amber-200', border: 'border-amber-200 dark:border-amber-500/20', icon: 'text-amber-500 dark:text-amber-400', IconElement: AlertTriangle },
    error: { bg: 'bg-red-50 dark:bg-red-500/10', text: 'text-red-800 dark:text-red-200', border: 'border-red-200 dark:border-red-500/20', icon: 'text-red-500 dark:text-red-400', IconElement: XCircle },
}

/**
 * Alertas Semânticos B2B
 * Renderizam-se fluidamente através da aplicação. Reduzem-se a ícones
 * precisos caso necessário.
 */
export function Alert({ variant = 'info', title, children, className = '', icon = true }: AlertProps) {
    const styles = variantStyles[variant]
    const Icon = styles.IconElement

    return (
        <div className={`p-4 rounded-xl border animate-fade-in flex gap-3 ${styles.bg} ${styles.border} ${className}`} role="alert">
            {icon && (
                <div className="flex-shrink-0 mt-0.5">
                    <Icon className={`w-5 h-5 ${styles.icon}`} aria-hidden="true" strokeWidth={1.5} />
                </div>
            )}
            <div className="flex-1 text-sm">
                {title && <h3 className={`font-semibold mb-1 ${styles.text}`}>{title}</h3>}
                <div className={`text-opacity-90 ${styles.text}`}>{children}</div>
            </div>
        </div>
    )
}
