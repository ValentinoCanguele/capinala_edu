import { ArrowUp } from 'lucide-react'

interface BackToTopProps {
  visible: boolean
  onClick: () => void
  /** Classe extra no botão (ex.: posição em páginas com scroll interno). */
  className?: string
}

/**
 * Botão flutuante "Voltar ao topo" para listas longas (item 70 do catálogo).
 * Aparece após o utilizador fazer scroll para baixo.
 */
export function BackToTop({ visible, onClick, className = '' }: BackToTopProps) {
  if (!visible) return null

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full
        bg-studio-brand text-white shadow-glass ring-1 ring-studio-border
        hover:bg-studio-brand-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 focus-visible:ring-offset-studio-bg
        transition-opacity duration-200 animate-fade-in
        ${className}
      `}
      title="Voltar ao topo"
      aria-label="Voltar ao topo da página"
    >
      <ArrowUp className="w-5 h-5" aria-hidden />
    </button>
  )
}
