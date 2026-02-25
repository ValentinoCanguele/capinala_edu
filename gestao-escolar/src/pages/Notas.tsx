import { useState, useMemo, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useTurmas, usePeriodos, useNotas, useTurmaAlunos } from '@/data/escola/queries'
import PageHeader from '@/components/PageHeader'
import { TableSkeleton } from '@/components/PageSkeleton'
import { useSaveNotasBatch, useEnsurePeriodos } from '@/data/escola/mutations'

const TRIMESTRES = [1, 2, 3] as const

type Row = { alunoId: string; alunoNome: string; valor: number }

export default function Notas() {
  const [turmaId, setTurmaId] = useState<string>('')
  const [trimestre, setTrimestre] = useState<number | ''>('')

  const { data: turmas = [] } = useTurmas()
  const selectedTurma = turmas.find((t) => t.id === turmaId)
  const anoLetivoId = selectedTurma?.anoLetivoId ?? null
  const { data: periodos = [], refetch: refetchPeriodos } = usePeriodos(anoLetivoId)
  const ensurePeriodos = useEnsurePeriodos()
  const periodo = trimestre !== '' ? periodos.find((p) => p.numero === trimestre) : null
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
    if (!turmaId || trimestre === '') return
    const toSend = (localRows.length === rows.length ? localRows : rows).map((r) => ({
      alunoId: r.alunoId,
      valor: r.valor,
    }))
    saveNotas.mutate(
      { turmaId, bimestre: trimestre as number, notas: toSend },
      {
        onSuccess: () => toast.success('Notas guardadas.'),
        onError: (err) => toast.error(err.message),
      }
    )
  }

  const canSave = turmaId && trimestre !== '' && displayRows.length > 0
  const isLoading = alunosLoading || notasLoading

  return (
    <div>
      <PageHeader
        title="Notas"
        subtitle="Lançamento por turma e trimestre. Valores entre 0 e 20 (uma casa decimal opcional)."
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
          <label htmlFor="notas-trimestre" className="label">
            Trimestre
          </label>
          <select
            id="notas-trimestre"
            value={trimestre === '' ? '' : String(trimestre)}
            onChange={(e) => {
              setTrimestre(e.target.value ? Number(e.target.value) : '')
              setLocalRows([])
            }}
            className="input min-w-[120px]"
          >
            <option value="">Selecionar</option>
            {TRIMESTRES.map((t) => (
              <option key={t} value={t}>
                {t}º trimestre
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
              className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {saveNotas.isPending ? 'A guardar...' : 'Guardar notas'}
            </button>
          </div>
        )}
      </div>

      <div className="card">
        {!turmaId || trimestre === '' ? (
          <div className="p-8 text-center text-studio-foreground-lighter">
            Selecione uma turma e um trimestre para lançar notas.
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
                  Nota (0–20)
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
                      max={20}
                      step={0.5}
                      value={r.valor}
                      onChange={(e) =>
                        updateValor(
                          r.alunoId,
                          Math.min(20, Math.max(0, Number(e.target.value) || 0))
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
