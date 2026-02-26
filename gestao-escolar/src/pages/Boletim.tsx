import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAlunos, useAnosLetivos, useBoletim, useResumoFrequenciaAluno } from '@/data/escola/queries'
import PageHeader from '@/components/PageHeader'
import { Card } from '@/components/shared/Card'
import { Select } from '@/components/shared/Select'
import { StatCard } from '@/components/shared/StatCard'
import { Badge } from '@/components/shared/Badge'
import { Avatar } from '@/components/shared/Avatar'
import EmptyState from '@/components/shared/EmptyState'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { Button } from '@/components/shared/Button'
import { printElement } from '@/utils/print'
import {
  FileText,
  User,
  Calendar,
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
  TrendingDown,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

export default function Boletim() {
  const [searchParams] = useSearchParams()
  const alunoIdFromUrl = searchParams.get('alunoId') ?? ''
  const [alunoId, setAlunoId] = useState('')
  const [anoLetivoId, setAnoLetivoId] = useState('')
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (alunoIdFromUrl) setAlunoId(alunoIdFromUrl)
  }, [alunoIdFromUrl])

  const { data: alunos = [] } = useAlunos()
  const { data: anosLetivos = [] } = useAnosLetivos()
  const { data: boletim, isLoading, error } = useBoletim(
    alunoId || null,
    anoLetivoId || undefined
  )

  const { data: frequencia } = useResumoFrequenciaAluno(
    alunoId || null,
    anoLetivoId || undefined
  )

  const stats = useMemo(() => {
    if (!boletim?.disciplinas?.length) return { media: 0, aprovadas: 0, total: 0, percent: 0, frequencia: 0 }
    const valid = boletim.disciplinas.filter(d => d.mediaFinal != null)
    const media = valid.reduce((acc, curr) => acc + (curr.mediaFinal || 0), 0) / (valid.length || 1)
    const aprovadas = boletim.disciplinas.filter(d => d.aprovado).length
    const total = boletim.disciplinas.length

    return {
      media: Number(media.toFixed(1)),
      aprovadas,
      total,
      percent: Math.round((aprovadas / total) * 100),
      frequencia: frequencia?.totais?.percentagemPresenca ? Math.round(frequencia.totais.percentagemPresenca) : 0
    }
  }, [boletim, frequencia])

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="pb-20 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <PageHeader
          title="Boletim Analítico de Rigor"
          subtitle="Acompanhamento granular de performance académica e indicadores de risco."
        />

        {alunoId && boletim && (
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => printElement('boletim-print-area')} icon={<Printer className="w-4 h-4" />}>
              Imprimir
            </Button>
            <Button variant="primary" size="sm" icon={<Download className="w-4 h-4" />}>
              Certificado Digital
            </Button>
          </div>
        )}
      </div>

      <Card className="border-studio-border/60 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-1">
          <div className="md:col-span-2">
            <Select
              label="Filtrar Estudante"
              value={alunoId}
              onChange={(e) => setAlunoId(e.target.value)}
              options={[{ label: 'Selecionar aluno', value: '' }, ...alunos.map(a => ({ label: a.nome, value: a.id }))]}
              leftIcon={<User className="w-4 h-4 text-studio-brand" />}
            />
          </div>
          <Select
            label="Ciclo Académico"
            value={anoLetivoId}
            onChange={(e) => setAnoLetivoId(e.target.value)}
            options={[{ label: 'Ano Letivo Atual', value: '' }, ...anosLetivos.map(a => ({ label: a.nome, value: a.id }))]}
            leftIcon={<Calendar className="w-4 h-4 text-studio-foreground-lighter" />}
          />
          <div className="flex items-end">
            <div className="w-full h-[38px] px-4 bg-studio-muted/10 rounded-xl flex items-center gap-3 border border-studio-border/50">
              <Activity className="w-4 h-4 text-studio-brand" />
              <span className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest">Sinc. Real-Time</span>
            </div>
          </div>
        </div>
      </Card>

      {!alunoId ? (
        <EmptyState
          title="Central de Gestão de Resultados"
          description="Selecione um estudante para visualizar o mapa de competências, notas compostas e análise de assiduidade."
          icon={<FileText className="w-20 h-20 opacity-5" />}
          className="h-[400px]"
        />
      ) : isLoading ? (
        <SkeletonTable rows={10} columns={5} />
      ) : (
        <div id="boletim-print-area" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Média Geral"
              value={stats.media}
              icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
              subtitle="Performance Consolidada"
              trend={{ value: stats.media >= 10 ? 'Aprovado' : 'Retido', direction: stats.media >= 10 ? 'up' : 'down' }}
            />
            <StatCard
              title="Assiduidade"
              value={`${stats.frequencia}%`}
              icon={<UserCheck className="w-5 h-5 text-blue-500" />}
              subtitle={`${frequencia?.totais?.faltas || 0} Incidentes`}
            />
            <StatCard
              title="Competências"
              value={`${stats.percent}%`}
              icon={<CheckCircle2 className="w-5 h-5 text-studio-brand" />}
              subtitle={`${stats.aprovadas}/${stats.total} Matrizes`}
            />
            <StatCard
              title="Classificação"
              value={stats.media >= 14 ? 'Excelente' : 'Bom'}
              icon={<Award className="w-5 h-5 text-amber-500" />}
              subtitle="Escala Institucional"
            />
          </div>

          <Card noPadding className="overflow-hidden border-studio-border/60 shadow-2xl">
            <div className="bg-studio-muted/10 p-8 border-b border-studio-border/50 flex flex-wrap gap-8 items-center">
              <Avatar name={boletim.alunoNome} size="xl" shape="square" className="shadow-xl ring-4 ring-white" />
              <div className="flex-1">
                <h3 className="text-3xl font-black text-studio-foreground uppercase tracking-tighter">{boletim.alunoNome}</h3>
                <div className="flex gap-4 mt-2">
                  <Badge variant="success" className="font-extrabold text-[10px] tracking-widest px-3">ENSINO SECUNDÁRIO</Badge>
                  <Badge variant="neutral" className="font-extrabold text-[10px] tracking-widest px-3">CÓDIGO: {alunoId.slice(0, 8).toUpperCase()}</Badge>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto min-h-[400px]">
              <table className="min-w-full divide-y divide-studio-border/40 text-left">
                <thead className="bg-studio-bg sticky top-0 z-10">
                  <tr className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest">
                    <th className="px-8 py-4">Matriz Curricular</th>
                    <th className="px-8 py-4 text-center">1º Trimestre</th>
                    <th className="px-8 py-4 text-center">2º Trimestre</th>
                    <th className="px-8 py-4 text-center">3º Trimestre</th>
                    <th className="px-8 py-4 text-right">Resultado Final</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-studio-border/20">
                  {boletim.disciplinas.map((d: any) => (
                    <>
                      <tr key={d.disciplinaId} className="group hover:bg-studio-brand/[0.02] cursor-pointer" onClick={() => toggleRow(d.disciplinaId)}>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-studio-brand/10 flex items-center justify-center">
                              <BookOpen className="w-4 h-4 text-studio-brand" />
                            </div>
                            <div>
                              <p className="text-sm font-black text-studio-foreground uppercase tracking-tight">{d.nome}</p>
                              <div className="flex items-center gap-1 mt-1 opacity-50">
                                {expandedRows[d.disciplinaId] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                <span className="text-[9px] font-black uppercase">Ver Detalhes (MAC/NPP)</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        {[1, 2, 3].map(t => (
                          <td key={t} className="px-8 py-6 text-center">
                            <Badge variant={d.detalhesPorTrimestre[t]?.valor >= 10 ? 'success' : d.detalhesPorTrimestre[t]?.valor > 0 ? 'danger' : 'neutral'} className="font-black text-[12px] min-w-[40px]">
                              {d.detalhesPorTrimestre[t]?.valor || '—'}
                            </Badge>
                          </td>
                        ))}
                        <td className="px-8 py-6 text-right">
                          <div className="flex flex-col items-end">
                            <span className={`text-xl font-black ${d.aprovado ? 'text-emerald-500' : 'text-red-500'}`}>{d.mediaFinal || '—'}</span>
                            <span className="text-[9px] font-black uppercase tracking-widest opacity-40">{d.resultadoFinal}</span>
                          </div>
                        </td>
                      </tr>
                      {expandedRows[d.disciplinaId] && (
                        <tr className="bg-studio-muted/5 animate-in slide-in-from-top-2 duration-300">
                          <td colSpan={5} className="px-8 py-6 border-y border-studio-border/30">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {[1, 2, 3].map(t => (
                                <div key={t} className="space-y-3 bg-studio-bg p-4 rounded-2xl border border-studio-border/50 shadow-sm">
                                  <h5 className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest flex items-center gap-2">
                                    <Activity className="w-3 h-3 text-studio-brand" /> {t}º Período
                                  </h5>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="p-2.5 bg-studio-muted/5 rounded-xl text-center">
                                      <p className="text-[8px] font-black text-studio-foreground-lighter uppercase mb-1">MAC</p>
                                      <p className="text-sm font-black text-studio-foreground">{d.detalhesPorTrimestre[t]?.mac || '—'}</p>
                                    </div>
                                    <div className="p-2.5 bg-studio-muted/5 rounded-xl text-center">
                                      <p className="text-[8px] font-black text-studio-foreground-lighter uppercase mb-1">NPP</p>
                                      <p className="text-sm font-black text-studio-foreground">{d.detalhesPorTrimestre[t]?.npp || '—'}</p>
                                    </div>
                                  </div>
                                  <div className="pt-2 border-t border-studio-border/30 flex justify-between items-center px-1">
                                    <span className="text-[9px] font-black text-studio-foreground-lighter uppercase">Média:</span>
                                    <span className="text-[11px] font-bold text-studio-brand">{d.detalhesPorTrimestre[t]?.valor || '—'} v.</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-8 bg-studio-muted/10 flex flex-wrap justify-between items-center gap-6 border-t border-studio-border/50">
              <div className="flex items-center gap-4">
                <Info className="w-5 h-5 text-studio-brand" />
                <p className="text-[10px] text-studio-foreground-light font-bold leading-relaxed uppercase tracking-tighter max-w-md">
                  Este documento apresenta a trajetória académica oficial do estudante. Todos os resultados são calculados com base em fórmulas institucionais de rigor angolano (0-20).
                </p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-48 h-px bg-studio-border/60 mb-2" />
                <p className="text-[8px] font-black text-studio-foreground-lighter uppercase tracking-[6px]">Selo de Autenticidade</p>
                <p className="text-[9px] font-black text-studio-brand mt-1 opacity-40 uppercase">CAPIÑALA ERP v.2024</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
