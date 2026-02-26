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
        />
        <StatCard
          title="Inadimplência Bruta"
          value={formatCurrency(data.totalInadimplencia)}
          icon={<AlertCircle className="w-5 h-5 text-amber-500" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-studio-foreground tracking-tight">Evolução Mensal</h3>
              <p className="text-sm text-studio-foreground-lighter">Histórico de fluxo de caixa institucional</p>
            </div>
            <Calendar className="w-5 h-5 text-studio-muted" />
          </div>

          <div className="overflow-x-auto -mx-1">
            <table className="w-full" aria-label="Evolução mensal de receitas e despesas">
              <thead>
                <tr className="border-b border-studio-border/50">
                  <th scope="col" className="text-left px-4 py-3 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Mês Referência</th>
                  <th scope="col" className="text-right px-4 py-3 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Receitas</th>
                  <th scope="col" className="text-right px-4 py-3 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Despesas</th>
                  <th scope="col" className="text-right px-4 py-3 text-xs font-bold text-studio-foreground-light uppercase tracking-widest">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-studio-border/20">
                {data.evolucaoMensal.map((row) => {
                  const isPositive = row.receitas >= row.despesas
                  return (
                    <tr key={row.mes} className="group hover:bg-studio-muted/5 transition-colors">
                      <td className="px-4 py-4 text-sm font-bold text-studio-foreground">{row.mes}</td>
                      <td className="px-4 py-4 text-right tabular-nums text-sm font-medium text-emerald-600">
                        {formatCurrency(row.receitas)}
                      </td>
                      <td className="px-4 py-4 text-right tabular-nums text-sm font-medium text-red-600">
                        {formatCurrency(row.despesas)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPositive ? (
                            <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`text-xs font-bold ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                            {isPositive ? 'Superávit' : 'Défice'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="space-y-6">
          <Card>
            <h4 className="text-sm font-bold text-studio-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-studio-brand" />
              Gestão de Devedores
            </h4>
            <div className="space-y-4">
              <div className="flex items-end justify-between">
                <span className="text-xs text-studio-foreground-light">Total Inadimplentes</span>
                <span className="text-lg font-bold text-studio-foreground">{data.quantidadeInadimplentes}</span>
              </div>
              <div className="w-full h-1.5 bg-studio-muted rounded-full overflow-hidden">
                <div className="h-full bg-red-500 w-1/3" />
              </div>
              <p className="text-[10px] text-studio-foreground-lighter leading-relaxed italic">
                Representa alunos com mais de 30 dias de atraso nas propinas.
              </p>
            </div>
          </Card>

          <Card>
            <h4 className="text-sm font-bold text-studio-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-studio-brand" />
              Alertas de Prazos
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/5 border border-amber-500/20">
                <div className="text-xs font-bold text-amber-600 uppercase tracking-tight">A Vencer (7d)</div>
                <div className="text-lg font-bold text-amber-600">{data.parcelasAVencer7Dias}</div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-red-50/5 border border-red-500/20">
                <div className="text-xs font-bold text-red-600 uppercase tracking-tight">Parcelas Vencidas</div>
                <div className="text-lg font-bold text-red-600">{data.parcelasVencidas}</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
