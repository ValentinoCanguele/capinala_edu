import type { Turma } from './types'

let turmas: Turma[] = [
  { id: 't1', nome: '5º A', anoLetivo: '2024/2025', alunoIds: ['1', '2', '3'] },
  { id: 't2', nome: '5º B', anoLetivo: '2024/2025', alunoIds: [] },
]

let nextId = 3

export function listTurmas(): Promise<Turma[]> {
  return Promise.resolve(turmas.map((t) => ({ ...t, alunoIds: [...t.alunoIds] })))
}

export function getTurma(id: string): Promise<Turma | null> {
  const turma = turmas.find((t) => t.id === id)
  if (!turma) return Promise.resolve(null)
  return Promise.resolve({ ...turma, alunoIds: [...turma.alunoIds] })
}

export function createTurma(data: Omit<Turma, 'id'>): Promise<Turma> {
  const turma: Turma = { ...data, id: `t${nextId++}`, alunoIds: data.alunoIds ?? [] }
  turmas.push(turma)
  return Promise.resolve({ ...turma, alunoIds: [...turma.alunoIds] })
}

export function updateTurma(id: string, data: Partial<Omit<Turma, 'id'>>): Promise<Turma | null> {
  const index = turmas.findIndex((t) => t.id === id)
  if (index === -1) return Promise.resolve(null)
  const next = { ...turmas[index], ...data, id }
  if (data.alunoIds) next.alunoIds = data.alunoIds
  turmas[index] = next
  return Promise.resolve({ ...turmas[index], alunoIds: [...turmas[index].alunoIds] })
}

export function deleteTurma(id: string): Promise<boolean> {
  const len = turmas.length
  turmas = turmas.filter((t) => t.id !== id)
  return Promise.resolve(turmas.length < len)
}
