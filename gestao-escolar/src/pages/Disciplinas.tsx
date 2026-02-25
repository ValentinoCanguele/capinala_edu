import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useDisciplinas } from '@/data/escola/queries'
import {
  useCreateDisciplina,
  useUpdateDisciplina,
  useDeleteDisciplina,
} from '@/data/escola/mutations'
import type { DisciplinaFormValues } from '@/schemas/disciplina'
import Modal from '@/components/Modal'
import EmptyState from '@/components/EmptyState'
import ListResultSummary from '@/components/ListResultSummary'
import PageHeader from '@/components/PageHeader'
import { TableSkeleton } from '@/components/PageSkeleton'

function DisciplinaForm({
  defaultNome,
  onSubmit,
  onCancel,
  isLoading,
}: {
  defaultNome: string
  onSubmit: (data: DisciplinaFormValues) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [nome, setNome] = useState(defaultNome)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    onSubmit({ nome: nome.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="disc-nome" className="label">
          Nome
        </label>
        <input
          id="disc-nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="input w-full"
          placeholder="Ex: Matemática"
          autoFocus
        />
      </div>
      <div className="flex gap-2 justify-end pt-4 mt-4 border-t border-studio-border">
        <button type="button" onClick={onCancel} className="btn-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2">
          Cancelar
        </button>
        <button type="submit" className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 disabled:opacity-50" disabled={isLoading}>
          {isLoading ? 'A guardar...' : 'Guardar'}
        </button>
      </div>
    </form>
  )
}

export default function Disciplinas() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    if (searchParams.get('acao') === 'novo') {
      setEditingId(null)
      setModalOpen(true)
    }
  }, [searchParams])

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingId(null)
    if (searchParams.get('acao') === 'novo') setSearchParams({})
  }

  const { data: disciplinas = [], isLoading, error } = useDisciplinas()
  const createDisc = useCreateDisciplina()
  const updateDisc = useUpdateDisciplina()
  const deleteDisc = useDeleteDisciplina()

  const filtered = useMemo(
    () =>
      filter
        ? disciplinas.filter((d) =>
            d.nome.toLowerCase().includes(filter.toLowerCase())
          )
        : disciplinas,
    [disciplinas, filter]
  )

  const editing = editingId
    ? disciplinas.find((d) => d.id === editingId) ?? null
    : null

  const handleCreate = () => {
    setEditingId(null)
    setModalOpen(true)
    setSearchParams({})
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
    setModalOpen(true)
  }

  const handleSubmit = (data: DisciplinaFormValues) => {
    if (editingId) {
      updateDisc.mutate(
        { id: editingId, ...data },
        {
          onSuccess: () => {
            toast.success('Disciplina atualizada.')
            handleCloseModal()
          },
          onError: (err) => toast.error(err.message),
        }
      )
    } else {
      createDisc.mutate(data, {
        onSuccess: () => {
          toast.success('Disciplina criada.')
          handleCloseModal()
        },
        onError: (err) => toast.error(err.message),
      })
    }
  }

  const handleDelete = (id: string, nome: string) => {
    if (!window.confirm(`Eliminar a disciplina "${nome}"?`)) return
    deleteDisc.mutate(id, {
      onSuccess: () => toast.success('Disciplina eliminada.'),
      onError: (err) => toast.error(err.message),
    })
  }

  const isFormLoading = createDisc.isPending || updateDisc.isPending

  return (
    <div>
      <PageHeader
        title="Disciplinas"
        subtitle="Gerir disciplinas da escola."
        actions={
          <button
            type="button"
            onClick={handleCreate}
            className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
          >
            Nova disciplina
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <input
          type="search"
          placeholder="Pesquisar por nome..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input max-w-xs"
          aria-label="Pesquisar disciplinas por nome"
        />
        <ListResultSummary
          count={filtered.length}
          total={disciplinas.length}
          label="disciplina"
          hasFilter={filter.length > 0}
          onClearFilter={() => setFilter('')}
          isLoading={isLoading}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Editar disciplina' : 'Nova disciplina'}
      >
        <DisciplinaForm
          defaultNome={editing?.nome ?? ''}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isLoading={isFormLoading}
        />
      </Modal>

      <div className="card overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : error ? (
          <div className="p-8 text-center text-red-600" role="alert">
            Erro: {(error as Error).message}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={filter ? 'Nenhuma disciplina encontrada' : 'Nenhuma disciplina registada'}
            description={filter ? 'Tente outro termo de pesquisa.' : 'Clique em "Nova disciplina" para começar.'}
            action={!filter ? (
              <button
                type="button"
                onClick={handleCreate}
                className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
              >
                Nova disciplina
              </button>
            ) : undefined}
          />
        ) : (
          <table className="min-w-full divide-y divide-studio-border" aria-label="Lista de disciplinas">
            <caption className="sr-only">Disciplinas com nome e ações</caption>
            <thead className="bg-studio-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                  Nome
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-studio-foreground-lighter uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-studio-border">
              {filtered.map((d) => (
                <tr key={d.id} className="hover:bg-studio-muted/50">
                  <td className="px-4 py-3 text-sm text-studio-foreground">
                    {d.nome}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button
                      type="button"
                      onClick={() => handleEdit(d.id)}
                      className="link-action link-action-primary mr-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-1 rounded px-1"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(d.id, d.nome)}
                      className="link-action link-action-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 rounded px-1"
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
