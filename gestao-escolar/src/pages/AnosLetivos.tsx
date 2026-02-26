import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useDebounce } from '@/hooks/useDebounce'
import { useQueryState } from '@/hooks/useQueryState'
import { useAuth } from '@/contexts/AuthContext'
import { isAdmin } from '@/lib/permissoes'
import { useAnosLetivos } from '@/data/escola/queries'
import {
  useCreateAnoLetivo,
  useUpdateAnoLetivo,
} from '@/data/escola/mutations'
import type { AnoLetivoFormValues } from '@/schemas/anoLetivo'
import Modal from '@/components/Modal'
import EmptyState from '@/components/EmptyState'
import PageHeader from '@/components/PageHeader'
import { TableSkeleton } from '@/components/PageSkeleton'

function AnoLetivoForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
}: {
  defaultValues: AnoLetivoFormValues | null
  onSubmit: (data: AnoLetivoFormValues) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [nome, setNome] = useState(defaultValues?.nome ?? '')
  const [dataInicio, setDataInicio] = useState(defaultValues?.dataInicio ?? '')
  const [dataFim, setDataFim] = useState(defaultValues?.dataFim ?? '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim() || !dataInicio || !dataFim) {
      toast.error('Preencha todos os campos.')
      return
    }
    onSubmit({ nome: nome.trim(), dataInicio, dataFim })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="al-nome" className="label">
          Nome
        </label>
        <input
          id="al-nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="input w-full"
          placeholder="Ex: 2024/2025"
          autoFocus
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="al-inicio" className="label">
            Data início
          </label>
          <input
            id="al-inicio"
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="input w-full"
          />
        </div>
        <div>
          <label htmlFor="al-fim" className="label">
            Data fim
          </label>
          <input
            id="al-fim"
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="input w-full"
          />
        </div>
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

export default function AnosLetivos() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterFromUrl, setFilterFromUrl] = useQueryState('q')
  const [filter, setFilter] = useState(() => searchParams.get('q') ?? '')
  const debouncedFilter = useDebounce(filter, 400)

  useEffect(() => {
    setFilter(filterFromUrl)
  }, [filterFromUrl])

  useEffect(() => {
    setFilterFromUrl(debouncedFilter)
  }, [debouncedFilter, setFilterFromUrl])

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

  const { data: anos = [], isLoading, error } = useAnosLetivos()
  const createAno = useCreateAnoLetivo()
  const updateAno = useUpdateAnoLetivo()

  const filtered = useMemo(
    () =>
      debouncedFilter
        ? anos.filter((a) =>
            a.nome.toLowerCase().includes(debouncedFilter.toLowerCase())
          )
        : anos,
    [anos, debouncedFilter]
  )

  const editing = editingId ? anos.find((a) => a.id === editingId) ?? null : null

  const handleCreate = () => {
    setEditingId(null)
    setModalOpen(true)
    setSearchParams({})
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
    setModalOpen(true)
  }

  const handleSubmit = (data: AnoLetivoFormValues) => {
    if (editingId) {
      updateAno.mutate(
        { id: editingId, ...data },
        {
          onSuccess: () => {
            toast.success('Ano letivo atualizado.')
            handleCloseModal()
          },
          onError: (err) => toast.error(err.message),
        }
      )
    } else {
      createAno.mutate(data, {
        onSuccess: () => {
          toast.success('Ano letivo criado.')
          handleCloseModal()
        },
        onError: (err) => toast.error(err.message),
      })
    }
  }

  const isFormLoading = createAno.isPending || updateAno.isPending

  return (
    <div>
      <PageHeader
        title="Anos letivos"
        subtitle="Gerir anos letivos e períodos."
        actions={
          isAdmin(user?.papel) ? (
            <button
              type="button"
              onClick={handleCreate}
              className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
            >
              Novo ano letivo
            </button>
          ) : undefined
        }
      />

      <div className="mb-4">
        <input
          type="search"
          placeholder="Pesquisar por nome..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input max-w-xs"
          aria-label="Pesquisar anos letivos por nome"
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Editar ano letivo' : 'Novo ano letivo'}
        size="md"
      >
        <AnoLetivoForm
          defaultValues={
            editing
              ? {
                  nome: editing.nome,
                  dataInicio: editing.dataInicio,
                  dataFim: editing.dataFim,
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
          <TableSkeleton rows={5} />
        ) : error ? (
          <div className="p-8 text-center text-red-600 dark:text-red-400" role="alert">
            Erro: {(error as Error).message}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title={filter ? 'Nenhum ano letivo encontrado' : 'Nenhum ano letivo registado'}
            description={filter ? 'Tente outro termo de pesquisa.' : (isAdmin(user?.papel) ? 'Clique em "Novo ano letivo" para começar.' : 'Ainda não há anos letivos.')}
            action={!filter && isAdmin(user?.papel) ? (
              <button
                type="button"
                onClick={handleCreate}
                className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
              >
                Novo ano letivo
              </button>
            ) : undefined}
          />
        ) : (
          <table className="min-w-full divide-y divide-studio-border" aria-label="Lista de anos letivos">
            <thead className="bg-studio-muted">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                  Nome
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                  Início
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                  Fim
                </th>
                {isAdmin(user?.papel) && (
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-studio-foreground-lighter uppercase">
                  Ações
                </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-studio-border">
              {filtered.map((a) => (
                <tr key={a.id} className="hover:bg-studio-muted/50">
                  <td className="px-4 py-3 text-sm text-studio-foreground">
                    {a.nome}
                  </td>
                  <td className="px-4 py-3 text-sm text-studio-foreground-light">
                    {a.dataInicio}
                  </td>
                  <td className="px-4 py-3 text-sm text-studio-foreground-light">
                    {a.dataFim}
                  </td>
                  {isAdmin(user?.papel) && (
                  <td className="px-4 py-3 text-right text-sm">
                    <button
                      type="button"
                      onClick={() => handleEdit(a.id)}
                      className="text-studio-brand hover:underline"
                    >
                      Editar
                    </button>
                  </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
