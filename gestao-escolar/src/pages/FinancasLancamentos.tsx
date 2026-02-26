import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { canGerirFinancas } from '@/lib/permissoes'
import {
  useFinancasLancamentos,
  type LancamentosFilters,
  type LancamentoRow,
} from '@/data/escola/financasQueries'
import { useFinancasCategorias } from '@/data/escola/financasQueries'
import { useAnosLetivos } from '@/data/escola/queries'
import {
  useCreateLancamento,
  useUpdateLancamento,
  useDeleteLancamento,
  type LancamentoInput,
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
import { formatCurrency } from '@/lib/formatCurrency'
import { formatDateShort } from '@/utils/formatters'
import { PlusCircle, Search, Filter, Trash2, Edit3, ArrowUpCircle, ArrowDownCircle, Info } from 'lucide-react'

function LancamentoForm({
  initial,
  categorias,
  anosLetivos,
  onSubmit,
  onCancel,
  isLoading,
}: {
  initial: Partial<LancamentoInput> & { tipo: 'entrada' | 'saida'; data: string; valor: number; categoriaId: string }
  categorias: { id: string; nome: string; tipo: string }[]
  anosLetivos: { id: string; nome: string }[]
  onSubmit: (data: LancamentoInput) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [tipo, setTipo] = useState<'entrada' | 'saida'>(initial.tipo)
  const [data, setData] = useState(initial.data)
  const [valor, setValor] = useState(String(initial.valor || ''))
  const [categoriaId, setCategoriaId] = useState(initial.categoriaId)
  const [descricao, setDescricao] = useState(initial.descricao ?? '')
  const [formaPagamento, setFormaPagamento] = useState(initial.formaPagamento ?? '')
  const [anoLetivoId, setAnoLetivoId] = useState(initial.anoLetivoId ?? '')

  const categoriasFiltradas = useMemo(
    () => categorias.filter((c) => c.tipo === (tipo === 'entrada' ? 'receita' : 'despesa')),
    [categorias, tipo]
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const numValor = Number(valor.replace(/,/, '.'))
    if (!data || !categoriaId || Number.isNaN(numValor) || numValor < 0) {
      toast.error('Preencha data, categoria e valor.')
      return
    }
    onSubmit({
      tipo,
      data,
      valor: numValor,
      categoriaId,
      descricao: descricao || undefined,
      formaPagamento: formaPagamento || undefined,
      anoLetivoId: anoLetivoId || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Fluxo"
          value={tipo}
          onChange={(e) => {
            setTipo(e.target.value as 'entrada' | 'saida')
            setCategoriaId('')
          }}
          options={[
            { value: 'entrada', label: 'Entrada (Crédito)' },
            { value: 'saida', label: 'Saída (Débito)' }
          ]}
          leftIcon={tipo === 'entrada' ? <ArrowUpCircle className="w-4 h-4 text-emerald-500" /> : <ArrowDownCircle className="w-4 h-4 text-red-500" />}
        />
        <Input
          label="Data Valor"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Montante (Kz)"
          type="text"
          inputMode="decimal"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="0,00"
          required
          hint="Use pontos ou vírgulas para decimais."
        />
        <Select
          label="Categoria"
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          required
          options={[
            { value: '', label: 'Selecionar categoria' },
            ...categoriasFiltradas.map((c) => ({ value: c.id, label: c.nome }))
          ]}
        />
      </div>

      <Input
        label="Descrição Narrativa"
        type="text"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="ex: Pagamento de fatura #392"
        leftIcon={<Info className="w-4 h-4" />}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Forma de Pagamento"
          type="text"
          value={formaPagamento}
          onChange={(e) => setFormaPagamento(e.target.value)}
          placeholder="TPA, Transferência, etc."
        />
        <Select
          label="Ano Letivo (Centro de Custo)"
          value={anoLetivoId}
          onChange={(e) => setAnoLetivoId(e.target.value)}
          options={[
            { value: '', label: 'Nenhum' },
            ...anosLetivos.map((a) => ({ value: a.id, label: a.nome }))
          ]}
        />
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
          {initial.valor ? 'Guardar Alterações' : 'Confirmar Lançamento'}
        </Button>
      </div>
    </form>
  )
}

export default function FinancasLancamentos() {
  const { user } = useAuth()
  const [filters, setFilters] = useState<LancamentosFilters>({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [itemToDelete, setItemToDelete] = useState<LancamentoRow | null>(null)

  const { data: lancamentos = [], isLoading, error } = useFinancasLancamentos(filters)
  const { data: categorias = [] } = useFinancasCategorias()
  const { data: anosLetivos = [] } = useAnosLetivos()
  const createLanc = useCreateLancamento()
  const updateLanc = useUpdateLancamento()
  const deleteLanc = useDeleteLancamento()

  const editing = editingId ? lancamentos.find((l) => l.id === editingId) ?? null : null

  const handleCloseModal = () => {
    setModalOpen(false)
    setEditingId(null)
  }

  const handleSubmit = (data: LancamentoInput) => {
    if (editingId) {
      updateLanc.mutate(
        { id: editingId, ...data },
        {
          onSuccess: () => {
            toast.success('Lançamento atualizado.')
            handleCloseModal()
          },
          onError: (err) => toast.error(err.message),
        }
      )
    } else {
      createLanc.mutate(data, {
        onSuccess: () => {
          toast.success('Lançamento criado.')
          handleCloseModal()
        },
        onError: (err) => toast.error(err.message),
      })
    }
  }

  const confirmDelete = () => {
    if (!itemToDelete) return
    deleteLanc.mutate(itemToDelete.id, {
      onSuccess: () => {
        toast.success('Lançamento eliminado.')
        setItemToDelete(null)
      },
      onError: (err) => {
        toast.error(err.message)
        setItemToDelete(null)
      },
    })
  }

  const isFormLoading = createLanc.isPending || updateLanc.isPending

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Lançamentos Financeiros"
        subtitle="Movimentação institucional de receitas e despesas operacionais."
        actions={
          canGerirFinancas(user?.papel) ? (
            <Button
              onClick={() => { setEditingId(null); setModalOpen(true) }}
              icon={<PlusCircle className="w-4 h-4" />}
            >
              Novo Lançamento
            </Button>
          ) : undefined
        }
      />

      <Card>
        <div className="flex flex-wrap gap-4 items-end">
          <Select
            label="Fluxo"
            value={filters.tipo ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                tipo: e.target.value ? (e.target.value as 'entrada' | 'saida') : undefined,
              }))
            }
            options={[
              { value: '', label: 'Todos os fluxos' },
              { value: 'entrada', label: 'Apenas Entradas' },
              { value: 'saida', label: 'Apenas Saídas' }
            ]}
            className="flex-1 min-w-[200px]"
          />

          <Input
            label="Início"
            type="date"
            value={filters.dataInicio ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, dataInicio: e.target.value || undefined }))
            }
            className="w-44"
          />

          <Input
            label="Fim"
            type="date"
            value={filters.dataFim ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, dataFim: e.target.value || undefined }))
            }
            className="w-44"
          />

          <Select
            label="Categoria"
            value={filters.categoriaId ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, categoriaId: e.target.value || undefined }))
            }
            options={[
              { value: '', label: 'Todas as categorias' },
              ...categorias.map((c) => ({ value: c.id, label: c.nome }))
            ]}
            className="flex-1 min-w-[240px]"
          />

          <Button variant="ghost" size="icon" className="mb-0.5" title="Limpar Filtros" onClick={() => setFilters({})}>
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </Card>
      <Modal
        title={editingId ? 'Editar lançamento' : 'Novo lançamento'}
        open={modalOpen}
        onClose={handleCloseModal}
        size="md"
      >
        <LancamentoForm
          initial={
            editing
              ? {
                tipo: editing.tipo,
                data: editing.data,
                valor: editing.valor,
                categoriaId: editing.categoriaId,
                descricao: editing.descricao ?? '',
                formaPagamento: editing.formaPagamento ?? '',
                anoLetivoId: editing.anoLetivoId ?? undefined,
              }
              : {
                tipo: 'entrada',
                data: new Date().toISOString().slice(0, 10),
                valor: 0,
                categoriaId: categorias.find((c) => c.tipo === 'receita')?.id ?? '',
              }
          }
          categorias={categorias}
          anosLetivos={anosLetivos}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isLoading={isFormLoading}
        />
      </Modal>
      <Modal title="Eliminar Lançamento" open={!!itemToDelete} onClose={() => setItemToDelete(null)} size="sm">
        <div className="p-1">
          <p className="text-sm text-studio-foreground-light leading-relaxed">
            Tem a certeza que deseja eliminar este registo financeiro? Esta ação afetará os relatórios e o saldo institucional.
          </p>
          <div className="flex gap-3 justify-end mt-8">
            <Button variant="ghost" onClick={() => setItemToDelete(null)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              loading={deleteLanc.isPending}
            >
              Eliminar Registo
            </Button>
          </div>
        </div>
      </Modal>
      {error && <p className="text-studio-foreground-light mb-4">{error.message}</p>}
      {isLoading ? (
        <SkeletonTable rows={10} columns={5} />
      ) : lancamentos.length === 0 ? (
        <Card>
          <EmptyState
            title="Nenhum Lançamento Encontrado"
            description="Não existem registos para o período ou filtros selecionados."
            icon={<Search className="w-12 h-12 text-studio-muted" />}
          />
        </Card>
      ) : (
        <Card noPadding className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Lista de lançamentos">
              <thead>
                <tr className="bg-studio-muted/10">
                  <th scope="col" className="text-left px-6 py-4 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Data</th>
                  <th scope="col" className="text-left px-6 py-4 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Descrição</th>
                  <th scope="col" className="text-left px-6 py-4 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Categoria</th>
                  <th scope="col" className="text-right px-6 py-4 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Montante</th>
                  {canGerirFinancas(user?.papel) && (
                  <th scope="col" className="w-24 px-6 py-4" aria-label="Ações" />
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-studio-border/20">
                {lancamentos.map((l) => (
                  <tr key={l.id} className="group hover:bg-studio-muted/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-studio-foreground-light font-medium" title={l.data}>
                      {formatDateShort(l.data, true)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-studio-foreground group-hover:text-studio-brand transition-colors">
                          {l.descricao ?? 'Lançamento sem descrição'}
                        </span>
                        {l.formaPagamento && (
                          <span className="text-[10px] text-studio-foreground-lighter uppercase font-bold tracking-tighter">
                            via {l.formaPagamento}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="neutral">{l.categoriaNome}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`tabular-nums font-bold ${l.tipo === 'entrada' ? 'text-emerald-600' : 'text-red-500'}`}>
                          {l.tipo === 'saida' ? '- ' : '+ '}
                          {formatCurrency(l.valor)}
                        </span>
                        <span className="text-[10px] text-studio-foreground-lighter uppercase font-bold">
                          {l.tipo === 'entrada' ? 'Receita' : 'Despesa'}
                        </span>
                      </div>
                    </td>
                    {canGerirFinancas(user?.papel) && (
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => { setEditingId(l.id); setModalOpen(true) }}
                          title="Editar"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => setItemToDelete(l)}
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
        </Card>
      )}
    </div>
  )
}
