/**
 * Formatação de moeda — Kwanza angolano (Kz).
 * Usado em todo o módulo de finanças.
 */

const MOEDA_LABEL = 'Kz'

/**
 * Formata um valor numérico em Kwanza (Kz).
 * Ex.: 1234.5 → "1 234,50 Kz"; negativos: -100 → "-100,00 Kz".
 * Usa espaço como separador de milhares e vírgula decimal (Angola).
 */
export function formatCurrency(value: number): string {
  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''
  try {
    const formatted = absValue.toLocaleString('pt-AO', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    if (formatted && !formatted.includes('NaN')) return `${sign}${formatted} ${MOEDA_LABEL}`
  } catch {
    // fallback se pt-AO não existir
  }
  const fixed = absValue.toFixed(2)
  const [intPart, decPart] = fixed.split('.')
  const withSpaces = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return `${sign}${withSpaces},${decPart} ${MOEDA_LABEL}`
}

/**
 * Símbolo/label da moeda para uso em títulos ou legendas.
 */
export function getCurrencyLabel(): string {
  return MOEDA_LABEL
}
