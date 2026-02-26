import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useSaveShortcut } from '@/hooks/useSaveShortcut'
import {
  useFinancasCategorias,
  type CategoriaFinanceira,
} from '@/data/escola/financasQueries'
import {
  useCreateCategoriaFinanceira,
  useUpdateCategoriaFinanceira,
  useDeleteCategoriaFinanceira,
  type CategoriaFinanceiraInput,
} from '@/data/escola/financasMutations'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { Card } from '@/components/shared/Card'
import { Select } from '@/components/shared/Select'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { Badge } from '@/components/shared/Badge'
import EmptyState from '@/components/shared/EmptyState'
import { PlusCircle, Edit3, Trash2, Tag, Layers, CheckCircle2, XCircle } from 'lucide-react'

function CategoriaForm({
  initial,
  onSubmit,
  onCancel,
  isLoading,
}: {
  initial: Partial<CategoriaFinanceiraInput> & { nome: string; tipo: 'receita' | 'despesa' }
  onSubmit: (data: CategoriaFinanceiraInput) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [nome, setNome] = useState(initial.nome)
  const [tipo, setTipo] = useState<'receita' | 'despesa'>(initial.tipo)
  const [ordem, setOrdem] = useState(initial.ordem ?? 0)
  const [ativo, setAtivo] = useState(initial.ativo ?? true)

  const doSubmit = useCallback(() => {
    if (!nome.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    onSubmit({ nome: nome.trim(), tipo, ordem, ativo })
  }, [nome, tipo, ordem, ativo, onSubmit])

  useSaveShortcut(doSubmit, true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    doSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Designação da Categoria"
        type="text"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Ex: Propinas, Material de Limpeza..."
        autoFocus
        required
        leftIcon={<Tag className="w-4 h-4" />}
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Classificação"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as 'receita' | 'despesa')}
          options={[
            { value: 'receita', label: 'Receita (Entrada)' },
            { value: 'despesa', label: 'Despesa (Saída)' }
          ]}
        />
        <Input
          label="Prioridade de Exibição"
          type="number"
          min={0}
          value={ordem}
          onChange={(e) => setOrdem(Number(e.target.value) || 0)}
          leftIcon={<Layers className="w-4 h-4" />}
        />
      </div>

      <div className="flex items-center gap-2 p-3 rounded-lg bg-studio-muted/30 border border-studio-border/50">
        <input
          id="cat-ativo"
          type="checkbox"
          checked={ativo}
          onChange={(e) => setAtivo(e.target.checked)}
          className="w-4 h-4 rounded border-studio-border text-studio-brand focus:ring-studio-brand"
        />
        <label htmlFor="cat-ativo" className="text-sm font-medium text-studio-foreground cursor-pointer">
          Categoria Ativa para Lançamentos
        </label>
      </div>

      <div className="flex gap-3 justify-end pt-5 border-t border-studio-border/50">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          variant="primary"
        >
          {initial.nome ? 'Atualizar Categoria' : 'Criar Categoria'}
        </Button>
      </div>
    </form>
  )
}

export default function FinancasCategorias() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [itemToDelete, setItemToDelete] = useState<CategoriaFinanceira | null>(null)

  const { data: categorias = [], isLoading, error } = useFinancasCategorias()
  const createCat = useCreateCategoriaFinanceira()
  const updateCat = useUpdateCategoriaFinanceira()
  const deleteCat = useDeleteCategoriaFinanceira()

  const editing = editingId ? categorias.find((c) => c.id === editingId) ?? null : null

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingId(null)
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

  const confirmDelete = () => {
    if (!itemToDelete) return
    deleteCat.mutate(itemToDelete.id, {
      onSuccess: () => {
        toast.success('Categoria eliminada.')
        setItemToDelete(null)
      },
      onError: (err) => {
        toast.error(err.message)
        setItemToDelete(null)
      },
    })
  }

  const isFormLoading = createCat.isPending || updateCat.isPending

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Categorias Financeiras"
        subtitle="Estrutura de classificação para o plano de contas institucional."
        actions={
          <Button
            onClick={() => {
              setEditingId(null)
              setModalOpen(true)
            }}
            icon={<PlusCircle className="w-4 h-4" />}
          >
            Nova Categoria
          </Button>
        }
      />
      <Modal
        title={editingId ? 'Editar categoria' : 'Nova categoria'}
        open={modalOpen}
        onClose={handleCloseModal}
        size="sm"
      >
        <CategoriaForm
          initial={
            editing
              ? {
                nome: editing.nome,
                tipo: editing.tipo,
                ordem: editing.ordem,
                ativo: editing.ativo,
              }
              : { nome: '', tipo: 'receita', ordem: 0, ativo: true }
          }
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isLoading={isFormLoading}
        />
      </Modal>
      <Modal title="Confirmar Exclusão" open={!!itemToDelete} onClose={() => setItemToDelete(null)} size="sm">
        <div className="p-1">
          <p className="text-sm text-studio-foreground-light leading-relaxed">
            Tem a certeza que deseja eliminar a categoria <span className="font-bold text-studio-foreground">&quot;{itemToDelete?.nome}&quot;</span>? Isto impedirá novos lançamentos nesta categoria.
          </p>
          <div className="flex gap-3 justify-end mt-8">
            <Button variant="ghost" onClick={() => setItemToDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              loading={deleteCat.isPending}
            >
              Excluir Categoria
            </Button>
          </div>
        </div>
      </Modal>
      {error && (
        <p className="text-studio-foreground-light mb-4">{error.message}</p>
      )}
      {isLoading ? (
        <SkeletonTable rows={8} columns={4} />
      ) : categorias.length === 0 ? (
        <Card>
          <EmptyState
            title="Nenhuma Categoria Configurada"
            description="Defina categorias para organizar as finanças da sua escola."
            icon={<Layers className="w-12 h-12 text-studio-muted" />}
          />
        </Card>
      ) : (
        <Card noPadding className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Lista de categorias financeiras">
              <thead>
                <tr className="bg-studio-muted/10">
                  <th scope="col" className="text-left px-6 py-4 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Nome / Designação</th>
                  <th scope="col" className="text-left px-6 py-4 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Tipo</th>
                  <th scope="col" className="text-left px-6 py-4 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Ordem</th>
                  <th scope="col" className="text-left px-6 py-4 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Estado</th>
                  <th scope="col" className="w-32 px-6 py-4" aria-label="Ações" />
                </tr>
              </thead>
              <tbody className="divide-y divide-studio-border/20">
                {categorias.map((c) => (
                  <tr key={c.id} className="group hover:bg-studio-muted/5 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-bold text-studio-foreground group-hover:text-studio-brand transition-colors">{c.nome}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={c.tipo === 'receita' ? 'brand' : 'neutral'}>
                        {c.tipo === 'receita' ? 'Crédito / Receita' : 'Débito / Despesa'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-studio-foreground-light font-medium">{c.ordem}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {c.ativo ? (
                          <Badge variant="success">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Ativa
                          </Badge>
                        ) : (
                          <Badge variant="neutral">
                            <XCircle className="w-3 h-3 mr-1" />
                            Inativa
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingId(c.id)
                            setModalOpen(true)
                          }}
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => setItemToDelete(c)}
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
