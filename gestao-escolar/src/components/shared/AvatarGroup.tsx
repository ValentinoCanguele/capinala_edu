import { Avatar, type AvatarProps } from './Avatar'

interface AvatarGroupProps {
    users: Array<{ name: string; url?: string | null }>
    max?: number
    size?: AvatarProps['size']
    shape?: AvatarProps['shape']
    className?: string
}

/**
 * AvatarGroup B2B (Múltiplas Faces)
 * Exibe utilizadores sobrepostos c/ anel de borda. 
 * Conta o restante em '+X' se exceder o 'max'. Ideal para mostrar Lotação da Turma.
 */
export function AvatarGroup({ users, max = 4, size = 'sm', shape = 'circle', className = '' }: AvatarGroupProps) {
    if (!users || users.length === 0) return null

    const visibleUsers = users.slice(0, max)
    const excess = users.length - max

    const overlapClass = shape === 'circle' ? '-ml-2 first:ml-0' : '-ml-1.5 first:ml-0'
    const ringClass = 'ring-2 ring-studio-bg'

    return (
        <div className={`flex items-center ${className}`}>
            {visibleUsers.map((user, idx) => (
                <div key={idx} className={`relative z-[${max - idx}] ${overlapClass} ${ringClass} rounded-full`}>
                    <Avatar name={user.name} url={user.url} size={size} shape={shape} />
                </div>
            ))}

            {excess > 0 && (
                <div className={`relative z-0 ${overlapClass} ${ringClass} rounded-[inherit]`}>
                    <div className="flex items-center justify-center bg-studio-muted border border-studio-border text-studio-foreground-light font-medium rounded-[inherit]" style={getAvatarSizeStyle(size)}>
                        +{excess}
                    </div>
                </div>
            )}
        </div>
    )
}

function getAvatarSizeStyle(size: string) {
    switch (size) {
        case 'sm': return { width: '1.5rem', height: '1.5rem', fontSize: '10px' }
        case 'md': return { width: '2rem', height: '2rem', fontSize: '11px' }
        case 'lg': return { width: '2.5rem', height: '2.5rem', fontSize: '12px' }
        case 'xl': return { width: '4rem', height: '4rem', fontSize: '16px' }
        default: return { width: '2rem', height: '2rem', fontSize: '11px' }
    }
}
