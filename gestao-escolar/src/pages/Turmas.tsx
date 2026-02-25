import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useTurmas, useTurmaAlunos, useAlunos } from '@/data/escola/queries'
import {
  useCreateTurma,
  useUpdateTurma,
  useDeleteTurma,
  useAddMatricula,
  useRemoveMatricula,
} from '@/data/escola/mutations'
import type { TurmaFormValues } from '@/schemas/turma'
import TurmaForm from '@/components/TurmaForm'
import Modal from '@/components/Modal'
import EmptyState from '@/components/EmptyState'
import PageHeader from '@/components/PageHeader'
import { TableSkeleton } from '@/components/PageSkeleton'

export default function Turmas() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [gerirTurmaId, setGerirTurmaId] = useState<string | null>(null)
  const [alunoToAdd, setAlunoToAdd] = useState('')

  useEffect(() => {
    if (searchParams.get('acao') === 'novo') {
      setEditingId(null)
      setFormOpen(true)
    }
  }, [searchParams])

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditingId(null)
    if (searchParams.get('acao') === 'novo') setSearchParams({})
  }

  const { data: turmas = [], isLoading, error } = useTurmas()
  const createTurma = useCreateTurma()
  const updateTurma = useUpdateTurma()
  const deleteTurma = useDeleteTurma()
  const addMatricula = useAddMatricula()
  const removeMatricula = useRemoveMatricula()

  const gerirTurma = gerirTurmaId ? turmas.find((t) => t.id === gerirTurmaId) ?? null : null
  const { data: turmaAlunos = [], isLoading: alunosLoading } = useTurmaAlunos(gerirTurmaId)
  const { data: todosAlunos = [] } = useAlunos()
  const alunosForaDaTurma = useMemo(() => {
    if (!gerirTurmaId) return []
    const idsInTurma = new Set(turmaAlunos.map((a) => a.alunoId))
    return todosAlunos.filter((a) => !idsInTurma.has(a.id))
  }, [gerirTurmaId, turmaAlunos, todosAlunos])

  const handleAddAluno = () => {
    if (!gerirTurmaId || !alunoToAdd) return
    addMatricula.mutate(
      { turmaId: gerirTurmaId, alunoId: alunoToAdd },
      {
        onSuccess: () => {
          toast.success('Aluno adicionado à turma.')
          setAlunoToAdd('')
        },
        onError: (err) => toast.error(err.message),
      }
    )
  }

  const handleRemoveAluno = (alunoId: string) => {
    if (!gerirTurmaId || !window.confirm('Remover este aluno da turma?')) return
    removeMatricula.mutate(
      { turmaId: gerirTurmaId, alunoId },
      {
        onSuccess: () => toast.success('Aluno removido da turma.'),
        onError: (err) => toast.error(err.message),
      }
    )
  }

  const editingTurma = editingId
    ? turmas.find((t) => t.id === editingId) ?? null
    : null

  const handleCreate = () => {
    setEditingId(null)
    setFormOpen(true)
    setSearchParams({})
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
    setFormOpen(true)
  }

  const handleSubmit = (data: TurmaFormValues) => {
    if (editingId) {
      updateTurma.mutate(
        { id: editingId, ...data, alunoIds: editingTurma?.alunoIds ?? [] },
        {
          onSuccess: () => {
            handleCloseForm()
            toast.success('Turma atualizada.')
          },
          onError: (err) => toast.error(err.message),
        }
      )
    } else {
      createTurma.mutate(
        { ...data, alunoIds: [] },
        {
          onSuccess: () => {
            handleCloseForm()
            toast.success('Turma criada.')
          },
          onError: (err) => toast.error(err.message),
        }
      )
    }
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('Eliminar esta turma?')) return
    deleteTurma.mutate(id, {
      onSuccess: () => toast.success('Turma eliminada.'),
      onError: (err) => toast.error(err.message),
    })
  }

  const isFormLoading = createTurma.isPending || updateTurma.isPending

  return (
    <div>
      <PageHeader
        title="Turmas"
        subtitle="Listagem e cadastro de turmas e matrículas."
        actions={
          <button
            type="button"
            onClick={handleCreate}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-studio-brand hover:bg-studio-brand-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
          >
            Nova turma
          </button>
        }
      />

      <Modal
        open={formOpen}
        onClose={handleCloseForm}
        title={editingId ? 'Editar turma' : 'Nova turma'}
      >
        <TurmaForm
          defaultValues={
            editingTurma
              ? { nome: editingTurma.nome, anoLetivo: editingTurma.anoLetivo }
              : undefined
          }
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          isLoading={isFormLoading}
        />
      </Modal>

      <Modal
        open={!!gerirTurmaId}
        onClose={() => {
          setGerirTurmaId(null)
          setAlunoToAdd('')
        }}
        title={gerirTurma ? `Gerir alunos — ${gerirTurma.nome}` : 'Gerir alunos'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="label">Adicionar aluno</label>
              <select
                value={alunoToAdd}
                onChange={(e) => setAlunoToAdd(e.target.value)}
                className="input w-full"
              >
                <option value="">Selecionar aluno</option>
                {alunosForaDaTurma.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleAddAluno}
              disabled={!alunoToAdd || addMatricula.isPending}
              className="px-4 py-2 rounded-md text-sm font-medium text-white bg-studio-brand hover:bg-studio-brand-hover disabled:opacity-50"
            >
              {addMatricula.isPending ? 'A adicionar...' : 'Adicionar'}
            </button>
          </div>
          <div>
            <h4 className="text-sm font-medium text-studio-foreground mb-2">
              Alunos na turma ({turmaAlunos.length})
            </h4>
            {alunosLoading ? (
              <div className="py-4 text-studio-foreground-lighter text-sm">A carregar...</div>
            ) : turmaAlunos.length === 0 ? (
              <p className="text-studio-foreground-light text-sm">Nenhum aluno. Use o campo acima para adicionar.</p>
            ) : (
              <ul className="border border-studio-border rounded-lg divide-y divide-studio-border max-h-64 overflow-y-auto">
                {turmaAlunos.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between px-3 py-2 hover:bg-studio-muted/50"
                  >
                    <span className="text-sm text-studio-foreground">{a.alunoNome}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAluno(a.alunoId)}
                      disabled={removeMatricula.isPending}
                      className="text-red-600 hover:underline text-sm"
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Modal>

      <div className="bg-studio-bg border border-studio-border rounded-lg overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            Erro: {(error as Error).message}
          </div>
        ) : turmas.length === 0 ? (
          <EmptyState
            title="Nenhuma turma registada"
            description={'Clique em "Nova turma" para começar.'}
            action={
              <button
                type="button"
                onClick={handleCreate}
                className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
              >
                Nova turma
              </button>
            }
          />
        ) : (
          <table className="min-w-full divide-y divide-studio-border">
            <thead className="bg-studio-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                  Ano letivo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                  N.º alunos
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-studio-foreground-lighter uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-studio-border">
              {turmas.map((t) => (
                <tr key={t.id} className="hover:bg-studio-muted/50">
                  <td className="px-4 py-3 text-sm text-studio-foreground">{t.nome}</td>
                  <td className="px-4 py-3 text-sm text-studio-foreground-light">{t.anoLetivo}</td>
                  <td className="px-4 py-3 text-sm text-studio-foreground-light">
                    {t.alunoIds?.length ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button
                      type="button"
                      onClick={() => setGerirTurmaId(t.id)}
                      className="text-studio-foreground-light hover:underline mr-3"
                    >
                      Gerir alunos
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEdit(t.id)}
                      className="text-studio-brand hover:underline mr-3"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(t.id)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
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
