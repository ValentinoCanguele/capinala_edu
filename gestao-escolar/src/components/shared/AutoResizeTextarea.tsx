import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    minHeight?: string
}

export const AutoResizeTextarea = forwardRef<HTMLTextAreaElement, Props>(
    ({ className = '', minHeight = '80px', value, onChange, ...props }, ref) => {
        const internalRef = useRef<HTMLTextAreaElement>(null)

        // Expose para o exterior se for passado ref
        useImperativeHandle(ref, () => internalRef.current as HTMLTextAreaElement)

        useEffect(() => {
            const textarea = internalRef.current
            if (textarea) {
                // Reset height para calcular a nova altura puramente baseada no scrollHeight
                textarea.style.height = minHeight
                const scrollHeight = textarea.scrollHeight
                textarea.style.height = scrollHeight + 'px'
            }
        }, [value, minHeight])

        return (
            <textarea
                ref={internalRef}
                value={value}
                onChange={onChange}
                className={`input resize-none overflow-hidden transition-[height] duration-200 ${className}`}
                style={{ minHeight }}
                {...props}
            />
        )
    }
)

AutoResizeTextarea.displayName = 'AutoResizeTextarea'
