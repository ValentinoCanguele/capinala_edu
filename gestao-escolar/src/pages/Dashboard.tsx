import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { FileText, CalendarCheck, Users } from 'lucide-react'
import {
  useDashboardStats,
  useAlertas,
  useMeuPapel,
  useMeusFilhos,
} from '@/data/escola/queries'
import { useResolveAlerta } from '@/data/escola/mutations'
import { navItemsConfig } from '@/config/routes'
import PageHeader from '@/components/PageHeader'
import { StatCard } from '@/components/shared/StatCard'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { Badge } from '@/components/shared/Badge'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { Avatar } from '@/components/shared/Avatar'
import { BellRing, ExternalLink, Zap } from 'lucide-react'

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
  { to: '/perfil', title: 'Perfil', description: 'Os seus dados e alterar senha' },
  { to: '/meu-boletim', title: 'Meu boletim', description: 'Consultar o seu boletim ou dos seus filhos' },
  { to: '/presencas', title: 'Presenças', description: 'Resumo de presenças e faltas' },
  { to: '/arquivos', title: 'Arquivos', description: 'Documentos e ficheiros' },
  { to: '/financas', title: 'Finanças', description: 'Receitas, despesas e relatórios' },
  { to: '/modulos', title: 'Módulos', description: 'Instalar e configurar módulos' },
  { to: '/utilizadores', title: 'Utilizadores', description: 'Gestão de utilizadores (admin)' },
]



const ROLES_ALERTAS: ('admin' | 'direcao')[] = ['admin', 'direcao']

