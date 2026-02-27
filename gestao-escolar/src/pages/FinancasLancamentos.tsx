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
import { useEffect } from 'react'
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
import { PlusCircle, Search, Filter, Trash2, Edit3, ArrowUpCircle, ArrowDownCircle, Info, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

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
  onDirtyChange?: (dirty: boolean) => void
}) {
  const [tipo, setTipo] = useState<'entrada' | 'saida'>(initial.tipo)
  const [data, setData] = useState(initial.data)
  const [valor, setValor] = useState(String(initial.valor || ''))
  const [categoriaId, setCategoriaId] = useState(initial.categoriaId)
  const [descricao, setDescricao] = useState(initial.descricao ?? '')
  const [formaPagamento, setFormaPagamento] = useState(initial.formaPagamento ?? '')
  const [anoLetivoId, setAnoLetivoId] = useState(initial.anoLetivoId ?? '')

  useEffect(() => {
    const isDirty =
      tipo !== initial.tipo ||
      data !== initial.data ||
      valor !== String(initial.valor || '') ||
      categoriaId !== initial.categoriaId ||
      descricao !== (initial.descricao ?? '') ||
      formaPagamento !== (initial.formaPagamento ?? '') ||
      anoLetivoId !== (initial.anoLetivoId ?? '')

    onDirtyChange?.(isDirty)
  }, [tipo, data, valor, categoriaId, descricao, formaPagamento, anoLetivoId, initial, onDirtyChange])

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

  const [isFormDirty, setIsFormDirty] = useState(false)

  const handleCloseModal = () => {
    if (isFormDirty && !window.confirm('Existem alterações não guardadas. Deseja sair?')) return
    setModalOpen(false)
    setEditingId(null)
    setIsFormDirty(false)
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
        title="Controlo Financeiro"
        subtitle="Movimentação institucional de receitas, despesas operacionais e gestão de fluxo de caixa."
        actions={
          canGerirFinancas(user?.papel) ? (
            <Button
              onClick={() => { setEditingId(null); setModalOpen(true) }}
              icon={<PlusCircle className="w-4 h-4" />}
              className="shadow-lg shadow-studio-brand/20 hover:shadow-xl transition-all rounded-xl font-black uppercase text-[10px] tracking-widest"
            >
              Registar Movimentação
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-6 rounded-[2rem] bg-studio-muted/10 border border-studio-border/40 flex items-center gap-5 group hover:border-emerald-500/30 transition-all">
          <div className="p-3.5 bg-emerald-500/10 rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-[2px]">Proveitos do Período</p>
            <h3 className="text-xl font-black text-emerald-600 tabular-nums truncate">
              {formatCurrency(lancamentos.filter(l => l.tipo === 'entrada').reduce((acc, l) => acc + l.valor, 0))}
            </h3>
          </div>
        </div>

        <div className="p-6 rounded-[2rem] bg-studio-muted/10 border border-studio-border/40 flex items-center gap-5 group hover:border-red-500/30 transition-all">
          <div className="p-3.5 bg-red-500/10 rounded-2xl text-red-500 group-hover:scale-110 transition-transform">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-[2px]">Custos do Período</p>
            <h3 className="text-xl font-black text-red-600 tabular-nums truncate">
              {formatCurrency(lancamentos.filter(l => l.tipo === 'saida').reduce((acc, l) => acc + l.valor, 0))}
            </h3>
          </div>
        </div>

        <div className="p-6 rounded-[2rem] bg-studio-muted/10 border border-studio-border/40 flex items-center gap-5 group hover:border-studio-brand/30 transition-all">
          <div className="p-3.5 bg-studio-brand/10 rounded-2xl text-studio-brand group-hover:scale-110 transition-transform">
            <DollarSign className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-[2px]">Balanço Líquido</p>
            <h3 className="text-xl font-black text-studio-foreground tabular-nums truncate">
              {formatCurrency(lancamentos.reduce((acc, l) => acc + (l.tipo === 'entrada' ? l.valor : -l.valor), 0))}
            </h3>
          </div>
        </div>
      </div>

      <Card className="bg-studio-muted/10 border-studio-border/40">
        <div className="flex flex-wrap gap-4 items-end">
          <Select
            label="Fluxo de Caixa"
            value={filters.tipo ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                tipo: e.target.value ? (e.target.value as 'entrada' | 'saida') : undefined,
              }))
            }
            options={[
              { value: '', label: 'Ver Todos' },
              { value: 'entrada', label: 'Proveitos (Entradas)' },
              { value: 'saida', label: 'Custos (Saídas)' }
            ]}
            className="flex-1 min-w-[200px]"
            leftIcon={<Filter className="w-4 h-4 text-studio-foreground-lighter" />}
          />

          <Input
            label="Período - Início"
            type="date"
            value={filters.dataInicio ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, dataInicio: e.target.value || undefined }))
            }
            className="w-44"
          />

          <Input
            label="Período - Fim"
            type="date"
            value={filters.dataFim ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, dataFim: e.target.value || undefined }))
            }
            className="w-44"
          />

          <Select
            label="Categoria Analítica"
            value={filters.categoriaId ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, categoriaId: e.target.value || undefined }))
            }
            options={[
              { value: '', label: 'Todas as Categorias' },
              ...categorias.map((c) => ({ value: c.id, label: c.nome }))
            ]}
            className="flex-1 min-w-[240px]"
          />

          <div className="flex items-center gap-2 mb-0.5">
            <Button
              variant="ghost"
              size="icon"
              title="Limpar Filtros"
              onClick={() => setFilters({})}
              className="hover:bg-studio-muted"
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </Button>
          </div>
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
          onDirtyChange={setIsFormDirty}
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
                  <th scope="col" className="sticky left-0 z-30 px-6 py-4 text-left text-[10px] font-black text-studio-foreground-light uppercase tracking-widest bg-studio-muted/10 border-r border-studio-border/30">Identificação Temporal</th>
                  <th scope="col" className="text-left px-6 py-4 text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">Descrição / Método</th>
                  <th scope="col" className="text-left px-6 py-4 text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">Centro de Custo</th>
                  <th scope="col" className="text-right px-6 py-4 text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">Magnitude (Kz)</th>
                  {canGerirFinancas(user?.papel) && (
                    <th scope="col" className="w-24 px-6 py-4 text-right text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">Gestão</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-studio-border/20">
                {lancamentos.map((l) => (
                  <tr key={l.id} className="group hover:bg-studio-brand/[0.01] transition-colors">
                    <td className="sticky left-0 z-20 px-6 py-4 whitespace-nowrap bg-studio-bg border-r border-studio-border/30 group-hover:bg-studio-brand/[0.02]">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-studio-foreground uppercase tracking-tight">{formatDateShort(l.data, true)}</span>
                        <span className="text-[10px] text-studio-foreground-lighter font-medium">Data Valor: {l.data}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-studio-foreground group-hover:text-studio-brand transition-colors uppercase tracking-tight">
                          {l.descricao ?? 'Lançamento sem descrição'}
                        </span>
                        {l.formaPagamento && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <Badge variant="neutral" className="px-1.5 py-0 text-[8px] font-black uppercase opacity-60">Via {l.formaPagamento}</Badge>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="neutral" className="text-[9px] font-black uppercase border-studio-border/50">{l.categoriaNome}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`tabular-nums text-sm font-black ${l.tipo === 'entrada' ? 'text-emerald-600' : 'text-red-500'}`}>
                          {l.tipo === 'saida' ? '- ' : '+ '}
                          {formatCurrency(l.valor)}
                        </span>
                        <Badge variant={l.tipo === 'entrada' ? 'success' : 'danger'} className="text-[8px] font-black uppercase mt-1 px-1.5 py-0">
                          {l.tipo === 'entrada' ? 'Proveito' : 'Custo'}
                        </Badge>
                      </div>
                    </td>
                    {canGerirFinancas(user?.papel) && (
                      <td className="px-6 py-4">
                        <div className="flex gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => { setEditingId(l.id); setModalOpen(true) }}
                            title="Editar"
                          >
                            <Edit3 className="w-4 h-4 text-studio-brand" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-400 hover:text-red-500 hover:bg-red-50"
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
