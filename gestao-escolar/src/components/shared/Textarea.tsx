import { forwardRef, type TextareaHTMLAttributes, type ReactNode } from 'react'

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string
    error?: string
    hint?: ReactNode
    maxLength?: number
}

/**
 * Super Textarea B2B
 * Elimina os <textarea> genéricos, adiciona formatação de bordas B2B 
 * e contador de caracteres embutido condicional.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, hint, maxLength, className = '', id, value, ...props }, ref) => {
        const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

        // Safely determine current length if string
        const currentLength = typeof value === 'string' ? value.length : 0

        return (
            <div className={`w-full ${className}`}>
                {label && (
                    <label htmlFor={textareaId} className="flex justify-between items-end mb-1 text-sm font-medium text-studio-foreground">
                        <span>{label}</span>
                        {maxLength && (
                            <span className={`text-xs ${currentLength > maxLength ? 'text-red-500 font-bold' : 'text-studio-foreground-lighter'}`}>
                                {currentLength} / {maxLength}
                            </span>
                        )}
                    </label>
                )}

                <div className="relative">
                    <textarea
                        {...props}
                        id={textareaId}
                        ref={ref}
                        value={value}
                        maxLength={maxLength}
                        className={`
               w-full bg-studio-bg border rounded-lg px-3 py-2 text-sm text-studio-foreground 
               transition-colors duration-200 outline-none resize-y min-h-[100px]
               focus:ring-2 focus:ring-studio-brand focus:border-studio-brand focus:bg-studio-bg
               disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-studio-muted
               ${error
                                ? 'border-red-500 hover:border-red-600 focus:ring-red-500 focus:border-red-500'
                                : 'border-studio-border hover:border-studio-foreground-lighter/50 focus:border-studio-brand'
                            }
            `}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${textareaId}-error` : hint ? `${textareaId}-hint` : undefined}
                    />
                </div>

                {error && (
                    <p id={`${textareaId}-error`} className="mt-1.5 text-xs text-red-500 flex items-center gap-1 animate-fade-in">
                        <span aria-hidden="true">■</span> {error}
                    </p>
                )}
                {!error && hint && (
                    <p id={`${textareaId}-hint`} className="mt-1.5 text-xs text-studio-foreground-lighter block">
                        {hint}
                    </p>
                )}
            </div>
        )
    }
)

Textarea.displayName = 'Textarea'
