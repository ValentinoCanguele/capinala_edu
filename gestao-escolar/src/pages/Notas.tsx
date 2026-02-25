import { useState, useMemo, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useTurmas, usePeriodos, useNotas, useTurmaAlunos } from '@/data/escola/queries'
import PageHeader from '@/components/PageHeader'
import { TableSkeleton } from '@/components/PageSkeleton'
import { useSaveNotasBatch, useEnsurePeriodos } from '@/data/escola/mutations'

const BIMESTRES = [1, 2, 3, 4] as const

type Row = { alunoId: string; alunoNome: string; valor: number }

export default function Notas() {
  const [turmaId, setTurmaId] = useState<string>('')
  const [bimestre, setBimestre] = useState<number | ''>('')

  const { data: turmas = [] } = useTurmas()
  const selectedTurma = turmas.find((t) => t.id === turmaId)
  const anoLetivoId = selectedTurma?.anoLetivoId ?? null
  const { data: periodos = [], refetch: refetchPeriodos } = usePeriodos(anoLetivoId)
  const ensurePeriodos = useEnsurePeriodos()
  const periodo = bimestre !== '' ? periodos.find((p) => p.numero === bimestre) : null
  const periodoId = periodo?.id ?? null

  useEffect(() => {
    if (anoLetivoId && periodos.length === 0 && !ensurePeriodos.isPending) {
      ensurePeriodos.mutate(anoLetivoId, {
        onSuccess: () => refetchPeriodos(),
      })
    }
  }, [anoLetivoId, periodos.length])

  const { data: notasRows = [], isLoading: notasLoading } = useNotas(turmaId || null, periodoId)
  const { data: turmaAlunos = [], isLoading: alunosLoading } = useTurmaAlunos(turmaId || null)

  const rows: Row[] = useMemo(() => {
    if (!turmaId) return []
    const byAluno = new Map(notasRows.map((n) => [n.alunoId, n.valor]))
    return turmaAlunos.map((a) => ({
      alunoId: a.alunoId,
      alunoNome: a.alunoNome,
      valor: byAluno.get(a.alunoId) ?? 0,
    }))
  }, [turmaId, turmaAlunos, notasRows])

  const [localRows, setLocalRows] = useState<Row[]>([])
  useEffect(() => {
    setLocalRows(rows)
  }, [rows])

  const displayRows = localRows.length > 0 ? localRows : rows

  const updateValor = (alunoId: string, valor: number) => {
    setLocalRows((prev) =>
      prev.map((r) => (r.alunoId === alunoId ? { ...r, valor } : r))
    )
  }

  const saveNotas = useSaveNotasBatch()

  const handleSave = () => {
    if (!turmaId || bimestre === '') return
    const toSend = (localRows.length === rows.length ? localRows : rows).map((r) => ({
      alunoId: r.alunoId,
      valor: r.valor,
    }))
    saveNotas.mutate(
      { turmaId, bimestre: bimestre as number, notas: toSend },
      {
        onSuccess: () => toast.success('Notas guardadas.'),
        onError: (err) => toast.error(err.message),
      }
    )
  }

  const canSave = turmaId && bimestre !== '' && displayRows.length > 0
  const isLoading = alunosLoading || notasLoading

  return (
    <div>
      <PageHeader
        title="Notas"
        subtitle="Lançamento por turma e bimestre. Valores entre 0 e 10 (uma casa decimal opcional)."
      />

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label htmlFor="notas-turma" className="label">
            Turma
          </label>
          <select
            id="notas-turma"
            value={turmaId}
            onChange={(e) => {
              setTurmaId(e.target.value)
              setLocalRows([])
            }}
            className="input min-w-[140px]"
          >
            <option value="">Selecionar turma</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome} ({t.anoLetivo})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="notas-bimestre" className="label">
            Bimestre
          </label>
          <select
            id="notas-bimestre"
            value={bimestre === '' ? '' : String(bimestre)}
            onChange={(e) => {
              setBimestre(e.target.value ? Number(e.target.value) : '')
              setLocalRows([])
            }}
            className="input min-w-[120px]"
          >
            <option value="">Selecionar</option>
            {BIMESTRES.map((b) => (
              <option key={b} value={b}>
                {b}º bimestre
              </option>
            ))}
          </select>
        </div>
        {canSave && (
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saveNotas.isPending}
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-studio-brand hover:bg-studio-brand-hover disabled:opacity-50"
            >
              {saveNotas.isPending ? 'A guardar...' : 'Guardar notas'}
            </button>
          </div>
        )}
      </div>

      <div className="card">
        {!turmaId || bimestre === '' ? (
          <div className="p-8 text-center text-studio-foreground-lighter">
            Selecione uma turma e um bimestre para lançar notas.
          </div>
        ) : isLoading ? (
          <TableSkeleton rows={8} />
        ) : displayRows.length === 0 ? (
          <div className="p-8 text-center text-studio-foreground-lighter">
            Esta turma não tem alunos. Adicione alunos à turma em Turmas.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-studio-border">
            <thead className="bg-studio-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                  Aluno
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase w-28">
                  Nota (0–10)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-studio-border">
              {displayRows.map((r) => (
                <tr key={r.alunoId} className="hover:bg-studio-muted">
                  <td className="px-4 py-3 text-sm text-studio-foreground">{r.alunoNome}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      max={10}
                      step={0.5}
                      value={r.valor}
                      onChange={(e) =>
                        updateValor(
                          r.alunoId,
                          Math.min(10, Math.max(0, Number(e.target.value) || 0))
                        )
                      }
                      className="input w-20 px-2 py-1.5"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
