/**
 * Serviço de impressão para relatórios e listas.
 * Permite imprimir a janela inteira ou um elemento específico.
 */

const PRINT_AREA_CLASS = 'print-area'

/**
 * Imprime a janela atual (documento inteiro).
 * Útil para páginas já preparadas para impressão com @media print.
 */
export function printWindow(): void {
  if (typeof window === 'undefined') return
  window.print()
}

/**
 * Imprime apenas o elemento com o id indicado.
 * Temporariamente esconde o resto do corpo e mostra só o elemento; após impressão restaura.
 */
export function printElement(elementId: string): void {
  if (typeof document === 'undefined' || typeof window === 'undefined') return

  const el = document.getElementById(elementId)
  if (!el) return

  const style = document.createElement('style')
  style.id = 'print-area-style'
  style.textContent = `
    @media print {
      body * { visibility: hidden; }
      .${PRINT_AREA_CLASS}, .${PRINT_AREA_CLASS} * { visibility: visible; }
      .${PRINT_AREA_CLASS} { position: absolute; left: 0; top: 0; width: 100%; }
    }
  `
  document.head.appendChild(style)

  el.classList.add(PRINT_AREA_CLASS)

  window.print()

  el.classList.remove(PRINT_AREA_CLASS)
  const added = document.getElementById('print-area-style')
  if (added) added.remove()
}

/**
 * Adiciona a classe ao elemento para que em @media print só ele seja visível.
 * Use em conjunto com CSS: @media print { body * { visibility: hidden; } .print-only, .print-only * { visibility: visible; } }
 */
export const PRINT_ONLY_CLASS = 'print-only'
