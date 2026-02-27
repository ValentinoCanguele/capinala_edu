import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { LabelWithHelp } from './LabelWithHelp'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    /** Texto ou nó mostrado no tooltip do ícone ? ao lado da label (item 111). */
    help?: ReactNode
    error?: string
    hint?: ReactNode
    leftIcon?: ReactNode
    rightIcon?: ReactNode
    /** Mostra botão X para limpar quando há valor (item 99). Passar onClear para o callback. */
    showClearButton?: boolean
    onClear?: () => void
}

/**
 * Super Input B2B
 * Elimina os <input> genéricos não estruturados de toda a App.
 * Suporta ícones Laterais (ex: Search na esquerda), descrições Hint e Mensagens de Erro Semânticas.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, help, error, hint, leftIcon, rightIcon, showClearButton, onClear, className = '', id, value, required, ...props }, ref) => {
        const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)
        const hasValue = value != null && String(value).length > 0
        const showClear = (showClearButton ?? !!onClear) && hasValue && !props.disabled && onClear

        return (
            <div className={`w-full ${className}`}>
                {label && (
                    <div className="mb-1">
                        {help != null ? (
                            <LabelWithHelp label={label} help={help} required={required} htmlFor={inputId} />
                        ) : (
                            <label htmlFor={inputId} className="block text-sm font-medium text-studio-foreground">
                                {label}
                                {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
                            </label>
                        )}
                    </div>
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
                        value={value}
                        required={required}
                        className={`
               w-full bg-studio-bg border rounded-lg px-3 py-2 text-sm text-studio-foreground 
               transition-colors duration-200 outline-none
               focus:ring-2 focus:ring-studio-brand focus:border-studio-brand focus:bg-studio-bg focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 focus-visible:ring-offset-studio-bg
               disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-studio-muted
               ${leftIcon ? 'pl-9' : ''}
               ${rightIcon || showClear ? 'pr-9' : ''}
               ${error
                                ? 'border-red-500 hover:border-red-600 focus:ring-red-500 focus:border-red-500'
                                : 'border-studio-border hover:border-studio-foreground-lighter/50 focus:border-studio-brand'
                            }
            `}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
                    />

                    {(rightIcon || showClear) && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1 text-studio-foreground-lighter">
                            {showClear && onClear && (
                                <button
                                    type="button"
                                    onClick={onClear}
                                    className="p-0.5 rounded hover:bg-studio-muted hover:text-studio-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-1"
                                    title="Limpar"
                                    aria-label="Limpar campo"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
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
