/**
 * Regras de médias e classificação académica.
 * Escala: 0–10. Aprovação: >= 5 (configurável).
 */

/* ── Tipos ── */

export interface NotaPonderada {
  valor: number
  peso: number
}

export type Classificacao = 'Insuficiente' | 'Suficiente' | 'Bom' | 'Muito Bom' | 'Excelente'
export type ResultadoTrimestral = 'Aprovado' | 'Reprovado' | 'Recurso'

/* ── Média Aritmética ── */

export function calcularMedia(notas: number[]): number | null {
  if (notas.length === 0) return null
  const sum = notas.reduce((a, b) => a + b, 0)
  return Math.round((sum / notas.length) * 100) / 100
}

/* ── Média Ponderada ── */

export function calcularMediaPonderada(notas: NotaPonderada[]): number | null {
  if (notas.length === 0) return null
  const totalPeso = notas.reduce((acc, n) => acc + n.peso, 0)
  if (totalPeso === 0) return null
  const somaValorPeso = notas.reduce((acc, n) => acc + n.valor * n.peso, 0)
  return Math.round((somaValorPeso / totalPeso) * 100) / 100
}

/* ── Classificação Textual (0–10) ── */

export function classificarNota(nota: number | null): Classificacao | null {
  if (nota === null) return null
  if (nota < 5) return 'Insuficiente'
  if (nota < 6.5) return 'Suficiente'
  if (nota < 8) return 'Bom'
  if (nota < 9.5) return 'Muito Bom'
  return 'Excelente'
}

/* ── Resultado Trimestral ── */

export function resultadoTrimestral(media: number | null, minimaAprovacao = 5, minimaRecurso = 4): ResultadoTrimestral {
  if (media === null) return 'Reprovado'
  if (media >= minimaAprovacao) return 'Aprovado'
  if (media >= minimaRecurso) return 'Recurso'
  return 'Reprovado'
}

/* ── Média Final Anual (média aritmética dos trimestres) ── */

export function mediaFinalAnual(mediasTrimestres: (number | null)[]): number | null {
  const validas = mediasTrimestres.filter((m): m is number => m !== null)
  return calcularMedia(validas)
}

/* ── Aprovação (genérica) ── */

export function mediaAprovacao(media: number | null, minima = 5): boolean {
  if (media === null) return false
  return media >= minima
}

/* ── Validar valor de nota ── */

export function validarNota(valor: number, min = 0, max = 10): { valido: boolean; erro?: string } {
  if (typeof valor !== 'number' || isNaN(valor)) {
    return { valido: false, erro: 'Valor da nota inválido' }
  }
  if (valor < min || valor > max) {
    return { valido: false, erro: `Nota deve estar entre ${min} e ${max}` }
  }
  return { valido: true }
}
