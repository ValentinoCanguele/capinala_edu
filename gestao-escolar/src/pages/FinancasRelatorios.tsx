import { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  useFluxoCaixa,
  useDRE,
  useInadimplencia,
  useAnosLetivos,
} from '@/data/escola/queries'
import { downloadExportCsv } from '@/lib/downloadCsv'
import { formatCurrency } from '@/lib/formatCurrency'
import PageHeader from '@/components/PageHeader'
import EmptyState from '@/components/EmptyState'
import { TableSkeleton } from '@/components/PageSkeleton'

const ESCOLA_API = '/api/escola'

const MESES: Record<number, string> = {
  1: 'Janeiro',
  2: 'Fevereiro',
  3: 'Março',
  4: 'Abril',
  5: 'Maio',
  6: 'Junho',
  7: 'Julho',
  8: 'Agosto',
  9: 'Setembro',
  10: 'Outubro',
  11: 'Novembro',
  12: 'Dezembro',
}

function getPrimeiroDiaMes(ano: number, mes: number): string {
  return `${ano}-${String(mes).padStart(2, '0')}-01`
}

function getUltimoDiaMes(ano: number, mes: number): string {
  const d = new Date(ano, mes, 0)
  return d.toISOString().slice(0, 10)
}

type VistaRelatorio = 'fluxo' | 'dre' | 'inadimplencia'

