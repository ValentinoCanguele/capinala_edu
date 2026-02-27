import { useFinancasDashboard } from '@/data/escola/financasQueries'
import PageHeader from '@/components/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { Card } from '@/components/shared/Card'
import { Badge } from '@/components/shared/Badge'
import { formatCurrency } from '@/lib/formatCurrency'
import { Wallet, TrendingUp, TrendingDown, Users, Calendar, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react'

export default function FinancasDashboard() {
  const { data, isLoading, error } = useFinancasDashboard()

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <PageHeader title="Dashboard Financeiro" subtitle="Carregando métricas consolidadas..." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <StatCard key={i} title="Carregando..." value="—" loading />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50/10 border border-red-500/20 rounded-2xl">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-studio-foreground">Erro ao carregar finanças</h3>
        <p className="text-studio-foreground-light mt-2">{error.message}</p>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="Dashboard Financeiro"
        subtitle="Controlo institucional de receitas, despesas e fluxos de caixa."
        actions={
          <Badge variant="brand" pulse className="px-4 py-1.5 uppercase tracking-widest font-bold">
            Realtime Finance
          </Badge>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Receitas do Mês"
          value={formatCurrency(data.receitasMes)}
          icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
          trend={{ value: '+8.4%', direction: 'up', label: 'vs mês ant.' }}
        />
        <StatCard
          title="Despesas do Mês"
          value={formatCurrency(data.despesasMes)}
          icon={<TrendingDown className="w-5 h-5 text-red-500" />}
          trend={{ value: '-2.1%', direction: 'down', label: 'vs mês ant.' }}
        />
        <StatCard
          title="Saldo Operacional"
          value={formatCurrency(data.saldoMes)}
          icon={<Wallet className="w-5 h-5 text-studio-brand" />}
          subtitle={<button className="mt-1 text-[10px] font-black uppercase text-studio-brand hover:underline">Conciliação Bancária &rarr;</button>}
        />
        <StatCard
          title="Dívida Ativa"
          value={formatCurrency(data.totalInadimplencia)}
          icon={<AlertCircle className="w-5 h-5 text-amber-500" />}
          subtitle={<button className="mt-1 text-[10px] font-black uppercase text-red-500 hover:underline">Cobrança Automática &rarr;</button>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-studio-foreground tracking-tight">Fluxo de Caixa Consolidado</h3>
              <p className="text-sm text-studio-foreground-lighter">Histórico de rendimento institucional vs despesas</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" icon={<FileText className="w-4 h-4" />}>Exportar Excel</Button>
              <Button variant="ghost" size="sm" icon={<ArrowUpRight className="w-4 h-4" />}>Relatório PDF</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full" aria-label="Evolução mensal de receitas e despesas">
              <thead>
                <tr className="border-b border-studio-border/50">
                  <th scope="col" className="text-left px-4 py-3 text-[10px] font-black text-studio-foreground-light uppercase tracking-[0.2em]">Mês</th>
                  <th scope="col" className="text-right px-4 py-3 text-[10px] font-black text-studio-foreground-light uppercase tracking-[0.2em]">Receitas</th>
                  <th scope="col" className="text-right px-4 py-3 text-[10px] font-black text-studio-foreground-light uppercase tracking-[0.2em]">Despesas</th>
                  <th scope="col" className="text-right px-4 py-3 text-[10px] font-black text-studio-foreground-light uppercase tracking-[0.2em]">Balanço</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-studio-border/20">
                {data.evolucaoMensal.map((row) => {
                  const balance = row.receitas - row.despesas
                  const isPositive = balance >= 0
                  const maxVal = Math.max(...data.evolucaoMensal.map(r => Math.max(r.receitas, r.despesas)))
                  return (
                    <tr key={row.mes} className="group hover:bg-studio-brand/[0.02] transition-colors">
                      <td className="px-4 py-4 text-sm font-black text-studio-foreground uppercase tracking-tight">{row.mes}</td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-sm font-bold text-emerald-600 tabular-nums">{formatCurrency(row.receitas)}</span>
                          <div className="w-24 h-1 bg-studio-muted/30 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500/50" style={{ width: `${(row.receitas / maxVal) * 100}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-sm font-bold text-red-600 tabular-nums">{formatCurrency(row.despesas)}</span>
                          <div className="w-24 h-1 bg-studio-muted/30 rounded-full overflow-hidden">
                            <div className="h-full bg-red-400/50" style={{ width: `${(row.despesas / maxVal) * 100}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right whitespace-nowrap">
                        <Badge variant={isPositive ? 'success' : 'danger'} className="text-[10px] font-black px-2 py-1">
                          {isPositive ? '+' : ''}{formatCurrency(balance)}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="border-l-4 border-l-red-500">
            <h4 className="text-[11px] font-black text-studio-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-red-500" />
              Risco de Inadimplência
            </h4>
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <span className="text-xs text-studio-foreground-lighter font-medium">Estudantes Irregulares</span>
                <span className="text-xl font-black text-studio-foreground tabular-nums">{data.quantidadeInadimplentes}</span>
              </div>
              <ProgressBar value={Math.min(100, (data.quantidadeInadimplentes / 100) * 100)} variant="error" size="sm" animated />
              <p className="text-[10px] text-studio-foreground-lighter leading-relaxed italic">
                Cerca de {Math.round((data.quantidadeInadimplentes / 250) * 100)}% da base estudantil possui pendências críticas.
              </p>
            </div>
          </Card>

          <Card className="bg-studio-brand/[0.03] border-studio-brand/10">
            <h4 className="text-[11px] font-black text-studio-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-studio-brand" />
              Previsão de Receita
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-studio-border shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-wider">A Receber (7d)</span>
                  <span className="text-lg font-black text-studio-brand tabular-nums">{formatCurrency(data.parcelasAVencer7Dias * 25000)}</span>
                </div>
                <div className="p-2 rounded-xl bg-studio-brand/10">
                  <Clock className="w-5 h-5 text-studio-brand" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-red-50/50 border border-red-500/10">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-wider">Total em Atraso</span>
                  <span className="text-lg font-black text-red-600 tabular-nums">{formatCurrency(data.totalInadimplencia)}</span>
                </div>
                <div className="p-2 rounded-xl bg-red-500/10">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
