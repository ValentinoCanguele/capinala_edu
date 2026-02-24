import type { Nota, Bimestre } from './types'
import { listTurmas } from './mockTurmas'
import { listAlunos } from './mockAlunos'

const notasMap = new Map<string, Nota>() // key: `${alunoId}-${turmaId}-${bimestre}`

function key(alunoId: string, turmaId: string, bimestre: Bimestre): string {
  return `${alunoId}-${turmaId}-${bimestre}`
}

export function getNotasByTurmaBimestre(
  turmaId: string,
  bimestre: Bimestre
): Promise<Nota[]> {
  const arr: Nota[] = []
  notasMap.forEach((n) => {
    if (n.turmaId === turmaId && n.bimestre === bimestre) arr.push({ ...n })
  })
  return Promise.resolve(arr)
}

export async function getNotasFormData(
  turmaId: string,
  bimestre: Bimestre
): Promise<{ alunoId: string; alunoNome: string; valor: number }[]> {
  const [turmas, alunos, notas] = await Promise.all([
    listTurmas(),
    listAlunos(),
    getNotasByTurmaBimestre(turmaId, bimestre),
  ])
  const turma = turmas.find((t) => t.id === turmaId)
  if (!turma) return []
  const byAluno = new Map(notas.map((n) => [n.alunoId, n.valor]))
  return turma.alunoIds.map((alunoId) => {
    const aluno = alunos.find((a) => a.id === alunoId)
    return {
      alunoId,
      alunoNome: aluno?.nome ?? '—',
      valor: byAluno.get(alunoId) ?? 0,
    }
  })
}

export function saveNotasBatch(
  turmaId: string,
  bimestre: Bimestre,
  items: { alunoId: string; valor: number }[]
): Promise<void> {
  items.forEach(({ alunoId, valor }) => {
    const k = key(alunoId, turmaId, bimestre)
    notasMap.set(k, { alunoId, turmaId, bimestre, valor })
  })
  return Promise.resolve()
}
