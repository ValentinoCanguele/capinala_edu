import { useState, useRef, useEffect, ReactNode } from 'react'

export interface MenuItem {
    label?: string
    icon?: ReactNode
    onClick?: () => void
    disabled?: boolean
    danger?: boolean
    separator?: boolean
}

interface ContextMenuProps {
    children: ReactNode
    items: MenuItem[]
    position?: 'bottom-left' | 'bottom-right'
    className?: string
}

/**
 * Menu de Acções de Contexto (Vercel Style)
 * Substitui filas intermináveis de botões por um Menu "Três Pontos"
 * que abre um dropdown fluido de contexto flutuante.
 */
export function ContextMenu({ children, items, position = 'bottom-right', className = '' }: ContextMenuProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleEvents = (e: MouseEvent | KeyboardEvent) => {
            if (e.type === 'mousedown' && containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
            if (e.type === 'keydown' && (e as KeyboardEvent).key === 'Escape') {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleEvents)
            document.addEventListener('keydown', handleEvents)
        }

        return () => {
            document.removeEventListener('mousedown', handleEvents)
            document.removeEventListener('keydown', handleEvents)
        }
    }, [isOpen])

    const positionClass = position === 'bottom-right' ? 'right-0' : 'left-0'

    return (
        <div className={`relative inline-block ${className}`} ref={containerRef}>
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer" aria-haspopup="menu" aria-expanded={isOpen}>
                {children}
            </div>

            {isOpen && (
                <div
                    className={`absolute z-[100] mt-1 w-48 bg-studio-bg border border-studio-border rounded-xl shadow-glass animate-fade-in overflow-hidden py-1 ${positionClass}`}
                    role="menu"
                >
                    {items.map((item, index) => {
                        if (item.separator) {
                            return <div key={`sep-${index}`} className="h-px bg-studio-border/60 my-1 w-full" />
                        }

                        return (
                            <button
                                key={index}
                                type="button"
                                disabled={item.disabled}
                                onClick={() => {
                                    item.onClick?.()
                                    setIsOpen(false)
                                }}
                                className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors focus:outline-none focus:bg-studio-muted/50 ${item.disabled ? 'opacity-50 cursor-not-allowed' :
                                    item.danger ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10' :
                                        'text-studio-foreground hover:bg-studio-muted/50'
                                    }`}
                                role="menuitem"
                            >
                                {item.icon && <span className={`flex-shrink-0 ${item.danger ? 'text-red-500' : 'text-studio-foreground-lighter'}`}>{item.icon}</span>}
                                {item.label}
                            </button>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
