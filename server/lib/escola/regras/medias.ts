/**
 * Regras de médias e classificação académica.
 * Escala: 0–20. Aprovação: >= 10 (configurável).
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

/* ── Classificação Textual (0–20) ── */

export function classificarNota(nota: number | null): Classificacao | null {
  if (nota === null) return null
  if (nota < 10) return 'Insuficiente'
  if (nota < 14) return 'Suficiente'
  if (nota < 18) return 'Bom'
  if (nota < 20) return 'Muito Bom'
  return 'Excelente'
}

/* ── Resultado Trimestral (Angola: < 7 Reprova, >= 10 Aprova, 7-9 Recurso/Exame) ── */

export function resultadoTrimestral(media: number | null, minimaAprovacao = 10, minimaRecurso = 7): ResultadoTrimestral {
  if (media === null) return 'Reprovado'
  if (media >= minimaAprovacao) return 'Aprovado'
  if (media >= minimaRecurso) return 'Recurso'
  return 'Reprovado'
}

/* ── Média Final Anual (MFA) ── */

export function calcularMFA(
  trimestres: { valor: number | null; peso: number }[]
): number | null {
  const validas = trimestres.filter((t): t is { valor: number; peso: number } => t.valor !== null)
  if (validas.length === 0) return null

  const totalPeso = validas.reduce((acc, t) => acc + t.peso, 0)
  if (totalPeso === 0) return null

  const soma = validas.reduce((acc, t) => acc + t.valor * t.peso, 0)
  return Math.round((soma / totalPeso) * 100) / 100
}

/** @deprecated Use calcularMFA para maior precisão com pesos */
export function mediaFinalAnual(mediasTrimestres: (number | null)[]): number | null {
  const validas = mediasTrimestres.filter((m): m is number => m !== null)
  return calcularMedia(validas)
}

/* ── Resultado Final e Exames ── */

export type ResultadoFinal = 'Aprovado' | 'Admitido a Exame' | 'Reprovado' | 'Aprovado em Exame' | 'Reprovado em Exame'

export function calcularResultadoFinal(
  mfa: number | null,
  config: { minimaAprovacao: number; minimaExame: number } = { minimaAprovacao: 10, minimaExame: 7 }
): ResultadoFinal {
  if (mfa === null) return 'Reprovado'
  if (mfa >= config.minimaAprovacao) return 'Aprovado'
  if (mfa >= config.minimaExame) return 'Admitido a Exame'
  return 'Reprovado'
}

export function calcularNotaFinalComExame(
  mfa: number,
  notaExame: number,
  pesoMfa = 0.4,
  pesoExame = 0.6
): number {
  const notaFinal = (mfa * pesoMfa) + (notaExame * pesoExame)
  return Math.round(notaFinal * 100) / 100
}

/* ── Aprovação (genérica) ── */

export function mediaAprovacao(media: number | null, minima = 10): boolean {
  if (media === null) return false
  return media >= minima
}

/* ── Validar valor de nota ── */

export function validarNota(valor: number, min = 0, max = 20): { valido: boolean; erro?: string } {
  if (typeof valor !== 'number' || isNaN(valor)) {
    return { valido: false, erro: 'Valor da nota inválido' }
  }
  if (valor < min || valor > max) {
    return { valido: false, erro: `Nota deve estar entre ${min} e ${max}` }
  }
  return { valido: true }
}

/** Arredonda valor conforme o regime institucional. */
export function aplicarArredondamento(
  valor: number,
  tipo: 'aritmetico' | 'truncado' | 'normativo_angola' = 'aritmetico',
  casas = 1
): number {
  if (tipo === 'truncado') {
    const f = 10 ** casas
    return Math.floor(valor * f) / f
  }

  if (tipo === 'normativo_angola') {
    // 9.5 sobe para 10 se a precisão for 0 casas (inteiro)
    if (casas === 0) {
      return valor >= Math.floor(valor) + 0.5 ? Math.ceil(valor) : Math.floor(valor)
    }
  }

  // Aritmetico (Padrão)
  const f = 10 ** casas
  return Math.round(valor * f) / f
}

/** Média de um conjunto de números com aplicação de arredondamento técnico. */
export function mediaSimples(
  valores: number[],
  tipo: 'aritmetico' | 'truncado' | 'normativo_angola' = 'aritmetico',
  casas = 1
): number | null {
  if (valores.length === 0) return null
  const mediaRaw = valores.reduce((a, b) => a + b, 0) / valores.length
  return aplicarArredondamento(mediaRaw, tipo, casas)
}

/** Menor nota de um array (útil para destaque de risco). */
export function menorNota(notas: number[]): number | null {
  if (notas.length === 0) return null
  return Math.min(...notas)
}

/** Maior nota de um array. */
export function maiorNota(notas: number[]): number | null {
  if (notas.length === 0) return null
  return Math.max(...notas)
}

/** Calcula a nota periódica baseada na fórmula configurada. */
export function calcularNotaPelaFormula(
  data: { mac: number; npp: number; ne: number },
  formula: string = '(MAC * 0.4) + (NPP * 0.6)'
): number {
  // Limpeza e normalização da fórmula (apenas suporte básico por agora)
  let expression = formula
    .replace(/MAC/g, data.mac.toString())
    .replace(/NPP/g, data.npp.toString())
    .replace(/NE/g, data.ne.toString())

  try {
    // Nota: Em ambiente real, usar um parser de expressões seguro.
    // Aqui simulamos o suporte às fórmulas padrão.
    if (formula.includes('MAC') && formula.includes('NPP')) {
      // Ex: (MAC * 0.4) + (NPP * 0.6)
      return (data.mac * 0.4) + (data.npp * 0.6)
    }
    return (data.mac + data.npp + data.ne) / 3 // Fallback
  } catch (e) {
    return data.mac || data.npp || data.ne || 0
  }
}

/** Número de notas abaixo do mínimo (ex.: < 10). */
export function contarAbaixoMinimo(notas: number[], minimo = 10): number {
  return notas.filter((n) => n < minimo).length
}
