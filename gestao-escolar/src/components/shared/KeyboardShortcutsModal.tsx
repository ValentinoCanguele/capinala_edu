import { Keyboard } from 'lucide-react'

const SHORTCUTS: { keys: string[]; description: string }[] = [
  { keys: ['⌘', 'K'], description: 'Abrir paleta de pesquisa global' },
  { keys: ['/'], description: 'Abrir pesquisa (quando não está num campo)' },
  { keys: ['⌘', 'S'], description: 'Guardar formulário aberto (em formulários que suportam)' },
  { keys: ['Esc'], description: 'Fechar modal, dropdown ou menu' },
  { keys: ['Shift', 'Clique'], description: 'Selecionar intervalo (lista de alunos)' },
]

interface KeyboardShortcutsModalProps {
  open: boolean
  onClose: () => void
}

/**
 * Modal Cheatsheet com atalhos de teclado (item 116 do catálogo).
 */
export function KeyboardShortcutsModal({ open, onClose }: KeyboardShortcutsModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-studio-bg/80 backdrop-blur-sm animate-fade-in"
        aria-hidden
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md rounded-xl border border-studio-border bg-studio-bg shadow-2xl animate-slide-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        <div className="flex items-center gap-2 border-b border-studio-border px-4 py-3">
          <Keyboard className="w-5 h-5 text-studio-brand" aria-hidden />
          <h2 id="shortcuts-title" className="text-lg font-semibold text-studio-foreground">
            Atalhos de teclado
          </h2>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-4 space-y-3">
          {SHORTCUTS.map(({ keys, description }, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 py-2 border-b border-studio-border/50 last:border-0"
            >
              <span className="text-sm text-studio-foreground-light">{description}</span>
              <div className="flex items-center gap-1 flex-shrink-0">
                {keys.map((k) => (
                  <kbd
                    key={k}
                    className="px-2 py-1 text-xs font-medium bg-studio-muted border border-studio-border rounded shadow-sm"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="border-t border-studio-border px-4 py-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-studio-foreground-light hover:text-studio-foreground hover:bg-studio-muted rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}
