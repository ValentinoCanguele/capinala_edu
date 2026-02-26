import { useState, useRef, useEffect } from 'react'

export interface TabItem {
    id: string
    label: string
    icon?: React.ReactNode
    badge?: string | number
    disabled?: boolean
}

interface TabsProps {
    tabs: TabItem[]
    defaultTab?: string
    onChange?: (id: string) => void
    className?: string
    layout?: 'pills' | 'underline'
}

/**
 * Tabs B2B 
 * Duas versões desenhadas à medida do Estilo Supabase Studio:
 * 1. Underline: Linha azul desliza por baixo do texto com animação e padding preciso.
 * 2. Pills: Fundo preenchido com bordas arredondadas para módulos pesados.
 */
export function Tabs({ tabs, defaultTab, onChange, className = '', layout = 'underline' }: TabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id)
    const navRef = useRef<HTMLDivElement>(null)
    const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

    // Efeito elegante que calcula exatamente a largura e a posição esquerda
    // da aba ativa para que a linha indicadora ou a Box Pill deslizem p/ lá.
    useEffect(() => {
        if (navRef.current) {
            const activeElement = Array.from(navRef.current.children).find(
                (child) => (child as HTMLElement).dataset.id === activeTab
            ) as HTMLElement | undefined

            if (activeElement) {
                setIndicatorStyle({
                    left: activeElement.offsetLeft,
                    width: activeElement.offsetWidth,
                })
            }
        }
    }, [activeTab, tabs])

    const handleTabClick = (id: string) => {
        if (activeTab === id) return
        setActiveTab(id)
        if (onChange) onChange(id)
    }

    if (layout === 'pills') {
        return (
            <div className={`relative flex items-center bg-studio-muted/50 p-1 rounded-xl border border-studio-border/30 w-max ${className}`} ref={navRef}>
                {/* Pilula Activa Transição Deslizante */}
                <div
                    className="absolute bg-studio-bg shadow transition-all duration-300 rounded-lg inset-y-1"
                    style={{ width: indicatorStyle.width, transform: `translateX(${indicatorStyle.left}px)` }}
                    aria-hidden="true"
                />
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            data-id={tab.id}
                            disabled={tab.disabled}
                            onClick={() => handleTabClick(tab.id)}
                            className={`relative z-10 flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand ${tab.disabled ? 'opacity-50 cursor-not-allowed' :
                                    isActive ? 'text-studio-foreground' : 'text-studio-foreground-light hover:text-studio-foreground'
                                }`}
                        >
                            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
                            {tab.label}
                            {tab.badge && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${isActive ? 'bg-studio-brand/10 text-studio-brand border-studio-brand/20' : 'bg-studio-muted border-studio-border text-studio-foreground-lighter'}`}>
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    )
                })}
            </div>
        )
    }

    // Underline Layout (Estilo Base Supabase)
    return (
        <div className={`border-b border-studio-border ${className}`}>
            <div className="relative flex" ref={navRef}>
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            data-id={tab.id}
                            disabled={tab.disabled}
                            onClick={() => handleTabClick(tab.id)}
                            className={`pb-3 pt-2 px-1 mr-6 flex items-center gap-2 text-sm font-medium transition-colors focus:outline-none border-b-2 ${tab.disabled ? 'opacity-50 cursor-not-allowed border-transparent' :
                                    isActive ? 'text-studio-foreground border-transparent' : 'text-studio-foreground-light hover:text-studio-foreground border-transparent'
                                }`}
                        >
                            {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
                            {tab.label}
                            {tab.badge && (
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] uppercase font-semibold border ${isActive ? 'bg-studio-brand/10 text-studio-brand border-studio-brand/20' : 'bg-studio-muted border-studio-border text-studio-foreground-lighter'}`}>
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    )
                })}
                {/* Underline Indicator Animation */}
                <div
                    className="absolute bottom-[-1px] h-0.5 bg-studio-brand transition-all duration-300"
                    style={{ width: indicatorStyle.width, left: 0, transform: `translateX(${indicatorStyle.left}px)` }}
                    aria-hidden="true"
                />
            </div>
        </div>
    )
}
