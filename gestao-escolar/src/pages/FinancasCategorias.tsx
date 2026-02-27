import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { canGerirFinancas } from '@/lib/permissoes'
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
import { useEffect } from 'react'

function CategoriaForm({
  initial,
  onSubmit,
  onCancel,
  isLoading,
  onDirtyChange,
}: {
  initial: Partial<CategoriaFinanceiraInput> & { nome: string; tipo: 'receita' | 'despesa' }
  onSubmit: (data: CategoriaFinanceiraInput) => void
  onCancel: () => void
  isLoading: boolean
  onDirtyChange?: (dirty: boolean) => void
}) {
  const [nome, setNome] = useState(initial.nome)
  const [tipo, setTipo] = useState<'receita' | 'despesa'>(initial.tipo)
  const [ordem, setOrdem] = useState(initial.ordem ?? 0)
  const [ativo, setAtivo] = useState(initial.ativo ?? true)

  useEffect(() => {
    const isDirty =
      nome !== initial.nome ||
      tipo !== initial.tipo ||
      ordem !== (initial.ordem ?? 0) ||
      ativo !== (initial.ativo ?? true)

    onDirtyChange?.(isDirty)
  }, [nome, tipo, ordem, ativo, initial, onDirtyChange])

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
  const { user } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [itemToDelete, setItemToDelete] = useState<CategoriaFinanceira | null>(null)

  const { data: categorias = [], isLoading, error } = useFinancasCategorias()
  const createCat = useCreateCategoriaFinanceira()
  const updateCat = useUpdateCategoriaFinanceira()
  const deleteCat = useDeleteCategoriaFinanceira()

  const editing = editingId ? categorias.find((c) => c.id === editingId) ?? null : null

  const [isFormDirty, setIsFormDirty] = useState(false)

  const handleCloseModal = () => {
    if (isFormDirty && !window.confirm('Existem alterações não guardadas. Deseja sair?')) return
    setModalOpen(false)
    setEditingId(null)
    setIsFormDirty(false)
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
          canGerirFinancas(user?.papel) ? (
            <Button
              onClick={() => {
                setEditingId(null)
                setModalOpen(true)
              }}
              icon={<PlusCircle className="w-4 h-4" />}
            >
              Nova Categoria
            </Button>
          ) : undefined
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
          onDirtyChange={setIsFormDirty}
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
        <Card noPadding className="overflow-hidden border-studio-border/60">
          {isLoading ? (
            <SkeletonTable rows={10} columns={5} />
          ) : categorias.length === 0 ? (
            <div className="p-12">
              <EmptyState
                title="Estrutura de Contas Vazia"
                description="Defina categorias analíticas para permitir a classificação de proveitos e custos institucional."
                onAction={() => { setEditingId(null); setModalOpen(true) }}
                actionLabel="Criar Primeira Categoria"
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Lista de categorias financeiras">
                <thead>
                  <tr className="bg-studio-muted/10">
                    <th scope="col" className="text-left px-6 py-4 text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">Identificação / Designação</th>
                    <th scope="col" className="text-left px-6 py-4 text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">Natureza</th>
                    <th scope="col" className="text-left px-6 py-4 text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">Ordinal</th>
                    <th scope="col" className="text-left px-6 py-4 text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">Vigência</th>
                    {canGerirFinancas(user?.papel) && (
                      <th scope="col" className="w-32 px-6 py-4 text-right text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">Gestão</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-studio-border/20">
                  {categorias.map((c) => (
                    <tr key={c.id} className="group hover:bg-studio-brand/[0.01] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-studio-brand/10 flex items-center justify-center">
                            <Tag className="w-4 h-4 text-studio-brand" />
                          </div>
                          <span className="text-sm font-black text-studio-foreground uppercase tracking-tight group-hover:text-studio-brand transition-colors">
                            {c.nome}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={c.tipo === 'receita' ? 'brand' : 'neutral'} className="text-[9px] font-black uppercase border-studio-border/50">
                          {c.tipo === 'receita' ? 'Proveito / Crédito' : 'Custo / Débito'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-studio-foreground-light tabular-nums">{c.ordem}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {c.ativo ? (
                            <Badge variant="success" className="text-[9px] font-black uppercase px-2 py-0.5">
                              Ativa
                            </Badge>
                          ) : (
                            <Badge variant="neutral" className="text-[9px] font-black uppercase px-2 py-0.5 opacity-50">
                              Suspesa
                            </Badge>
                          )}
                        </div>
                      </td>
                      {canGerirFinancas(user?.papel) && (
                        <td className="px-6 py-4">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Edit3 className="w-3.5 h-3.5" />}
                              onClick={() => {
                                setEditingId(c.id)
                                setModalOpen(true)
                              }}
                              className="text-[10px] font-black uppercase text-studio-brand"
                            >
                              Editar
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-400 hover:text-red-500 hover:bg-red-50"
                              onClick={() => setItemToDelete(c)}
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}
