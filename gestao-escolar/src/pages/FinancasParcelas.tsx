import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  useParcelas,
  useCategoriasFinancas,
  useAnosLetivos,
  useAlunos,
  useTurmas,
  useTurmaAlunos,
} from '@/data/escola/queries'
import {
  useCreateParcela,
  useRegistrarPagamento,
  useGerarParcelasLote,
} from '@/data/escola/mutations'
import type {
  ParcelaInput,
  PagamentoInput,
  GerarParcelasLoteInput,
} from '@/data/escola/mutations'
import Modal from '@/components/Modal'
import EmptyState from '@/components/EmptyState'
import PageHeader from '@/components/PageHeader'
import { TableSkeleton } from '@/components/PageSkeleton'
import { formatCurrency } from '@/lib/formatCurrency'

function ParcelaForm({
  anosLetivos,
  alunos,
  categoriasReceita,
  onSubmit,
  onCancel,
  isLoading,
}: {
  anosLetivos: { id: string; nome: string }[]
  alunos: { id: string; nome: string }[]
  categoriasReceita: { id: string; nome: string }[]
  onSubmit: (data: ParcelaInput) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [anoLetivoId, setAnoLetivoId] = useState('')
  const [alunoId, setAlunoId] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [valorOriginal, setValorOriginal] = useState('')
  const [vencimento, setVencimento] = useState('')
  const [descricao, setDescricao] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const v = parseFloat(valorOriginal)
    if (isNaN(v) || v < 0) {
      toast.error('Valor inválido')
      return
    }
    if (!anoLetivoId || !alunoId || !categoriaId || !vencimento) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    onSubmit({
      anoLetivoId,
      alunoId,
      categoriaId,
      valorOriginal: v,
      vencimento,
      descricao: descricao || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="parcela-ano" className="label">Ano letivo</label>
        <select
          id="parcela-ano"
          value={anoLetivoId}
          onChange={(e) => setAnoLetivoId(e.target.value)}
          className="input w-full"
          required
          aria-label="Ano letivo da parcela"
        >
          <option value="">Selecionar</option>
          {anosLetivos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="parcela-aluno" className="label">Aluno</label>
        <select
          id="parcela-aluno"
          value={alunoId}
          onChange={(e) => setAlunoId(e.target.value)}
          className="input w-full"
          required
          aria-label="Aluno da parcela"
        >
          <option value="">Selecionar</option>
          {alunos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="parcela-categoria" className="label">Categoria (receita)</label>
        <select
          id="parcela-categoria"
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          className="input w-full"
          required
          aria-label="Categoria de receita"
        >
          <option value="">Selecionar</option>
          {categoriasReceita.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="parcela-valor" className="label">Valor (Kz)</label>
        <input
          id="parcela-valor"
          type="number"
          min={0}
          step={0.01}
          value={valorOriginal}
          onChange={(e) => setValorOriginal(e.target.value)}
          className="input w-full"
          required
          aria-label="Valor em Kz"
        />
      </div>
      <div>
        <label htmlFor="parcela-vencimento" className="label">Vencimento</label>
        <input
          id="parcela-vencimento"
          type="date"
          value={vencimento}
          onChange={(e) => setVencimento(e.target.value)}
          className="input w-full"
          required
          aria-label="Data de vencimento"
        />
      </div>
      <div>
        <label htmlFor="parcela-descricao" className="label">Descrição</label>
        <input
          id="parcela-descricao"
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="input w-full"
          placeholder="Ex: Mensalidade março"
          aria-label="Descrição da parcela (opcional)"
        />
      </div>
      <div className="flex gap-2 justify-end pt-2">
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

function GerarLoteForm({
  anosLetivos,
  turmas,
  categoriasReceita,
  onSubmit,
  onCancel,
  isLoading,
}: {
  anosLetivos: { id: string; nome: string }[]
  turmas: { id: string; nome: string }[]
  categoriasReceita: { id: string; nome: string }[]
  onSubmit: (data: GerarParcelasLoteInput) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [anoLetivoId, setAnoLetivoId] = useState('')
  const [turmaId, setTurmaId] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [valorOriginal, setValorOriginal] = useState('')
  const [primeiroVencimento, setPrimeiroVencimento] = useState('')
  const [numeroParcelas, setNumeroParcelas] = useState('12')
  const [descricao, setDescricao] = useState('')

  const { data: turmaAlunos = [] } = useTurmaAlunos(turmaId || null)
  const turmaSemAlunos = Boolean(turmaId && turmaAlunos.length === 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const v = parseFloat(valorOriginal)
    const n = parseInt(numeroParcelas, 10)
    if (isNaN(v) || v < 0) {
      toast.error('Valor inválido')
      return
    }
    if (isNaN(n) || n < 1 || n > 24) {
      toast.error('Número de parcelas entre 1 e 24')
      return
    }
    if (!anoLetivoId || !turmaId || !categoriaId || !primeiroVencimento) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    if (turmaSemAlunos) {
      toast.error('Esta turma não tem alunos matriculados.')
      return
    }
    const totalParcelas = turmaAlunos.length * n
    const confirmar =
      totalParcelas <= 20 ||
      window.confirm(
        `Serão criadas ${totalParcelas} parcela(s) para ${turmaAlunos.length} aluno(s). Continuar?`
      )
    if (!confirmar) return
    onSubmit({
      anoLetivoId,
      turmaId,
      categoriaId,
      valorOriginal: v,
      primeiroVencimento,
      numeroParcelas: n,
      descricao: descricao || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-studio-foreground-light">
        Cria parcelas para todos os alunos da turma: cada aluno recebe o mesmo
        número de parcelas com vencimentos mensais.
      </p>
      <div>
        <label htmlFor="gerar-ano" className="label">Ano letivo</label>
        <select
          id="gerar-ano"
          value={anoLetivoId}
          onChange={(e) => setAnoLetivoId(e.target.value)}
          className="input w-full"
          required
          aria-label="Ano letivo"
        >
          <option value="">Selecionar</option>
          {anosLetivos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="gerar-turma" className="label">Turma</label>
        <select
          id="gerar-turma"
          value={turmaId}
          onChange={(e) => setTurmaId(e.target.value)}
          className="input w-full"
          required
          aria-label="Turma"
        >
          <option value="">Selecionar</option>
          {turmas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
        {turmaSemAlunos && (
          <p className="text-xs text-warning mt-1">
            Esta turma não tem alunos matriculados. Não será possível gerar parcelas.
          </p>
        )}
        {turmaId && turmaAlunos.length > 0 && (
          <p className="text-xs text-studio-foreground-lighter mt-1">
            {turmaAlunos.length} aluno(s) na turma →{' '}
            {turmaAlunos.length * Math.max(0, parseInt(numeroParcelas, 10) || 0)}{' '}
            parcela(s) a criar.
          </p>
        )}
      </div>
      <div>
        <label htmlFor="gerar-categoria" className="label">Categoria (receita)</label>
        <select
          id="gerar-categoria"
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          className="input w-full"
          required
          aria-label="Categoria de receita"
        >
          <option value="">Selecionar</option>
          {categoriasReceita.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="gerar-valor" className="label">Valor por parcela (Kz)</label>
        <input
          id="gerar-valor"
          type="number"
          min={0}
          step={0.01}
          value={valorOriginal}
          onChange={(e) => setValorOriginal(e.target.value)}
          className="input w-full"
          required
          aria-label="Valor por parcela em Kz"
        />
      </div>
      <div>
        <label htmlFor="gerar-vencimento" className="label">Primeiro vencimento</label>
        <input
          id="gerar-vencimento"
          type="date"
          value={primeiroVencimento}
          onChange={(e) => setPrimeiroVencimento(e.target.value)}
          className="input w-full"
          required
          aria-label="Data do primeiro vencimento"
        />
      </div>
      <div>
        <label htmlFor="gerar-num" className="label">Número de parcelas (1–24)</label>
        <input
          id="gerar-num"
          type="number"
          min={1}
          max={24}
          value={numeroParcelas}
          onChange={(e) => setNumeroParcelas(e.target.value)}
          className="input w-full"
          aria-label="Número de parcelas"
        />
      </div>
      <div>
        <label htmlFor="gerar-desc" className="label">Descrição (opcional)</label>
        <input
          id="gerar-desc"
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="input w-full"
          placeholder="Ex: Mensalidade 2025"
          aria-label="Descrição das parcelas"
        />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2">
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 disabled:opacity-50"
          disabled={isLoading || turmaSemAlunos}
        >
          {isLoading ? 'A gerar...' : 'Gerar parcelas'}
        </button>
      </div>
    </form>
  )
}

function PagamentoForm({
  parcelaId,
  valorPendente,
  onSubmit,
  onCancel,
  isLoading,
}: {
  parcelaId: string
  valorPendente: number
  onSubmit: (data: PagamentoInput) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [dataPagamento, setDataPagamento] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [valor, setValor] = useState(String(valorPendente))
  const [formaPagamento, setFormaPagamento] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const v = parseFloat(valor)
    if (isNaN(v) || v <= 0) {
      toast.error('Valor inválido')
      return
    }
    onSubmit({
      parcelaId,
      dataPagamento,
      valor: v,
      formaPagamento: formaPagamento || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="pag-data" className="label">Data do pagamento</label>
        <input
          id="pag-data"
          type="date"
          value={dataPagamento}
          onChange={(e) => setDataPagamento(e.target.value)}
          className="input w-full"
          required
          aria-label="Data do pagamento"
        />
      </div>
      <div>
        <label htmlFor="pag-valor" className="label">Valor (pendente: {formatCurrency(valorPendente)})</label>
        <input
          id="pag-valor"
          type="number"
          min={0}
          step={0.01}
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="input w-full"
          required
          aria-label="Valor a pagar"
        />
      </div>
      <div>
        <label htmlFor="pag-forma" className="label">Forma de pagamento</label>
        <input
          id="pag-forma"
          type="text"
          value={formaPagamento}
          onChange={(e) => setFormaPagamento(e.target.value)}
          className="input w-full"
          placeholder="Ex: Transferência, Dinheiro"
          aria-label="Forma de pagamento (opcional)"
        />
      </div>
      <div className="flex gap-2 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2">
          Cancelar
        </button>
        <button type="submit" className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 disabled:opacity-50" disabled={isLoading}>
          {isLoading ? 'A registar...' : 'Registar'}
        </button>
      </div>
    </form>
  )
}

export default function FinancasParcelas() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [modalOpen, setModalOpen] = useState(false)
  const [loteModalOpen, setLoteModalOpen] = useState(false)
  const [pagamentoParcelaId, setPagamentoParcelaId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [anoLetivoFilter, setAnoLetivoFilter] = useState('')

  useEffect(() => {
    if (searchParams.get('acao') === 'novo') {
      setModalOpen(true)
    }
  }, [searchParams])

  const handleCloseModal = () => {
    setModalOpen(false)
    if (searchParams.get('acao') === 'novo') setSearchParams({})
  }

  const filtros = useMemo(
    () => ({
      status: statusFilter || undefined,
      anoLetivoId: anoLetivoFilter || undefined,
    }),
    [statusFilter, anoLetivoFilter]
  )

  const { data: parcelas = [], isLoading, error } = useParcelas(filtros)
  const { data: categorias = [] } = useCategoriasFinancas()
  const { data: anosLetivos = [] } = useAnosLetivos()
  const { data: alunos = [] } = useAlunos()
  const { data: turmas = [] } = useTurmas()
  const createParcela = useCreateParcela()
  const registrarPagamento = useRegistrarPagamento()
  const gerarLote = useGerarParcelasLote()

  const categoriasReceita = useMemo(
    () => categorias.filter((c) => c.tipo === 'receita' && c.ativo),
    [categorias]
  )

  const parcelaParaPagamento = pagamentoParcelaId
    ? parcelas.find((p) => p.id === pagamentoParcelaId)
    : null

  const handleCreate = () => {
    setModalOpen(true)
    setSearchParams({})
  }

  const handleSubmitParcela = (data: ParcelaInput) => {
    createParcela.mutate(data, {
      onSuccess: () => {
        toast.success('Parcela criada.')
        handleCloseModal()
      },
      onError: (err) => toast.error(err.message),
    })
  }

  const handleRegistrarPagamento = (data: PagamentoInput) => {
    registrarPagamento.mutate(data, {
      onSuccess: () => {
        toast.success('Pagamento registado.')
        setPagamentoParcelaId(null)
      },
      onError: (err) => toast.error(err.message),
    })
  }

  const handleGerarLote = (data: GerarParcelasLoteInput) => {
    gerarLote.mutate(data, {
      onSuccess: (result) => {
        toast.success(
          `${result.criadas} parcela(s) criada(s) para ${result.alunos} aluno(s).`
        )
        setLoteModalOpen(false)
      },
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <div>
      <PageHeader
        title="Parcelas"
        subtitle="Mensalidades e cobranças por aluno."
        actions={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setLoteModalOpen(true)}
              className="btn-secondary"
            >
              Gerar em lote
            </button>
            <button type="button" onClick={handleCreate} className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2">
              Nova parcela
            </button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label className="label text-xs">Ano letivo</label>
          <select
            value={anoLetivoFilter}
            onChange={(e) => setAnoLetivoFilter(e.target.value)}
            className="input"
          >
            <option value="">Todos</option>
            {anosLetivos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label text-xs">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="">Todos</option>
            <option value="aberta">Aberta</option>
            <option value="paga">Paga</option>
            <option value="atrasada">Atrasada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      <Modal open={modalOpen} onClose={handleCloseModal} title="Nova parcela">
        <ParcelaForm
          anosLetivos={anosLetivos}
          alunos={alunos}
          categoriasReceita={categoriasReceita}
          onSubmit={handleSubmitParcela}
          onCancel={handleCloseModal}
          isLoading={createParcela.isPending}
        />
      </Modal>

      <Modal
        open={loteModalOpen}
        onClose={() => setLoteModalOpen(false)}
        title="Gerar parcelas em lote"
      >
        <GerarLoteForm
          anosLetivos={anosLetivos}
          turmas={turmas}
          categoriasReceita={categoriasReceita}
          onSubmit={handleGerarLote}
          onCancel={() => setLoteModalOpen(false)}
          isLoading={gerarLote.isPending}
        />
      </Modal>

      <Modal
        open={!!pagamentoParcelaId}
        onClose={() => setPagamentoParcelaId(null)}
        title="Registar pagamento"
      >
        {parcelaParaPagamento && (
          <PagamentoForm
            parcelaId={parcelaParaPagamento.id}
            valorPendente={parcelaParaPagamento.valorAtualizado}
            onSubmit={handleRegistrarPagamento}
            onCancel={() => setPagamentoParcelaId(null)}
            isLoading={registrarPagamento.isPending}
          />
        )}
      </Modal>

      <div className="card overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : error ? (
          <div className="p-8 text-center text-red-600" role="alert">
            Erro: {(error as Error).message}
          </div>
        ) : parcelas.length === 0 ? (
          <EmptyState
            title="Nenhuma parcela"
            description="Crie parcelas para mensalidades ou taxas."
            action={
              <button type="button" onClick={handleCreate} className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2">
                Nova parcela
              </button>
            }
          />
        ) : (
          <table className="min-w-full divide-y divide-studio-border" aria-label="Parcelas financeiras">
            <caption className="sr-only">Lista de parcelas por aluno e categoria</caption>
            <thead className="bg-studio-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                  Aluno
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                  Categoria
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                  Vencimento
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-studio-foreground-lighter uppercase">
                  Valor (Kz)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-studio-foreground-lighter uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-studio-border">
              {parcelas.map((p) => (
                <tr key={p.id} className="hover:bg-studio-muted/50">
                  <td className="px-4 py-3 text-sm text-studio-foreground">
                    {p.alunoNome}
                  </td>
                  <td className="px-4 py-3 text-sm text-studio-foreground-light">
                    {p.categoriaNome}
                  </td>
                  <td className="px-4 py-3 text-sm">{p.vencimento}</td>
                  <td className="px-4 py-3 text-sm text-right">
                    {formatCurrency(p.valorAtualizado)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={
                        p.status === 'paga'
                          ? 'text-green-600'
                          : p.status === 'atrasada'
                            ? 'text-red-600'
                            : 'text-studio-foreground-light'
                      }
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    {p.status !== 'paga' && p.status !== 'cancelada' && (
                      <button
                        type="button"
                        onClick={() => setPagamentoParcelaId(p.id)}
                        className="link-action link-action-primary mr-3"
                      >
                        Pagar
                      </button>
                    )}
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
