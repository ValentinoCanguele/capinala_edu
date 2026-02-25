/**
 * Regras de negócio do módulo finanças: multa, juros, status atrasada.
 */

export interface ConfigMultaJuros {
  multaPercentual: number
  jurosMensalPercentual: number
}

/**
 * Calcula valor atualizado com multa (uma vez) + juros ao mês sobre o valor original.
 * dataVencimento e dataReferencia no formato YYYY-MM-DD.
 */
export function calcularValorComMultaEJuros(
  valorOriginal: number,
  dataVencimento: string,
  dataReferencia: string,
  config: ConfigMultaJuros
): number {
  const ven = new Date(dataVencimento + 'T12:00:00Z').getTime()
  const ref = new Date(dataReferencia + 'T12:00:00Z').getTime()
  if (ref <= ven) return valorOriginal

  const multa = valorOriginal * (config.multaPercentual / 100)
  let valorComMulta = valorOriginal + multa

  const mesesAtraso = Math.max(
    0,
    Math.floor((ref - ven) / (30.44 * 24 * 60 * 60 * 1000))
  )
  for (let i = 0; i < mesesAtraso; i++) {
    valorComMulta += valorOriginal * (config.jurosMensalPercentual / 100)
  }

  return Math.round(valorComMulta * 100) / 100
}

/**
 * Retorna true se a parcela está em atraso (vencimento < data de referência e não paga).
 */
export function parcelaEstaAtrasada(
  vencimento: string,
  status: string,
  dataReferencia: string
): boolean {
  if (status === 'paga' || status === 'cancelada') return false
  const ven = new Date(vencimento + 'T12:00:00Z').getTime()
  const ref = new Date(dataReferencia + 'T12:00:00Z').getTime()
  return ven < ref
}

/**
 * Data de hoje em YYYY-MM-DD (UTC).
 */
export function hojeISO(): string {
  return new Date().toISOString().slice(0, 10)
}
