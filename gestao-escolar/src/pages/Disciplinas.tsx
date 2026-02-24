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
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={isLoading}>
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-studio-foreground">
            Disciplinas
          </h2>
          <p className="text-studio-foreground-light text-sm mt-0.5">
            Gerir disciplinas da escola.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="px-4 py-2 rounded-md text-sm font-medium text-white bg-studio-brand hover:bg-studio-brand-hover"
        >
          Nova disciplina
        </button>
      </div>

      <div className="mb-4">
        <input
          type="search"
          placeholder="Pesquisar por nome..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input max-w-xs"
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
          <div className="p-8 text-center text-studio-foreground-lighter">
            A carregar...
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">
            Erro: {(error as Error).message}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-studio-foreground-lighter">
            {filter ? 'Nenhuma disciplina encontrada.' : 'Nenhuma disciplina registada.'}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-studio-border">
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
                      className="text-studio-brand hover:underline mr-3"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(d.id, d.nome)}
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
