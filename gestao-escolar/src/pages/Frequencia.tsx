import { Link } from 'react-router-dom'
import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useTurmas, useDisciplinas, useTurmaAlunos, useFrequencia, useRelatorioFrequenciaTurma } from '@/data/escola/queries'
import { useQueryClient } from '@tanstack/react-query'
import PageHeader from '@/components/PageHeader'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { Input } from '@/components/shared/Input'
import { useCreateAula, useSaveFrequencia } from '@/data/escola/mutations'
import { Avatar } from '@/components/shared/Avatar'
import { Badge } from '@/components/shared/Badge'
import { StatCard } from '@/components/shared/StatCard'
import { Card } from '@/components/shared/Card'
import { Select } from '@/components/shared/Select'
import { Button } from '@/components/shared/Button'
import { useSaveShortcut } from '@/hooks/useSaveShortcut'
import EmptyState from '@/components/shared/EmptyState'
import { ArrowLeft, BarChart3, Users, CheckCircle2, AlertTriangle, CalendarDays, ShieldAlert, Check, X, Info, FileText, ClipboardList, Save, QrCode } from 'lucide-react'


type Status = 'presente' | 'falta' | 'justificada'

type Row = { alunoId: string; alunoNome: string; status: Status }

function FrequenciaRelatorio() {
  const [turmaId, setTurmaId] = useState('')
  const { data: turmas = [] } = useTurmas()
  const { data: relatorio, isLoading } = useRelatorioFrequenciaTurma(
    turmaId || null
  )

  const turmaOptions = turmas.map(t => ({
    value: t.id,
    label: `${t.nome} (${t.anoLetivo})`
  }))

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Relatório de Frequência"
        subtitle="Analítica consolidada de presenças e alertas de assiduidade."
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.history.pushState({}, '', '/frequencia')}
            className="group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Registar Chamada
          </Button>
        }
      />

      <div className="max-w-xs">
        <Select
          label="Selecionar Turma"
          value={turmaId}
          onChange={(e) => setTurmaId(e.target.value)}
          options={turmaOptions}
          leftIcon={<Users className="w-4 h-4" />}
        />
      </div>

      {!turmaId ? (
        <Card>
          <EmptyState
            title="Relatório de Assiduidade"
            description="Selecione uma turma acima para gerar o relatório detalhado de presenças, faltas e alunos em risco."
            icon={<BarChart3 className="w-12 h-12 text-studio-muted" />}
          />
        </Card>
      ) : isLoading ? (
        <Card noPadding>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 border-b border-studio-border/50 bg-studio-muted/5">
            <div className="h-20 bg-studio-muted/20 animate-pulse rounded-xl" />
            <div className="h-20 bg-studio-muted/20 animate-pulse rounded-xl" />
            <div className="h-20 bg-studio-muted/20 animate-pulse rounded-xl" />
          </div>
          <SkeletonTable columns={6} rows={8} />
        </Card>
      ) : !relatorio ? (
        <Card>
          <EmptyState
            title="Sem Dados Disponíveis"
            description="Não foram encontrados registos de frequência para esta turma no período letivo atual."
            icon={<CalendarDays className="w-12 h-12 text-studio-muted" />}
          />
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              title="Turma Selecionada"
              value={relatorio.turmaNome}
              icon={<Users className="w-5 h-5" />}
            />
            <StatCard
              title="Taxa de Frequência"
              value={`${relatorio.mediaPresenca}%`}
              icon={<CheckCircle2 className="w-5 h-5" />}
              trend={{
                label: 'Média global',
                value: relatorio.mediaPresenca > 90 ? 'Excelente' : 'Regular',
                direction: relatorio.mediaPresenca > 90 ? 'up' : 'neutral'
              }}
            />
            <StatCard
              title="Alunos em Risco"
              value={relatorio.totalEmRisco.toString()}
              icon={<AlertTriangle className="w-5 h-5" />}
              trend={{ label: 'Limite < 75%', value: 'Presença', direction: 'down' }}
            />
          </div>

          <Card noPadding>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-studio-border/50" aria-label="Resumo de frequência por aluno">
                <thead>
                  <tr className="bg-studio-muted/10">
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-studio-foreground-light uppercase tracking-widest">
                      Estudante
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-studio-foreground-light uppercase tracking-widest border-l border-studio-border/30">
                      Total Aulas
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-studio-foreground-light uppercase tracking-widest">
                      Presenças
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-studio-foreground-light uppercase tracking-widest border-l border-studio-border/30 w-32">
                      Assiduidade
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-studio-foreground-light uppercase tracking-widest">
                      Estado de Risco
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-studio-border/30">
                  {relatorio.resumos.map((r) => (
                    <tr
                      key={r.alunoId}
                      className={`group transition-all duration-200 ${r.nivelRisco === 'critico'
                        ? 'bg-red-50/40 hover:bg-red-50/60'
                        : r.nivelRisco === 'atencao'
                          ? 'bg-amber-50/20 hover:bg-amber-50/40'
                          : 'hover:bg-studio-muted/20'
                        }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar name={r.alunoNome} size="sm" />
                          <span className="text-sm font-semibold text-studio-foreground group-hover:text-studio-brand transition-colors">{r.alunoNome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-studio-foreground-light text-center border-l border-studio-border/30 font-medium">
                        {r.totalAulas}
                      </td>
                      <td className="px-6 py-4 text-sm text-center font-bold">
                        <span className="text-emerald-600 dark:text-emerald-400">{r.presencas}</span>
                        <span className="text-studio-foreground-lighter mx-1">/</span>
                        <span className="text-red-500">{r.faltas}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-center tabular-nums border-l border-studio-border/30">
                        <div className="flex flex-col items-center gap-1">
                          <span className={`font-black ${r.nivelRisco === 'critico' ? 'text-red-600' : r.nivelRisco === 'atencao' ? 'text-amber-600' : 'text-studio-foreground-light'}`}>
                            {r.percentagemPresenca}%
                          </span>
                          <div className="w-16 h-1.5 bg-studio-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-700 ${r.nivelRisco === 'critico' ? 'bg-red-600' : r.nivelRisco === 'atencao' ? 'bg-amber-500' : 'bg-studio-brand'}`}
                              style={{ width: `${r.percentagemPresenca}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {r.nivelRisco === 'critico' ? (
                          <Badge variant="danger" pulse className="font-black uppercase tracking-tighter">Eliminado por Faltas</Badge>
                        ) : r.nivelRisco === 'atencao' ? (
                          <Badge variant="warning" className="font-black uppercase tracking-tighter">Risco de Exclusão</Badge>
                        ) : (
                          <Badge variant="success" className="font-black uppercase tracking-tighter">Regularizado</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default function Frequencia() {
  const [searchParams, setSearchParams] = useSearchParams()
  const vistaRelatorio = searchParams.get('vista') === 'relatorio'
  const queryClient = useQueryClient()

  const [turmaId, setTurmaId] = useState('')
  const [dataAula, setDataAula] = useState(new Date().toISOString().split('T')[0])
  const [disciplinaId, setDisciplinaId] = useState('')
  const [aulaId, setAulaId] = useState<string | null>(null)

  const { data: turmas = [] } = useTurmas()
  const { data: disciplinas = [] } = useDisciplinas()
  const { data: turmaAlunos = [] } = useTurmaAlunos(turmaId || null)
  const { data: frequenciaRows = [] } = useFrequencia(aulaId)

  const createAula = useCreateAula()
  const saveFrequencia = useSaveFrequencia()

  const rows: Row[] = useMemo(() => {
    const byAluno = new Map(frequenciaRows.map((f) => [f.alunoId, f.status as Status]))
    if (byAluno.size > 0) {
      return turmaAlunos.map((a) => ({
        alunoId: a.alunoId,
        alunoNome: a.alunoNome,
        status: byAluno.get(a.alunoId) ?? 'presente',
      }))
    }
    return turmaAlunos.map((a) => ({
      alunoId: a.alunoId,
      alunoNome: a.alunoNome,
      status: 'presente' as Status,
    }))
  }, [turmaAlunos, frequenciaRows])

  const [localRows, setLocalRows] = useState<Row[]>([])
  useEffect(() => {
    setLocalRows(rows)
  }, [rows])

  const canLoadAula = Boolean(turmaId && dataAula && disciplinaId)

  useEffect(() => {
    if (!canLoadAula) setAulaId(null)
  }, [canLoadAula, turmaId, dataAula, disciplinaId])

  const handleCarregarAula = () => {
    if (!canLoadAula) return
    createAula.mutate(
      { turmaId, disciplinaId, dataAula },
      {
        onSuccess: (data) => setAulaId(data?.aulaId ?? null),
        onError: (err) => {
          setAulaId(null)
          toast.error(err.message)
        },
      }
    )
  }

  const handleStatusChange = (alunoId: string, status: Status) => {
    setLocalRows((prev) =>
      prev.map((r) => (r.alunoId === alunoId ? { ...r, status } : r))
    )
  }

  const isDirty = useMemo(() => {
    if (!localRows.length) return false
    return localRows.some((r, i) => r.status !== rows[i]?.status)
  }, [localRows, rows])

  const handleSave = () => {
    if (!aulaId || !isDirty) return
    saveFrequencia.mutate(
      {
        aulaId,
        items: localRows.map((r) => ({ alunoId: r.alunoId, status: r.status })),
      },
      {
        onSuccess: () => {
          toast.success('Frequência guardada com sucesso.')
          queryClient.invalidateQueries({ queryKey: ['escola', 'relatorio-frequencia-turma'] })
        },
        onError: (err) => toast.error(err.message),
      }
    )
  }

  useSaveShortcut(handleSave, Boolean(aulaId && isDirty))

  const displayRows = localRows.length > 0 ? localRows : rows

  const attendanceRate = useMemo(() => {
    if (!displayRows.length) return 0
    const presentes = displayRows.filter(r => r.status === 'presente').length
    return Math.round((presentes / displayRows.length) * 100)
  }, [displayRows])

  const isLoading = createAula.isPending

  if (vistaRelatorio) {
    return <FrequenciaRelatorio />
  }

  const turmaOptions = turmas.map(t => ({ value: t.id, label: `${t.nome} (${t.anoLetivo})` }))
  const disciplinaOptions = disciplinas.map(d => ({ value: d.id, label: d.nome }))

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Registo de Chamada"
        subtitle="Controlo de assiduidade em tempo real com sincronização institucional automática."
        actions={
          <div className="flex items-center gap-3">
            <Link to="/frequencia/scanner">
              <Button
                variant="outline"
                size="sm"
                icon={<QrCode className="w-4 h-4" />}
              >
                Scanner
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchParams({ vista: 'relatorio' })}
              icon={<FileText className="w-4 h-4" />}
            >
              Relatórios Consolidados
            </Button>
            <Link to="/frequencia/justificativas">
              <Button
                variant="ghost"
                size="sm"
                icon={<ShieldAlert className="w-4 h-4" />}
                className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
              >
                Justificar Faltas
              </Button>
            </Link>
            {aulaId && (
              <Badge variant={isDirty ? 'warning' : 'success'} pulse={isDirty}>
                {isDirty ? 'Alterações Pendentes' : 'Chamada Sincronizada'}
              </Badge>
            )}
          </div>
        }
      />

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 p-1">
          <Select
            label="Turma"
            value={turmaId}
            onChange={(e) => setTurmaId(e.target.value)}
            options={turmaOptions}
            leftIcon={<Users className="w-4 h-4" />}
          />

          <Input
            label="Data da Aula"
            type="date"
            value={dataAula}
            onChange={(e) => setDataAula(e.target.value)}
            leftIcon={<CalendarDays className="w-4 h-4" />}
          />

          <Select
            label="Disciplina"
            value={disciplinaId}
            onChange={(e) => setDisciplinaId(e.target.value)}
            options={disciplinaOptions}
            leftIcon={<BarChart3 className="w-4 h-4" />}
          />

          <div className="flex items-end">
            <Button
              className="w-full"
              onClick={handleCarregarAula}
              disabled={!canLoadAula || createAula.isPending}
              loading={createAula.isPending}
              variant={aulaId ? 'secondary' : 'primary'}
            >
              {aulaId ? 'Recarregar Lista' : 'Abrir Chamada'}
            </Button>
          </div>
        </div>
      </Card>

      <Card noPadding className="overflow-hidden">
        {!canLoadAula ? (
          <EmptyState
            title="Configuração Requerida"
            description="Selecione a turma, data e disciplina para iniciar o registo de presenças."
            icon={<ShieldAlert className="w-12 h-12 text-studio-muted" />}
          />
        ) : canLoadAula && !aulaId && !createAula.isPending ? (
          <EmptyState
            title="Pronto para Iniciar"
            description="Configuração validada. Clique em 'Abrir Chamada' para carregar a lista de estudantes."
            icon={<CheckCircle2 className="w-12 h-12 text-studio-muted" />}
          />
        ) : isLoading ? (
          <SkeletonTable columns={2} rows={8} />
        ) : displayRows.length === 0 ? (
          <EmptyState
            title="Sem Estudantes"
            description="Esta turma não possui estudantes matriculados para renderizar a lista de chamada."
            icon={<Users className="w-12 h-12 text-studio-muted" />}
          />
        ) : (
          <div className="relative">
            <div className="px-6 py-4 bg-studio-muted/10 border-b border-studio-border/50 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4 text-studio-brand" />
                  <span className="text-xs font-bold text-studio-foreground uppercase tracking-widest">{displayRows.length} Estudantes</span>
                </div>
                <div className="h-4 w-px bg-studio-border/50" />
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${attendanceRate >= 80 ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
                  <span className="text-xs font-bold text-studio-foreground-lighter uppercase tracking-widest">
                    Assiduidade hoje: <span className="text-studio-foreground">{attendanceRate}%</span>
                  </span>
                </div>
              </div>

              <Button
                size="sm"
                onClick={handleSave}
                loading={saveFrequencia.isPending}
                disabled={!isDirty || saveFrequencia.isPending}
                icon={<Save className="w-4 h-4" />}
              >
                {isDirty ? 'Gravar Chamada (Cmd+S)' : 'Dados Guardados'}
              </Button>
            </div>

            <div className="overflow-x-auto max-h-[60vh] overflow-y-auto custom-scrollbar">
              <table className="min-w-full divide-y divide-studio-border/30" aria-label="Estado de frequência dos alunos">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-studio-bg/95 backdrop-blur-md border-b border-studio-border/50">
                    <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-studio-foreground-light uppercase tracking-widest">
                      Estudante
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-studio-foreground-light uppercase tracking-widest">
                      Controlo de Presença
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-studio-border/20">
                  {displayRows.map((r) => (
                    <tr key={r.alunoId} className="group hover:bg-studio-muted/10 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <Avatar name={r.alunoNome} size="sm" />
                          <span className="text-sm font-semibold text-studio-foreground">{r.alunoNome}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end p-1 bg-studio-muted/20 border border-studio-border/30 rounded-xl inline-flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(r.alunoId, 'presente')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all duration-200 ${r.status === 'presente'
                              ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-105'
                              : 'text-studio-foreground-lighter hover:bg-studio-bg hover:text-emerald-500'
                              }`}
                          >
                            <Check className={`w-3 h-3 ${r.status === 'presente' ? 'opacity-100' : 'opacity-0'}`} />
                            Presente
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(r.alunoId, 'falta')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all duration-200 ${r.status === 'falta'
                              ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 scale-105'
                              : 'text-studio-foreground-lighter hover:bg-studio-bg hover:text-red-500'
                              }`}
                          >
                            <X className={`w-3 h-3 ${r.status === 'falta' ? 'opacity-100' : 'opacity-0'}`} />
                            Falta
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(r.alunoId, 'justificada')}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all duration-200 ${r.status === 'justificada'
                              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20 scale-105'
                              : 'text-studio-foreground-lighter hover:bg-studio-bg hover:text-amber-500'
                              }`}
                          >
                            <Info className={`w-3 h-3 ${r.status === 'justificada' ? 'opacity-100' : 'opacity-0'}`} />
                            Justificada
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-studio-muted/10 border-t border-studio-border/30 flex justify-between items-center">
              <div className="text-[10px] text-studio-foreground-lighter font-bold uppercase tracking-widest flex items-center gap-4">
                <span>Presentes: {displayRows.filter(r => r.status === 'presente').length}</span>
                <span>Faltas: {displayRows.filter(r => r.status === 'falta').length}</span>
              </div>
              <Button
                onClick={handleSave}
                loading={saveFrequencia.isPending}
                disabled={!isDirty || saveFrequencia.isPending}
                variant="primary"
                size="sm"
                icon={<Save className="w-4 h-4" />}
              >
                Finalizar Sessão
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
