import { type ReactNode } from 'react'

export interface CardProps {
    children: ReactNode
    className?: string
    noPadding?: boolean
}

export function Card({ children, className = '', noPadding = false }: CardProps) {
    return (
        <div className={`bg-studio-bg border border-studio-border rounded-xl shadow-soft overflow-hidden ${className}`}>
            <div className={`${noPadding ? '' : 'p-5 sm:p-6'}`}>
                {children}
            </div>
        </div>
    )
}

export interface CardHeaderProps {
    title: ReactNode
    description?: ReactNode
    action?: ReactNode
    className?: string
}

export function CardHeader({ title, description, action, className = '' }: CardHeaderProps) {
    return (
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-studio-border/50 px-5 py-4 sm:px-6 bg-studio-muted/10 ${className}`}>
            <div>
                <h3 className="text-base font-semibold text-studio-foreground">{title}</h3>
                {description && (
                    <p className="mt-1 text-sm text-studio-foreground-light">{description}</p>
                )}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    )
}

export interface CardFooterProps {
    children: ReactNode
    className?: string
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
    return (
        <div className={`px-5 py-4 sm:px-6 bg-studio-muted/30 border-t border-studio-border/50 flex items-center justify-end gap-3 ${className}`}>
            {children}
        </div>
    )
}