export default function FinancasRelatorios() {
  const [searchParams] = useSearchParams()
  const now = new Date()
  const [ano, setAno] = useState(now.getFullYear())
  const [mes, setMes] = useState(now.getMonth() + 1)
  const [vista, setVista] = useState<VistaRelatorio>('fluxo')
  const [anoLetivoId, setAnoLetivoId] = useState('')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const v = searchParams.get('vista') as VistaRelatorio | null
    if (v === 'fluxo' || v === 'dre' || v === 'inadimplencia') setVista(v)
  }, [searchParams])

  const dataInicio = useMemo(
    () => getPrimeiroDiaMes(ano, mes),
    [ano, mes]
  )
  const dataFim = useMemo(
    () => getUltimoDiaMes(ano, mes),
    [ano, mes]
  )

  const { data: fluxoRaw = [], isLoading: loadingFluxo } = useFluxoCaixa(
    dataInicio,
    dataFim
  )
  const { data: dre, isLoading: loadingDre } = useDRE(dataInicio, dataFim)
  const { data: inadimplentesRaw = [], isLoading: loadingInad } =
    useInadimplencia(anoLetivoId || undefined)
  const { data: anosLetivosRaw = [] } = useAnosLetivos()

  const fluxo = Array.isArray(fluxoRaw) ? fluxoRaw : []
  const inadimplentes = Array.isArray(inadimplentesRaw) ? inadimplentesRaw : []
  const anosLetivos = Array.isArray(anosLetivosRaw) ? anosLetivosRaw : []

  const runExport = useCallback(
    async (fn: () => Promise<void>) => {
      if (exporting) return
      setExporting(true)
      try {
        await fn()
      } catch (e) {
        toast.error(e instanceof Error ? e.message : 'Erro ao exportar')
      } finally {
        setExporting(false)
      }
    },
    [exporting]
  )

  const handleExportLancamentos = () =>
    runExport(async () => {
      await downloadExportCsv(
        `${ESCOLA_API}/financas/export/lancamentos?format=csv&dataInicio=${dataInicio}&dataFim=${dataFim}`,
        `lancamentos-${dataInicio}-${dataFim}.csv`
      )
      toast.success('Ficheiro descarregado.')
    })

  const handleExportParcelas = () =>
    runExport(async () => {
      const params = new URLSearchParams({ format: 'csv' })
      if (anoLetivoId) params.set('anoLetivoId', anoLetivoId)
      params.set('dataInicio', dataInicio)
      params.set('dataFim', dataFim)
      await downloadExportCsv(
        `${ESCOLA_API}/financas/export/parcelas?${params}`,
        `parcelas-${dataInicio}-${dataFim}.csv`
      )
      toast.success('Ficheiro descarregado.')
    })

  const handleExportInadimplencia = () =>
    runExport(async () => {
      const params = new URLSearchParams({ format: 'csv' })
      if (anoLetivoId) params.set('anoLetivoId', anoLetivoId)
      await downloadExportCsv(
        `${ESCOLA_API}/financas/export/inadimplencia?${params}`,
        `inadimplencia-${new Date().toISOString().slice(0, 10)}.csv`
      )
      toast.success('Ficheiro descarregado.')
    })

  return (
    <div>
      <PageHeader
        title="Relatórios financeiros"
        subtitle="Fluxo de caixa, DRE e inadimplência. Exportar para Excel (CSV)."
      />

      <div className="mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label htmlFor="rel-mes" className="label text-xs">Mês / Ano</label>
          <div className="flex gap-2">
            <select
              id="rel-mes"
              value={mes}
              onChange={(e) => setMes(Number(e.target.value))}
              className="input min-w-[8rem]"
              aria-label="Mês"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <option key={m} value={m}>
                  {MESES[m]}
                </option>
              ))}
            </select>
            <select
              id="rel-ano"
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="input w-24"
              aria-label="Ano"
            >
              {[now.getFullYear(), now.getFullYear() - 1].map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="rel-ano-letivo" className="label text-xs">Ano letivo (inadimplência)</label>
          <select
            id="rel-ano-letivo"
            value={anoLetivoId}
            onChange={(e) => setAnoLetivoId(e.target.value)}
            className="input w-48"
            aria-label="Ano letivo para inadimplência"
          >
            <option value="">Todos</option>
            {anosLetivos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 border-b border-studio-border -mb-px">
          {(['fluxo', 'dre', 'inadimplencia'] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVista(v)}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                vista === v
                  ? 'border-studio-brand text-studio-brand'
                  : 'border-transparent text-studio-foreground-light hover:text-studio-foreground'
              }`}
            >
              {v === 'fluxo' && 'Fluxo de caixa'}
              {v === 'dre' && 'DRE'}
              {v === 'inadimplencia' && 'Inadimplência'}
            </button>
          ))}
        </div>
      </div>

      {vista === 'fluxo' && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-studio-border flex justify-between items-center">
            <h3 className="font-medium">Fluxo de caixa</h3>
            <button
              type="button"
              onClick={handleExportLancamentos}
              disabled={exporting}
              className="btn-secondary text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {exporting ? 'A exportar...' : 'Exportar CSV (Excel)'}
            </button>
          </div>
          {loadingFluxo ? (
            <TableSkeleton rows={5} />
          ) : fluxo.length === 0 ? (
            <EmptyState
              title="Nenhum lançamento no período"
              description="Altere as datas ou importe lançamentos para ver o fluxo de caixa."
            />
          ) : (
            <table className="min-w-full divide-y divide-studio-border" aria-label="Fluxo de caixa">
              <caption className="sr-only">Movimentos e saldo acumulado no período</caption>
              <thead className="bg-studio-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                    Data
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                    Descrição
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-studio-foreground-lighter uppercase">
                    Valor (Kz)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-studio-foreground-lighter uppercase">
                    Saldo (Kz)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-studio-border">
                {fluxo.map((r, i) => (
                  <tr key={i} className="hover:bg-studio-muted/50">
                    <td className="px-4 py-3 text-sm">{r.data}</td>
                    <td className="px-4 py-3 text-sm">{r.descricao || '—'}</td>
                    <td className="px-4 py-3 text-sm">
                      {r.tipo === 'entrada' ? (
                        <span className="text-green-600">Entrada</span>
                      ) : (
                        <span className="text-red-600">Saída</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">{r.categoriaNome}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      {r.tipo === 'entrada' ? '+' : '-'}
                      {formatCurrency(r.valor)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium">
                      {formatCurrency(r.saldoAcumulado)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {vista === 'dre' && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-studio-border flex justify-between items-center">
            <h3 className="font-medium">DRE simplificado</h3>
            <button
              type="button"
              onClick={handleExportLancamentos}
              className="btn-secondary text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
            >
              Exportar lançamentos CSV
            </button>
          </div>
          {loadingDre ? (
            <TableSkeleton rows={5} />
          ) : !dre ? (
            <EmptyState
              title="Nenhum dado para DRE"
              description="Não existem lançamentos no período para o demonstrativo de resultados."
            />
          ) : (
            <div className="p-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium text-studio-foreground-lighter mb-2">
                  Receitas por categoria
                </h4>
                <ul className="space-y-1">
                  {(Array.isArray(dre.receitas) ? dre.receitas : []).map((r) => (
                    <li key={r.categoriaNome} className="flex justify-between text-sm">
                      <span>{r.categoriaNome}</span>
                      <span className="text-green-600">{formatCurrency(r.total)}</span>
                    </li>
                  ))}
                  <li className="flex justify-between font-medium pt-2 border-t border-studio-border">
                    <span>Total receitas</span>
                    <span className="text-green-600">{formatCurrency(Number(dre.totalReceitas) || 0)}</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-studio-foreground-lighter mb-2">
                  Despesas por categoria
                </h4>
                <ul className="space-y-1">
                  {(Array.isArray(dre.despesas) ? dre.despesas : []).map((r) => (
                    <li key={r.categoriaNome} className="flex justify-between text-sm">
                      <span>{r.categoriaNome}</span>
                      <span className="text-red-600">{formatCurrency(r.total)}</span>
                    </li>
                  ))}
                  <li className="flex justify-between font-medium pt-2 border-t border-studio-border">
                    <span>Total despesas</span>
                    <span className="text-red-600">{formatCurrency(Number(dre.totalDespesas) || 0)}</span>
                  </li>
                </ul>
              </div>
              <div className="pt-2 border-t border-studio-border">
                <p className="flex justify-between font-semibold">
                  <span>Resultado (receitas - despesas)</span>
                  <span
                    className={
                      Number(dre.resultado) >= 0 ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {formatCurrency(Number(dre.resultado) || 0)}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {vista === 'inadimplencia' && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-studio-border flex justify-between items-center">
            <h3 className="font-medium">Inadimplentes</h3>
            <button
              type="button"
              onClick={handleExportInadimplencia}
              disabled={exporting}
              className="btn-secondary text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 disabled:opacity-50"
            >
              {exporting ? 'A exportar...' : 'Exportar CSV (Excel)'}
            </button>
          </div>
          {loadingInad ? (
            <TableSkeleton rows={5} />
          ) : inadimplentes.length === 0 ? (
            <EmptyState
              title="Nenhum inadimplente"
              description="Não há parcelas em atraso no período selecionado."
            />
          ) : (
            <table className="min-w-full divide-y divide-studio-border" aria-label="Inadimplentes">
              <caption className="sr-only">Alunos com parcelas em atraso e valor em aberto</caption>
              <thead className="bg-studio-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                    Aluno
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-studio-foreground-lighter uppercase">
                    Parcelas atrasadas
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-studio-foreground-lighter uppercase">
                    Valor em aberto (Kz)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-studio-foreground-lighter uppercase">
                    Dias atraso
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-studio-border">
                {inadimplentes.map((r) => (
                  <tr key={r.alunoId} className="hover:bg-studio-muted/50">
                    <td className="px-4 py-3 text-sm font-medium">{r.alunoNome}</td>
                    <td className="px-4 py-3 text-sm text-right">{r.parcelasAtrasadas}</td>
                    <td className="px-4 py-3 text-sm text-right text-red-600">
                      {formatCurrency(r.valorTotalAberto)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">{r.diasAtraso}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
