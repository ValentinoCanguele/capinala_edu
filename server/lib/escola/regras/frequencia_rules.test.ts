import { describe, it, expect } from 'vitest'
import {
    calcularPercentagemPresenca,
    estaEmRisco,
    nivelRiscoFrequencia,
    montarResumoFrequencia,
    filtrarAlunosEmRisco,
    validarFrequenciaParaAprovacao,
} from './frequencia_rules'

describe('frequencia_rules', () => {
    describe('calcularPercentagemPresenca', () => {
        it('retorna 100% quando não há aulas', () => {
            expect(calcularPercentagemPresenca(0, 0, 0)).toBe(100)
        })
        it('calcula percentagem corretamente', () => {
            // 15 presentes + 5 justificadas de 25 aulas = 80%
            expect(calcularPercentagemPresenca(15, 5, 25)).toBe(80)
        })
        it('justificadas contam como presença', () => {
            expect(calcularPercentagemPresenca(0, 10, 10)).toBe(100)
        })
        it('arredonda a 1 decimal', () => {
            // 7 presentes + 0 justificadas de 9 aulas = 77.8%
            expect(calcularPercentagemPresenca(7, 0, 9)).toBe(77.8)
        })
    })

    describe('estaEmRisco', () => {
        it('em risco se < 75%', () => {
            expect(estaEmRisco(74)).toBe(true)
            expect(estaEmRisco(74.9)).toBe(true)
        })
        it('não em risco se >= 75%', () => {
            expect(estaEmRisco(75)).toBe(false)
            expect(estaEmRisco(100)).toBe(false)
        })
        it('respeita limite customizado', () => {
            expect(estaEmRisco(79, 80)).toBe(true)
            expect(estaEmRisco(80, 80)).toBe(false)
        })
    })

    describe('nivelRiscoFrequencia', () => {
        it('crítico quando abaixo do limite mínimo', () => {
            expect(nivelRiscoFrequencia(60)).toBe('critico')
            expect(nivelRiscoFrequencia(74)).toBe('critico')
        })
        it('atenção quando entre mínimo e atenção', () => {
            expect(nivelRiscoFrequencia(75)).toBe('atencao')
            expect(nivelRiscoFrequencia(79)).toBe('atencao')
        })
        it('normal quando acima do limite de atenção', () => {
            expect(nivelRiscoFrequencia(80)).toBe('normal')
            expect(nivelRiscoFrequencia(100)).toBe('normal')
        })
    })

    describe('montarResumoFrequencia', () => {
        it('monta resumo com todos os campos', () => {
            const resumo = montarResumoFrequencia('aluno-1', 20, 16, 3, 1)
            expect(resumo.alunoId).toBe('aluno-1')
            expect(resumo.totalAulas).toBe(20)
            expect(resumo.presencas).toBe(16)
            expect(resumo.faltas).toBe(3)
            expect(resumo.justificadas).toBe(1)
            expect(resumo.percentagemPresenca).toBe(85) // (16+1)/20 = 85%
            expect(resumo.emRisco).toBe(false)
        })
        it('marca em risco se < 75%', () => {
            const resumo = montarResumoFrequencia('aluno-2', 20, 10, 7, 3)
            // (10+3)/20 = 65%
            expect(resumo.percentagemPresenca).toBe(65)
            expect(resumo.emRisco).toBe(true)
        })
    })

    describe('filtrarAlunosEmRisco', () => {
        it('retorna apenas alunos em risco', () => {
            const resumos = [
                montarResumoFrequencia('a1', 20, 18, 2, 0), // 90% - ok
                montarResumoFrequencia('a2', 20, 10, 8, 2), // 60% - risco
                montarResumoFrequencia('a3', 20, 14, 5, 1), // 75% - ok
            ]
            const emRisco = filtrarAlunosEmRisco(resumos)
            expect(emRisco).toHaveLength(1)
            expect(emRisco[0].alunoId).toBe('a2')
        })
    })

    describe('validarFrequenciaParaAprovacao', () => {
        it('aprovável se >= 75%', () => {
            expect(validarFrequenciaParaAprovacao(75)).toEqual({ aprovavel: true })
            expect(validarFrequenciaParaAprovacao(100)).toEqual({ aprovavel: true })
        })
        it('não aprovável se < 75% com motivo', () => {
            const result = validarFrequenciaParaAprovacao(70)
            expect(result.aprovavel).toBe(false)
            expect(result.motivo).toContain('70%')
            expect(result.motivo).toContain('75%')
        })
    })
})
