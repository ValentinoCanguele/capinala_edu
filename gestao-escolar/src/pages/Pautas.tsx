import { useState, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { canViewNotas } from '@/lib/permissoes'
import {
    useTurmas,
    usePeriodos,
    usePautaGeral,
} from '@/data/escola/queries'
import PageHeader from '@/components/PageHeader'
import { exportPautaAnualPDF } from '@/utils/exportPDF'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { Card } from '@/components/shared/Card'
import { Select } from '@/components/shared/Select'
import { Button } from '@/components/shared/Button'
import { Badge } from '@/components/shared/Badge'
import { Avatar } from '@/components/shared/Avatar'
import EmptyState from '@/components/shared/EmptyState'
import { StatCard } from '@/components/shared/StatCard'
import {
    Table as TableIcon,
    FileSpreadsheet,
    Printer,
    TrendingUp,
    GraduationCap,
    Calendar,
    LayoutGrid,
    Info,
    CheckCircle2,
    AlertCircle,
    FileText,
    Clock,
    Download,
    Share2,
    Activity,
    Award
} from 'lucide-react'

export default function Pautas() {
    const { user } = useAuth()
    const [turmaId, setTurmaId] = useState<string>('')
    const [trimestre, setTrimestre] = useState<number | ''>('')
    const [viewMode, setViewMode] = useState<'grid' | 'ata'>('grid')

    const { data: turmas = [] } = useTurmas()
    const selectedTurma = turmas.find((t) => t.id === turmaId)
    const anoLetivoId = selectedTurma?.anoLetivoId ?? null

    const { data: periodos = [] } = usePeriodos(anoLetivoId)
    const periodo = trimestre !== '' ? periodos.find((p) => p.numero === trimestre) : null
    const periodoId = periodo?.id ?? null

    const { data: pauta, isLoading } = usePautaGeral(turmaId || null, periodoId)

    const stats = useMemo(() => {
        if (!pauta || pauta.rows.length === 0) return { media: 0, aprovacao: 0, total: 0, aprovadosColor: 'text-studio-foreground' }
        const medias = pauta.rows.map(r => r.mediaGeral).filter((m): m is number => m !== null)
        if (medias.length === 0) return { media: 0, aprovacao: 0, total: pauta.rows.length, aprovadosColor: 'text-studio-foreground' }
        const media = medias.reduce((a, b) => a + b, 0) / medias.length
        const aprovadosCount = pauta.rows.filter(r => r.aprovado).length
        const aprovacao = Math.round((aprovadosCount / pauta.rows.length) * 100)

        return {
            media: Number(media.toFixed(2)),
            aprovacao,
            total: pauta.rows.length,
            aprovadosCount,
            aprovadosColor: aprovacao >= 75 ? 'text-emerald-500' : aprovacao >= 50 ? 'text-amber-500' : 'text-red-500'
        }
    }, [pauta])

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <PageHeader
                    title="Pautas & Atas Digitais"
                    subtitle="Visão consolidada de rendimento académico e suporte a conselhos de turma."
                    className="mb-0"
                />

                {pauta && (
                    <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                        <Button variant="secondary" size="sm" onClick={handlePrint} icon={<Printer className="w-4 h-4" />}>
                            Imprimir
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                                if (!pauta) return;
                                exportPautaAnualPDF({
                                    escola: 'Capiñala - Complexo Escolar',
                                    turma: selectedTurma?.nome || 'Sem Turma',
                                    anoLetivo: selectedTurma?.anoLetivo || '2026/2027',
                                    disciplinas: pauta.disciplinas.map(d => d.nome),
                                    rows: pauta.rows.map(r => ({
                                        aluno: r.alunoNome,
                                        notas: Object.keys(r.notas).reduce((acc: any, key) => {
                                            const dNome = pauta.disciplinas.find(d => d.id === key)?.nome;
                                            if (dNome) acc[dNome] = { media: r.notas[key] };
                                            return acc;
                                        }, {})
                                    }))
                                });
                            }}
                            icon={<Download className="w-4 h-4" />}
                        >
                            Pauta Oficial (Landscape)
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8">
                    <Card className="border-studio-border/60 shadow-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select
                                label="1. Selecionar Turma"
                                value={turmaId}
                                onChange={(e) => {
                                    setTurmaId(e.target.value)
                                    setTrimestre('')
                                }}
                                leftIcon={<GraduationCap className="w-4 h-4 text-studio-brand" />}
                                options={[{ value: '', label: 'Selecione uma Turma' }, ...turmas.map(t => ({ value: t.id, label: `${t.nome} (${t.anoLetivo})` }))]}
                            />

                            <Select
                                label="2. Trimestre / Período"
                                value={trimestre === '' ? '' : String(trimestre)}
                                onChange={(e) => setTrimestre(e.target.value ? Number(e.target.value) : '')}
                                disabled={!turmaId}
                                leftIcon={<Calendar className="w-4 h-4 text-studio-brand" />}
                                options={[
                                    { value: '', label: 'Selecionar Trimestre' },
                                    ...[1, 2, 3].map(t => ({ value: String(t), label: `${t}º Trimestre` }))
                                ]}
                            />
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-4 flex items-end">
                    <div className="w-full p-4 bg-studio-brand/5 border border-studio-brand/10 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-studio-brand/10 p-2.5 rounded-lg">
                                <Activity className="w-5 h-5 text-studio-brand" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-studio-brand uppercase tracking-widest leading-none mb-1">Status da Pauta</p>
                                <p className="text-sm font-bold text-studio-foreground">
                                    {pauta ? 'Consolidada em Real-Time' : 'Aguardando Criterios'}
                                </p>
                            </div>
                        </div>
                        {pauta && (
                            <Badge variant="success" className="px-2 py-0.5 text-[9px] font-black tracking-tighter">OFICIAL</Badge>
                        )}
                    </div>
                </div>
            </div>

            {pauta && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                    <StatCard
                        title="Média Geral Turma"
                        value={stats.media}
                        icon={<TrendingUp className="w-5 h-5" />}
                        subtitle="Média ponderada do grupo"
                        trend={{
                            value: stats.media >= 10 ? 'Positiva' : 'Crítica',
                            direction: stats.media >= 10 ? 'up' : 'down'
                        }}
                        className="border-b-4 border-b-studio-brand"
                    />
                    <StatCard
                        title="Taxa de Aproveitamento"
                        value={`${stats.aprovacao}%`}
                        icon={<CheckCircle2 className="w-5 h-5" />}
                        subtitle={`${stats.aprovadosCount} de ${stats.total} alunos`}
                        trend={{
                            value: stats.aprovacao >= 75 ? 'Excelente' : stats.aprovacao >= 50 ? 'Regular' : 'Baixa',
                            direction: stats.aprovacao >= 50 ? 'up' : 'down'
                        }}
                    />
                    <StatCard
                        title="Conselho de Turma"
                        value={stats.aprovacao >= 80 ? 'Favorável' : 'Atenção'}
                        icon={<FileText className="w-5 h-5" />}
                        subtitle="Indicador de desempenho"
                    />
                    <StatCard
                        title="Estado da Pauta"
                        value="Validada"
                        icon={<Award className="w-5 h-5" />}
                        subtitle="Sincronizado p/ Pautas"
                    />
                </div>
            )}

            <Card noPadding className="border-studio-border/60 shadow-xl overflow-hidden relative">
                {!turmaId || trimestre === '' ? (
                    <EmptyState
                        title="Broadsheet de Avaliação"
                        description="Selecione a turma e o respectivo período para visualizar a matriz completa de notas e desempenho."
                        icon={<FileSpreadsheet className="w-16 h-16 text-studio-brand/40" />}
                        tone="info"
                        size="lg"
                        className="py-24"
                    />
                ) : isLoading ? (
                    <div className="p-10">
                        <SkeletonTable rows={10} columns={6} />
                    </div>
                ) : !pauta || pauta.rows.length === 0 ? (
                    <EmptyState
                        title="Nenhum Registro Encontrado"
                        description="Não existem lançamentos de notas suficientes para gerar a pauta desta turma no período selecionado."
                        icon={<AlertCircle className="w-14 h-14 text-studio-foreground-lighter" />}
                        tone="warning"
                        size="md"
                        className="py-20"
                    />
                ) : (
                    <div className="animate-in fade-in duration-700">
                        {/* Toolbar interna */}
                        <div className="bg-studio-muted/10 border-b border-studio-border/50 px-6 py-4 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="flex bg-studio-bg border border-studio-border/60 p-1 rounded-xl shadow-sm">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'grid' ? 'bg-studio-brand text-white' : 'text-studio-foreground-light hover:bg-studio-muted'}`}
                                    >
                                        Matriz Geral
                                    </button>
                                    <button
                                        onClick={() => setViewMode('ata')}
                                        className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'ata' ? 'bg-studio-brand text-white' : 'text-studio-foreground-light hover:bg-studio-muted'}`}
                                    >
                                        Resumo p/ Ata
                                    </button>
                                </div>
                                <div className="hidden sm:flex items-center gap-3 ml-4">
                                    <Badge variant="neutral" className="text-[10px] font-black uppercase tracking-widest px-2">Escala 0-20</Badge>
                                    <span className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" /> Última Sincronização: {new Date().toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" className="hidden lg:flex">Audit Log</Button>
                            </div>
                        </div>

                        {viewMode === 'grid' ? (
                            <div className="overflow-x-auto max-h-[70vh] custom-scrollbar">
                                <table className="min-w-full divide-y divide-studio-border/50">
                                    <thead>
                                        <tr className="bg-studio-bg sticky top-0 z-30 divide-x divide-studio-border/30">
                                            <th className="sticky left-0 z-40 bg-studio-bg px-8 py-5 text-left text-[10px] font-black text-studio-foreground-light uppercase tracking-widest border-r border-studio-border/50 shadow-sm">
                                                Estudante
                                            </th>
                                            {pauta.disciplinas.map((d) => (
                                                <th key={d.id} className="px-5 py-5 text-center text-[10px] font-black text-studio-foreground-light uppercase tracking-widest min-w-[120px]">
                                                    <div className="truncate max-w-[120px]" title={d.nome}>{d.nome}</div>
                                                </th>
                                            ))}
                                            <th className="px-8 py-5 text-center text-[10px] font-black text-studio-brand uppercase tracking-widest bg-studio-brand/[0.02]">
                                                Média Período
                                            </th>
                                            <th className="px-8 py-5 text-center text-[10px] font-black text-studio-foreground-light uppercase tracking-widest w-40">
                                                Classificação
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-studio-border/30">
                                        {pauta.rows.map((row) => (
                                            <tr key={row.alunoId} className="group hover:bg-studio-brand/[0.01] transition-colors divide-x divide-studio-border/10">
                                                <td className="sticky left-0 z-20 bg-studio-bg px-8 py-6 whitespace-nowrap border-r border-studio-border/50 shadow-sm group-hover:bg-studio-brand/[0.01]">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar name={row.alunoNome} size="xs" shape="square" className="shadow-sm border border-studio-border/30" />
                                                        <span className="text-sm font-bold text-studio-foreground group-hover:text-studio-brand transition-colors tracking-tight">
                                                            {row.alunoNome}
                                                        </span>
                                                    </div>
                                                </td>
                                                {pauta.disciplinas.map((d) => {
                                                    const nota = row.notas[d.id]
                                                    return (
                                                        <td key={d.id} className="px-5 py-6 text-center whitespace-nowrap">
                                                            {nota !== undefined ? (
                                                                <span className={`text-sm font-black tabular-nums ${nota < 10 ? 'text-red-500' : 'text-studio-foreground'}`}>
                                                                    {nota.toFixed(1)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-studio-foreground-lighter/20 text-xs font-black">—</span>
                                                            )}
                                                        </td>
                                                    )
                                                })}
                                                <td className="px-8 py-6 text-center whitespace-nowrap bg-studio-brand/[0.01]">
                                                    {row.mediaGeral !== null ? (
                                                        <span className={`text-base font-black tabular-nums ${row.mediaGeral < 10 ? 'text-red-600' : 'text-studio-brand'}`}>
                                                            {row.mediaGeral.toFixed(1)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-studio-foreground-lighter/30">—</span>
                                                    )}
                                                </td>
                                                <td className="px-8 py-6 text-center whitespace-nowrap">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Badge variant={row.aprovado ? 'success' : 'danger'} className="text-[9px] font-black tracking-widest px-2 py-0.5">
                                                            {row.aprovado ? 'ADMITIDO' : row.mediaGeral === null ? 'PENDENTE' : 'EXAME'}
                                                        </Badge>
                                                        {row.mediaGeral !== null && row.mediaGeral >= 16 && (
                                                            <span className="text-[8px] font-black text-studio-brand uppercase tracking-tighter">Quadro de Mérito</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-10 max-w-4xl mx-auto space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                                <div className="text-center space-y-2">
                                    <h3 className="text-2xl font-black text-studio-foreground tracking-tight uppercase">Resumo Estruturado de Desempenho</h3>
                                    <p className="text-sm font-medium text-studio-foreground-light italic">Sessão de Conselho de Turma do {trimestre}º Trimestre — {selectedTurma?.nome}</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-studio-foreground uppercase tracking-[3px] border-b border-studio-border pb-2">Distribuição de Resultados</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-bold text-studio-foreground-light">Total de Alunos Avaliados</span>
                                                <span className="font-black text-studio-foreground">{stats.total}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-bold text-studio-foreground-light">Aprovações (Admissões Diretas)</span>
                                                <span className="font-black text-emerald-600">{stats.aprovadosCount}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="font-bold text-studio-foreground-light">Reprovações / Exames de Recurso</span>
                                                <span className="font-black text-red-600">{stats.total - stats.aprovadosCount}</span>
                                            </div>
                                            <div className="pt-4 mt-4 border-t border-studio-border/40">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-bold text-studio-foreground">Índice Geral de Escolaridade</span>
                                                    <span className={`text-lg font-black ${stats.aprovadosColor}`}>{stats.aprovacao}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-studio-muted rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-1000 ${stats.aprovacao >= 75 ? 'bg-emerald-500' : stats.aprovacao >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                        style={{ width: `${stats.aprovacao}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black text-studio-foreground uppercase tracking-[3px] border-b border-studio-border pb-2">Top Performance p/ Cadeira</h4>
                                        <div className="space-y-3">
                                            {pauta.disciplinas.slice(0, 5).map((d) => {
                                                const notasDisciplina = pauta.rows.map(r => r.notas[d.id]).filter(n => n !== undefined);
                                                const mediaDisciplina = notasDisciplina.length > 0
                                                    ? notasDisciplina.reduce((a, b) => a + b, 0) / notasDisciplina.length
                                                    : 0;

                                                return (
                                                    <div key={d.id} className="flex items-center gap-3 p-3 bg-studio-muted/20 border border-studio-border/40 rounded-xl">
                                                        <div className="w-8 h-8 rounded-lg bg-studio-bg flex items-center justify-center font-black text-[10px] text-studio-brand border border-studio-border/60 shadow-sm">
                                                            {d.nome.slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-xs font-bold text-studio-foreground truncate">{d.nome}</p>
                                                            <p className="text-[10px] text-studio-foreground-lighter uppercase font-black">{notasDisciplina.length} alunos avaliados</p>
                                                        </div>
                                                        <Badge variant="neutral" className="bg-studio-bg border border-studio-border/60 shadow-inner">
                                                            <TrendingUp className="w-3 h-3 text-studio-brand mr-1" />
                                                            {mediaDisciplina.toFixed(1)}
                                                        </Badge>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 border-2 border-dashed border-studio-border/60 rounded-3xl bg-studio-muted/10 flex flex-col items-center">
                                    <p className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest mb-6 underline decoration-studio-brand/30 decoration-2 underline-offset-4">Área de Validação Pedagógica</p>
                                    <div className="flex flex-wrap justify-center gap-12">
                                        <div className="flex flex-col items-center">
                                            <div className="w-48 h-px bg-studio-foreground/40 mb-3" />
                                            <span className="text-[9px] font-black text-studio-foreground italic uppercase">O Diretor da Turma</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="w-48 h-px bg-studio-foreground/40 mb-3" />
                                            <span className="text-[9px] font-black text-studio-foreground italic uppercase">A Direção Pedagógica</span>
                                        </div>
                                    </div>
                                    <div className="mt-8">
                                        <p className="text-[9px] font-bold text-studio-brand uppercase tracking-tighter opacity-50">DOCUMENTO PROCESSADO POR COMPUTADOR — ACMS GESTÃO INTEGRADA</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="px-8 py-5 border-t border-studio-border/50 bg-studio-muted/5 flex justify-between items-center text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest">
                            <div className="flex items-center gap-6">
                                <span className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5" /> Estatuto do Aluno Art. 82º</span>
                                <span className="flex items-center gap-1.5"><TableIcon className="w-3.5 h-3.5" /> Broadsheet ID: {pauta.rows[0]?.alunoId?.slice(0, 8)}</span>
                            </div>
                            <span>Capiñala ACMS Systems</span>
                        </div>
                    </div>
                )}
            </Card>

            <div className="mt-8 flex justify-center">
                <div className="bg-white dark:bg-studio-bg border border-studio-border/80 px-8 py-4 rounded-3xl shadow-soft animate-in zoom-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-studio-brand/10 rounded-2xl flex items-center justify-center">
                            <ShieldCheckIcon className="w-5 h-5 text-studio-brand" />
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-xs font-black text-studio-foreground uppercase tracking-widest underline decoration-studio-brand/40">Garantia de Integridade</p>
                            <p className="text-[10px] font-medium text-studio-foreground-light italic leading-none opacity-80">
                                Este mapa de notas é final e inalterável após o encerramento do trimestre pela Direção Pedagógica.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Support items missing from Lucide imports if any
function ShieldCheckIcon(props: any) {
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
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
