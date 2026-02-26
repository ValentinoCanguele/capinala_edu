import { useState } from 'react'
import {
  useFinancasDRE,
  useFinancasFluxoCaixa,
  useFinancasInadimplencia,
} from '@/data/escola/financasQueries'
import { useAnosLetivos } from '@/data/escola/queries'
import PageHeader from '@/components/PageHeader'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { Card } from '@/components/shared/Card'
import { Select } from '@/components/shared/Select'
import { Input } from '@/components/shared/Input'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { formatCurrency } from '@/lib/formatCurrency'
import { FileText, TrendingUp, TrendingDown, Users, Calendar, Filter, PieChart, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react'

const defaultDataInicio = (() => {
  const d = new Date()
  d.setMonth(d.getMonth() - 1)
  return d.toISOString().slice(0, 10)
})()
const defaultDataFim = new Date().toISOString().slice(0, 10)

export default function FinancasRelatorios() {
  const [dataInicio, setDataInicio] = useState(defaultDataInicio)
  const [dataFim, setDataFim] = useState(defaultDataFim)
  const [anoLetivoId, setAnoLetivoId] = useState<string>('')

  const { data: dre, isLoading: dreLoading } = useFinancasDRE(dataInicio, dataFim)
  const { data: fluxo = [], isLoading: fluxoLoading } = useFinancasFluxoCaixa(
    dataInicio,
    dataFim
  )
  const { data: inadimplentes = [], isLoading: inadLoading } =
    useFinancasInadimplencia(anoLetivoId || null)
  const { data: anosLetivos = [] } = useAnosLetivos()

  return (
    <div className="space-y-10 animate-fade-in pb-10">
      <PageHeader
        title="Relatórios Estruturados"
        subtitle="Analítica institucional: DRE, Fluxo de Caixa e Auditoria de Inadimplência."
        actions={
          <Button variant="ghost" icon={<FileText className="w-4 h-4" />}>
            Exportar PDF
          </Button>
        }
      />

      <Card>
        <div className="flex flex-wrap gap-6 items-end">
          <Input
            label="Início do Período"
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="w-44"
          />
          <Input
            label="Fim do Período"
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="w-44"
          />
          <Select
            label="Ciclo Académico (Inadimplência)"
            value={anoLetivoId}
            onChange={(e) => setAnoLetivoId(e.target.value)}
            options={[
              { value: '', label: 'Todos os Ciclos' },
              ...anosLetivos.map((a) => ({ value: a.id, label: a.nome }))
            ]}
            className="flex-1 min-w-[240px]"
          />
          <Button variant="ghost" size="icon" className="mb-0.5" onClick={() => { setDataInicio(defaultDataInicio); setDataFim(defaultDataFim); setAnoLetivoId('') }}>
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5 text-studio-brand" />
          <h3 className="text-lg font-bold text-studio-foreground tracking-tight">DRE Simplificado (Demonstração de Resultados)</h3>
        </div>

        {dreLoading ? (
          <SkeletonTable rows={5} columns={3} />
        ) : dre ? (
          <Card noPadding className="overflow-hidden">
            <table className="w-full text-sm" aria-label="DRE por categoria">
              <thead>
                <tr className="bg-studio-muted/10 border-b border-studio-border/50">
                  <th scope="col" className="text-left px-6 py-4 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Categoria Económica</th>
                  <th scope="col" className="text-left px-6 py-4 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Tipo</th>
                  <th scope="col" className="text-right px-6 py-4 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Total Consolidado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-studio-border/20">
                {dre.receitas.map((r) => (
                  <tr key={r.categoriaNome} className="group hover:bg-studio-muted/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-studio-foreground">{r.categoriaNome}</td>
                    <td className="px-6 py-4">
                      <Badge variant="brand">Receita</Badge>
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums font-bold text-emerald-600">
                      {formatCurrency(r.total)}
                    </td>
                  </tr>
                ))}
                {dre.despesas.map((r) => (
                  <tr key={r.categoriaNome} className="group hover:bg-studio-muted/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-studio-foreground">{r.categoriaNome}</td>
                    <td className="px-6 py-4">
                      <Badge variant="neutral">Despesa</Badge>
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums font-bold text-red-500">
                      {formatCurrency(r.total)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-studio-muted/5 border-t border-studio-border/50">
                  <td className="px-6 py-4 font-bold text-studio-foreground-light" colSpan={2}>
                    Somatório de Receitas
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums font-extrabold text-emerald-600 text-base">
                    {formatCurrency(dre.totalReceitas)}
                  </td>
                </tr>
                <tr className="bg-studio-muted/5">
                  <td className="px-6 py-4 font-bold text-studio-foreground-light" colSpan={2}>
                    Somatório de Despesas
                  </td>
                  <td className="px-6 py-4 text-right tabular-nums font-extrabold text-red-500 text-base">
                    {formatCurrency(dre.totalDespesas)}
                  </td>
                </tr>
                <tr className="bg-studio-bg border-t-2 border-studio-border">
                  <td className="px-6 py-5 font-black text-studio-foreground text-base uppercase tracking-tight" colSpan={2}>
                    Resultado Líquido do Exercício
                  </td>
                  <td
                    className={`px-6 py-5 text-right tabular-nums font-black text-lg ${dre.resultado >= 0
                      ? 'text-emerald-600'
                      : 'text-red-600'
                      }`}
                  >
                    {formatCurrency(dre.resultado)}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        ) : (
          <Card className="text-center py-10">
            <Activity className="w-12 h-12 text-studio-muted mx-auto mb-4" />
            <p className="text-studio-foreground-light font-medium">Selecione um intervalo para gerar a DRE.</p>
          </Card>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-studio-brand" />
          <h3 className="text-lg font-bold text-studio-foreground tracking-tight">Fluxo de Caixa Detalhado</h3>
        </div>

        {fluxoLoading ? (
          <SkeletonTable rows={6} columns={6} />
        ) : fluxo.length > 0 ? (
          <Card noPadding className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" aria-label="Fluxo de caixa">
                <thead>
                  <tr className="bg-studio-muted/10 border-b border-studio-border/50">
                    <th scope="col" className="text-left px-6 py-4 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Data</th>
                    <th scope="col" className="text-left px-6 py-4 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Descrição</th>
                    <th scope="col" className="text-left px-6 py-4 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Categoria</th>
                    <th scope="col" className="text-left px-6 py-4 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Tipo</th>
                    <th scope="col" className="text-right px-6 py-4 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Valor</th>
                    <th scope="col" className="text-right px-6 py-4 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Saldo Acumulado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-studio-border/20">
                  {fluxo.map((row, i) => (
                    <tr key={i} className="group hover:bg-studio-muted/5 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-studio-foreground-light font-medium">{row.data}</td>
                      <td className="px-6 py-4 font-bold text-studio-foreground">{row.descricao}</td>
                      <td className="px-6 py-4">
                        <Badge variant="neutral">{row.categoriaNome}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          {row.tipo === 'entrada' ? (
                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-500" />
                          )}
                          <span className={`font-bold ${row.tipo === 'entrada' ? 'text-emerald-600' : 'text-red-500'}`}>
                            {row.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                          </span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-right tabular-nums font-bold ${row.tipo === 'entrada' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {row.tipo === 'saida' ? '- ' : '+ '}
                        {formatCurrency(row.valor)}
                      </td>
                      <td className="px-6 py-4 text-right tabular-nums font-black text-studio-foreground">
                        {formatCurrency(row.saldoAcumulado)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        ) : (
          <Card className="text-center py-10">
            <Calendar className="w-12 h-12 text-studio-muted mx-auto mb-4" />
            <p className="text-studio-foreground-light font-medium">Nenhum lançamento registado no período selecionado.</p>
          </Card>
        )}
      </section>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-bold text-studio-foreground tracking-tight">Auditoria de Inadimplência</h3>
        </div>

        {inadLoading ? (
          <SkeletonTable rows={4} columns={4} />
        ) : inadimplentes.length > 0 ? (
          <Card noPadding className="overflow-hidden">
            <table className="w-full text-sm" aria-label="Inadimplência por aluno">
              <thead>
                <tr className="bg-studio-muted/10 border-b border-studio-border/50">
                  <th scope="col" className="text-left px-6 py-4 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Estudante Devedor</th>
                  <th scope="col" className="text-right px-6 py-4 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Prestações em Atraso</th>
                  <th scope="col" className="text-right px-6 py-4 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Dívida Consolidada</th>
                  <th scope="col" className="text-right px-6 py-4 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Envelhecimento (Dias)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-studio-border/20">
                {inadimplentes.map((row) => (
                  <tr key={row.alunoId} className="group hover:bg-studio-muted/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-studio-muted" />
                        <span className="font-bold text-studio-foreground">{row.alunoNome}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Badge variant="danger" pulse>{row.parcelasAtrasadas} Parcelas</Badge>
                    </td>
                    <td className="px-6 py-4 text-right tabular-nums font-black text-red-600">
                      {formatCurrency(row.valorTotalAberto)}
                    </td>
                    <td className="px-6 py-4 text-right text-studio-foreground-light font-bold">
                      {row.diasAtraso} dias
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        ) : (
          <Card className="text-center py-10">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <p className="text-studio-foreground-light font-medium">Compliance financeiro atingido. Zero inadimplência para este filtro.</p>
          </Card>
        )}
      </section>
    </div>
  )
}
