import { useState, forwardRef } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input, type InputProps } from './Input'

export interface PasswordInputProps extends InputProps {
    showStrength?: boolean
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className = '', showStrength = true, value, onChange, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false)
        const valStr = (value as string) || ''

        // Cálculo simples de força de password (0 a 4)
        const calculateStrength = (pass: string) => {
            let score = 0
            if (!pass) return score
            if (pass.length >= 8) score += 1
            if (pass.match(/[a-z]/) && pass.match(/[A-Z]/)) score += 1
            if (pass.match(/\d/)) score += 1
            if (pass.match(/[^a-zA-Z\d]/)) score += 1
            return score
        }

        const strength = calculateStrength(valStr)

        const strengthClasses = [
            'bg-red-500', // 1 (Muito Fraca)
            'bg-orange-500', // 2 (Fraca)
            'bg-amber-400', // 3 (Razoável)
            'bg-emerald-500', // 4 (Forte)
        ]

        const labels = ['Muito Fraca', 'Fraca', 'Razoável', 'Forte']

        const toggleButton = (
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                className="flex items-center justify-center p-1 rounded-md text-studio-foreground-lighter hover:text-studio-foreground hover:bg-studio-muted transition-colors focus:outline-none focus:ring-2 focus:ring-studio-brand"
                title={showPassword ? 'Ocultar Palavra-passe' : 'Revelar Palavra-passe'}
                aria-label={showPassword ? 'Ocultar Palavra-passe' : 'Revelar Palavra-passe'}
            >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
        )

        return (
            <div className={`w-full ${className}`}>
                <Input
                    {...props}
                    ref={ref}
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={onChange}
                    rightIcon={toggleButton}
                />

                {showStrength && valStr.length > 0 && !props.error && (
                    <div className="mt-2 animate-fade-in pl-1">
                        <div className="flex gap-1 h-1.5 w-full bg-studio-muted rounded-full overflow-hidden">
                            {[0, 1, 2, 3].map((index) => (
                                <div
                                    key={index}
                                    className={`h-full flex-1 transition-all duration-300 ${strength > index ? strengthClasses[strength - 1] : 'bg-transparent'
                                        }`}
                                />
                            ))}
                        </div>
                        <p className="mt-1 text-xs font-medium text-studio-foreground-light text-right">
                            {strength > 0 ? labels[strength - 1] : ''}
                        </p>
                    </div>
                )}
            </div>
        )
    }
)

PasswordInput.displayName = 'PasswordInput'
