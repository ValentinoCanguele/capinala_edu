import { useState, useRef, useEffect } from 'react'

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right'

interface TooltipProps {
    content: React.ReactNode
    children: React.ReactNode
    position?: TooltipPosition
    delay?: number
    className?: string
}

const positionStyles: Record<TooltipPosition, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

const arrowStyles: Record<TooltipPosition, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-studio-foreground border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-studio-foreground border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-studio-foreground border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-studio-foreground border-t-transparent border-b-transparent border-l-transparent',
}

/**
 * Universal Tooltip (B2B Precision)
 * Substitui tooltips do css (`.tooltip-trigger`) em componentes avançados com delay configurável.
 */
export function Tooltip({ content, children, position = 'top', delay = 300, className = '' }: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const handleMouseEnter = () => {
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true)
        }, delay)
    }

    const handleMouseLeave = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }
        setIsVisible(false)
    }

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
        }
    }, [])

    return (
        <div
            className={`relative inline-flex ${className}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleMouseEnter}
            onBlur={handleMouseLeave}
            ref={containerRef}
        >
            {children}

            {isVisible && (
                <div
                    className={`absolute z-[100] px-2.5 py-1.5 text-xs font-medium text-studio-bg bg-studio-foreground rounded shadow-lg whitespace-nowrap animate-fade-in pointer-events-none ${positionStyles[position]}`}
                    role="tooltip"
                >
                    {content}
                    <div className={`absolute w-0 h-0 border-[5px] ${arrowStyles[position]}`} aria-hidden="true" />
                </div>
            )}
        </div>
    )
}
