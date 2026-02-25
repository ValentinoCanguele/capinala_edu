import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useCategoriasFinancas } from '@/data/escola/queries'
import type { CategoriaFinanceira } from '@/data/escola/queries'
import {
  useCreateCategoriaFinanceira,
  useUpdateCategoriaFinanceira,
  useDeleteCategoriaFinanceira,
} from '@/data/escola/mutations'
import type { CategoriaFinanceiraInput } from '@/data/escola/mutations'
import Modal from '@/components/Modal'
import EmptyState from '@/components/EmptyState'
import ListResultSummary from '@/components/ListResultSummary'
import PageHeader from '@/components/PageHeader'
import { TableSkeleton } from '@/components/PageSkeleton'

function CategoriaForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
}: {
  defaultValues: CategoriaFinanceiraInput
  onSubmit: (data: CategoriaFinanceiraInput) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [nome, setNome] = useState(defaultValues.nome)
  const [tipo, setTipo] = useState<'receita' | 'despesa'>(defaultValues.tipo)
  const [ordem, setOrdem] = useState(String(defaultValues.ordem ?? 0))
  const [ativo, setAtivo] = useState(defaultValues.ativo ?? true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    onSubmit({
      nome: nome.trim(),
      tipo,
      ordem: parseInt(ordem, 10) || 0,
      ativo,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="cat-nome" className="label">
          Nome
        </label>
        <input
          id="cat-nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="input w-full"
          placeholder="Ex: Mensalidade"
          autoFocus
        />
      </div>
      <div>
        <label htmlFor="cat-tipo" className="label">
          Tipo
        </label>
        <select
          id="cat-tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as 'receita' | 'despesa')}
          className="input w-full"
        >
          <option value="receita">Receita</option>
          <option value="despesa">Despesa</option>
        </select>
      </div>
      <div>
        <label htmlFor="cat-ordem" className="label">
          Ordem
        </label>
        <input
          id="cat-ordem"
          type="number"
          min={0}
          value={ordem}
          onChange={(e) => setOrdem(e.target.value)}
          className="input w-full"
          placeholder="0"
        />
        <p className="text-xs text-studio-foreground-lighter mt-1">
          Ordem de exibição na lista (menor = primeiro).
        </p>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="cat-ativo"
          type="checkbox"
          checked={ativo}
          onChange={(e) => setAtivo(e.target.checked)}
          className="rounded border-studio-border"
        />
        <label htmlFor="cat-ativo" className="label mb-0">
          Ativo
        </label>
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

export default function FinancasCategorias() {
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

  const { data: categorias = [], isLoading, error } = useCategoriasFinancas()
  const createCat = useCreateCategoriaFinanceira()
  const updateCat = useUpdateCategoriaFinanceira()
  const deleteCat = useDeleteCategoriaFinanceira()

  const filtered = useMemo(
    () =>
      filter
        ? categorias.filter((c) =>
            c.nome.toLowerCase().includes(filter.toLowerCase())
          )
        : categorias,
    [categorias, filter]
  )

  const editing: CategoriaFinanceira | null = editingId
    ? categorias.find((c) => c.id === editingId) ?? null
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

  const handleSubmit = (data: CategoriaFinanceiraInput) => {
    if (editingId) {
      updateCat.mutate(
        { id: editingId, ...data },
        {
          onSuccess: () => {
            toast.success('Categoria atualizada.')
            handleCloseModal()
          },
          onError: (err) => toast.error(err.message),
        }
      )
    } else {
      createCat.mutate(data, {
        onSuccess: () => {
          toast.success('Categoria criada.')
          handleCloseModal()
        },
        onError: (err) => toast.error(err.message),
      })
    }
  }

  const handleDelete = (id: string, nome: string) => {
    if (!window.confirm(`Eliminar a categoria "${nome}"?`)) return
    deleteCat.mutate(id, {
      onSuccess: () => toast.success('Categoria eliminada.'),
      onError: (err) => toast.error(err.message),
    })
  }

  const isFormLoading = createCat.isPending || updateCat.isPending

  return (
    <div>
      <PageHeader
        title="Categorias financeiras"
        subtitle="Receitas e despesas por categoria."
        actions={
          <button
            type="button"
            onClick={handleCreate}
            className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
          >
            Nova categoria
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
          aria-label="Pesquisar categorias por nome"
        />
        <ListResultSummary
          count={filtered.length}
          total={categorias.length}
          label="categoria"
          hasFilter={filter.length > 0}
          onClearFilter={() => setFilter('')}
          isLoading={isLoading}
        />
      </div>

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Editar categoria' : 'Nova categoria'}
      >
        <CategoriaForm
          defaultValues={{
            nome: editing?.nome ?? '',
            tipo: editing?.tipo ?? 'receita',
            ordem: editing?.ordem ?? 0,
            ativo: editing?.ativo ?? true,
          }}
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
            title={
              filter
                ? 'Nenhuma categoria encontrada'
                : 'Nenhuma categoria registada'
            }
            description={
              filter
                ? 'Tente outro termo de pesquisa.'
                : 'Clique em "Nova categoria" para começar.'
            }
            action={
              !filter ? (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
                >
                  Nova categoria
                </button>
              ) : undefined
            }
          />
        ) : (
          <table className="min-w-full divide-y divide-studio-border" aria-label="Categorias financeiras">
            <caption className="sr-only">Lista de categorias de receita e despesa</caption>
            <thead className="bg-studio-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                  Ordem
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                  Estado
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-studio-foreground-lighter uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-studio-border">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-studio-muted/50">
                  <td className="px-4 py-3 text-sm text-studio-foreground">
                    {c.nome}
                  </td>
                  <td className="px-4 py-3 text-sm text-studio-foreground-light">
                    {c.tipo === 'receita' ? 'Receita' : 'Despesa'}
                  </td>
                  <td className="px-4 py-3 text-sm text-studio-foreground-light">
                    {c.ordem}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {c.ativo ? (
                      <span className="text-green-600">Ativo</span>
                    ) : (
                      <span className="text-studio-foreground-lighter">
                        Inativo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button
                      type="button"
                      onClick={() => handleEdit(c.id)}
                      className="link-action link-action-primary mr-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-1 rounded px-1"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(c.id, c.nome)}
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
