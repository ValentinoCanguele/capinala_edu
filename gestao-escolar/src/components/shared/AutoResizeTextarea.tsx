import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    minHeight?: string
    /** Quando definido, mostra contador regressivo de caracteres (item 95). */
    showCharCount?: boolean
}

export const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, Props>(
    ({ className = '', minHeight = '80px', value, onChange, maxLength, showCharCount, ...props }, ref) => {
        const internalRef = useRef<HTMLTextAreaElement>(null)
        const length = typeof value === 'string' ? value.length : 0
        const showCounter = (showCharCount ?? maxLength != null) && maxLength != null

        useImperativeHandle(ref, () => internalRef.current as HTMLTextAreaElement)

        useEffect(() => {
            const textarea = internalRef.current
            if (textarea) {
                textarea.style.height = minHeight
                const scrollHeight = textarea.scrollHeight
                textarea.style.height = scrollHeight + 'px'
            }
        }, [value, minHeight])

        return (
            <div className="w-full">
                <textarea
                    ref={internalRef}
                    value={value}
                    onChange={onChange}
                    maxLength={maxLength}
                    className={`input resize-none overflow-hidden transition-[height] duration-200 ${className}`}
                    style={{ minHeight }}
                    aria-describedby={showCounter && props.id ? `${props.id}-char-count` : undefined}
                    {...props}
                />
                {showCounter && (
                    <p
                        id={props.id ? `${props.id}-char-count` : undefined}
                        className="mt-1 text-right text-xs text-studio-foreground-lighter tabular-nums"
                        aria-live="polite"
                    >
                        {length} / {maxLength}
                    </p>
                )}
            </div>
        )
    }
)

AutoResizeTextarea.displayName = 'AutoResizeTextarea'
