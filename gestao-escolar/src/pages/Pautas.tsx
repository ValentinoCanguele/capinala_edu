import { useState, useMemo } from 'react'
import {
    useTurmas,
    usePeriodos,
    usePautaGeral,
} from '@/data/escola/queries'
import PageHeader from '@/components/PageHeader'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { Card } from '@/components/shared/Card'
import { Select } from '@/components/shared/Select'
import { Button } from '@/components/shared/Button'
import { Badge } from '@/components/shared/Badge'
import { Avatar } from '@/components/shared/Avatar'
import EmptyState from '@/components/shared/EmptyState'
import {
    Table,
    FileSpreadsheet,
    Printer,
    TrendingUp,
    GraduationCap,
    Calendar,
    LayoutGrid,
    Info,
    CheckCircle2,
    AlertCircle
} from 'lucide-react'

export default function Pautas() {
    const [turmaId, setTurmaId] = useState<string>('')
    const [trimestre, setTrimestre] = useState<number | ''>('')

    const { data: turmas = [] } = useTurmas()
    const selectedTurma = turmas.find((t) => t.id === turmaId)
    const anoLetivoId = selectedTurma?.anoLetivoId ?? null

    const { data: periodos = [] } = usePeriodos(anoLetivoId)
    const periodo = trimestre !== '' ? periodos.find((p) => p.numero === trimestre) : null
    const periodoId = periodo?.id ?? null

    const { data: pauta, isLoading } = usePautaGeral(turmaId || null, periodoId)

    const stats = useMemo(() => {
        if (!pauta || pauta.rows.length === 0) return { media: 0, aprovacao: 0 }
        const medias = pauta.rows.map(r => r.mediaGeral).filter((m): m is number => m !== null)
        if (medias.length === 0) return { media: 0, aprovacao: 0 }
        const media = medias.reduce((a, b) => a + b, 0) / medias.length
        const aprovados = pauta.rows.filter(r => r.aprovado).length
        return {
            media: Number(media.toFixed(1)),
            aprovacao: Math.round((aprovados / pauta.rows.length) * 100)
        }
    }, [pauta])

    const handleExport = () => {
        // TODO: Implementar exportação real
        console.log('Exporting broadsheet...')
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Pautas de Aproveitamento"
                subtitle="Mapa consolidado de rendimento académico por turma e período (Broadsheet)."
                actions={
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            icon={<Printer className="w-4 h-4" />}
                            onClick={handleExport}
                            disabled={!pauta}
                        >
                            Imprimir
                        </Button>
                        <Button
                            variant="primary"
                            size="sm"
                            icon={<FileSpreadsheet className="w-4 h-4" />}
                            onClick={handleExport}
                            disabled={!pauta}
                        >
                            Exportar Excel
                        </Button>
                    </div>
                }
            />

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-1">
                    <Select
                        label="Turma"
                        value={turmaId}
                        onChange={(e) => {
                            setTurmaId(e.target.value)
                            setTrimestre('')
                        }}
                        options={turmas.map(t => ({ value: t.id, label: `${t.nome} (${t.anoLetivo})` }))}
                        leftIcon={<GraduationCap className="w-4 h-4" />}
                    />

                    <Select
                        label="Período"
                        value={trimestre === '' ? '' : String(trimestre)}
                        onChange={(e) => setTrimestre(e.target.value ? Number(e.target.value) : '')}
                        options={[
                            { value: '', label: 'Selecionar Trimestre' },
                            ...[1, 2, 3].map(t => ({ value: String(t), label: `${t}º Trimestre` }))
                        ]}
                        leftIcon={<Calendar className="w-4 h-4" />}
                        disabled={!turmaId}
                    />
                </div>
            </Card>

            {!turmaId || trimestre === '' ? (
                <EmptyState
                    title="Consulta de Resultados"
                    description="Selecione os parâmetros acima para gerar a pauta oficial de aproveitamento em tempo real."
                    icon={<LayoutGrid className="w-12 h-12 text-studio-muted" />}
                />
            ) : isLoading ? (
                <Card>
                    <SkeletonTable rows={10} columns={6} />
                </Card>
            ) : !pauta || pauta.rows.length === 0 ? (
                <EmptyState
                    title="Dados Insuficientes"
                    description="Não foram encontrados dados de avaliação para esta turma no período selecionado."
                    icon={<AlertCircle className="w-12 h-12 text-studio-muted" />}
                />
            ) : (
                <div className="space-y-4">
                    {/* Analytics Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="bg-studio-muted/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-studio-brand/10 border border-studio-brand/20">
                                    <TrendingUp className="w-5 h-5 text-studio-brand" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-studio-foreground-lighter uppercase tracking-widest">Média da Turma</p>
                                    <p className="text-xl font-black text-studio-foreground">{stats.media} v.</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="bg-studio-muted/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-studio-foreground-lighter uppercase tracking-widest">Aproveitamento</p>
                                    <p className="text-xl font-black text-studio-foreground">{stats.aprovacao}%</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <Card noPadding className="overflow-hidden border-studio-border/60 shadow-xl">
                        <div className="overflow-x-auto max-h-[70vh] custom-scrollbar">
                            <table className="min-w-full divide-y divide-studio-border/50 border-collapse">
                                <thead className="sticky top-0 z-20">
                                    <tr className="bg-studio-bg divide-x divide-studio-border/30">
                                        <th scope="col" className="sticky left-0 z-30 bg-studio-bg px-6 py-4 text-left text-[10px] font-bold text-studio-foreground-light uppercase tracking-widest border-r border-studio-border/50 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                            Estudante
                                        </th>
                                        {pauta.disciplinas.map((d) => (
                                            <th
                                                key={d.id}
                                                scope="col"
                                                className="px-4 py-4 text-center text-[10px] font-bold text-studio-foreground-light uppercase tracking-widest min-w-[100px]"
                                            >
                                                <div className="truncate max-w-[120px]" title={d.nome}>{d.nome}</div>
                                            </th>
                                        ))}
                                        <th scope="col" className="px-6 py-4 text-center text-[10px] font-bold text-studio-brand uppercase tracking-widest bg-studio-brand/[0.03]">
                                            Média G.
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-center text-[10px] font-bold text-studio-foreground-light uppercase tracking-widest w-32">
                                            Estado
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-studio-bg divide-y divide-studio-border/20">
                                    {pauta.rows.map((row) => {
                                        const isReproved = !row.aprovado && row.mediaGeral !== null

                                        return (
                                            <tr
                                                key={row.alunoId}
                                                className={`group hover:bg-studio-muted/10 transition-colors duration-150 divide-x divide-studio-border/10 ${isReproved ? 'bg-red-500/[0.02]' : ''
                                                    }`}
                                            >
                                                <td className="sticky left-0 z-10 bg-inherit px-6 py-4 whitespace-nowrap border-r border-studio-border/50 shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar name={row.alunoNome} size="xs" shape="square" />
                                                        <span className="text-sm font-semibold text-studio-foreground group-hover:text-studio-brand transition-colors">
                                                            {row.alunoNome}
                                                        </span>
                                                    </div>
                                                </td>
                                                {pauta.disciplinas.map((d) => {
                                                    const nota = row.notas[d.id]
                                                    return (
                                                        <td key={d.id} className="px-4 py-4 whitespace-nowrap text-center">
                                                            {nota !== undefined ? (
                                                                <span className={`text-sm font-bold tabular-nums ${nota < 10 ? 'text-red-500' : 'text-studio-foreground'
                                                                    }`}>
                                                                    {nota.toFixed(1)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-studio-foreground-lighter/30 text-xs">—</span>
                                                            )}
                                                        </td>
                                                    )
                                                })}
                                                <td className="px-6 py-4 whitespace-nowrap text-center bg-studio-brand/[0.01]">
                                                    {row.mediaGeral !== null ? (
                                                        <span className={`text-sm font-black tabular-nums ${row.mediaGeral < 10 ? 'text-red-600 font-black' : 'text-studio-brand'
                                                            }`}>
                                                            {row.mediaGeral.toFixed(1)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-studio-foreground-lighter/30">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {row.mediaGeral === null ? (
                                                        <Badge variant="neutral">Incompleto</Badge>
                                                    ) : row.aprovado ? (
                                                        <Badge variant="success">Admitido</Badge>
                                                    ) : (
                                                        <Badge variant="danger">Exame</Badge>
                                                    )}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="p-4 bg-studio-muted/10 border-t border-studio-border/30 flex justify-between items-center">
                            <div className="flex items-center gap-4 text-[10px] text-studio-foreground-lighter font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-studio-brand" />
                                    Total de Alunos: {pauta.rows.length}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    Aprovados: {pauta.rows.filter(r => r.aprovado).length}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Info className="w-3.5 h-3.5 text-studio-foreground-lighter" />
                                <span className="text-[10px] text-studio-foreground-lighter italic">
                                    Dados calculados com base na escala 0–20 (Art. 45º do Regulamento Escolar).
                                </span>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
