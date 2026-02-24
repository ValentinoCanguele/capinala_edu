/**
 * Regras de frequência/assiduidade.
 * Limite mínimo de presença: 75% (configurável).
 */

export interface ResumoFrequencia {
    alunoId: string
    totalAulas: number
    presencas: number
    faltas: number
    justificadas: number
    percentagemPresenca: number
    emRisco: boolean
}

export type NivelRisco = 'normal' | 'atencao' | 'critico'

const LIMITE_PRESENCA_MINIMO = 75
const LIMITE_ATENCAO = 80

/**
 * Calcula percentagem de presença.
 * Justificadas são contadas como presença.
 */
export function calcularPercentagemPresenca(
    presencas: number,
    justificadas: number,
    totalAulas: number
): number {
    if (totalAulas === 0) return 100
    const efectivas = presencas + justificadas
    return Math.round((efectivas / totalAulas) * 1000) / 10
}

/**
 * Verifica se o aluno está em risco de reprovação por faltas.
 */
export function estaEmRisco(percentagemPresenca: number, limiteMinimo = LIMITE_PRESENCA_MINIMO): boolean {
    return percentagemPresenca < limiteMinimo
}

/**
 * Classifica o nível de risco de frequência.
 */
export function nivelRiscoFrequencia(
    percentagemPresenca: number,
    limiteMinimo = LIMITE_PRESENCA_MINIMO,
    limiteAtencao = LIMITE_ATENCAO
): NivelRisco {
    if (percentagemPresenca < limiteMinimo) return 'critico'
    if (percentagemPresenca < limiteAtencao) return 'atencao'
    return 'normal'
}

/**
 * Monta o resumo de frequência para um aluno a partir dos dados brutos.
 */
export function montarResumoFrequencia(
    alunoId: string,
    totalAulas: number,
    presencas: number,
    faltas: number,
    justificadas: number
): ResumoFrequencia {
    const percentagemPresenca = calcularPercentagemPresenca(presencas, justificadas, totalAulas)
    return {
        alunoId,
        totalAulas,
        presencas,
        faltas,
        justificadas,
        percentagemPresenca,
        emRisco: estaEmRisco(percentagemPresenca),
    }
}

/**
 * Filtra alunos em risco de uma lista de resumos.
 */
export function filtrarAlunosEmRisco(resumos: ResumoFrequencia[]): ResumoFrequencia[] {
    return resumos.filter((r) => r.emRisco)
}

/**
 * Valida se o aluno pode ser aprovado considerando a frequência.
 * Retorna erro se a frequência é insuficiente.
 */
export function validarFrequenciaParaAprovacao(
    percentagemPresenca: number,
    limiteMinimo = LIMITE_PRESENCA_MINIMO
): { aprovavel: boolean; motivo?: string } {
    if (percentagemPresenca < limiteMinimo) {
        return {
            aprovavel: false,
            motivo: `Frequência insuficiente: ${percentagemPresenca}% (mínimo ${limiteMinimo}%)`,
        }
    }
    return { aprovavel: true }
}
