import { useState, useMemo } from 'react'
import { Save, TrendingUp, Info, RefreshCw, Trash2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '@/contexts/AuthContext'
import { canLancarNotas } from '@/lib/permissoes'
import { useTurmas, useDisciplinas, useExames, usePautaGeral } from '@/data/escola/queries'
import { useSaveExame, useDeleteExame } from '@/data/escola/mutations'
import PageHeader from '@/components/PageHeader'
import { Card } from '@/components/shared/Card'
import { Select } from '@/components/shared/Select'
import { Button } from '@/components/shared/Button'
import { Badge } from '@/components/shared/Badge'
import EmptyState from '@/components/shared/EmptyState'

export default function Recuperacao() {
    const { user } = useAuth()
    const [turmaId, setTurmaId] = useState<string>('')
    const [disciplinaId, setDisciplinaId] = useState<string>('')
    const [tipo, setTipo] = useState<'recurso' | 'melhoria' | 'especial'>('recurso')

    const { data: turmas = [] } = useTurmas()
    const { data: disciplinas = [] } = useDisciplinas()

    // We need to know who is in the "Exame" zone. We can use usePautaGeral for this (3rd period of course)
    // To keep it simple, we fetch the pauta for the whole year (using a virtual period or 3rd period result)
    const { data: pauta } = usePautaGeral(turmaId || null, 'actual') // 'actual' might need to be resolved to periodoId

    const { data: exames = [] } = useExames({ turmaId: turmaId || undefined, disciplinaId: disciplinaId || undefined })
    const saveExame = useSaveExame()
    const deleteExame = useDeleteExame()

    // Find the Periodo for the 3rd Trimester (standard for annual MFA) – selectedTurma available via turmas.find(t => t.id === turmaId) if needed later

    const candidates = useMemo(() => {
        if (!pauta) return []
        // Filter rows where student has MFA between 7 and 9.9
        return pauta.rows.filter(r => r.mediaGeral !== null && r.mediaGeral >= 7 && r.mediaGeral < 10)
    }, [pauta])

    const [localGrades, setLocalGrades] = useState<Record<string, number>>({})

    const handleSave = (alunoId: string) => {
        const valor = localGrades[alunoId]
        if (valor === undefined) return

        saveExame.mutate({
            alunoId,
            turmaId,
            disciplinaId,
            tipo,
            valor
        }, {
            onSuccess: () => {
                toast.success('Nota de exame lançada.')
                setLocalGrades(prev => {
                    const n = { ...prev }
                    delete n[alunoId]
                    return n
                })
            },
            onError: (err) => toast.error(err.message)
        })
    }

    const handleDelete = (id: string) => {
        if (confirm('Deseja eliminar este registo de exame?')) {
            deleteExame.mutate(id, {
                onSuccess: () => toast.success('Registo eliminado.'),
                onError: (err) => toast.error(err.message)
            })
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Recuperação e Melhoria"
                subtitle="Gestão de exames de recurso, melhoria de nota e exames especiais."
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <Card className="lg:col-span-1 p-4 space-y-4 h-fit">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-studio-foreground-lighter uppercase tracking-widest px-1">Turma</label>
                        <Select
                            value={turmaId}
                            onChange={(e) => setTurmaId(e.target.value)}
                            options={[{ value: '', label: 'Selecionar Turma...' }, ...turmas.map(t => ({ value: t.id, label: t.nome }))]}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-studio-foreground-lighter uppercase tracking-widest px-1">Disciplina</label>
                        <Select
                            value={disciplinaId}
                            onChange={(e) => setDisciplinaId(e.target.value)}
                            options={[{ value: '', label: 'Selecionar Disciplina...' }, ...disciplinas.map(d => ({ value: d.id, label: d.nome }))]}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-studio-foreground-lighter uppercase tracking-widest px-1">Tipo de Exame</label>
                        <Select
                            value={tipo}
                            onChange={(e) => setTipo((e.target.value || 'recurso') as 'recurso' | 'melhoria' | 'especial')}
                            options={[
                                { value: 'recurso', label: 'Exame de Recurso' },
                                { value: 'melhoria', label: 'Melhoria de Nota' },
                                { value: 'especial', label: 'Exame Especial' },
                            ]}
                        />
                    </div>

                    <div className="pt-4 border-t border-studio-border">
                        <div className="flex items-center gap-2 mb-2">
                            <Info className="w-3 h-3 text-studio-brand" />
                            <span className="text-[10px] font-bold text-studio-foreground-light uppercase">Contexto Legal</span>
                        </div>
                        <p className="text-[10px] text-studio-foreground-lighter leading-relaxed">
                            O exame de recurso é obrigatório para alunos com MFA entre 7 e 9 valores. A nota final será ponderada entre a MFA (40%) e o Exame (60%).
                        </p>
                    </div>
                </Card>

                <div className="lg:col-span-3 space-y-4">
                    {!turmaId || !disciplinaId ? (
                        <EmptyState
                            title="Aguardando Seleção"
                            description="Selecione a turma e a disciplina para gerir os exames."
                            icon={<TrendingUp className="w-12 h-12 text-studio-muted" />}
                        />
                    ) : (
                        <>
                            {/* Estatísticas Rápidas */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="p-4 bg-amber-500/5 border-amber-500/20">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Candidatos a Recurso</p>
                                            <h3 className="text-2xl font-black text-amber-600">{candidates.length}</h3>
                                        </div>
                                        <AlertCircle className="w-8 h-8 text-amber-500/30" />
                                    </div>
                                </Card>
                                <Card className="p-4 bg-emerald-500/5 border-emerald-500/20">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Exames Lançados</p>
                                            <h3 className="text-2xl font-black text-emerald-600">{exames.length}</h3>
                                        </div>
                                        <RefreshCw className="w-8 h-8 text-emerald-500/30" />
                                    </div>
                                </Card>
                            </div>

                            {/* Tabela de Lançamento */}
                            <Card className="overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-studio-muted/5 border-b border-studio-border">
                                        <tr>
                                            <th className="px-6 py-3 text-[10px] font-bold text-studio-foreground-lighter uppercase tracking-widest">Aluno</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-studio-foreground-lighter uppercase tracking-widest text-center">MFA Atual</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-studio-foreground-lighter uppercase tracking-widest text-center">Nota Exame</th>
                                            <th className="px-6 py-3 text-right"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-studio-border/50">
                                        {/* Lista de alunos que já têm exame */}
                                        {exames.map(ex => (
                                            <tr key={ex.id} className="hover:bg-studio-muted/5 transition-colors group">
                                                <td className="px-6 py-4 font-bold text-studio-foreground flex items-center gap-2">
                                                    {ex.studentName}
                                                    <Badge variant="neutral" className="text-[8px]">{ex.tipo}</Badge>
                                                </td>
                                                <td className="px-6 py-4 text-center text-studio-foreground-light font-medium italic">Consolidado</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center">
                                                        <Badge variant={ex.valor >= 10 ? 'success' : 'danger'} className="px-4 py-1.5 text-sm font-black">
                                                            {ex.valor}
                                                        </Badge>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {canLancarNotas(user?.papel) && (
                                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(ex.id)}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}

                                        {/* Alunos candidatos que ainda não têm exame */}
                                        {candidates.filter(c => !exames.find(e => e.alunoId === c.alunoId)).map(aluno => (
                                            <tr key={aluno.alunoId} className="hover:bg-studio-brand/5 transition-colors">
                                                <td className="px-6 py-4 font-medium text-studio-foreground">{aluno.alunoNome}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <Badge variant="neutral" className="bg-amber-100 text-amber-700 border-amber-200">
                                                        {aluno.mediaGeral}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex justify-center">
                                                        <input
                                                            type="number"
                                                            readOnly={!canLancarNotas(user?.papel)}
                                                            className="w-20 px-3 py-1.5 bg-studio-bg border border-studio-border rounded-md text-center font-bold text-lg focus:ring-2 focus:ring-studio-brand focus:border-transparent outline-none transition-all"
                                                            placeholder="0-20"
                                                            value={localGrades[aluno.alunoId] ?? ''}
                                                            onChange={(e) => setLocalGrades({ ...localGrades, [aluno.alunoId]: Number(e.target.value) })}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {canLancarNotas(user?.papel) && (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        icon={<Save className="w-3 h-3" />}
                                                        onClick={() => handleSave(aluno.alunoId)}
                                                        disabled={localGrades[aluno.alunoId] === undefined}
                                                    >
                                                        Lançar
                                                    </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}

                                        {(exames.length === 0 && candidates.length === 0) && (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-studio-foreground-lighter italic">
                                                    Nenhum aluno em fase de recuperação para os filtros selecionados.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </Card>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
