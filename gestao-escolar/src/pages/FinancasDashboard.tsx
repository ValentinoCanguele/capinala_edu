import { Link } from 'react-router-dom'
import PageHeader from '@/components/PageHeader'
import { useDashboardFinancas } from '@/data/escola/queries'
import { TableSkeleton } from '@/components/PageSkeleton'
import { formatCurrency } from '@/lib/formatCurrency'

export default function FinancasDashboard() {
  const { data: dashboard, isLoading, error } = useDashboardFinancas()

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Finanças" subtitle="Visão geral." />
        <TableSkeleton rows={4} />
      </div>
    )
  }

  if (error || !dashboard) {
    return (
      <div>
        <PageHeader title="Finanças" />
        <div className="p-4 text-red-600" role="alert">
          {error ? (error instanceof Error ? error.message : String(error)) : 'Erro ao carregar dashboard.'}
        </div>
      </div>
    )
  }

  const evolucaoMensal = Array.isArray(dashboard.evolucaoMensal) ? dashboard.evolucaoMensal : []
  const maxVal = Math.max(
    ...evolucaoMensal.flatMap((m) => [m.receitas, m.despesas]),
    1
  )

  return (
    <div>
      <PageHeader
        title="Finanças"
        subtitle="Visão geral e indicadores do mês."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="card p-4">
          <h3 className="text-sm font-medium text-studio-foreground-lighter mb-1">
            Receitas (mês)
          </h3>
          <p className="text-2xl font-semibold text-green-600">
            {formatCurrency(dashboard.receitasMes)}
          </p>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-medium text-studio-foreground-lighter mb-1">
            Despesas (mês)
          </h3>
          <p className="text-2xl font-semibold text-red-600">
            {formatCurrency(dashboard.despesasMes)}
          </p>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-medium text-studio-foreground-lighter mb-1">
            Saldo (mês)
          </h3>
          <p
            className={`text-2xl font-semibold ${
              dashboard.saldoMes >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {formatCurrency(dashboard.saldoMes)}
          </p>
        </div>
        <Link
          to="/financas/relatorios?vista=inadimplencia"
          className="card card-interactive p-4 block focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 rounded-lg"
          aria-label="Ver inadimplência em Relatórios"
        >
          <h3 className="text-sm font-medium text-studio-foreground-lighter mb-1">
            Inadimplência
          </h3>
          <p className="text-2xl font-semibold text-studio-foreground">
            {formatCurrency(dashboard.totalInadimplencia)}
          </p>
          <p className="text-xs text-studio-foreground-lighter mt-1">
            {dashboard.quantidadeInadimplentes} aluno(s)
          </p>
          <p className="text-xs text-studio-brand mt-2">Ver relatório →</p>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        <div className="card p-4">
          <h3 className="text-sm font-medium text-studio-foreground-lighter mb-1">
            Parcelas a vencer (7 dias)
          </h3>
          <p className="text-xl font-semibold text-studio-foreground">
            {dashboard.parcelasAVencer7Dias}
          </p>
        </div>
        <div className="card p-4">
          <h3 className="text-sm font-medium text-studio-foreground-lighter mb-1">
            Parcelas vencidas
          </h3>
          <p className="text-xl font-semibold text-studio-foreground">
            {dashboard.parcelasVencidas}
          </p>
        </div>
      </div>

      <div className="card p-4 mb-8">
        <h3 className="text-sm font-medium text-studio-foreground-lighter mb-3">
          Evolução mensal (últimos 12 meses)
        </h3>
        {evolucaoMensal.length > 0 ? (
          <>
          <div className="space-y-2">
            {evolucaoMensal.slice(-6).map((m) => (
              <div key={m.mes} className="flex items-center gap-3 text-sm">
                <span className="w-24 text-studio-foreground-lighter">{m.mes}</span>
                <div className="flex-1 flex gap-2 items-center">
                  <div
                    className="h-6 bg-green-600/30 rounded min-w-0 flex items-center justify-end pr-1"
                    style={{
                      width: `${(m.receitas / maxVal) * 100}%`,
                      minWidth: m.receitas > 0 ? '2rem' : 0,
                    }}
                  >
                    {m.receitas > 0 && (
                      <span className="text-xs text-white truncate">
                        {m.receitas.toFixed(0)}
                      </span>
                    )}
                  </div>
                  <div
                    className="h-6 bg-red-600/30 rounded min-w-0 flex items-center justify-end pr-1"
                    style={{
                      width: `${(m.despesas / maxVal) * 100}%`,
                      minWidth: m.despesas > 0 ? '2rem' : 0,
                    }}
                  >
                    {m.despesas > 0 && (
                      <span className="text-xs text-white truncate">
                        {m.despesas.toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-2 text-xs text-studio-foreground-lighter">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-green-600/30" /> Receitas (Kz)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded bg-red-600/30" /> Despesas (Kz)
            </span>
          </div>
          </>
        ) : (
          <p className="text-sm text-studio-foreground-light py-4">
            Não há dados de evolução mensal para o período. Os lançamentos aparecerão aqui à medida que forem registados.
          </p>
        )}
      </div>

      <div className="card p-4 flex flex-col gap-2">
        <span className="text-sm font-medium text-studio-foreground-lighter">
          Navegação
        </span>
        <div className="flex flex-wrap gap-4">
          <Link to="/financas/categorias" className="text-studio-brand hover:underline">
            Categorias
          </Link>
          <Link to="/financas/lancamentos" className="text-studio-brand hover:underline">
            Lançamentos
          </Link>
          <Link to="/financas/parcelas" className="text-studio-brand hover:underline">
            Parcelas
          </Link>
          <Link to="/financas/relatorios" className="text-studio-brand hover:underline">
            Relatórios
          </Link>
          <Link to="/financas/configuracao" className="text-studio-brand hover:underline">
            Configuração
          </Link>
        </div>
      </div>
    </div>
  )
}
