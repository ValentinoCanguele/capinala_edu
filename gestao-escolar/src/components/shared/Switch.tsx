interface SwitchProps {
    checked: boolean
    onChange: (checked: boolean) => void
    disabled?: boolean
    className?: string
    size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
    sm: {
        container: 'h-4 w-7',
        thumb: 'h-3 w-3',
        translate: 'translate-x-[12px]'
    },
    md: {
        container: 'h-5 w-9',
        thumb: 'h-4 w-4',
        translate: 'translate-x-[16px]'
    },
    lg: {
        container: 'h-6 w-11',
        thumb: 'h-5 w-5',
        translate: 'translate-x-[20px]'
    }
}

/**
 * Switch Toggle animado estilo iOS/Vercel.
 * Cor central verde ou blue consoante o projeto.
 */
export function Switch({ checked, onChange, disabled = false, className = '', size = 'md' }: SwitchProps) {
    const { container, thumb, translate } = sizeStyles[size]

    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={() => !disabled && onChange(!checked)}
            className={`
        relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 focus-visible:ring-offset-studio-bg
        ${checked ? 'bg-studio-brand' : 'bg-studio-border'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${container}
        ${className}
      `}
        >
            <span className="sr-only">Alternar definição</span>
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${thumb} ${checked ? translate : 'translate-x-0'}`}
            />
        </button>
    )
}
