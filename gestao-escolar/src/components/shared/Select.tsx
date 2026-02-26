import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react'

export interface SelectOption {
    label: string
    value: string
    disabled?: boolean
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string
    error?: string
    hint?: ReactNode
    options: SelectOption[]
    leftIcon?: ReactNode
}

/**
 * Super Select Nativo B2B
 * Elimina os <select> genéricos em formulários simples.
 * Estilo B2B puro, ícone custom dropdown, e suporte a Erros.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, error, hint, options, leftIcon, className = '', id, ...props }, ref) => {
        const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

        return (
            <div className={`w-full ${className}`}>
                {label && (
                    <label htmlFor={selectId} className="block text-sm font-medium text-studio-foreground mb-1">
                        {label}
                    </label>
                )}

                <div className="relative flex items-center">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-studio-foreground-lighter">
                            {leftIcon}
                        </div>
                    )}

                    <select
                        {...props}
                        id={selectId}
                        ref={ref}
                        className={`
               w-full bg-studio-bg border rounded-lg px-3 py-2 text-sm text-studio-foreground 
               transition-colors duration-200 outline-none
               focus:ring-2 focus:ring-studio-brand focus:border-studio-brand focus:bg-studio-bg
               disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-studio-muted
               appearance-none
               ${leftIcon ? 'pl-9' : ''}
               ${error
                                ? 'border-red-500 hover:border-red-600 focus:ring-red-500 focus:border-red-500'
                                : 'border-studio-border hover:border-studio-foreground-lighter/50 focus:border-studio-brand'
                            }
            `}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${selectId}-error` : hint ? `${selectId}-hint` : undefined}
                    >
                        {options.map(opt => (
                            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                                {opt.label}
                            </option>
                        ))}
                    </select>

                    {/* Custom B2B Arrow */}
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-studio-foreground-lighter">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {error && (
                    <p id={`${selectId}-error`} className="mt-1.5 text-xs text-red-500 flex items-center gap-1 animate-fade-in">
                        <span aria-hidden="true">■</span> {error}
                    </p>
                )}
                {!error && hint && (
                    <p id={`${selectId}-hint`} className="mt-1.5 text-xs text-studio-foreground-lighter block">
                        {hint}
                    </p>
                )}
            </div>
        )
    }
)

Select.displayName = 'Select'
