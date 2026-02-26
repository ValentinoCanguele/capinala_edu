import { useMemo } from 'react'

export interface AvatarProps {
    name: string
    url?: string | null
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
    status?: 'online' | 'offline' | 'away' | 'dnd'
    className?: string
    shape?: 'circle' | 'square'
}

const colorPalette = [
    'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200 dark:bg-fuchsia-500/10 dark:text-fuchsia-400 dark:border-fuchsia-500/20',
    'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
    'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-400 dark:border-cyan-500/20',
    'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
]

const sizeClasses = {
    xs: 'h-5 w-5 text-[8px]',
    sm: 'h-6 w-6 text-[10px]',
    md: 'h-8 w-8 text-xs',
    lg: 'h-10 w-10 text-sm',
    xl: 'h-16 w-16 text-xl',
}

const statusDisplay = {
    online: 'bg-emerald-500',
    offline: 'bg-studio-border',
    away: 'bg-amber-500',
    dnd: 'bg-red-500 border-white',
}

/**
 * Avatar B2B
 * Cor de fundo determinística (calculada com base no nome do usuário).
 * Permite formas circulares ou quadradas (ideal para "Turmas" ou "Grupos").
 * Suporta pontos de estado (online/offline).
 */
export function Avatar({ name, url, size = 'md', status, className = '', shape = 'circle' }: AvatarProps) {
    // Inicial Dinâmica (Ex: "João Silva" -> "JS")
    const initials = useMemo(() => {
        if (!name) return '?'
        const parts = name.trim().split(' ')
        if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        return name.substring(0, 2).toUpperCase()
    }, [name])

    // Cor Dinâmica Baseada no Nome (Determinística)
    const colorClass = useMemo(() => {
        let hash = 0
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash)
        }
        const idx = Math.abs(hash) % colorPalette.length
        return colorPalette[idx]
    }, [name])

    const roundedClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg'

    return (
        <div className={`relative inline-flex items-center justify-center flex-shrink-0 font-bold border shadow-sm select-none ${sizeClasses[size]} ${colorClass} ${roundedClass} ${className}`} aria-label={name} title={name}>
            {url ? (
                <img
                    src={url}
                    alt={name}
                    className={`h-full w-full object-cover select-none pointer-events-none ${roundedClass}`}
                    onError={(e) => {
                        // Se falhar a imagem, remove source e mostra iniciais nativamente
                        e.currentTarget.style.display = 'none'
                    }}
                />
            ) : (
                <span className="opacity-90 tracking-wider">
                    {initials}
                </span>
            )}

            {status && (
                <span
                    className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-studio-bg ${statusDisplay[status]}`}
                    title={status}
                />
            )}
        </div>
    )
}
