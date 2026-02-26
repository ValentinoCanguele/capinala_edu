import { forwardRef } from 'react'

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    description?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
    ({ label, description, className = '', ...props }, ref) => {
        return (
            <div className={`relative flex items-start ${className}`}>
                <div className="flex h-6 items-center">
                    <input
                        type="checkbox"
                        ref={ref}
                        className="h-4 w-4 rounded border-studio-border bg-studio-bg text-studio-brand focus:ring-2 focus:ring-studio-brand focus:ring-offset-2 focus:ring-offset-studio-bg transition-colors cursor-pointer disabled:opacity-50 checked:animate-pulse-fast"
                        {...props}
                    />
                </div>
                <div className="ml-3 text-sm leading-6">
                    <label htmlFor={props.id} className="font-medium text-studio-foreground cursor-pointer">
                        {label}
                    </label>
                    {description && (
                        <span className="block text-studio-foreground-light">{description}</span>
                    )}
                </div>
            </div>
        )
    }
)

Checkbox.displayName = 'Checkbox'
