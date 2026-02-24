import { Link } from 'react-router-dom'
import { useDashboardStats } from '@/data/escola/queries'
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

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats()

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-studio-foreground">Início</h1>
        <p className="mt-1 text-sm text-studio-foreground-light">
          Painel de controlo do Sistema de Gestão Escolar.
        </p>
      </div>

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

      {/* Alunos por turma */}
      {stats && stats.alunosPorTurma.length > 0 && (
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
