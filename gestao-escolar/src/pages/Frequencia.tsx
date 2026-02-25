import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useTurmas, useDisciplinas, useTurmaAlunos, useFrequencia } from '@/data/escola/queries'
import { TableSkeleton } from '@/components/PageSkeleton'
import PageHeader from '@/components/PageHeader'
import { useCreateAula, useSaveFrequencia } from '@/data/escola/mutations'

type Status = 'presente' | 'falta' | 'justificada'

type Row = { alunoId: string; alunoNome: string; status: Status }

export default function Frequencia() {
  const [searchParams] = useSearchParams()
  const vistaRelatorio = searchParams.get('vista') === 'relatorio'

  const [turmaId, setTurmaId] = useState('')
  const [dataAula, setDataAula] = useState('')
  const [disciplinaId, setDisciplinaId] = useState('')
  const [aulaId, setAulaId] = useState<string | null>(null)

  const { data: turmas = [] } = useTurmas()
  const { data: disciplinas = [] } = useDisciplinas()
  const { data: turmaAlunos = [] } = useTurmaAlunos(turmaId || null)
  const { data: frequenciaRows = [] } = useFrequencia(aulaId)

  const createAula = useCreateAula()
  const saveFrequencia = useSaveFrequencia()

  const rows: Row[] = useMemo(() => {
    const byAluno = new Map(frequenciaRows.map((f) => [f.alunoId, f.status as Status]))
    if (byAluno.size > 0) {
      return turmaAlunos.map((a) => ({
        alunoId: a.alunoId,
        alunoNome: a.alunoNome,
        status: byAluno.get(a.alunoId) ?? 'presente',
      }))
    }
    return turmaAlunos.map((a) => ({
      alunoId: a.alunoId,
      alunoNome: a.alunoNome,
      status: 'presente' as Status,
    }))
  }, [turmaAlunos, frequenciaRows])

  const [localRows, setLocalRows] = useState<Row[]>([])
  useEffect(() => {
    setLocalRows(rows)
  }, [rows])

  const canLoadAula = turmaId && dataAula && disciplinaId
  useEffect(() => {
    if (!canLoadAula) {
      setAulaId(null)
      return
    }
    createAula.mutate(
      { turmaId, disciplinaId, dataAula },
      {
        onSuccess: (data) => setAulaId(data?.aulaId ?? null),
        onError: () => setAulaId(null),
      }
    )
  }, [turmaId, dataAula, disciplinaId])

  const handleStatusChange = (alunoId: string, status: Status) => {
    setLocalRows((prev) =>
      prev.map((r) => (r.alunoId === alunoId ? { ...r, status } : r))
    )
  }

  const handleSave = () => {
    if (!aulaId) return
    saveFrequencia.mutate(
      {
        aulaId,
        items: localRows.map((r) => ({ alunoId: r.alunoId, status: r.status })),
      },
      {
        onSuccess: () => toast.success('Frequência guardada.'),
        onError: (err) => toast.error(err.message),
      }
    )
  }

  const displayRows = localRows.length > 0 ? localRows : rows
  const isLoading = createAula.isPending

  if (vistaRelatorio) {
    return (
      <div>
        <PageHeader
          title="Relatório de frequência"
          subtitle="Visão consolidada de presenças e faltas por turma ou período."
        />
        <div className="card p-8 text-center">
          <p className="text-studio-foreground-light">
            O relatório de frequência estará disponível em breve. Poderá filtrar por ano letivo, turma e período.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Frequência"
        subtitle="Chamada por turma, data e disciplina."
      />

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label htmlFor="freq-turma" className="label">Turma</label>
          <select
            id="freq-turma"
            value={turmaId}
            onChange={(e) => setTurmaId(e.target.value)}
            className="input min-w-[140px]"
            aria-label="Selecionar turma"
          >
            <option value="">Selecionar</option>
            {turmas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome} ({t.anoLetivo})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="freq-data" className="label">Data</label>
          <input
            id="freq-data"
            type="date"
            value={dataAula}
            onChange={(e) => setDataAula(e.target.value)}
            className="input min-w-[140px]"
            aria-label="Data da aula"
          />
        </div>
        <div>
          <label htmlFor="freq-disc" className="label">Disciplina</label>
          <select
            id="freq-disc"
            value={disciplinaId}
            onChange={(e) => setDisciplinaId(e.target.value)}
            className="input min-w-[160px]"
            aria-label="Selecionar disciplina"
          >
            <option value="">Selecionar</option>
            {disciplinas.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </select>
        </div>
        {aulaId && displayRows.length > 0 && (
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saveFrequencia.isPending}
              className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {saveFrequencia.isPending ? 'A guardar...' : 'Guardar frequência'}
            </button>
          </div>
        )}
      </div>

      <div className="card">
        {!canLoadAula ? (
          <div className="p-8 text-center text-studio-foreground-lighter">
            Selecione turma, data e disciplina.
          </div>
        ) : isLoading ? (
          <TableSkeleton rows={8} />
        ) : displayRows.length === 0 ? (
          <div className="p-8 text-center text-studio-foreground-lighter">
            Esta turma não tem alunos matriculados.
          </div>
        ) : (
          <table
            className="min-w-full divide-y divide-studio-border"
            aria-label="Presenças por aluno"
          >
            <caption className="sr-only">
              Lista de alunos com estado de presença (presente, falta, justificada)
            </caption>
            <thead className="bg-studio-muted">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                  Aluno
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-studio-border">
              {displayRows.map((r) => (
                <tr key={r.alunoId} className="hover:bg-studio-muted">
                  <td className="px-4 py-3 text-sm text-studio-foreground">{r.alunoNome}</td>
                  <td className="px-4 py-3">
                    <select
                      value={r.status}
                      onChange={(e) =>
                        handleStatusChange(r.alunoId, e.target.value as Status)
                      }
                      className="input w-32"
                      aria-label={`Presença de ${r.alunoNome}`}
                    >
                      <option value="presente">Presente</option>
                      <option value="falta">Falta</option>
                      <option value="justificada">Justificada</option>
                    </select>
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
