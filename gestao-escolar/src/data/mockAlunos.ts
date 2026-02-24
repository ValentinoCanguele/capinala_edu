import type { Aluno } from './types'

let alunos: Aluno[] = [
  { id: '1', nome: 'Ana Silva', email: 'ana.silva@email.com', dataNascimento: '2010-05-15' },
  { id: '2', nome: 'Bruno Costa', email: 'bruno.costa@email.com', dataNascimento: '2009-08-22' },
  { id: '3', nome: 'Carla Mendes', email: 'carla.mendes@email.com', dataNascimento: '2010-01-10' },
]

let nextId = 4

export function listAlunos(): Promise<Aluno[]> {
  return Promise.resolve([...alunos])
}

export function getAluno(id: string): Promise<Aluno | null> {
  const aluno = alunos.find((a) => a.id === id) ?? null
  return Promise.resolve(aluno ? { ...aluno } : null)
}

export function createAluno(data: Omit<Aluno, 'id'>): Promise<Aluno> {
  const aluno: Aluno = { ...data, id: String(nextId++) }
  alunos.push(aluno)
  return Promise.resolve({ ...aluno })
}

export function updateAluno(id: string, data: Partial<Omit<Aluno, 'id'>>): Promise<Aluno | null> {
  const index = alunos.findIndex((a) => a.id === id)
  if (index === -1) return Promise.resolve(null)
  alunos[index] = { ...alunos[index], ...data, id }
  return Promise.resolve({ ...alunos[index] })
}

export function deleteAluno(id: string): Promise<boolean> {
  const len = alunos.length
  alunos = alunos.filter((a) => a.id !== id)
  return Promise.resolve(alunos.length < len)
}
