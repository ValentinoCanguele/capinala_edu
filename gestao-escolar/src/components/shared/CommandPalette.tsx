import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Search,
    User,
    Users,
    Settings,
    Plus,
    Home,
    Monitor,
    Calendar,
    CreditCard,
    X,
    GraduationCap,
    BookOpen
} from 'lucide-react'
import { useAlunos, useTurmas } from '@/data/escola/queries'

interface Command {
    id: string
    title: string
    description?: string
    icon: React.ReactNode
    category: 'Navegação' | 'Ações' | 'Procurar'
    onSelect: () => void
    shortcut?: string[]
}

/**
 * Super Command Palette B2B (Global Search)
 * Atalho Central: Cmd+K / Ctrl+K
 * Permite navegação ultrarrápida sem usar o mouse.
 */
export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const navigate = useNavigate()
    const inputRef = useRef<HTMLInputElement>(null)

    const commands: Command[] = [
        { id: 'dash', title: 'Dashboard', icon: <Home className="w-4 h-4" />, category: 'Navegação', onSelect: () => navigate('/') },
        { id: 'aln', title: 'Alunos', icon: <User className="w-4 h-4" />, category: 'Navegação', onSelect: () => navigate('/alunos') },
        { id: 'tur', title: 'Turmas', icon: <Users className="w-4 h-4" />, category: 'Navegação', onSelect: () => navigate('/turmas') },
        { id: 'fin', title: 'Finanças', icon: <CreditCard className="w-4 h-4" />, category: 'Navegação', onSelect: () => navigate('/financas') },
        { id: 'pref', title: 'Definições de Perfil', icon: <Settings className="w-4 h-4" />, category: 'Navegação', onSelect: () => navigate('/perfil') },

        { id: 'new-aln', title: 'Registar Novo Aluno', icon: <Plus className="w-4 h-4" />, category: 'Ações', onSelect: () => navigate('/alunos') },
        { id: 'new-tur', title: 'Criar Nova Turma', icon: <Plus className="w-4 h-4" />, category: 'Ações', onSelect: () => navigate('/turmas') },
        { id: 'aula', title: 'Marcar Presenças', icon: <Calendar className="w-4 h-4" />, category: 'Ações', onSelect: () => navigate('/frequencia') },
    ]

    const { data: alunos = [] } = useAlunos()
    const { data: turmas = [] } = useTurmas()

    const searchCommands: Command[] = useMemo(() => {
        if (query.length < 2) return []

        const alunoResults: Command[] = alunos
            .filter(a => a.nome.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 5)
            .map(a => ({
                id: `search-aluno-${a.id}`,
                title: a.nome,
                description: `Estudante • ${a.email}`,
                icon: <GraduationCap className="w-4 h-4" />,
                category: 'Procurar',
                onSelect: () => navigate(`/alunos?id=${a.id}`)
            }))

        const turmaResults: Command[] = turmas
            .filter(t => t.nome.toLowerCase().includes(query.toLowerCase()))
            .slice(0, 3)
            .map(t => ({
                id: `search-turma-${t.id}`,
                title: t.nome,
                description: `Turma • ${t.anoLetivo}`,
                icon: <BookOpen className="w-4 h-4" />,
                category: 'Procurar',
                onSelect: () => navigate(`/turmas?id=${t.id}`)
            }))

        return [...alunoResults, ...turmaResults]
    }, [alunos, turmas, query, navigate])

    const allCommands = [...commands, ...searchCommands]

    const filteredCommands = allCommands.filter(c =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        (c.description?.toLowerCase().includes(query.toLowerCase())) ||
        c.category.toLowerCase().includes(query.toLowerCase())
    )

    const handleOpen = useCallback((e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault()
            setIsOpen(prev => !prev)
        }
    }, [])

    useEffect(() => {
        window.addEventListener('keydown', handleOpen)
        return () => window.removeEventListener('keydown', handleOpen)
    }, [handleOpen])

    useEffect(() => {
        if (isOpen) {
            setQuery('')
            setSelectedIndex(0)
            setTimeout(() => inputRef.current?.focus(), 50)
        }
    }, [isOpen])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(prev => (prev + 1) % filteredCommands.length)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length)
        } else if (e.key === 'Enter') {
            filteredCommands[selectedIndex]?.onSelect()
            setIsOpen(false)
        } else if (e.key === 'Escape') {
            setIsOpen(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
            <div
                className="fixed inset-0 bg-studio-bg/60 backdrop-blur-md pointer-events-auto animate-fade-in"
                onClick={() => setIsOpen(false)}
            />

            <div className="relative w-full max-w-2xl bg-studio-bg border border-studio-border/50 rounded-2xl shadow-2xl overflow-hidden animate-slide-up pointer-events-auto flex flex-col max-h-[70vh]">
                <div className="flex items-center px-4 py-4 border-b border-studio-border/50 gap-3">
                    <Search className="w-5 h-5 text-studio-foreground-lighter" />
                    <input
                        ref={inputRef}
                        type="text"
                        className="flex-1 bg-transparent border-none outline-none text-studio-foreground placeholder:text-studio-foreground-lighter/50 text-base"
                        placeholder="O que procura? (ex: 'alunos', 'novas turmas'...)"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value)
                            setSelectedIndex(0)
                        }}
                        onKeyDown={handleKeyDown}
                    />
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-studio-muted border border-studio-border text-[10px] font-mono text-studio-foreground-lighter">
                        <X className="w-3 h-3 cursor-pointer" onClick={() => setIsOpen(false)} />
                        <span>ESC</span>
                    </div>
                </div>

                <div className="overflow-y-auto p-2">
                    {filteredCommands.length > 0 ? (
                        <div className="space-y-1">
                            {filteredCommands.map((command, index) => {
                                const isSelected = index === selectedIndex

                                return (
                                    <div
                                        key={command.id}
                                        className={`
                      flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all duration-200
                      ${isSelected ? 'bg-studio-brand text-white' : 'hover:bg-studio-muted/50 text-studio-foreground'}
                    `}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        onClick={() => {
                                            command.onSelect()
                                            setIsOpen(false)
                                        }}
                                    >
                                        <div className={`
                        flex items-center justify-center w-8 h-8 rounded-lg 
                        ${isSelected ? 'bg-white/20' : 'bg-studio-muted'}
                    `}>
                                            {command.icon}
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-sm font-semibold truncate">{command.title}</p>
                                            <p className={`text-[10px] truncate ${isSelected ? 'text-white/70' : 'text-studio-foreground-lighter'}`}>
                                                {command.description || command.category}
                                            </p>
                                        </div>
                                        {isSelected && (
                                            <div className="text-[10px] font-bold text-white/50 bg-white/10 px-1.5 py-0.5 rounded border border-white/20 uppercase">
                                                Enter
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="py-12 flex flex-col items-center justify-center text-studio-foreground-lighter">
                            <Monitor className="w-12 h-12 mb-3 opacity-20" />
                            <p className="text-sm">Nenhum resultado para "{query}"</p>
                        </div>
                    )}
                </div>

                <div className="px-4 py-3 bg-studio-muted/30 border-t border-studio-border/50 flex items-center justify-between text-[11px] text-studio-foreground-lighter font-medium">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1"><span className="px-1 py-0.5 rounded bg-studio-muted border border-studio-border">↑↓</span> Navegar</span>
                        <span className="flex items-center gap-1"><span className="px-1 py-0.5 rounded bg-studio-muted border border-studio-border">↵</span> Selecionar</span>
                    </div>
                    <div>Nexus Command Center v1.0</div>
                </div>
            </div>
        </div>
    )
}
