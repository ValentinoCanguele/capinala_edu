import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    hint?: ReactNode
    leftIcon?: ReactNode
    rightIcon?: ReactNode
}

/**
 * Super Input B2B
 * Elimina os <input> genéricos não estruturados de toda a App.
 * Suporta ícones Laterais (ex: Search na esquerda), descrições Hint e Mensagens de Erro Semânticas.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, hint, leftIcon, rightIcon, className = '', id, ...props }, ref) => {
        const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

        return (
            <div className={`w-full ${className}`}>
                {label && (
                    <label htmlFor={inputId} className="block text-sm font-medium text-studio-foreground mb-1">
                        {label}
                    </label>
                )}

                <div className="relative flex items-center">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-studio-foreground-lighter">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        {...props}
                        id={inputId}
                        ref={ref}
                        className={`
               w-full bg-studio-bg border rounded-lg px-3 py-2 text-sm text-studio-foreground 
               transition-colors duration-200 outline-none
               focus:ring-2 focus:ring-studio-brand focus:border-studio-brand focus:bg-studio-bg focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 focus-visible:ring-offset-studio-bg
               disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-studio-muted
               ${leftIcon ? 'pl-9' : ''}
               ${rightIcon ? 'pr-9' : ''}
               ${error
                                ? 'border-red-500 hover:border-red-600 focus:ring-red-500 focus:border-red-500'
                                : 'border-studio-border hover:border-studio-foreground-lighter/50 focus:border-studio-brand'
                            }
            `}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                    />

                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-studio-foreground-lighter">
                            {rightIcon}
                        </div>
                    )}
                </div>

                {error && (
                    <p id={`${inputId}-error`} className="mt-1.5 text-xs text-red-500 flex items-center gap-1 animate-fade-in">
                        <span aria-hidden="true">■</span> {error}
                    </p>
                )}
                {!error && hint && (
                    <p id={`${inputId}-hint`} className="mt-1.5 text-xs text-studio-foreground-lighter block">
                        {hint}
                    </p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'
