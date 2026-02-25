/**
 * Utilitário para copiar texto para a área de transferência.
 * Útil para IDs, links ou dados que o utilizador queira colar noutro sítio.
 */

/**
 * Copia o texto para o clipboard.
 * @param text - Texto a copiar
 * @returns Promise<true> em sucesso, Promise<false> se não suportado ou falha
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator?.clipboard?.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }
  // Fallback para ambientes antigos
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.position = 'absolute'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}
