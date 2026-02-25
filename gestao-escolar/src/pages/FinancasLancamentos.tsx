import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  useLancamentos,
  useCategoriasFinancas,
  useAnosLetivos,
} from '@/data/escola/queries'
import type { LancamentoRow } from '@/data/escola/queries'
import {
  useCreateLancamento,
  useUpdateLancamento,
  useDeleteLancamento,
  useImportLancamentosCsv,
} from '@/data/escola/mutations'
import type {
  LancamentoInput,
  ImportLancamentosCsvResult,
} from '@/data/escola/mutations'
import Modal from '@/components/Modal'
import EmptyState from '@/components/EmptyState'
import PageHeader from '@/components/PageHeader'
import { TableSkeleton } from '@/components/PageSkeleton'
import { downloadLancamentosCsvTemplate } from '@/lib/downloadCsv'
import { formatCurrency } from '@/lib/formatCurrency'

function LancamentosTable({
  lancamentos,
  onEdit,
  onDelete,
}: {
  lancamentos: LancamentoRow[]
  onEdit: (id: string) => void
  onDelete: (id: string, desc: string) => void
}) {
  const totalEntradas = lancamentos.filter((l) => l.tipo === 'entrada').reduce((s, l) => s + l.valor, 0)
  const totalSaidas = lancamentos.filter((l) => l.tipo === 'saida').reduce((s, l) => s + l.valor, 0)
  const saldo = totalEntradas - totalSaidas
  return (
    <>
      <div className="px-4 py-2 bg-studio-muted/50 border-b border-studio-border flex flex-wrap gap-6 text-sm">
        <span className="text-studio-foreground-light">
          <strong className="text-green-600">Entradas: {formatCurrency(totalEntradas)}</strong>
        </span>
        <span className="text-studio-foreground-light">
          <strong className="text-red-600">Saídas: {formatCurrency(totalSaidas)}</strong>
        </span>
        <span className="text-studio-foreground-light">
          <strong className={saldo >= 0 ? 'text-green-600' : 'text-red-600'}>
            Saldo: {formatCurrency(saldo)}
          </strong>
        </span>
      </div>
      <table className="min-w-full divide-y divide-studio-border" aria-label="Lançamentos financeiros">
        <caption className="sr-only">Lista de lançamentos com totais de entradas, saídas e saldo</caption>
        <thead className="bg-studio-muted">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">Data</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">Tipo</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">Valor (Kz)</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">Categoria</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">Descrição</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-studio-foreground-lighter uppercase">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-studio-border">
          {lancamentos.map((l) => (
            <tr key={l.id} className="hover:bg-studio-muted/50">
              <td className="px-4 py-3 text-sm text-studio-foreground">{l.data}</td>
              <td className="px-4 py-3 text-sm text-studio-foreground-light">
                {l.tipo === 'entrada' ? 'Entrada' : 'Saída'}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-studio-foreground">{formatCurrency(l.valor)}</td>
              <td className="px-4 py-3 text-sm text-studio-foreground-light">{l.categoriaNome}</td>
              <td className="px-4 py-3 text-sm text-studio-foreground-lighter max-w-[200px] truncate">{l.descricao || '—'}</td>
              <td className="px-4 py-3 text-right text-sm">
                <button
                  type="button"
                  onClick={() => onEdit(l.id)}
                  className="link-action link-action-primary mr-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-1 rounded px-1"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(l.id, l.descricao)}
                  className="link-action link-action-danger focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 rounded px-1"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

const FILTER_DEFAULT = {
  tipo: undefined as 'entrada' | 'saida' | undefined,
  dataInicio: '',
  dataFim: '',
  categoriaId: '',
  anoLetivoId: '',
}

function LancamentoForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
  categorias,
  anosLetivos,
}: {
  defaultValues: Partial<LancamentoInput> & { tipo: 'entrada' | 'saida' }
  onSubmit: (data: LancamentoInput) => void
  onCancel: () => void
  isLoading: boolean
  categorias: { id: string; nome: string; tipo: string }[]
  anosLetivos: { id: string; nome: string }[]
}) {
  const [tipo, setTipo] = useState<'entrada' | 'saida'>(defaultValues.tipo)
  const [data, setData] = useState(defaultValues.data ?? '')
  const [valor, setValor] = useState(
    defaultValues.valor !== undefined ? String(defaultValues.valor) : ''
  )
  const [categoriaId, setCategoriaId] = useState(defaultValues.categoriaId ?? '')
  const [descricao, setDescricao] = useState(defaultValues.descricao ?? '')
  const [formaPagamento, setFormaPagamento] = useState(
    defaultValues.formaPagamento ?? ''
  )
  const [referencia, setReferencia] = useState(defaultValues.referencia ?? '')
  const [anoLetivoId, setAnoLetivoId] = useState(
    defaultValues.anoLetivoId ?? ''
  )

  const tipoCategoria = tipo === 'entrada' ? 'receita' : 'despesa'
  const categoriasFiltradas = useMemo(
    () => categorias.filter((c) => c.tipo === tipoCategoria),
    [categorias, tipoCategoria]
  )
  const categoriasParaSelect =
    categoriasFiltradas.length > 0 ? categoriasFiltradas : categorias

  useEffect(() => {
    const currentCat = categorias.find((c) => c.id === categoriaId)
    if (currentCat && currentCat.tipo !== tipoCategoria) setCategoriaId('')
  }, [tipo, tipoCategoria, categoriaId, categorias])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const val = parseFloat(valor.replace(',', '.'))
    if (!data.trim()) {
      toast.error('Data é obrigatória')
      return
    }
    if (Number.isNaN(val) || val < 0) {
      toast.error('Valor inválido')
      return
    }
    if (!categoriaId) {
      toast.error('Categoria é obrigatória')
      return
    }
    onSubmit({
      tipo,
      data: data.trim(),
      valor: val,
      categoriaId,
      descricao: descricao.trim() || undefined,
      formaPagamento: formaPagamento.trim() || undefined,
      referencia: referencia.trim() || undefined,
      anoLetivoId: anoLetivoId.trim() || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="lanc-tipo" className="label">
          Tipo
        </label>
        <select
          id="lanc-tipo"
          value={tipo}
          onChange={(e) =>
            setTipo(e.target.value as 'entrada' | 'saida')
          }
          className="input w-full"
        >
          <option value="entrada">Entrada (receita)</option>
          <option value="saida">Saída (despesa)</option>
        </select>
      </div>
      <div>
        <label htmlFor="lanc-data" className="label">
          Data
        </label>
        <input
          id="lanc-data"
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className="input w-full"
          required
        />
      </div>
      <div>
        <label htmlFor="lanc-valor" className="label">
          Valor (Kz)
        </label>
        <input
          id="lanc-valor"
          type="text"
          inputMode="decimal"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          className="input w-full"
          placeholder="0,00 Kz"
          required
        />
      </div>
      <div>
        <label htmlFor="lanc-categoria" className="label">
          Categoria
        </label>
        <select
          id="lanc-categoria"
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          className="input w-full"
          required
        >
          <option value="">Selecione...</option>
          {categoriasParaSelect.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome} ({c.tipo === 'receita' ? 'Receita' : 'Despesa'})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="lanc-descricao" className="label">
          Descrição
        </label>
        <input
          id="lanc-descricao"
          type="text"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="input w-full"
          placeholder="Opcional"
        />
      </div>
      <div>
        <label htmlFor="lanc-forma" className="label">
          Forma de pagamento
        </label>
        <input
          id="lanc-forma"
          type="text"
          value={formaPagamento}
          onChange={(e) => setFormaPagamento(e.target.value)}
          className="input w-full"
          placeholder="Ex: Dinheiro, Transferência"
        />
      </div>
      <div>
        <label htmlFor="lanc-ref" className="label">
          Referência
        </label>
        <input
          id="lanc-ref"
          type="text"
          value={referencia}
          onChange={(e) => setReferencia(e.target.value)}
          className="input w-full"
          placeholder="Opcional"
        />
      </div>
      <div>
        <label htmlFor="lanc-ano" className="label">
          Ano letivo
        </label>
        <select
          id="lanc-ano"
          value={anoLetivoId}
          onChange={(e) => setAnoLetivoId(e.target.value)}
          className="input w-full"
        >
          <option value="">Nenhum</option>
          {anosLetivos.map((a) => (
            <option key={a.id} value={a.id}>
              {a.nome}
            </option>
          ))}
        </select>
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

export default function FinancasLancamentos() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filters, setFilters] = useState(FILTER_DEFAULT)

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

  const filterParams = useMemo(
    () => ({
      tipo: filters.tipo || undefined,
      dataInicio: filters.dataInicio || undefined,
      dataFim: filters.dataFim || undefined,
      categoriaId: filters.categoriaId || undefined,
      anoLetivoId: filters.anoLetivoId || undefined,
    }),
    [filters]
  )

  const { data: lancamentosRaw, isLoading, error } = useLancamentos(filterParams)
  const { data: categoriasRaw = [] } = useCategoriasFinancas()
  const { data: anosLetivosRaw = [] } = useAnosLetivos()

  const lancamentos = Array.isArray(lancamentosRaw) ? lancamentosRaw : []
  const categorias = Array.isArray(categoriasRaw) ? categoriasRaw : []
  const anosLetivos = Array.isArray(anosLetivosRaw) ? anosLetivosRaw : []
  const createLanc = useCreateLancamento()
  const updateLanc = useUpdateLancamento()
  const deleteLanc = useDeleteLancamento()
  const importCsv = useImportLancamentosCsv()

  const editing: LancamentoRow | null = editingId
    ? lancamentos.find((l) => l.id === editingId) ?? null
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

  const handleDelete = (id: string, desc: string) => {
    if (!window.confirm(`Eliminar o lançamento "${desc || id}"?`)) return
    deleteLanc.mutate(id, {
      onSuccess: () => toast.success('Lançamento eliminado.'),
      onError: (err) => toast.error(err.message),
    })
  }

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setImportResult(null)
    if (!file) {
      setImportFileText(null)
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setImportFileText(typeof reader.result === 'string' ? reader.result : null)
    }
    reader.readAsText(file, 'utf-8')
  }

  const handleImportSubmit = () => {
    if (!importFileText?.trim()) {
      toast.error('Selecione um ficheiro CSV.')
      return
    }
    importCsv.mutate(importFileText, {
      onSuccess: (data) => {
        setImportResult(data)
        if (data.erros.length === 0) {
          toast.success(`${data.importados} lançamento(s) importado(s).`)
        } else if (data.importados > 0) {
          toast.success(
            `${data.importados} importado(s); ${data.erros.length} erro(s). Ver detalhes no painel.`
          )
        }
      },
      onError: (err) => toast.error(err.message),
    })
  }

  const closeImportModal = () => {
    setImportModalOpen(false)
    setImportFileText(null)
    setImportResult(null)
  }

  const isFormLoading = createLanc.isPending || updateLanc.isPending

  return (
    <div>
      <PageHeader
        title="Lançamentos financeiros"
        subtitle="Entradas e saídas por data e categoria."
        actions={
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setImportModalOpen(true)}
              className="btn-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
            >
              Importar CSV / Excel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
            >
              Novo lançamento
            </button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap gap-3 items-end">
        <div>
          <label htmlFor="f-tipo" className="label text-xs">
            Tipo
          </label>
          <select
            id="f-tipo"
            value={filters.tipo ?? ''}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                tipo: (e.target.value || undefined) as
                  | 'entrada'
                  | 'saida'
                  | undefined,
              }))
            }
            className="input"
          >
            <option value="">Todos</option>
            <option value="entrada">Entrada</option>
            <option value="saida">Saída</option>
          </select>
        </div>
        <div>
          <label htmlFor="f-inicio" className="label text-xs">
            Data início
          </label>
          <input
            id="f-inicio"
            type="date"
            value={filters.dataInicio}
            onChange={(e) =>
              setFilters((f) => ({ ...f, dataInicio: e.target.value }))
            }
            className="input"
          />
        </div>
        <div>
          <label htmlFor="f-fim" className="label text-xs">
            Data fim
          </label>
          <input
            id="f-fim"
            type="date"
            value={filters.dataFim}
            onChange={(e) =>
              setFilters((f) => ({ ...f, dataFim: e.target.value }))
            }
            className="input"
          />
        </div>
        <div>
          <label htmlFor="f-cat" className="label text-xs">
            Categoria
          </label>
          <select
            id="f-cat"
            value={filters.categoriaId}
            onChange={(e) =>
              setFilters((f) => ({ ...f, categoriaId: e.target.value }))
            }
            className="input min-w-[160px]"
          >
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-ano" className="label text-xs">
            Ano letivo
          </label>
          <select
            id="f-ano"
            value={filters.anoLetivoId}
            onChange={(e) =>
              setFilters((f) => ({ ...f, anoLetivoId: e.target.value }))
            }
            className="input min-w-[140px]"
          >
            <option value="">Todos</option>
            {anosLetivos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setFilters(FILTER_DEFAULT)}
          className="btn-secondary text-sm"
        >
          Limpar filtros
        </button>
      </div>

      <Modal
        open={importModalOpen}
        onClose={closeImportModal}
        title="Importar lançamentos (CSV / Excel)"
      >
        <div className="space-y-4">
          <p className="text-sm text-studio-foreground-light">
            Use um ficheiro CSV com cabeçalho: Data, Tipo, Categoria, Valor,
            Descrição, Forma pagamento, Referência. Data no formato AAAA-MM-DD.
            Categoria pelo nome (igual às categorias da escola).
          </p>
          <p className="text-sm">
            <button
              type="button"
              onClick={downloadLancamentosCsvTemplate}
              className="link-action link-action-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand rounded"
            >
              Descarregar modelo CSV
            </button>
          </p>
          <div>
            <label htmlFor="import-csv-file" className="label">
              Ficheiro CSV
            </label>
            <input
              id="import-csv-file"
              type="file"
              accept=".csv,.txt,text/csv,application/csv"
              onChange={handleImportFileChange}
              className="input w-full"
            />
          </div>
          {importResult && (
            <div className="rounded-md bg-studio-muted p-3 space-y-2">
              <p className="text-sm font-medium text-studio-foreground">
                Resultado: {importResult.importados} lançamento(s) importado(s).
              </p>
              {importResult.erros.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-studio-foreground-lighter mb-1">
                    Erros por linha:
                  </p>
                  <ul className="text-xs text-studio-foreground-light max-h-40 overflow-auto space-y-1">
                    {importResult.erros.map((err, idx) => (
                      <li key={idx}>
                        Linha {err.linha}: {err.mensagem}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={closeImportModal}
              className="btn-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handleImportSubmit}
              disabled={!importFileText?.trim() || importCsv.isPending}
              className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {importCsv.isPending ? 'A importar...' : 'Importar'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Editar lançamento' : 'Novo lançamento'}
      >
        <LancamentoForm
          defaultValues={{
            tipo: editing?.tipo ?? 'entrada',
            data: editing?.data ?? '',
            valor: editing?.valor ?? 0,
            categoriaId: editing?.categoriaId ?? '',
            descricao: editing?.descricao ?? '',
            formaPagamento: editing?.formaPagamento ?? '',
            referencia: editing?.referencia ?? '',
            anoLetivoId: editing?.anoLetivoId ?? '',
          }}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isLoading={isFormLoading}
          categorias={categorias}
          anosLetivos={anosLetivos}
        />
      </Modal>

      <div className="card overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={8} />
        ) : error ? (
          <div className="p-8 text-center text-red-600" role="alert">
            Erro: {error instanceof Error ? error.message : String(error)}
          </div>
        ) : lancamentos.length === 0 ? (
          <EmptyState
            title="Nenhum lançamento encontrado"
            description="Ajuste os filtros ou clique em «Novo lançamento»."
            action={
              <button
                type="button"
                onClick={handleCreate}
                className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
              >
                Novo lançamento
              </button>
            }
          />
        ) : (
          <LancamentosTable
            lancamentos={lancamentos}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  )
}
