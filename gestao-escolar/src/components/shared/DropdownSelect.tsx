import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check, X } from 'lucide-react'

export interface DropdownOption {
    value: string
    label: string
}

interface DropdownSelectProps {
    options: DropdownOption[]
    value: string | string[]
    onChange: (value: string | string[]) => void
    multiple?: boolean
    searchable?: boolean
    placeholder?: string
    className?: string
    disabled?: boolean
}

/**
 * Dropdown Select B2B Customizado
 * Substitui o `<select>` horrível do Browser por uma UI limpa (Estilo Vercel/Supabase).
 * Suporta selecção simples, multi-selecção c/ Chips removíveis e Auto-Fecho ('ESC' / click fora).
 */
export function DropdownSelect({
    options,
    value,
    onChange,
    multiple = false,
    searchable = false,
    placeholder = 'Selecione uma opção...',
    className = '',
    disabled = false,
}: DropdownSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [search, setSearch] = useState('')
    const containerRef = useRef<HTMLDivElement>(null)

    const isArray = Array.isArray(value)

    // Fechar dropdown ao clicar fora ou ESC
    useEffect(() => {
        const handleEvents = (e: MouseEvent | KeyboardEvent) => {
            // Click fora
            if (e.type === 'mousedown' && containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
            // Pressionar ESC
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

    const handleSelect = (optionValue: string) => {
        if (multiple) {
            const currentValues = isArray ? [...value] : []
            if (currentValues.includes(optionValue)) {
                onChange(currentValues.filter(v => v !== optionValue))
            } else {
                onChange([...currentValues, optionValue])
            }
        } else {
            onChange(optionValue)
            setIsOpen(false)
        }
    }

    const handleRemoveChip = (e: React.MouseEvent, optionValue: string) => {
        e.stopPropagation()
        const currentValues = isArray ? [...value] : []
        onChange(currentValues.filter(v => v !== optionValue))
    }

    const filteredOptions = searchable
        ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
        : options

    // Rendering Valor actual (Placeholder vs Chips vs String Única)
    const renderValue = () => {
        if (multiple && isArray && value.length > 0) {
            return (
                <div className="flex flex-wrap gap-1.5 p-0.5">
                    {value.map(val => {
                        const opt = options.find(o => o.value === val)
                        if (!opt) return null
                        return (
                            <span key={val} className="inline-flex items-center gap-1 bg-studio-muted border border-studio-border text-studio-foreground text-xs rounded-md px-2 py-1 transition-colors">
                                {opt.label}
                                {!disabled && (
                                    <button type="button" onClick={(e) => handleRemoveChip(e, val)} className="text-studio-foreground-lighter hover:text-red-500 focus:outline-none">
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </span>
                        )
                    })}
                </div>
            )
        }

        if (!multiple && value) {
            const selected = options.find(o => o.value === value)
            return <span className="text-sm font-medium text-studio-foreground">{selected?.label || String(value)}</span>
        }

        return <span className="text-sm text-studio-foreground-lighter">{placeholder}</span>
    }

    return (
        <div className={`relative w-full ${className}`} ref={containerRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full min-h-[38px] bg-studio-bg border ${isOpen ? 'border-studio-brand ring-2 ring-studio-brand ring-opacity-20' : 'border-studio-border'} rounded-lg px-3 py-1.5 flex items-center justify-between transition-all outline-none focus:outline-none focus:ring-2 focus:ring-studio-brand focus:border-studio-brand disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-studio-bg-alt shadow-soft group hover:border-studio-brand/50`}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <div className="flex-1 overflow-hidden text-left flex items-center h-full break-all">
                    {renderValue()}
                </div>
                <ChevronDown className={`w-4 h-4 text-studio-foreground-lighter transition-transform duration-200 flex-shrink-0 ml-2 ${isOpen ? 'rotate-180 text-studio-brand' : 'group-hover:text-studio-foreground'}`} />
            </button>

            {isOpen && (
                <div className="absolute z-[100] mt-1 w-full bg-studio-bg border border-studio-border rounded-lg shadow-2xl animate-fade-in overflow-hidden">
                    {searchable && (
                        <div className="p-2 border-b border-studio-border/50 sticky top-0 bg-studio-bg/90 backdrop-blur-sm z-10">
                            <input
                                type="text"
                                autoFocus // eslint-disable-line
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Pesquisar..."
                                className="w-full bg-studio-muted/50 border border-transparent rounded-md px-3 py-1.5 text-sm text-studio-foreground focus:outline-none focus:ring-2 focus:ring-studio-brand focus:bg-transparent transition-all"
                            />
                        </div>
                    )}

                    <ul className="max-h-60 overflow-y-auto py-1 scroll-smooth" role="listbox" aria-multiselectable={multiple}>
                        {filteredOptions.length === 0 ? (
                            <li className="px-4 py-3 text-sm text-studio-foreground-light text-center">Nenhum resultado encontrado.</li>
                        ) : (
                            filteredOptions.map((option) => {
                                const isSelected = multiple
                                    ? (isArray && value.includes(option.value))
                                    : value === option.value

                                return (
                                    <li
                                        key={option.value}
                                        role="option"
                                        aria-selected={isSelected}
                                        onClick={() => handleSelect(option.value)}
                                        className={`px-3 py-2 text-sm mx-1 rounded-md cursor-pointer flex items-center justify-between group transition-colors duration-150 ${isSelected
                                                ? 'bg-studio-brand/10 text-studio-brand font-semibold'
                                                : 'text-studio-foreground hover:bg-studio-muted hover:text-studio-foreground'
                                            }`}
                                    >
                                        <span className="truncate pr-4">{option.label}</span>
                                        {isSelected && <Check className={`w-4 h-4 text-studio-brand animate-fade-in`} />}
                                    </li>
                                )
                            })
                        )}
                    </ul>
                </div>
            )}
        </div>
    )
}
