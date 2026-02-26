import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  useFinancasParcelas,
  type ParcelasFilters,
  type ParcelaRow,
} from '@/data/escola/financasQueries'
import { useAnosLetivos, useTurmas } from '@/data/escola/queries'
import { useFinancasCategorias } from '@/data/escola/financasQueries'
import {
  useGerarParcelasLote,
  useRegistrarPagamento,
  type GerarParcelasLoteInput,
} from '@/data/escola/financasMutations'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { Card } from '@/components/shared/Card'
import { Select } from '@/components/shared/Select'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { Badge } from '@/components/shared/Badge'
import { Avatar } from '@/components/shared/Avatar'
import EmptyState from '@/components/shared/EmptyState'
import { formatCurrency } from '@/lib/formatCurrency'
import { Layers, CreditCard, Filter, AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react'

function GerarLoteForm({
  anosLetivos,
  turmas,
  categorias,
  onSubmit,
  onCancel,
  isLoading,
}: {
  anosLetivos: { id: string; nome: string }[]
  turmas: { id: string; nome: string }[]
  categorias: { id: string; nome: string; tipo: string }[]
  onSubmit: (data: GerarParcelasLoteInput) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [anoLetivoId, setAnoLetivoId] = useState('')
  const [turmaId, setTurmaId] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [valorOriginal, setValorOriginal] = useState('')
  const [primeiroVencimento, setPrimeiroVencimento] = useState('')
  const [numeroParcelas, setNumeroParcelas] = useState('')
  const [descricao, setDescricao] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const valor = Number(valorOriginal.replace(/,/, '.'))
    const num = Number(numeroParcelas)
    if (!anoLetivoId || !turmaId || !categoriaId || Number.isNaN(valor) || valor < 0 || !primeiroVencimento || !num || num < 1 || num > 24) {
      toast.error('Preencha todos os campos. Número de parcelas entre 1 e 24.')
      return
    }
    onSubmit({
      anoLetivoId,
      turmaId,
      categoriaId,
      valorOriginal: valor,
      primeiroVencimento,
      numeroParcelas: num,
      descricao: descricao || undefined,
    })
  }

  const categoriasReceita = categorias.filter((c) => c.tipo === 'receita')

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Ano Letivo"
          value={anoLetivoId}
          onChange={(e) => setAnoLetivoId(e.target.value)}
          required
          options={[
            { value: '', label: 'Selecionar...' },
            ...anosLetivos.map((a) => ({ value: a.id, label: a.nome }))
          ]}
        />
        <Select
          label="Turma Alvo"
          value={turmaId}
          onChange={(e) => setTurmaId(e.target.value)}
          required
          options={[
            { value: '', label: 'Selecionar...' },
            ...turmas.map((t) => ({ value: t.id, label: t.nome }))
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Categoria de Receita"
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          required
          options={[
            { value: '', label: 'Selecionar...' },
            ...categoriasReceita.map((c) => ({ value: c.id, label: c.nome }))
          ]}
        />
        <Input
          label="Valor por Parcela (Kz)"
          type="text"
          inputMode="decimal"
          value={valorOriginal}
          onChange={(e) => setValorOriginal(e.target.value)}
          required
          placeholder="0,00"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Primeiro Vencimento"
          type="date"
          value={primeiroVencimento}
          onChange={(e) => setPrimeiroVencimento(e.target.value)}
          required
        />
        <Input
          label="Nº de Prestações (1–24)"
          type="number"
          min={1}
          max={24}
          value={numeroParcelas}
          onChange={(e) => setNumeroParcelas(e.target.value)}
          required
        />
      </div>

      <Input
        label="Identificador do Lote (Opcional)"
        type="text"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="ex: Propinas 2024 - 1º Ciclo"
      />

      <div className="flex gap-3 justify-end pt-5 border-t border-studio-border/50">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          variant="primary"
        >
          {isLoading ? 'A gerar...' : 'Confirmar Geração em Lote'}
        </Button>
      </div>
    </form>
  )
}

function PagamentoForm({
  parcela,
  onSubmit,
  onCancel,
  isLoading,
}: {
  parcela: ParcelaRow
  onSubmit: (data: { dataPagamento: string; valor: number; formaPagamento?: string }) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [dataPagamento, setDataPagamento] = useState(new Date().toISOString().slice(0, 10))
  const [valor, setValor] = useState(String(parcela.valorAtualizado))
  const [formaPagamento, setFormaPagamento] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const v = Number(valor.replace(/,/, '.'))
    if (!dataPagamento || Number.isNaN(v) || v <= 0) {
      toast.error('Preencha data e valor.')
      return
    }
    onSubmit({ dataPagamento, valor: v, formaPagamento: formaPagamento || undefined })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="p-4 rounded-xl bg-studio-muted/30 border border-studio-border/50">
        <p className="text-xs font-bold text-studio-foreground-lighter uppercase tracking-widest mb-1">Parcela de Estudante</p>
        <p className="text-sm font-bold text-studio-foreground">{parcela.alunoNome}</p>
        <p className="text-lg font-bold text-studio-brand mt-2">{formatCurrency(parcela.valorAtualizado)}</p>
        <p className="text-[10px] text-studio-foreground-lighter mt-1 italic">Vencimento em {parcela.vencimento}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Data da Liquidação"
          type="date"
          value={dataPagamento}
          onChange={(e) => setDataPagamento(e.target.value)}
          required
        />
        <Input
          label="Valor Recebido (Kz)"
          type="text"
          inputMode="decimal"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          required
        />
      </div>

      <Input
        label="Canal / Forma de Recebimento"
        type="text"
        value={formaPagamento}
        onChange={(e) => setFormaPagamento(e.target.value)}
        placeholder="ex: Transferência Bancária - BAI"
        leftIcon={<CreditCard className="w-4 h-4" />}
      />

      <div className="flex gap-3 justify-end pt-5 border-t border-studio-border/50">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          loading={isLoading}
          variant="primary"
        >
          Confirmar Recebimento
        </Button>
      </div>
    </form>
  )
}

export default function FinancasParcelas() {
  const [filters, setFilters] = useState<ParcelasFilters>({})
  const [modalGerarOpen, setModalGerarOpen] = useState(false)
  const [pagamentoParcela, setPagamentoParcela] = useState<ParcelaRow | null>(null)

  const { data: parcelas = [], isLoading, error } = useFinancasParcelas(filters)
  const { data: anosLetivos = [] } = useAnosLetivos()
  const { data: turmas = [] } = useTurmas()
  const { data: categorias = [] } = useFinancasCategorias()
  const gerarLote = useGerarParcelasLote()
  const registrarPagamento = useRegistrarPagamento()

  const handleGerarLote = (data: GerarParcelasLoteInput) => {
    gerarLote.mutate(data, {
      onSuccess: () => {
        toast.success('Parcelas geradas.')
        setModalGerarOpen(false)
      },
      onError: (err) => toast.error(err.message),
    })
  }

  const handleRegistrarPagamento = (data: { dataPagamento: string; valor: number; formaPagamento?: string }) => {
    if (!pagamentoParcela) return
    registrarPagamento.mutate(
      { parcelaId: pagamentoParcela.id, ...data },
      {
        onSuccess: () => {
          toast.success('Pagamento registado.')
          setPagamentoParcela(null)
        },
        onError: (err) => toast.error(err.message),
      }
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Gestão de Parcelas"
        subtitle="Controlo de faturação, propinas e liquidações estruturadas."
        actions={
          <Button
            onClick={() => setModalGerarOpen(true)}
            icon={<Layers className="w-4 h-4" />}
          >
            Gerar Lote de Propinas
          </Button>
        }
      />

      <Card>
        <div className="flex flex-wrap gap-4 items-end">
          <Select
            label="Ciclo Académico"
            value={filters.anoLetivoId ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, anoLetivoId: e.target.value || undefined }))
            }
            options={[
              { value: '', label: 'Todos os Anos' },
              ...anosLetivos.map((a) => ({ value: a.id, label: a.nome }))
            ]}
            className="flex-1 min-w-[200px]"
          />

          <Select
            label="Estado da Fatura"
            value={filters.status ?? ''}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: e.target.value || undefined }))
            }
            options={[
              { value: '', label: 'Ver Todos' },
              { value: 'aberta', label: 'Em Aberto' },
              { value: 'atrasada', label: 'Em Atraso (Vencida)' },
              { value: 'paga', label: 'Consolidada (Paga)' },
              { value: 'cancelada', label: 'Anulada' }
            ]}
            className="flex-1 min-w-[200px]"
          />

          <Button variant="ghost" size="icon" className="mb-0.5" onClick={() => setFilters({})}>
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </Card>
      <Modal
        title="Gerar parcelas em lote"
        open={modalGerarOpen}
        onClose={() => setModalGerarOpen(false)}
        size="md"
      >
        <GerarLoteForm
          anosLetivos={anosLetivos}
          turmas={turmas}
          categorias={categorias}
          onSubmit={handleGerarLote}
          onCancel={() => setModalGerarOpen(false)}
          isLoading={gerarLote.isPending}
        />
      </Modal>
      <Modal
        title="Registar pagamento"
        open={!!pagamentoParcela}
        onClose={() => setPagamentoParcela(null)}
        size="sm"
      >
        {pagamentoParcela && (
          <PagamentoForm
            parcela={pagamentoParcela}
            onSubmit={handleRegistrarPagamento}
            onCancel={() => setPagamentoParcela(null)}
            isLoading={registrarPagamento.isPending}
          />
        )}
      </Modal>
      {error && <p className="text-studio-foreground-light mb-4">{error.message}</p>}
      {isLoading ? (
        <SkeletonTable rows={10} columns={5} />
      ) : parcelas.length === 0 ? (
        <Card>
          <EmptyState
            title="Sem Parcelas Académicas"
            description="Não existem faturas geradas para os filtros atuais."
            icon={<CreditCard className="w-12 h-12 text-studio-muted" />}
          />
        </Card>
      ) : (
        <Card noPadding className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" aria-label="Lista de parcelas">
              <thead>
                <tr className="bg-studio-muted/10">
                  <th scope="col" className="text-left px-6 py-4 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Estudante</th>
                  <th scope="col" className="text-left px-6 py-4 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Categoria</th>
                  <th scope="col" className="text-left px-6 py-4 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Vencimento</th>
                  <th scope="col" className="text-left px-6 py-4 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Status / Auditoria</th>
                  <th scope="col" className="text-right px-6 py-4 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Montante</th>
                  <th scope="col" className="w-28 px-6 py-4" aria-label="Ações" />
                </tr>
              </thead>
              <tbody className="divide-y divide-studio-border/20">
                {parcelas.map((p) => {
                  const isOverdue = p.status === 'atrasada'
                  const isPaid = p.status === 'paga'

                  return (
                    <tr key={p.id} className="group hover:bg-studio-muted/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar name={p.alunoNome} size="xs" shape="square" />
                          <span className="font-bold text-studio-foreground group-hover:text-studio-brand transition-colors">{p.alunoNome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="neutral">{p.categoriaNome}</Badge>
                      </td>
                      <td className="px-6 py-4 text-studio-foreground-light font-medium">
                        {p.vencimento}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {isPaid ? (
                            <Badge variant="success">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Consolidada
                            </Badge>
                          ) : isOverdue ? (
                            <Badge variant="danger" pulse>
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Vencida
                            </Badge>
                          ) : p.status === 'cancelada' ? (
                            <Badge variant="neutral">
                              <XCircle className="w-3 h-3 mr-1" />
                              Anulada
                            </Badge>
                          ) : (
                            <Badge variant="neutral">
                              <Clock className="w-3 h-3 mr-1" />
                              Em Aberto
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums font-bold text-studio-foreground">
                        {formatCurrency(p.valorAtualizado)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          {p.status !== 'paga' && p.status !== 'cancelada' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<CreditCard className="w-4 h-4" />}
                              onClick={() => setPagamentoParcela(p)}
                            >
                              Liquidat
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
