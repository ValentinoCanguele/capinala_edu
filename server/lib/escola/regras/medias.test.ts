import { describe, it, expect } from 'vitest'
import { calcularMedia, calcularMediaPonderada, classificarNota, resultadoTrimestral, mediaFinalAnual, mediaAprovacao, validarNota } from './medias'

describe('medias', () => {
  describe('calcularMedia', () => {
    it('retorna null para array vazio', () => {
      expect(calcularMedia([])).toBeNull()
    })
    it('retorna o valor para um único número', () => {
      expect(calcularMedia([8])).toBe(8)
    })
    it('calcula média aritmética e arredonda a 2 decimais', () => {
      expect(calcularMedia([6, 7, 8, 9])).toBe(7.5)
      expect(calcularMedia([5.5, 6.5])).toBe(6)
    })
  })

  describe('calcularMediaPonderada', () => {
    it('retorna null para array vazio', () => {
      expect(calcularMediaPonderada([])).toBeNull()
    })
    it('retorna null se peso total é 0', () => {
      expect(calcularMediaPonderada([{ valor: 8, peso: 0 }])).toBeNull()
    })
    it('calcula média ponderada corretamente', () => {
      // Teste peso 3, Trabalho peso 1, Exame peso 4
      const notas = [
        { valor: 7, peso: 3 },  // teste
        { valor: 8, peso: 1 },  // trabalho
        { valor: 6, peso: 4 },  // exame
      ]
      // (7*3 + 8*1 + 6*4) / (3+1+4) = (21 + 8 + 24) / 8 = 53/8 = 6.625
      expect(calcularMediaPonderada(notas)).toBe(6.63)
    })
    it('pesos iguais = média aritmética', () => {
      const notas = [
        { valor: 6, peso: 1 },
        { valor: 8, peso: 1 },
      ]
      expect(calcularMediaPonderada(notas)).toBe(7)
    })
  })

  describe('classificarNota', () => {
    it('retorna null para nota null', () => {
      expect(classificarNota(null)).toBeNull()
    })
    it('classifica Insuficiente < 10', () => {
      expect(classificarNota(4)).toBe('Insuficiente')
      expect(classificarNota(0)).toBe('Insuficiente')
      expect(classificarNota(9.9)).toBe('Insuficiente')
    })
    it('classifica Suficiente [10, 14)', () => {
      expect(classificarNota(10)).toBe('Suficiente')
      expect(classificarNota(12)).toBe('Suficiente')
      expect(classificarNota(13.9)).toBe('Suficiente')
    })
    it('classifica Bom [14, 18)', () => {
      expect(classificarNota(14)).toBe('Bom')
      expect(classificarNota(16)).toBe('Bom')
      expect(classificarNota(17.9)).toBe('Bom')
    })
    it('classifica Muito Bom [18, 20)', () => {
      expect(classificarNota(18)).toBe('Muito Bom')
      expect(classificarNota(19)).toBe('Muito Bom')
      expect(classificarNota(19.9)).toBe('Muito Bom')
    })
    it('classifica Excelente >= 20', () => {
      expect(classificarNota(20)).toBe('Excelente')
    })
  })

  describe('resultadoTrimestral', () => {
    it('Reprovado para null', () => {
      expect(resultadoTrimestral(null)).toBe('Reprovado')
    })
    it('Aprovado quando >= 10', () => {
      expect(resultadoTrimestral(10)).toBe('Aprovado')
      expect(resultadoTrimestral(15)).toBe('Aprovado')
    })
    it('Recurso quando >= 8 e < 10', () => {
      expect(resultadoTrimestral(8)).toBe('Recurso')
      expect(resultadoTrimestral(9.5)).toBe('Recurso')
    })
    it('Reprovado quando < 8', () => {
      expect(resultadoTrimestral(7.9)).toBe('Reprovado')
      expect(resultadoTrimestral(0)).toBe('Reprovado')
    })
    it('respeita limites customizados', () => {
      expect(resultadoTrimestral(12, 14, 10)).toBe('Recurso')
      expect(resultadoTrimestral(15, 14, 10)).toBe('Aprovado')
    })
  })

  describe('mediaFinalAnual', () => {
    it('retorna null se todas as médias são null', () => {
      expect(mediaFinalAnual([null, null, null])).toBeNull()
    })
    it('calcula média das médias válidas', () => {
      expect(mediaFinalAnual([7, 8, 6])).toBe(7)
      expect(mediaFinalAnual([5, null, 7])).toBe(6)
    })
  })

  describe('mediaAprovacao', () => {
    it('retorna false para media null', () => {
      expect(mediaAprovacao(null)).toBe(false)
    })
    it('retorna true quando media >= 10 (default)', () => {
      expect(mediaAprovacao(10)).toBe(true)
      expect(mediaAprovacao(12)).toBe(true)
    })
    it('retorna false quando media < 10', () => {
      expect(mediaAprovacao(9.9)).toBe(false)
    })
  })

  describe('validarNota', () => {
    it('nota válida entre 0 e 20', () => {
      expect(validarNota(15)).toEqual({ valido: true })
      expect(validarNota(0)).toEqual({ valido: true })
      expect(validarNota(20)).toEqual({ valido: true })
    })
    it('nota inválida fora do range', () => {
      expect(validarNota(-1).valido).toBe(false)
      expect(validarNota(21).valido).toBe(false)
    })
    it('NaN é inválido', () => {
      expect(validarNota(NaN).valido).toBe(false)
    })
  })
})
