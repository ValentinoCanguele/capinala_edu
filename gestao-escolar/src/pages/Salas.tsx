import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useSalas } from '@/data/escola/queries'
import {
  useCreateSala,
  useUpdateSala,
  useDeleteSala,
} from '@/data/escola/mutations'
import type { SalaFormValues } from '@/schemas/sala'
import Modal from '@/components/Modal'
import EmptyState from '@/components/EmptyState'

function SalaForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
}: {
  defaultValues: SalaFormValues | null
  onSubmit: (data: SalaFormValues) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [nome, setNome] = useState(defaultValues?.nome ?? '')
  const [capacidade, setCapacidade] = useState(
    defaultValues?.capacidade != null ? String(defaultValues.capacidade) : ''
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) {
      toast.error('Nome é obrigatório.')
      return
    }
    onSubmit({
      nome: nome.trim(),
      capacidade: capacidade === '' ? undefined : Number(capacidade) || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="sala-nome" className="label">
          Nome
        </label>
        <input
          id="sala-nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="input w-full"
          placeholder="Ex: Sala 1"
          autoFocus
        />
      </div>
      <div>
        <label htmlFor="sala-cap" className="label">
          Capacidade (opcional)
        </label>
        <input
          id="sala-cap"
          type="number"
          min={0}
          value={capacidade}
          onChange={(e) => setCapacidade(e.target.value)}
          className="input w-full"
          placeholder="Nº de lugares"
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

export default function Salas() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState('')

  const { data: salas = [], isLoading, error } = useSalas()
  const createSala = useCreateSala()
  const updateSala = useUpdateSala()
  const deleteSala = useDeleteSala()

  const filtered = useMemo(
    () =>
      filter
        ? salas.filter((s) =>
            s.nome.toLowerCase().includes(filter.toLowerCase())
          )
        : salas,
    [salas, filter]
  )

  const editing = editingId ? salas.find((s) => s.id === editingId) ?? null : null

  const handleCreate = () => {
    setEditingId(null)
    setModalOpen(true)
    setSearchParams({})
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
    setModalOpen(true)
  }

  const handleSubmit = (data: SalaFormValues) => {
    if (editingId) {
      updateSala.mutate(
        {
          id: editingId,
          nome: data.nome,
          capacidade: data.capacidade ?? undefined,
        },
        {
          onSuccess: () => {
            toast.success('Sala atualizada.')
            setModalOpen(false)
            setEditingId(null)
          },
          onError: (err) => toast.error(err.message),
        }
      )
    } else {
      createSala.mutate(
        { nome: data.nome, capacidade: data.capacidade ?? undefined },
        {
          onSuccess: () => {
            toast.success('Sala criada.')
            handleCloseModal()
          },
          onError: (err) => toast.error(err.message),
        }
      )
    }
  }

  const handleDelete = (id: string, nome: string) => {
    if (!window.confirm(`Eliminar a sala "${nome}"?`)) return
    deleteSala.mutate(id, {
      onSuccess: () => toast.success('Sala eliminada.'),
      onError: (err) => toast.error(err.message),
    })
  }

  const isFormLoading = createSala.isPending || updateSala.isPending

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-studio-foreground">
            Salas
          </h2>
          <p className="text-studio-foreground-light text-sm mt-0.5">
            Gerir salas e capacidade para horários.
          </p>
        </div>
        <button
          type="button"
          onClick={handleCreate}
          className="px-4 py-2 rounded-md text-sm font-medium text-white bg-studio-brand hover:bg-studio-brand-hover"
        >
          Nova sala
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
        title={editingId ? 'Editar sala' : 'Nova sala'}
      >
        <SalaForm
          defaultValues={
            editing
              ? {
                  nome: editing.nome,
                  capacidade: editing.capacidade ?? undefined,
                }
              : null
          }
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
          <EmptyState
            title={filter ? 'Nenhuma sala encontrada' : 'Nenhuma sala registada'}
            description={filter ? 'Tente outro termo de pesquisa.' : 'Clique em "Nova sala" para começar.'}
            action={!filter ? (
              <button
                type="button"
                onClick={handleCreate}
                className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
              >
                Nova sala
              </button>
            ) : undefined}
          />
        ) : (
          <table className="min-w-full divide-y divide-studio-border">
            <thead className="bg-studio-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                  Capacidade
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-studio-foreground-lighter uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-studio-border">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-studio-muted/50">
                  <td className="px-4 py-3 text-sm text-studio-foreground">
                    {s.nome}
                  </td>
                  <td className="px-4 py-3 text-sm text-studio-foreground-light">
                    {s.capacidade != null ? `${s.capacidade} lugares` : '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button
                      type="button"
                      onClick={() => handleEdit(s.id)}
                      className="text-studio-brand hover:underline mr-3"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(s.id, s.nome)}
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
