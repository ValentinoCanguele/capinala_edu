export interface Aluno {
  id: string
  nome: string
  email: string
  dataNascimento: string
}

export interface Turma {
  id: string
  nome: string
  anoLetivo: string
  alunoIds: string[]
}

export type Bimestre = 1 | 2 | 3 | 4

export interface Nota {
  id?: string
  alunoId: string
  turmaId: string
  bimestre: Bimestre
  valor: number
}