export default function Dashboard() {
  const { data: stats, isLoading } = useDashboardStats()
  const { data: meuPapel } = useMeuPapel()
  const canViewAlertas =
    meuPapel?.papel != null && ROLES_ALERTAS.includes(meuPapel.papel as 'admin' | 'direcao')
  const { data: alertas = [], isLoading: alertasLoading } = useAlertas(canViewAlertas)
  const { data: meusFilhos = [] } = useMeusFilhos()
  const resolveAlerta = useResolveAlerta()

  const isResponsavel = meuPapel?.papel === 'responsavel'

  const visibleNavPaths = useMemo(() => {
    const papel = meuPapel?.papel
    if (!papel) return new Set<string>()
    return new Set(
      navItemsConfig
        .filter((item) => !item.roles || (item.roles as readonly string[]).includes(papel))
        .map((item) => item.to)
    )
  }, [meuPapel?.papel])

  const dashboardCards = useMemo(
    () => navCards.filter((card) => visibleNavPaths.has(card.to)),
    [visibleNavPaths]
  )

  const handleResolveAlerta = (alertaId: string) => {
    resolveAlerta.mutate(alertaId, {
      onSuccess: () => toast.success('Alerta marcado como resolvido.'),
      onError: (err) => toast.error(err.message),
    })
  }

  const alertasVisiveis = alertas.slice(0, 5)

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Escola Dashboard"
        subtitle="Analítica avançada e monitorização de fluxo institucional."
        actions={
          <Badge variant="brand" pulse className="px-4 py-1.5">
            Sistema Online
          </Badge>
        }
      />

      {/* Meus filhos (papel responsável) */}
      {isResponsavel && meusFilhos.length > 0 && (
        <section className="mb-8" aria-labelledby="secao-filhos">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-studio-brand" />
            <h2 id="secao-filhos" className="text-lg font-bold text-studio-foreground tracking-tight">
              Acesso de Encarregado
            </h2>
          </div>
          <Card>
            <p className="text-sm text-studio-foreground-light mb-5">
              Acompanhe o desempenho académico e presenças dos seus educandos em tempo real.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {meusFilhos.map((f) => (
                <div
                  key={f.id}
                  className="group relative flex flex-col p-4 rounded-xl border border-studio-border bg-studio-muted/10 hover:border-studio-brand/30 transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar name={f.nome} size="sm" shape="square" />
                    <span className="font-bold text-studio-foreground">{f.nome}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/boletim?alunoId=${encodeURIComponent(f.id)}`}
                      className="flex-1"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                      >
                        <FileText className="w-3.5 h-3.5 mr-2" />
                        Boletim
                      </Button>
                    </Link>
                    <Link
                      to={`/presencas?alunoId=${encodeURIComponent(f.id)}`}
                      className="flex-1"
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                      >
                        <CalendarCheck className="w-3.5 h-3.5 mr-2" />
                        Presenças
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      )}

      {/* Alertas ativos (apenas admin/direção) */}
      {canViewAlertas && !alertasLoading && alertas.length > 0 && (
        <section className="mb-10" aria-labelledby="secao-alertas">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BellRing className="w-5 h-5 text-red-500" />
              <h2 id="secao-alertas" className="text-lg font-bold text-studio-foreground tracking-tight">
                Central de Alertas Criticos
              </h2>
            </div>
            <Link to="/auditoria">
              <Button variant="ghost" size="sm">
                Ver Auditoria Completa
                <ExternalLink className="w-3.5 h-3.5 ml-2" />
              </Button>
            </Link>
          </div>
          <Card noPadding className="divide-y divide-studio-border/50">
            {alertasVisiveis.map((a) => (
              <div
                key={a.id}
                className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 group hover:bg-studio-muted/5 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge
                      variant={a.severidade === 'critico' ? 'danger' : a.severidade === 'atencao' ? 'warning' : 'info'}
                      pulse={a.severidade === 'critico'}
                    >
                      {a.severidade === 'critico' ? 'Critico' : a.severidade === 'atencao' ? 'Atenção' : 'Info'}
                    </Badge>
                    <span className="text-sm font-bold text-studio-foreground group-hover:text-studio-brand transition-colors">
                      {a.titulo}
                    </span>
                  </div>
                  {a.descricao && (
                    <p className="mt-1 text-xs text-studio-foreground-light leading-relaxed max-w-2xl">
                      {a.descricao}
                    </p>
                  )}
                  {(a.alunoNome || a.turmaNome) && (
                    <div className="mt-1.5 flex items-center gap-2 text-[10px] font-bold text-studio-foreground-lighter uppercase tracking-widest bg-studio-muted/30 w-fit px-2 py-0.5 rounded">
                      {[a.alunoNome, a.turmaNome].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleResolveAlerta(a.id)}
                  loading={resolveAlerta.isPending}
                >
                  Arquivar Alerta
                </Button>
              </div>
            ))}
          </Card>
        </section>
      )}

      {/* KPIs and Activity */}
      <div className="mb-10 grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
              {[...Array(6)].map((_, i) => <StatCard key={i} title="Carregando..." value="—" loading />)}
            </div>
          ) : stats ? (
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
              <StatCard title="Alunos" value={stats.totalAlunos} trend={{ value: '+12%', direction: 'up' }} icon={<Users className="hidden sm:block" />} />
              <StatCard title="Turmas" value={stats.totalTurmas} trend={{ value: '0%', direction: 'neutral' }} />
              <StatCard title="Professores" value={stats.totalProfessores} trend={{ value: '+2', direction: 'up' }} />
              <StatCard title="Disciplinas" value={stats.totalDisciplinas} />
              <StatCard title="Média Geral" value={`${stats.mediaGeral}/10`} trend={{ value: '+0.4', direction: 'up' }} />
              <StatCard title="Presença" value={`${stats.taxaPresenca}%`} trend={{ value: '-2%', direction: 'down' }} />
            </div>
          ) : (
            <div className="rounded-2xl border border-studio-border bg-studio-bg p-8 text-center text-studio-foreground-light text-sm shadow-soft">
              Sem dados de estatísticas disponíveis.
            </div>
          )}
        </div>

        {/* Animated Fake Activity Chart */}
        <div className="lg:col-span-1 p-5 rounded-2xl border border-studio-border bg-studio-bg/50 backdrop-blur-sm shadow-soft flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-studio-foreground-light uppercase tracking-widest">Atividade Semanal</p>
            <p className="text-2xl font-bold text-studio-foreground mt-2 tracking-tight">84%</p>
          </div>
          <div className="flex flex-col flex-1 mt-4 justify-end gap-2">
            <ProgressBar value={84} variant="brand" showLabel label="Tarefas Core Concluídas" animated className="mb-2" />
            <ProgressBar value={45} variant="warning" size="sm" />
            <ProgressBar value={12} variant="error" size="sm" />
          </div>
        </div>
      </div>

      {/* Alunos por turma (oculto para responsável) */}
      {stats && stats.alunosPorTurma.length > 0 && !isResponsavel && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-studio-foreground mb-3">Alunos por turma</h2>
          <div className="card overflow-hidden">
            <table className="min-w-full divide-y divide-studio-border" aria-label="Alunos por turma">
              <thead className="bg-studio-muted">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-studio-foreground-lighter uppercase">Turma</th>
                  <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-studio-foreground-lighter uppercase">Alunos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-studio-border">
                {stats.alunosPorTurma.map((t) => (
                  <tr key={t.turmaNome} className="hover:bg-studio-muted/50 group">
                    <td className="px-4 py-3 text-sm font-medium text-studio-foreground group-hover:text-studio-brand transition-colors w-1/3">{t.turmaNome}</td>
                    <td className="px-4 py-3 text-sm text-studio-foreground-light w-2/3">
                      <div className="flex items-center gap-3">
                        <ProgressBar value={Math.min(t.total * 2.5, 100)} variant={t.total > 35 ? 'warning' : 'brand'} className="flex-1" />
                        <span className="tabular-nums font-medium w-6 text-right">{t.total}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <section aria-labelledby="secao-atalhos">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
          <h2 id="secao-atalhos" className="text-lg font-bold text-studio-foreground tracking-tight">Atalhos de Alta Produtividade</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {dashboardCards.map(({ to, title, description }) => (
            <Link
              key={to}
              to={to}
              className="group flex flex-col p-6 rounded-2xl border border-studio-border/50 bg-studio-bg hover:border-studio-brand hover:shadow-xl hover:shadow-studio-brand/5 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-studio-foreground group-hover:text-studio-brand transition-colors tracking-tight line-clamp-1">
                  {title}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-studio-muted group-hover:text-studio-brand opacity-0 group-hover:opacity-100 transition-all" />
              </div>
              <p className="text-xs text-studio-foreground-light leading-relaxed line-clamp-2">{description}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
