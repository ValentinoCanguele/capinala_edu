import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  useTurmas,
  useDisciplinas,
  useTurmaAlunos,
  useFrequencia,
  useRelatorioFrequenciaTurma,
} from '@/data/escola/queries'
import PageHeader from '@/components/PageHeader'
import { TableSkeleton } from '@/components/PageSkeleton'
import { useCreateAula, useSaveFrequencia } from '@/data/escola/mutations'

type Status = 'presente' | 'falta' | 'justificada'

type Row = { alunoId: string; alunoNome: string; status: Status }

function FrequenciaRelatorio() {
  const [turmaId, setTurmaId] = useState('')
  const { data: turmas = [] } = useTurmas()
  const { data: relatorio, isLoading } = useRelatorioFrequenciaTurma(
    turmaId || null
  )

  return (
    <div>
      <PageHeader
        title="Relatório de frequência"
        subtitle="Visão consolidada de presenças e faltas por turma."
        actions={
          <Link
            to="/frequencia"
            className="text-sm text-studio-brand hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 rounded px-2 py-1"
          >
            ← Chamada (registar aula)
          </Link>
        }
      />

      <div className="mb-6">
        <label htmlFor="relatorio-turma" className="label">
          Turma
        </label>
        <select
          id="relatorio-turma"
          value={turmaId}
          onChange={(e) => setTurmaId(e.target.value)}
          className="input min-w-[200px]"
        >
          <option value="">Selecionar turma</option>
          {turmas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome} ({t.anoLetivo})
            </option>
          ))}
        </select>
      </div>

      <div className="card">
        {!turmaId ? (
          <div className="p-8 text-center text-studio-foreground-lighter">
            Selecione uma turma para ver o resumo de frequência.
          </div>
        ) : isLoading ? (
          <TableSkeleton rows={8} />
        ) : !relatorio ? (
          <div className="p-8 text-center text-studio-foreground-lighter">
            Sem dados para esta turma.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="px-4 py-3 border-b border-studio-border bg-studio-muted flex flex-wrap items-center justify-between gap-4">
              <span className="font-medium text-studio-foreground">
                {relatorio.turmaNome}
              </span>
              <span className="text-sm text-studio-foreground-light">
                Média de presença: <strong>{relatorio.mediaPresenca}%</strong>
                {relatorio.totalEmRisco > 0 && (
                  <span className="ml-2 text-amber-600">
                    · {relatorio.totalEmRisco} em risco (&lt;75%)
                  </span>
                )}
              </span>
            </div>
            <table className="min-w-full divide-y divide-studio-border">
              <thead className="bg-studio-muted">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                    Aluno
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-studio-foreground-lighter uppercase">
                    Aulas
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-studio-foreground-lighter uppercase">
                    Presenças
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-studio-foreground-lighter uppercase">
                    Faltas
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-studio-foreground-lighter uppercase">
                    %
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-studio-border">
                {relatorio.resumos.map((r) => (
                  <tr
                    key={r.alunoId}
                    className={
                      r.emRisco
                        ? 'bg-amber-50/50 hover:bg-amber-50/70'
                        : 'hover:bg-studio-muted/50'
                    }
                  >
                    <td className="px-4 py-2 text-sm text-studio-foreground">
                      {r.alunoNome}
                    </td>
                    <td className="px-4 py-2 text-sm text-studio-foreground-light text-right">
                      {r.totalAulas}
                    </td>
                    <td className="px-4 py-2 text-sm text-studio-foreground-light text-right">
                      {r.presencas}
                    </td>
                    <td className="px-4 py-2 text-sm text-studio-foreground-light text-right">
                      {r.faltas}
                    </td>
                    <td className="px-4 py-2 text-sm text-right tabular-nums">
                      {r.percentagemPresenca}%
                    </td>
                    <td className="px-4 py-2">
                      {r.emRisco ? (
                        <span className="text-amber-600 text-sm font-medium">
                          Em risco
                        </span>
                      ) : (
                        <span className="text-studio-foreground-lighter text-sm">
                          Normal
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

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

  const canLoadAula = Boolean(turmaId && dataAula && disciplinaId)

  useEffect(() => {
    if (!canLoadAula) setAulaId(null)
  }, [canLoadAula, turmaId, dataAula, disciplinaId])

  const handleCarregarAula = () => {
    if (!canLoadAula) return
    createAula.mutate(
      { turmaId, disciplinaId, dataAula },
      {
        onSuccess: (data) => setAulaId(data?.aulaId ?? null),
        onError: (err) => {
          setAulaId(null)
          toast.error(err.message)
        },
      }
    )
  }

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
    return <FrequenciaRelatorio />
  }

  return (
    <div>
      <PageHeader
        title="Frequência"
        subtitle="Chamada por turma, data e disciplina."
        actions={
          <Link
            to="/frequencia?vista=relatorio"
            className="text-sm text-studio-brand hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 rounded px-2 py-1"
          >
            Ver relatório por turma →
          </Link>
        }
      />

      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <label className="label">Turma</label>
          <select
            value={turmaId}
            onChange={(e) => setTurmaId(e.target.value)}
            className="input min-w-[140px]"
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
          <label className="label">Data</label>
          <input
            type="date"
            value={dataAula}
            onChange={(e) => setDataAula(e.target.value)}
            className="input min-w-[140px]"
          />
        </div>
        <div>
          <label className="label">Disciplina</label>
          <select
            value={disciplinaId}
            onChange={(e) => setDisciplinaId(e.target.value)}
            className="input min-w-[160px]"
          >
            <option value="">Selecionar</option>
            {disciplinas.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </select>
        </div>
        {canLoadAula && !aulaId && (
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleCarregarAula}
              disabled={createAula.isPending}
              className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {createAula.isPending ? 'A carregar...' : 'Carregar aula'}
            </button>
          </div>
        )}
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
            Selecione turma, data e disciplina e clique em &quot;Carregar aula&quot;.
          </div>
        ) : canLoadAula && !aulaId && !createAula.isPending ? (
          <div className="p-8 text-center text-studio-foreground-light">
            Clique em <strong>Carregar aula</strong> acima para abrir a lista de alunos e registar presenças.
          </div>
        ) : isLoading ? (
          <TableSkeleton rows={8} />
        ) : displayRows.length === 0 ? (
          <div className="p-8 text-center text-studio-foreground-lighter">
            Esta turma não tem alunos matriculados.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-studio-border">
            <thead className="bg-studio-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                  Aluno
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
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
