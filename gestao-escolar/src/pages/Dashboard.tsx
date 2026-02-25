import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FileText } from 'lucide-react'
import {
  useDashboardStats,
  useAlertas,
  useMeuPapel,
  useMeusFilhos,
} from '@/data/escola/queries'
import { useResolveAlerta } from '@/data/escola/mutations'
import { StatCardSkeleton } from '@/components/PageSkeleton'

const navCards = [
  { to: '/alunos', title: 'Alunos', description: 'Cadastro e listagem de alunos' },
  { to: '/turmas', title: 'Turmas', description: 'Turmas e matrículas' },
  { to: '/notas', title: 'Notas', description: 'Lançamento de notas' },
  { to: '/frequencia', title: 'Frequência', description: 'Registo de presenças' },
  { to: '/boletim', title: 'Boletim', description: 'Consultar boletins' },
  { to: '/horarios', title: 'Horários', description: 'Gestão de horários' },
  { to: '/comunicados', title: 'Comunicados', description: 'Avisos internos da escola' },
  { to: '/disciplinas', title: 'Disciplinas', description: 'Gerir disciplinas' },
  { to: '/anos-letivos', title: 'Anos letivos', description: 'Gerir anos letivos' },
  { to: '/salas', title: 'Salas', description: 'Gerir salas e capacidade' },
  { to: '/auditoria', title: 'Auditoria', description: 'Log de ações e alertas' },
]

function StatCard({ label, value, unit }: { label: string; value: string | number | null; unit?: string }) {
  return (
    <div className="p-4 rounded-lg border border-studio-border bg-studio-bg transition-colors hover:border-studio-border/80">
      <p className="text-xs text-studio-foreground-lighter uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-semibold text-studio-foreground mt-1 tabular-nums">
        {value !== null && value !== undefined ? value : '—'}
        {unit && value !== null && value !== undefined && (
          <span className="text-sm font-normal text-studio-foreground-light ml-1">{unit}</span>
        )}
      </p>
    </div>
  )
}

function SeveridadeBadge({ severidade }: { severidade: 'info' | 'atencao' | 'critico' }) {
  const classes =
    severidade === 'critico'
      ? 'bg-red-100 text-red-800'
      : severidade === 'atencao'
        ? 'bg-amber-100 text-amber-800'
        : 'bg-studio-muted text-studio-foreground-light'
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${classes}`}>
      {severidade === 'critico' ? 'Crítico' : severidade === 'atencao' ? 'Atenção' : 'Info'}
    </span>
  )
}

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats()
  const { data: alertas = [], isLoading: alertasLoading } = useAlertas()
  const { data: meuPapel } = useMeuPapel()
  const { data: meusFilhos = [] } = useMeusFilhos()
  const resolveAlerta = useResolveAlerta()

  const isResponsavel = meuPapel?.papel === 'responsavel'

  const handleResolveAlerta = (alertaId: string) => {
    resolveAlerta.mutate(alertaId, {
      onSuccess: () => toast.success('Alerta marcado como resolvido.'),
      onError: (err) => toast.error(err.message),
    })
  }

  const alertasVisiveis = alertas.slice(0, 5)

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-studio-foreground">Início</h1>
        <p className="mt-1 text-sm text-studio-foreground-light">
          Painel de controlo do Sistema de Gestão Escolar.
        </p>
      </div>

      {/* Meus filhos (papel responsável) */}
      {isResponsavel && meusFilhos.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-studio-foreground mb-3">
            Meus filhos
          </h2>
          <div className="card p-4">
            <p className="text-sm text-studio-foreground-light mb-3">
              Aceda ao boletim de cada educando.
            </p>
            <div className="flex flex-wrap gap-3">
              {meusFilhos.map((f) => (
                <Link
                  key={f.id}
                  to={`/boletim?alunoId=${encodeURIComponent(f.id)}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-studio-border bg-studio-bg hover:border-studio-brand/50 hover:bg-studio-muted/50 transition-colors"
                >
                  <FileText className="w-4 h-4 text-studio-brand" />
                  <span className="font-medium text-studio-foreground">{f.nome}</span>
                  <span className="text-studio-foreground-lighter text-sm">→ Boletim</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alertas ativos */}
      {!alertasLoading && alertas.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-studio-foreground">
              Alertas ativos
            </h2>
            <Link
              to="/auditoria"
              className="text-xs text-studio-brand hover:underline"
            >
              Ver todos na Auditoria →
            </Link>
          </div>
          <div className="card divide-y divide-studio-border">
            {alertasVisiveis.map((a) => (
              <div
                key={a.id}
                className="px-4 py-3 flex flex-wrap items-start justify-between gap-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <SeveridadeBadge severidade={a.severidade} />
                    <span className="text-sm font-medium text-studio-foreground">
                      {a.titulo}
                    </span>
                  </div>
                  {a.descricao && (
                    <p className="mt-0.5 text-xs text-studio-foreground-light">
                      {a.descricao}
                    </p>
                  )}
                  {(a.alunoNome || a.turmaNome) && (
                    <p className="mt-0.5 text-xs text-studio-foreground-lighter">
                      {[a.alunoNome, a.turmaNome].filter(Boolean).join(' · ')}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleResolveAlerta(a.id)}
                  disabled={resolveAlerta.isPending}
                  className="shrink-0 px-3 py-1.5 rounded text-xs font-medium bg-studio-muted text-studio-foreground hover:bg-studio-border disabled:opacity-50"
                >
                  Resolver
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPIs */}
      <div className="mb-8">
        {isLoading ? (
          <StatCardSkeleton count={6} />
        ) : stats ? (
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard label="Alunos" value={stats.totalAlunos} />
            <StatCard label="Turmas" value={stats.totalTurmas} />
            <StatCard label="Professores" value={stats.totalProfessores} />
            <StatCard label="Disciplinas" value={stats.totalDisciplinas} />
            <StatCard label="Média Geral" value={stats.mediaGeral} unit="/10" />
            <StatCard label="Presença" value={stats.taxaPresenca} unit="%" />
          </div>
        ) : (
          <div className="rounded-lg border border-studio-border bg-studio-bg p-8 text-center text-studio-foreground-light text-sm">
            Sem dados de estatísticas disponíveis.
          </div>
        )}
      </div>

      {/* Alunos por turma (oculto para responsável) */}
      {stats && stats.alunosPorTurma.length > 0 && !isResponsavel && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-studio-foreground mb-3">Alunos por turma</h2>
          <div className="card overflow-hidden">
            <table className="min-w-full divide-y divide-studio-border">
              <thead className="bg-studio-muted">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-studio-foreground-lighter uppercase">Turma</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-studio-foreground-lighter uppercase">Alunos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-studio-border">
                {stats.alunosPorTurma.map((t) => (
                  <tr key={t.turmaNome} className="hover:bg-studio-muted/50">
                    <td className="px-4 py-2 text-sm text-studio-foreground">{t.turmaNome}</td>
                    <td className="px-4 py-2 text-sm text-studio-foreground-light text-right">{t.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Navegação rápida */}
      <h2 className="text-sm font-semibold text-studio-foreground mb-3">Acesso rápido</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {navCards.map(({ to, title, description }) => (
          <Link
            key={to}
            to={to}
            className="block p-5 rounded-lg border border-studio-border bg-studio-bg hover:border-studio-brand/50 hover:shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
          >
            <span className="font-medium text-studio-brand">{title}</span>
            <p className="mt-1 text-sm text-studio-foreground-light">{description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
