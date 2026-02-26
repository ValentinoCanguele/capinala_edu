import { forwardRef } from 'react'
import { Plus, Minus } from 'lucide-react'
import { Input, type InputProps } from './Input'
import { Button } from './Button'

export interface NumberInputProps extends Omit<InputProps, 'onChange' | 'value'> {
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    step?: number
}

/**
 * Super Number Input B2B
 * Inclui os botões de Stepper (+ / -) integrados visualmente.
 * Controla os limites de min/max nativamente.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
    ({ value, onChange, min, max, step = 1, ...props }, ref) => {

        const handleIncrement = () => {
            const newValue = value + step
            if (max !== undefined && newValue > max) return
            onChange(newValue)
        }

        const handleDecrement = () => {
            const newValue = value - step
            if (min !== undefined && newValue < min) return
            onChange(newValue)
        }

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = parseFloat(e.target.value)
            if (isNaN(val)) return
            if (min !== undefined && val < min) return
            if (max !== undefined && val > max) return
            onChange(val)
        }

        const leftButton = (
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md"
                onClick={handleDecrement}
                disabled={min !== undefined && value <= min}
            >
                <Minus className="h-3.5 w-3.5" />
            </Button>
        )

        const rightButton = (
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-md"
                onClick={handleIncrement}
                disabled={max !== undefined && value >= max}
            >
                <Plus className="h-3.5 w-3.5" />
            </Button>
        )

        return (
            <Input
                {...props}
                ref={ref}
                type="number"
                value={value}
                onChange={handleChange}
                leftIcon={leftButton}
                rightIcon={rightButton}
                className={`text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${props.className || ''}`}
            />
        )
    }
)

NumberInput.displayName = 'NumberInput'
