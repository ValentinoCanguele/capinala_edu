export interface RadioOption {
    label: string
    value: string
    description?: string
    disabled?: boolean
}

interface RadioGroupProps {
    name: string
    options: RadioOption[]
    value: string
    onChange: (value: string) => void
    layout?: 'vertical' | 'horizontal'
    className?: string
}

/**
 * Super Radio Group B2B
 * Renderiza blocos de Opções grandes com títulos e descrições, fáceis de clicar (Hitboxes maiores).
 */
export function RadioGroup({ name, options, value, onChange, layout = 'vertical', className = '' }: RadioGroupProps) {
    return (
        <div
            role="radiogroup"
            aria-label={name}
            className={`flex ${layout === 'vertical' ? 'flex-col gap-3' : 'flex-row flex-wrap gap-4'} ${className}`}
        >
            {options.map((option) => {
                const isSelected = value === option.value

                return (
                    <label
                        key={option.value}
                        className={`
              relative flex items-start p-4 cursor-pointer rounded-xl border-2 transition-all duration-200
              ${option.disabled ? 'opacity-50 cursor-not-allowed bg-studio-muted' : ' hover:bg-studio-muted/30'}
              ${isSelected ? 'border-studio-brand bg-studio-brand/5' : 'border-studio-border/50 bg-studio-bg'}
              ${layout === 'horizontal' ? 'flex-1 min-w-[200px]' : 'w-full'}
            `}
                    >
                        <div className="flex h-5 items-center">
                            <input
                                type="radio"
                                name={name}
                                value={option.value}
                                checked={isSelected}
                                disabled={option.disabled}
                                onChange={() => onChange(option.value)}
                                className="h-4 w-4 bg-transparent border-studio-foreground-lighter text-studio-brand focus:ring-studio-brand focus:ring-offset-studio-bg focus:ring-offset-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
                            />
                        </div>
                        <div className="ml-3 flex flex-col">
                            <span className={`block text-sm font-medium ${isSelected ? 'text-studio-brand' : 'text-studio-foreground'}`}>
                                {option.label}
                            </span>
                            {option.description && (
                                <span className={`block text-sm mt-0.5 ${isSelected ? 'text-studio-brand/70' : 'text-studio-foreground-light'}`}>
                                    {option.description}
                                </span>
                            )}
                        </div>
                    </label>
                )
            })}
        </div>
    )
}
