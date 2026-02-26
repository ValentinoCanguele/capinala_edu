import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

interface AccordionProps {
    title: string
    children: React.ReactNode
    defaultOpen?: boolean
    icon?: React.ReactNode
    badge?: React.ReactNode
    className?: string
}

/**
 * Accordion Elegante B2B
 * Substitui divs pesados colapsáveis com um `max-height` animado perfeitamente.
 */
export function Accordion({ title, children, defaultOpen = false, icon, badge, className = '' }: AccordionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)
    const contentRef = useRef<HTMLDivElement>(null)
    const [height, setHeight] = useState<number | 'auto'>('auto')

    useEffect(() => {
        if (isOpen) {
            if (contentRef.current) {
                setHeight(contentRef.current.scrollHeight)
            }
        } else {
            setHeight(0)
        }
    }, [isOpen])

    // Ajusta altura no redimensionamento se aberto
    useEffect(() => {
        if (!isOpen) return
        const resizeObserver = new ResizeObserver(() => {
            if (contentRef.current) {
                setHeight(contentRef.current.scrollHeight)
            }
        })
        if (contentRef.current) resizeObserver.observe(contentRef.current)
        return () => resizeObserver.disconnect()
    }, [isOpen])

    return (
        <div className={`border border-studio-border rounded-lg bg-studio-bg overflow-hidden ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full px-4 py-4 text-left focus:outline-none focus-visible:bg-studio-muted/50 transition-colors hover:bg-studio-muted/30"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-3">
                    {icon && <span className="text-studio-foreground-lighter">{icon}</span>}
                    <span className="text-sm font-medium text-studio-foreground">{title}</span>
                    {badge && <span className="ml-2">{badge}</span>}
                </div>
                <ChevronDown
                    className={`w-4 h-4 text-studio-foreground-lighter transition-transform duration-300 ${isOpen ? 'rotate-180 text-studio-brand' : ''}`}
                />
            </button>

            <div
                ref={contentRef}
                style={{ height }}
                className="transition-[height] duration-300 ease-in-out opacity-100"
            >
                <div className="px-4 pb-4 pt-1 border-t border-studio-border/50 text-sm text-studio-foreground-light">
                    {children}
                </div>
            </div>
        </div>
    )
}
