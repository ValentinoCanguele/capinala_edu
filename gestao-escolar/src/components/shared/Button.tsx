import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant
    size?: ButtonSize
    loading?: boolean
    icon?: ReactNode
    rightIcon?: ReactNode
    fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-studio-brand text-white border border-transparent shadow shadow-studio-brand/20 hover:bg-studio-brand-light focus-visible:ring-studio-brand',
    secondary: 'bg-studio-muted text-studio-foreground border border-studio-border shadow-soft hover:border-studio-foreground-lighter/50 hover:bg-studio-muted/80 focus-visible:ring-studio-border',
    danger: 'bg-red-600 text-white border border-transparent shadow shadow-red-600/20 hover:bg-red-700 focus-visible:ring-red-500',
    ghost: 'bg-transparent text-studio-foreground-light border border-transparent hover:text-studio-foreground hover:bg-studio-muted/50 focus-visible:ring-studio-border font-medium',
    outline: 'bg-transparent text-studio-foreground border border-studio-border hover:bg-studio-muted focus-visible:ring-studio-brand',
}

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'p-2 inline-flex items-center justify-center shrink-0 w-9 h-9',
}

/**
 * Super Botão B2B
 * Centraliza Loading State (Spinner animado), Desativação por estado e Variações Vercel-like.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ children, variant = 'primary', size = 'md', loading, icon, rightIcon, fullWidth, className = '', disabled, ...props }, ref) => {

        // Efeito *Scale Down* está ativo globalmente via `active:scale-95` ou `button:active` em components.css
        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={`
          inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 rounded-lg outline-none 
          focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-studio-bg
          disabled:opacity-60 disabled:cursor-not-allowed
          ${fullWidth ? 'w-full' : ''}
          ${sizeStyles[size]}
          ${variantStyles[variant]}
          ${className}
        `}
                {...props}
            >
                {loading && (
                    <svg className="animate-spin -ml-1 mr-1 h-4 w-4 shrink-0 opacity-80" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {!loading && icon && <span className="shrink-0">{icon}</span>}
                {children && <span>{children}</span>}
                {!loading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
            </button>
        )
    }
)

Button.displayName = 'Button'
