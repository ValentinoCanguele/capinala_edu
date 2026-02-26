import { type ReactNode } from 'react'

export interface SectionHeaderProps {
    title: string
    description?: string
    action?: ReactNode
    className?: string
}

/**
 * Super Header B2B para Divisores de Seções
 * Em vez de criar `<h2 className="mb-4">` e `<p>`, o componente gere o layout, a hierarquia tipográfica e Alinhamento horizontal Flex do Botão lado direito.
 */
export function SectionHeader({ title, description, action, className = '' }: SectionHeaderProps) {
    return (
        <div className={`mb-6 sm:flex sm:items-center sm:justify-between sm:gap-4 ${className}`}>
            <div>
                <h2 className="text-lg font-semibold text-studio-foreground">{title}</h2>
                {description && (
                    <p className="mt-1 text-sm text-studio-foreground-light max-w-2xl">{description}</p>
                )}
            </div>
            {action && (
                <div className="mt-4 sm:ml-4 sm:mt-0 flex-shrink-0 flex items-center gap-3">
                    {action}
                </div>
            )}
        </div>
    )
}
