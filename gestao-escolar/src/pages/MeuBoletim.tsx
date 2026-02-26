import { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  useMeuAluno,
  useMeusFilhos,
  useAnosLetivos,
  useBoletim,
  useResumoFrequenciaAluno,
  useOcorrencias
} from '@/data/escola/queries'
import PageHeader from '@/components/PageHeader'
import { Card } from '@/components/shared/Card'
import { Select } from '@/components/shared/Select'
import { StatCard } from '@/components/shared/StatCard'
import { Badge } from '@/components/shared/Badge'
import { Avatar } from '@/components/shared/Avatar'
import EmptyState from '@/components/shared/EmptyState'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { Button } from '@/components/shared/Button'
import {
  FileText,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Award,
  GraduationCap,
  BookOpen,
  Info,
  Printer,
  Download,
  Activity,
  UserCheck,
  Briefcase,
  ShieldAlert,
  Calendar,
  History,
  Clock,
  MessageSquare
} from 'lucide-react'

type TabType = 'notas' | 'ocorrencias' | 'assiduidade' | 'horario'

export default function MeuBoletim() {
  const { user } = useAuth()
  const { data: meuAluno } = useMeuAluno()
  const { data: filhos = [] } = useMeusFilhos()
  const { data: anosLetivos = [] } = useAnosLetivos()

  const [alunoId, setAlunoId] = useState('')
  const [anoLetivoId, setAnoLetivoId] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('notas')

  const effectiveAlunoId = user?.papel === 'aluno' ? meuAluno?.alunoId ?? '' : alunoId

  useEffect(() => {
    if (user?.papel === 'aluno' && meuAluno?.alunoId) setAlunoId(meuAluno.alunoId)
  }, [user?.papel, meuAluno?.alunoId])

  const { data: boletim, isLoading: loadingBoletim, error } = useBoletim(
    effectiveAlunoId || null,
    anoLetivoId || undefined
  )

  const { data: frequencia, isLoading: loadingFreq } = useResumoFrequenciaAluno(
    effectiveAlunoId || null,
    anoLetivoId || undefined
  )

  const { data: ocorrencias = [], isLoading: loadingOco } = useOcorrencias({ alunoId: effectiveAlunoId || '0000' })

  const isAluno = user?.papel === 'aluno'
  const isResponsavel = user?.papel === 'responsavel'
  const canView = isAluno || isResponsavel

  const stats = useMemo(() => {
    if (!boletim?.disciplinas?.length) return { media: 0, aprovadas: 0, total: 0, percent: 0, frequencia: 0, ocorrencias: 0 }
    const valid = boletim.disciplinas.filter(d => d.mediaFinal != null)
    const media = valid.reduce((acc, curr) => acc + (curr.mediaFinal || 0), 0) / (valid.length || 1)
    const aprovadas = boletim.disciplinas.filter(d => d.aprovado).length
    const total = boletim.disciplinas.length

    return {
      media: Number(media.toFixed(2)),
      aprovadas,
      total,
      percent: Math.round((aprovadas / total) * 100),
      frequencia: frequencia?.totais?.percentagemPresenca ? Math.round(frequencia.totais.percentagemPresenca) : 0,
      ocorrencias: ocorrencias.filter(o => !o.resolvido).length
    }
  }, [boletim, frequencia, ocorrencias])

  if (!canView) {
    return <div className="p-8 text-center"><AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500" /><p>Acesso Restrito</p></div>
  }

  const handlePrint = () => window.print()

  return (
    <div className="pb-20 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title={isAluno ? "Minha Caderneta Digital" : "Caderneta do Educando"}
          subtitle="Acompanhamento integral: notas, faltas, comportamento e notificações."
          className="mb-0"
        />

        {effectiveAlunoId && boletim && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={handlePrint} icon={<Printer className="w-4 h-4" />}>
              Imprimir
            </Button>
            <Button size="sm" icon={<Download className="w-4 h-4" />}>
              Exportar PDF
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-studio-muted/10 p-3 rounded-2xl border border-studio-border/50">
        {isResponsavel && (
          <div className="flex-1">
            <Select
              options={[{ label: 'Selecionar filho', value: '' }, ...filhos.map(f => ({ label: f.nome, value: f.id }))]}
              value={alunoId}
              onChange={(e) => setAlunoId(e.target.value)}
              leftIcon={<Briefcase className="w-4 h-4 text-studio-brand" />}
            />
          </div>
        )}
        <div className="w-full md:w-64">
          <Select
            options={[{ label: 'Ano Letivo Atual', value: '' }, ...anosLetivos.map(a => ({ label: a.nome, value: a.id }))]}
            value={anoLetivoId}
            onChange={(e) => setAnoLetivoId(e.target.value)}
            leftIcon={<Activity className="w-4 h-4 text-studio-brand" />}
          />
        </div>
      </div>

      {!effectiveAlunoId ? (
        <EmptyState
          title="Consulta de Caderneta"
          description={isResponsavel ? "Selecione um educando para carregar o percurso académico." : "Aguardando sincronização de dados."}
          icon={<FileText className="w-16 h-16 text-studio-brand/30" />}
          className="py-20"
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <StatCard
              title="Média Período"
              value={stats.media}
              icon={<TrendingUp className="w-5 h-5" />}
              trend={{ value: stats.media >= 10 ? 'Positivo' : 'Negativo', direction: stats.media >= 10 ? 'up' : 'down' }}
            />
            <StatCard
              title="Assiduidade"
              value={`${stats.frequencia}%`}
              icon={<UserCheck className="w-5 h-5" />}
              trend={{ value: stats.frequencia >= 75 ? 'Regular' : 'Crítico', direction: stats.frequencia >= 75 ? 'up' : 'down' }}
            />
            <StatCard
              title="Ocorrências"
              value={stats.ocorrencias}
              icon={<ShieldAlert className="w-5 h-5" />}
              subtitle="Pendentes de resolução"
              className={stats.ocorrencias > 0 ? 'border-b-4 border-b-red-500' : ''}
            />
            <StatCard
              title="Aproveitamento"
              value={`${stats.percent}%`}
              icon={<Award className="w-5 h-5" />}
              subtitle={`${stats.aprovadas} de ${stats.total} disciplinas`}
            />
          </div>

          <Card noPadding className="border-studio-border/60 shadow-xl overflow-hidden">
            {/* Tabs High-Density */}
            <div className="flex border-b border-studio-border bg-studio-muted/10 overflow-x-auto scrollbar-hide">
              {[
                { id: 'notas', label: 'Rendimento Escolar', icon: FileText },
                { id: 'ocorrencias', label: 'Disciplina & Mérito', icon: ShieldAlert },
                { id: 'assiduidade', label: 'Controlo de Faltas', icon: History },
                { id: 'horario', label: 'Horário Semanal', icon: Clock },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] border-b-2 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-studio-brand text-studio-brand bg-studio-bg' : 'border-transparent text-studio-foreground-lighter hover:text-studio-foreground'}`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === 'ocorrencias' && stats.ocorrencias > 0 && (
                    <span className="w-4 h-4 flex items-center justify-center bg-red-500 text-white rounded-full text-[8px] animate-pulse">
                      {stats.ocorrencias}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="min-h-[400px]">
              {activeTab === 'notas' && (
                <div className="animate-in fade-in duration-500">
                  {loadingBoletim ? (
                    <div className="p-8"><SkeletonTable rows={10} columns={4} /></div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-studio-border/50">
                        <thead className="bg-studio-muted/5">
                          <tr>
                            <th className="px-8 py-4 text-left text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">Disciplina</th>
                            <th className="px-8 py-4 text-center text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">Situação</th>
                            <th className="px-8 py-4 text-center text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">Assiduidade</th>
                            <th className="px-8 py-4 text-right text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">Nota Final</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-studio-border/30">
                          {boletim?.disciplinas.map(d => (
                            <tr key={d.disciplinaId} className="hover:bg-studio-brand/[0.02] transition-colors group">
                              <td className="px-8 py-5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-studio-brand/10 flex items-center justify-center">
                                    <BookOpen className="w-4 h-4 text-studio-brand" />
                                  </div>
                                  <span className="text-sm font-bold text-studio-foreground">{d.nome}</span>
                                </div>
                              </td>
                              <td className="px-8 py-5 text-center">
                                <Badge variant={d.aprovado ? 'success' : 'danger'} size="sm" className="uppercase font-black text-[9px]">
                                  {d.aprovado ? 'Aprovado' : 'Em curso / Reprov.'}
                                </Badge>
                              </td>
                              <td className="px-8 py-5 text-center">
                                <span className="text-xs font-bold text-studio-foreground-light">{stats.frequencia}%</span>
                              </td>
                              <td className="px-8 py-5 text-right whitespace-nowrap">
                                <span className={`text-lg font-black tabular-nums ${d.mediaFinal && d.mediaFinal >= 14 ? 'text-emerald-600' : d.mediaFinal && d.mediaFinal < 10 ? 'text-red-600' : 'text-studio-foreground'}`}>
                                  {d.mediaFinal?.toFixed(1) || '—'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'ocorrencias' && (
                <div className="p-8 animate-in fade-in duration-500 space-y-4">
                  {ocorrencias.length === 0 ? (
                    <EmptyState title="Cump rimento Exemplar" description="Não existem registos disciplinares negativos até à data." icon={<Award className="w-12 h-12 text-emerald-500" />} />
                  ) : (
                    ocorrencias.map((oc: any) => (
                      <div key={oc.id} className={`flex items-start gap-4 p-4 rounded-xl border ${oc.tipo === 'elogio' ? 'border-studio-brand bg-studio-brand/5' : 'border-red-500/20 bg-red-500/[0.02]'}`}>
                        <div className={`p-2 rounded-lg ${oc.tipo === 'elogio' ? 'bg-studio-brand/20 text-studio-brand' : 'bg-red-500/20 text-red-500'}`}>
                          {oc.tipo === 'elogio' ? <Star className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="text-xs font-black uppercase text-studio-foreground">{oc.tipo.replace('_', ' ')}</h5>
                            <span className="text-[10px] text-studio-foreground-lighter">{new Date(oc.data_ocorrencia).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-studio-foreground-light leading-relaxed">{oc.descricao}</p>
                          <div className="mt-2 text-[10px] font-bold text-studio-foreground-lighter flex gap-3">
                            <span>Gravidade: <span className="uppercase text-studio-foreground">{oc.gravidade}</span></span>
                            {oc.medida_tomada && <span>Medida: <span className="italic">{oc.medida_tomada}</span></span>}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'assiduidade' && (
                <div className="p-8 animate-in fade-in duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h4 className="text-xs font-black uppercase text-studio-foreground-lighter tracking-widest flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Resumo de Faltas
                      </h4>
                      <div className="space-y-3">
                        {frequencia?.porTurma.map((t: any) => (
                          <div key={t.turmaId} className="flex items-center justify-between p-3 bg-studio-muted/10 rounded-xl">
                            <span className="text-xs font-bold text-studio-foreground">{t.turmaNome}</span>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-[10px] font-black text-red-500">{t.faltas} FALTAS</p>
                                <p className="text-[9px] text-studio-foreground-lighter">DE {t.totalAulas} AULAS</p>
                              </div>
                              <Badge variant={t.emRisco ? 'danger' : 'success'}>{t.percentagemPresenca}%</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/20">
                      <UserCheck className="w-8 h-8 text-emerald-500 mb-3" />
                      <h4 className="text-sm font-black text-emerald-700 uppercase mb-2 text-center md:text-left">Análise de Assiduidade</h4>
                      <p className="text-xs text-emerald-800/80 leading-relaxed mb-4 text-center md:text-left">
                        O nível de presença global é de **{stats.frequencia}%**. Para garantir a aprovação direta, mantenha a assiduidade acima dos 75% em todas as unidades curriculares.
                      </p>
                      <div className="w-full h-2 bg-emerald-500/20 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${stats.frequencia}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'horario' && (
                <div className="p-12 text-center text-studio-muted">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p className="text-xs font-black uppercase tracking-widest">Redirecionando para o Módulo de Horários...</p>
                  <Button variant="ghost" className="mt-4" onClick={() => window.location.href = '/horarios'}>Ver Horário Completo</Button>
                </div>
              )}
            </div>

            <div className="p-6 bg-studio-muted/5 border-t border-studio-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-studio-brand/10 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-studio-brand" />
                </div>
                <div className="text-center md:text-left">
                  <p className="text-xs font-black text-studio-foreground uppercase tracking-tight">Conselho Pedagógico</p>
                  <p className="text-[9px] text-studio-foreground-lighter uppercase tracking-widest">Sistema de Verificação Nexus v1.0</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[9px] border-studio-border">Atualizado em tempo real</Badge>
                <span className="text-[10px] text-studio-foreground-lighter italic">Nexus Education Cloud</span>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}

function Star(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
