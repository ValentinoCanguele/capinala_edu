import { type ReactNode } from 'react'
import { HelpCircle } from 'lucide-react'
import { Tooltip } from './Tooltip'

export interface LabelWithHelpProps {
  /** Texto da label (ex.: "Email institucional") */
  label: string
  /** Texto explicativo mostrado ao interagir com o ícone ? (item 111) */
  help?: ReactNode
  /** Campo obrigatório: mostra asterisco vermelho */
  required?: boolean
  /** id do input associado (para htmlFor) */
  htmlFor?: string
  /** Classes adicionais na label */
  className?: string
}

/**
 * Label com opcional ícone ? que abre tooltip explicativo.
 * Uso em formulários para ajudar o utilizador a preencher campos.
 */
export function LabelWithHelp({
  label,
  help,
  required,
  htmlFor,
  className = '',
}: LabelWithHelpProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`inline-flex items-center gap-1.5 text-sm font-medium text-studio-foreground ${className}`}
    >
      <span>{label}</span>
      {required && <span className="text-red-500" aria-hidden="true">*</span>}
      {help != null && (
        <Tooltip content={help} position="top" delay={200}>
          <button
            type="button"
            className="inline-flex p-0.5 rounded-full text-studio-foreground-lighter hover:text-studio-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-1"
            aria-label="Ver ajuda"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
      )}
    </label>
  )
}
