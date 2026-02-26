import { useState, useMemo } from 'react'
import { Plus, Search, ShieldAlert, AlertTriangle, Info, CheckCircle, Trash2, User, Calendar, Filter, FileText, Bell, MessageSquare, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import { useQueryState } from '@/hooks/useQueryState'
import { useAuth } from '@/contexts/AuthContext'
import { canManageOcorrencias } from '@/lib/permissoes'
import { useOcorrencias, useTurmas, useTurmaAlunos } from '@/data/escola/queries'
import { useCreateOcorrencia, useResolveOcorrencia, useDeleteOcorrencia } from '@/data/escola/mutations'
import PageHeader from '@/components/PageHeader'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { Select } from '@/components/shared/Select'
import { Badge } from '@/components/shared/Badge'
import { Avatar } from '@/components/shared/Avatar'
import { Modal } from '@/components/shared/Modal'
import EmptyState from '@/components/shared/EmptyState'

const TIPOS = [
    { value: 'advertencia_verbal', label: 'Advertência Verbal', icon: MessageSquare },
    { value: 'advertencia_escrita', label: 'Advertência Escrita', icon: FileText },
    { value: 'participacao_disciplinar', label: 'Participação Disciplinar', icon: ShieldAlert },
    { value: 'suspensao', label: 'Suspensão', icon: AlertTriangle },
    { value: 'expulsao', label: 'Expulsão', icon: ShieldAlert },
    { value: 'elogio', label: 'Elogio / Mérito', icon: Star },
]

const GRAVIDADES = [
    { value: 'leve', label: 'Leve', color: 'bg-blue-500' },
    { value: 'moderada', label: 'Moderada', color: 'bg-amber-500' },
    { value: 'grave', label: 'Grave', color: 'bg-orange-600' },
    { value: 'critica', label: 'Crítica', color: 'bg-red-700' },
]

function parseResolvido(s: string): boolean | undefined {
    if (s === 'true') return true
    if (s === 'false') return false
    return undefined
}

export default function Ocorrencias() {
    const { user } = useAuth()
    const [turmaIdUrl, setTurmaIdUrl] = useQueryState('turmaId')
    const [alunoIdUrl, setAlunoIdUrl] = useQueryState('alunoId')
    const [resolvidoUrl, setResolvidoUrl] = useQueryState('resolvido')

    const filters = useMemo(
        () => ({
            turmaId: turmaIdUrl,
            alunoId: alunoIdUrl,
            resolvido: parseResolvido(resolvidoUrl),
        }),
        [turmaIdUrl, alunoIdUrl, resolvidoUrl]
    )

    const [isModalOpen, setIsModalOpen] = useState(false)

    const { data: turmas = [] } = useTurmas()
    const { data: alunos = [] } = useTurmaAlunos(filters.turmaId || null)
    const { data: ocorrencias = [], isLoading } = useOcorrencias(filters)

    const createMutation = useCreateOcorrencia()
    const resolveMutation = useResolveOcorrencia()
    const deleteMutation = useDeleteOcorrencia()

    const [form, setForm] = useState({
        alunoId: '',
        turmaId: '',
        tipo: 'advertencia_verbal' as any,
        gravidade: 'leve' as any,
        descricao: '',
        medidaTomada: '',
        notificarEncarregado: true,
    })

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.alunoId || !form.descricao) return

        createMutation.mutate(form, {
            onSuccess: () => {
                toast.success('Ocorrência registada com sucesso.')
                setIsModalOpen(false)
                setForm({ alunoId: '', turmaId: '', tipo: 'advertencia_verbal', gravidade: 'leve', descricao: '', medidaTomada: '', notificarEncarregado: true })
            },
            onError: (err) => toast.error(err.message)
        })
    }

    const handleResolve = (id: string, current: boolean) => {
        resolveMutation.mutate({ id, resolvido: !current }, {
            onSuccess: () => toast.success('Estado atualizado.')
        })
    }

    const handleDelete = (id: string) => {
        if (confirm('Eliminar este registo permanentemente?')) {
            deleteMutation.mutate(id, {
                onSuccess: () => toast.success('Registo eliminado.')
            })
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Gestão Disciplinar"
                subtitle="Registo formal de ocorrências, medidas corretivas e elogios de mérito."
                actions={
                    canManageOcorrencias(user?.papel) ? (
                        <Button icon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
                            Nova Ocorrência
                        </Button>
                    ) : undefined
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filtros */}
                <Card className="lg:col-span-1 p-4 space-y-4 h-fit">
                    <div className="flex items-center gap-2 mb-2">
                        <Filter className="w-4 h-4 text-studio-brand" />
                        <h3 className="text-xs font-black text-studio-foreground-light uppercase tracking-widest">Filtros Avançados</h3>
                    </div>

                    <Select
                        label="Turma"
                        value={filters.turmaId}
                        onChange={(e) => {
                            setTurmaIdUrl(e.target.value)
                            setAlunoIdUrl('')
                        }}
                        options={[{ value: '', label: 'Todas as Turmas' }, ...turmas.map(t => ({ value: t.id, label: t.nome }))]}
                    />

                    <Select
                        label="Estudante"
                        value={filters.alunoId}
                        onChange={(e) => setAlunoIdUrl(e.target.value)}
                        options={[{ value: '', label: 'Todos os Estudantes' }, ...alunos.map(a => ({ value: a.alunoId, label: a.alunoNome }))]}
                        disabled={!filters.turmaId}
                    />

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-studio-foreground-lighter uppercase tracking-widest px-1">Estado</label>
                        <div className="flex p-1 bg-studio-muted/10 rounded-xl border border-studio-border/50">
                            <button
                                type="button"
                                onClick={() => setResolvidoUrl('')}
                                className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${filters.resolvido === undefined ? 'bg-studio-bg text-studio-brand shadow-sm' : 'text-studio-foreground-lighter'}`}
                            >
                                Todos
                            </button>
                            <button
                                type="button"
                                onClick={() => setResolvidoUrl('false')}
                                className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${filters.resolvido === false ? 'bg-studio-bg text-studio-brand shadow-sm' : 'text-studio-foreground-lighter'}`}
                            >
                                Pendentes
                            </button>
                            <button
                                type="button"
                                onClick={() => setResolvidoUrl('true')}
                                className={`flex-1 py-1.5 text-[9px] font-black uppercase rounded-lg transition-all ${filters.resolvido === true ? 'bg-studio-bg text-studio-brand shadow-sm' : 'text-studio-foreground-lighter'}`}
                            >
                                Resolvidos
                            </button>
                        </div>
                    </div>
                </Card>

                {/* Lista */}
                <div className="lg:col-span-3 space-y-4">
                    {isLoading ? (
                        <Card className="p-8 text-center">A carregar registos...</Card>
                    ) : ocorrencias.length === 0 ? (
                        <EmptyState
                            title="Sem Ocorrências"
                            description="Não foram encontrados registos disciplinares para os critérios selecionados."
                            icon={<ShieldAlert className="w-12 h-12 text-studio-muted" />}
                        />
                    ) : (
                        <div className="space-y-4">
                            {ocorrencias.map((oc: any) => (
                                <Card key={oc.id} className={`overflow-hidden border-l-4 ${oc.resolvido ? 'border-l-emerald-500 opacity-80' : oc.tipo === 'elogio' ? 'border-l-studio-brand' : 'border-l-red-500'} hover:shadow-xl transition-all duration-300`}>
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar name={oc.studentName} size="md" />
                                                <div>
                                                    <h4 className="text-sm font-black text-studio-foreground uppercase tracking-tight">{oc.studentName}</h4>
                                                    <p className="text-[10px] text-studio-foreground-lighter flex items-center gap-2">
                                                        <User className="w-3 h-3" /> {oc.turmaNome || 'Sem Turma'} • <Calendar className="w-3 h-3" /> {new Date(oc.data_ocorrencia).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <Badge variant={oc.resolvido ? 'success' : 'danger'} size="sm" className="uppercase font-black tracking-tighter">
                                                    {oc.resolvido ? 'Resolvido' : 'Pendente'}
                                                </Badge>
                                                <Badge variant="neutral" className="bg-studio-muted/10 text-[9px]">
                                                    ID: {oc.id.slice(0, 8)}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2">
                                                    <Badge className={`${GRAVIDADES.find(g => g.value === oc.gravidade)?.color} text-white border-none py-1 px-3 text-[10px] font-black uppercase`}>
                                                        Gravidade: {oc.gravidade}
                                                    </Badge>
                                                    <Badge variant="outline" className="text-studio-brand border-studio-brand/30 py-1 px-3 text-[10px] font-black uppercase">
                                                        {oc.tipo.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-studio-foreground-light leading-relaxed bg-studio-muted/5 p-3 rounded-xl border border-studio-border/50">
                                                    {oc.descricao}
                                                </p>
                                            </div>

                                            <div className="space-y-2 bg-studio-muted/10 p-4 rounded-xl border border-studio-border/30">
                                                <h5 className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest flex items-center gap-2">
                                                    <ShieldAlert className="w-3 h-3" /> Medida / Decisão
                                                </h5>
                                                <p className="text-xs italic text-studio-foreground-light">
                                                    {oc.medida_tomada || 'Nenhuma medida registada até ao momento.'}
                                                </p>
                                                <div className="pt-2 border-t border-studio-border/50 mt-2">
                                                    <p className="text-[9px] text-studio-foreground-lighter font-medium">Relatado por: <span className="text-studio-foreground font-bold">{oc.professorName || 'Sistema / Direção'}</span></p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-4 border-t border-studio-border/30">
                                            <div className="flex items-center gap-3">
                                                {oc.notificar_encarregado && (
                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-studio-brand uppercase tracking-widest bg-studio-brand/5 px-2 py-1 rounded-full">
                                                        <Bell className="w-3 h-3" /> Encarregado Notificado
                                                    </div>
                                                )}
                                            </div>
                                            {canManageOcorrencias(user?.papel) && (
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    icon={oc.resolvido ? <CheckCircle className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                                                    onClick={() => handleResolve(oc.id, oc.resolvido)}
                                                    className={oc.resolvido ? 'text-emerald-500' : 'text-amber-500'}
                                                >
                                                    {oc.resolvido ? 'Reabrir' : 'Marcar Resolvido'}
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:bg-red-50"
                                                    onClick={() => handleDelete(oc.id)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Nova Ocorrência */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Registar Ocorrência Disciplinar"
                size="lg"
            >
                <form onSubmit={handleCreate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Turma"
                            required
                            value={form.turmaId}
                            onChange={(e) => setForm({ ...form, turmaId: e.target.value, alunoId: '' })}
                            options={[{ value: '', label: 'Selecionar Turma...' }, ...turmas.map(t => ({ value: t.id, label: t.nome }))]}
                        />
                        <Select
                            label="Estudante"
                            required
                            value={form.alunoId}
                            onChange={(e) => setForm({ ...form, alunoId: e.target.value })}
                            options={[{ value: '', label: 'Selecionar Estudante...' }, ...alunos.map(a => ({ value: a.alunoId, label: a.alunoNome }))]}
                            disabled={!form.turmaId}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Tipo de Participação"
                            required
                            value={form.tipo}
                            onChange={(e) => setForm({ ...form, tipo: e.target.value as any })}
                            options={TIPOS.map(t => ({ value: t.value, label: t.label }))}
                        />
                        <Select
                            label="Gravidade"
                            required
                            value={form.gravidade}
                            onChange={(e) => setForm({ ...form, gravidade: e.target.value as any })}
                            options={GRAVIDADES.map(g => ({ value: g.value, label: g.label }))}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-studio-foreground-light">Descrição Detalhada do Incidente</label>
                            <textarea
                                className="w-full h-32 p-4 bg-studio-muted/10 border border-studio-border rounded-xl text-sm focus:ring-2 focus:ring-studio-brand outline-none transition-all placeholder:text-studio-muted"
                                placeholder="Descreva o que aconteceu de forma objetiva..."
                                value={form.descricao}
                                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                                required
                            />
                        </div>

                        <Input
                            label="Medida Tomada no Momento"
                            placeholder="Ex: Advertência verbal, expulsão da sala..."
                            value={form.medidaTomada}
                            onChange={(e) => setForm({ ...form, medidaTomada: e.target.value })}
                        />
                    </div>

                    <div className="flex items-center justify-between p-4 bg-studio-muted/5 rounded-xl border border-studio-border/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-studio-brand/10">
                                <Bell className="w-4 h-4 text-studio-brand" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-studio-foreground uppercase tracking-tight">Notificar Encarregado</p>
                                <p className="text-[10px] text-studio-foreground-lighter">Enviar alerta automático para a caderneta digital.</p>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            className="w-5 h-5 accent-studio-brand rounded cursor-pointer"
                            checked={form.notificarEncarregado}
                            onChange={(e) => setForm({ ...form, notificarEncarregado: e.target.checked })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-studio-border">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" loading={createMutation.isPending}>Registar Ocorrência</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
