import { useState, useMemo, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { canLancarNotas } from '@/lib/permissoes'
import {
  useTurmas,
  usePeriodos,
  useNotas,
  useTurmaAlunos,
  useDisciplinas
} from '@/data/escola/queries'
import PageHeader from '@/components/PageHeader'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { Card } from '@/components/shared/Card'
import { Select } from '@/components/shared/Select'
import { Button } from '@/components/shared/Button'
import { Avatar } from '@/components/shared/Avatar'
import { Badge } from '@/components/shared/Badge'
import EmptyState from '@/components/shared/EmptyState'
import { useSaveShortcut } from '@/hooks/useSaveShortcut'
import { useSaveNotasBatch, useEnsurePeriodos } from '@/data/escola/mutations'
import {
  BookOpen,
  GraduationCap,
  Save,
  CheckCircle2,
  Info,
  Sigma,
  Calculator,
  ShieldCheck,
  History
} from 'lucide-react'

const TRIMESTRES = [1, 2, 3] as const

type Row = {
  alunoId: string;
  alunoNome: string;
  mac: number;
  npp: number;
  ne: number;
  valor: number
}

export default function Notas() {
  const { user } = useAuth()
  const [turmaId, setTurmaId] = useState<string>('')
  const [disciplinaId, setDisciplinaId] = useState<string>('')
  const [trimestre, setTrimestre] = useState<number | ''>('')
  const { data: turmas = [] } = useTurmas()
  const { data: disciplinas = [] } = useDisciplinas()

  const selectedTurma = turmas.find((t) => t.id === turmaId)
  const anoLetivoId = selectedTurma?.anoLetivoId ?? null

  const { data: periodos = [], refetch: refetchPeriodos } = usePeriodos(anoLetivoId)
  const ensurePeriodos = useEnsurePeriodos()

  const periodo = trimestre !== '' ? periodos.find((p) => p.numero === trimestre) : null
  const periodoId = periodo?.id ?? null

  useEffect(() => {
    if (anoLetivoId && periodos.length === 0 && !ensurePeriodos.isPending) {
      ensurePeriodos.mutate(anoLetivoId, {
        onSuccess: () => refetchPeriodos(),
      })
    }
  }, [anoLetivoId, periodos.length])

  const { data: notasRows = [], isLoading: notasLoading } = useNotas(turmaId || null, periodoId, disciplinaId)
  const { data: turmaAlunos = [], isLoading: alunosLoading } = useTurmaAlunos(turmaId || null)
  const saveNotas = useSaveNotasBatch()

  const canSave = !!turmaId && !!disciplinaId && trimestre !== ''

  const rows: Row[] = useMemo(() => {
    if (!turmaId) return []
    const byAluno = new Map(notasRows.map((n) => [n.alunoId, n]))
    return turmaAlunos.map((a) => {
      const n = byAluno.get(a.alunoId)
      return {
        alunoId: a.alunoId,
        alunoNome: a.alunoNome,
        mac: n?.mac ?? 0,
        npp: n?.npp ?? 0,
        ne: n?.ne ?? 0,
        valor: n?.valor ?? 0,
      }
    })
  }, [turmaId, turmaAlunos, notasRows])

  const [localRows, setLocalRows] = useState<Row[]>([])

  useEffect(() => {
    setLocalRows(rows)
  }, [rows])

  const handleUpdateComponent = (alunoId: string, field: 'mac' | 'npp' | 'ne', value: number) => {
    setLocalRows(prev => prev.map(r => {
      if (r.alunoId !== alunoId) return r
      const newRow = { ...r, [field]: value }
      // Cálculo de Rigor Simplificado (MAC 40% + NPP 60%) - No futuro virá da Matriz
      if (field !== 'ne') {
        newRow.valor = Number(((newRow.mac * 0.4) + (newRow.npp * 0.6)).toFixed(1))
      }
      return newRow
    }))
  }

  const isDirty = useMemo(() => {
    if (!localRows.length) return false
    return localRows.some((r, i) =>
      r.mac !== rows[i]?.mac ||
      r.npp !== rows[i]?.npp ||
      r.ne !== rows[i]?.ne ||
      r.valor !== rows[i]?.valor
    )
  }, [localRows, rows])

  const handleSave = () => {
    if (!canSave || !isDirty) return
    const toSend = localRows.map((r) => ({
      alunoId: r.alunoId,
      valor: r.valor,
      mac: r.mac,
      npp: r.npp,
      ne: r.ne
    }))
    saveNotas.mutate(
      {
        turmaId,
        periodoId: periodoId!,
        disciplinaId,
        notas: toSend
      },
      {
        onSuccess: () => toast.success('Caderneta de notas sincronizada.'),
        onError: (err) => toast.error(err.message),
      }
    )
  }

  useSaveShortcut(handleSave, canSave && isDirty)

  const stats = useMemo(() => {
    const validNotas = localRows.map(r => r.valor).filter(v => v > 0)
    if (!validNotas.length) return { media: 0, aprovacao: 0 }
    const media = validNotas.reduce((a, b) => a + b, 0) / validNotas.length
    const aprovados = validNotas.filter(v => v >= 10).length
    return {
      media: Number(media.toFixed(1)),
      aprovacao: Math.round((aprovados / validNotas.length) * 100)
    }
  }, [localRows])

  const isLoading = alunosLoading || notasLoading

  return (
    <div className="space-y-6 pb-20">
      <PageHeader
        title="Motor de Avaliação & Pautas"
        subtitle="Registo de notas compostas (MAC, NPP, NE) com cálculo de rigor institucional."
        actions={
          <div className="flex items-center gap-3">
            {isDirty && (
              <Badge variant="warning" pulse className="animate-in fade-in zoom-in duration-300">
                <Info className="w-3 h-3 mr-1" /> Alterações Pendentes
              </Badge>
            )}
            <Button variant="ghost" size="sm" icon={<History className="w-4 h-4" />}>Audit Log</Button>
          </div>
        }
      />

      <Card className="border-studio-border/60 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-1">
          <Select
            label="Turma"
            value={turmaId}
            onChange={(e) => {
              setTurmaId(e.target.value)
              setLocalRows([])
            }}
            options={turmas.map(t => ({ value: t.id, label: `${t.nome}` }))}
            leftIcon={<GraduationCap className="w-4 h-4 text-studio-brand" />}
          />

          <Select
            label="Disciplina"
            value={disciplinaId}
            onChange={(e) => setDisciplinaId(e.target.value)}
            options={[{ value: '', label: 'Selecionar Cadeira' }, ...disciplinas.map(d => ({ value: d.id, label: d.nome }))]}
            leftIcon={<BookOpen className="w-4 h-4 text-studio-foreground-lighter" />}
          />

          <Select
            label="Trimestre"
            value={trimestre === '' ? '' : String(trimestre)}
            onChange={(e) => {
              setTrimestre(e.target.value ? Number(e.target.value) : '')
              setLocalRows([])
            }}
            options={[
              { value: '', label: 'Selecionar Período' },
              ...TRIMESTRES.map(t => ({ value: String(t), label: `${t}º Trimestre` }))
            ]}
          />

          <div className="flex items-end">
            <Button
              className="w-full shadow-md"
              onClick={handleSave}
              disabled={!canSave || saveNotas.isPending || !isDirty}
              loading={saveNotas.isPending}
              icon={<ShieldCheck className="w-4 h-4" />}
            >
              Efetivar Pauta
            </Button>
          </div>
        </div>
      </Card>

      {!turmaId || !disciplinaId || trimestre === '' ? (
        <EmptyState
          title="Motor de Rigor Académico"
          description="Selecione os parâmetros acima para processar a pauta de avaliações e cálculos de média."
          icon={<Calculator className="w-16 h-16 opacity-10" />}
          className="h-[400px]"
        />
      ) : isLoading ? (
        <SkeletonTable rows={10} columns={5} />
      ) : (
        <Card noPadding className="overflow-hidden border-studio-border/60 shadow-xl animate-in fade-in duration-500">
          <div className="bg-studio-muted/10 border-b border-studio-border/50 px-6 py-4 flex flex-wrap gap-8 items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="neutral" className="font-extrabold text-[10px] uppercase tracking-widest px-2">Escala 0-20</Badge>
              <div className="flex items-center gap-2 text-[10px] font-black text-studio-foreground-lighter uppercase tracking-tighter">
                <span className="flex items-center gap-1"><Info className="w-3 h-3" /> Fórm.: (MAC * 0.4) + (NPP * 0.6)</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Sigma className="w-4 h-4 text-studio-brand" />
                <span className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest">Média Turma:</span>
                <span className={`text-sm font-black ${stats.media >= 10 ? 'text-emerald-500' : 'text-red-500'}`}>
                  {stats.media} v.
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest">Aproveitamento:</span>
                <span className="text-sm font-black text-studio-foreground">
                  {stats.aprovacao}%
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[60vh] overflow-y-auto custom-scrollbar">
            <table className="min-w-full divide-y divide-studio-border/40 text-left">
              <thead className="sticky top-0 z-20 bg-studio-bg border-b border-studio-border shadow-sm">
                <tr className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest">
                  <th className="px-6 py-4">Estudante</th>
                  <th className="px-6 py-4 text-center">MAC (C.)</th>
                  <th className="px-6 py-4 text-center">NPP (P.)</th>
                  <th className="px-6 py-4 text-center border-x border-studio-border/30 bg-studio-muted/5">Média Período</th>
                  <th className="px-6 py-4 text-right">Classificação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-studio-border/20">
                {localRows.map((r) => {
                  const isNegative = r.valor < 10 && r.valor > 0
                  return (
                    <tr key={r.alunoId} className="group hover:bg-studio-brand/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={r.alunoNome} size="sm" shape="square" className="shadow-sm border border-studio-border/50" />
                          <span className="text-xs font-bold text-studio-foreground uppercase tracking-tight truncate max-w-[180px]">
                            {r.alunoNome}
                          </span>
                        </div>
                      </td>

                      {/* MAC Input */}
                      <td className="px-4 py-4 text-center">
                        <input
                          type="number"
                          min={0} max={20} step={0.1}
                          value={r.mac || 0}
                          onChange={(e) => handleUpdateComponent(r.alunoId, 'mac', Number(e.target.value))}
                          readOnly={!canLancarNotas(user?.papel)}
                          className="w-20 px-3 py-1.5 rounded-lg border border-studio-border/50 text-xs font-black text-center focus:ring-1 focus:ring-studio-brand outline-none transition-all tabular-nums bg-transparent"
                        />
                      </td>

                      {/* NPP Input */}
                      <td className="px-4 py-4 text-center">
                        <input
                          type="number"
                          min={0} max={20} step={0.1}
                          value={r.npp || 0}
                          onChange={(e) => handleUpdateComponent(r.alunoId, 'npp', Number(e.target.value))}
                          readOnly={!canLancarNotas(user?.papel)}
                          className="w-20 px-3 py-1.5 rounded-lg border border-studio-border/50 text-xs font-black text-center focus:ring-1 focus:ring-studio-brand outline-none transition-all tabular-nums bg-transparent"
                        />
                      </td>

                      {/* Calculado Auto */}
                      <td className="px-6 py-4 text-center border-x border-studio-border/10 bg-studio-muted/5">
                        <Badge variant={isNegative ? 'danger' : r.valor >= 10 ? 'success' : 'neutral'} className="text-[11px] font-black min-w-[50px]">
                          {r.valor}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {r.valor === 0 ? (
                          <span className="text-[9px] font-black text-studio-foreground-lighter uppercase">Pendente</span>
                        ) : isNegative ? (
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-red-500 uppercase">Deficiente</span>
                            <span className="text-[8px] font-bold text-red-500/50 uppercase">Não Transita</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span className="text-[9px] font-black text-emerald-600 uppercase">Aprovado</span>
                            <Badge variant="success" className="mt-1 text-[10px] invisible group-hover:visible">{r.valor >= 16 ? 'Excelente' : 'Bom'}</Badge>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Action Bar Bottom */}
          <div className="p-4 bg-studio-muted/10 border-t border-studio-border/50 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-[9px] font-black text-studio-foreground-lighter uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Auditoria de Sessão Ativa</span>
              <span className="opacity-30">|</span>
              <span>Estudantes: {localRows.length}</span>
            </div>
            {canLancarNotas(user?.papel) && (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setLocalRows(rows)} disabled={!isDirty}>Reverter</Button>
              <Button
                onClick={handleSave}
                loading={saveNotas.isPending}
                disabled={!canSave || !isDirty}
                variant="primary"
                icon={<Save className="w-4 h-4" />}
                size="sm"
              >
                {isDirty ? 'Confirmar e Publicar (Cmd+S)' : 'Pauta Publicada'}
              </Button>
            </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
