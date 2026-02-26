/**
 * Componente ProgressBar B2B Premium
 * Permite tamanhos infinitos, cores baseadas em alertas/semântica,
 * e suporte a animação `stripe` para indicar "Processando..."
 */

export interface ProgressBarProps {
    value: number // 0 to 100
    size?: 'sm' | 'md' | 'lg'
    variant?: 'brand' | 'success' | 'warning' | 'error' | 'neutral'
    showLabel?: boolean
    label?: string
    animated?: boolean
    className?: string
}

const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
}

const variantStyles = {
    brand: 'bg-studio-brand',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    neutral: 'bg-studio-foreground-lighter',
}

export function ProgressBar({
    value,
    size = 'md',
    variant = 'brand',
    showLabel = false,
    label,
    animated = false,
    className = '',
}: ProgressBarProps) {
    const safeValue = Math.min(Math.max(value, 0), 100)

    return (
        <div className={`w-full ${className}`}>
            {(showLabel || label) && (
                <div className="flex justify-between items-end mb-1 text-xs">
                    {label && <span className="font-medium text-studio-foreground-light">{label}</span>}
                    {showLabel && <span className="text-studio-foreground-lighter tabular-nums">{safeValue}%</span>}
                </div>
            )}
            <div className={`overflow-hidden rounded-full bg-studio-muted border border-studio-border/50 ${sizeStyles[size]}`}>
                <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${variantStyles[variant]} ${animated ? 'animate-pulse bg-[length:1rem_1rem] bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[min-width:200%]' : ''}`}
                    style={{ width: `${safeValue}%` }}
                    role="progressbar"
                    aria-valuenow={safeValue}
                    aria-valuemin={0}
                    aria-valuemax={100}
                />
            </div>
        </div>
    )
}
