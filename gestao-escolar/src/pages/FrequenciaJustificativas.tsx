import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { canRegistarFrequencia, isAdmin } from '@/lib/permissoes'
import {
    useJustificativas,
    useAlunos
} from '@/data/escola/queries'
import {
    useCreateJustificativa,
    useApproveJustificativa
} from '@/data/escola/mutations'
import PageHeader from '@/components/PageHeader'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { Badge } from '@/components/shared/Badge'
import { Input } from '@/components/shared/Input'
import { Select } from '@/components/shared/Select'
import Modal from '@/components/shared/Modal'
import EmptyState from '@/components/shared/EmptyState'
import toast from 'react-hot-toast'
import {
    FileText,
    Plus,
    CheckCircle2,
    XCircle,
    Clock,
    User,
    Calendar,
    Search,
    Filter,
    Stethoscope,
    ShieldAlert,
    ChevronRight,
    ExternalLink,
    AlertCircle
} from 'lucide-react'

const MOTIVOS = [
    { value: 'doenca', label: 'Doença / Atestado Médico', icon: Stethoscope },
    { value: 'luto', label: 'Falecimento / Luto', icon: ShieldAlert },
    { value: 'transporte', label: 'Dificuldade de Transporte', icon: Clock },
    { value: 'outro', label: 'Outros Motivos Justificáveis', icon: FileText },
]

const STATUS_CONFIG: Record<string, { label: string, variant: 'neutral' | 'success' | 'danger' | 'warning', icon: any }> = {
    pendente: { label: 'Em Análise', variant: 'warning', icon: Clock },
    deferido: { label: 'Aprovada', variant: 'success', icon: CheckCircle2 },
    indeferido: { label: 'Rejeitada', variant: 'danger', icon: XCircle },
}

export default function FrequenciaJustificativas() {
    const { user } = useAuth()
    const [modalOpen, setModalOpen] = useState(false)
    const [filter, setFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('todos')

    const { data: justificativas = [], isLoading } = useJustificativas() as unknown as { data: any[], isLoading: boolean }
    const { data: alunos = [] } = useAlunos()

    const createJustificativa = useCreateJustificativa()
    const approveJustificativa = useApproveJustificativa()

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        createJustificativa.mutate({
            aluno_id: formData.get('aluno_id'),
            motivo: formData.get('motivo'),
            data_inicio: formData.get('data_inicio'),
            data_fim: formData.get('data_fim'),
            descricao: formData.get('descricao')
        }, {
            onSuccess: () => {
                toast.success('Justificação submetida para análise')
                setModalOpen(false)
            }
        })
    }

    const handleAprove = (id: string, acao: 'deferido' | 'indeferido') => {
        approveJustificativa.mutate({ id, acao }, {
            onSuccess: () => toast.success(`Pedido ${acao === 'deferido' ? 'aprovado' : 'rejeitado'} com sucesso.`)
        })
    }

    const filtered = (Array.isArray(justificativas) ? justificativas : []).filter(j => {
        const matchesSearch = j.alunoNome?.toLowerCase().includes(filter.toLowerCase()) ||
            j.descricao?.toLowerCase().includes(filter.toLowerCase())
        const matchesStatus = statusFilter === 'todos' || j.parecer_direcao === statusFilter
        return matchesSearch && matchesStatus
    })

    return (
        <div className="space-y-6 pb-20 animate-fade-in">
            <PageHeader
                title="Gestão de Justificações & Licenças"
                subtitle="Regularização de faltas, auditoria de atestados e controle de ausências autorizadas."
                actions={
                    canRegistarFrequencia(user?.papel) ? (
                        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
                            Registar Justificação
                        </Button>
                    ) : undefined
                }
            />

            {/* Filtros e Stats */}
            <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-studio-foreground-lighter tracking-widest px-1">Procurar Aluno ou Descrição</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-studio-foreground-lighter" />
                        <Input
                            placeholder="Nome do aluno, motivo ou observações..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="pl-10 h-11"
                        />
                    </div>
                </div>
                <div className="w-full md:w-64 space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-studio-foreground-lighter tracking-widest px-1">Filtrar por Status</label>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        options={[
                            { value: 'todos', label: 'Todos os Status' },
                            { value: 'pendente', label: 'Pendentes' },
                            { value: 'deferido', label: 'Deferidos' },
                            { value: 'indeferido', label: 'Indeferidos' }
                        ]}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card noPadding className="overflow-hidden border-studio-border/60 shadow-xl">
                    <div className="p-4 border-b border-studio-border bg-studio-muted/10 flex items-center justify-between">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-studio-foreground-lighter flex items-center gap-2">
                            <FileText className="w-4 h-4" /> Histórico de Regularizações
                        </h3>
                        <Badge variant="neutral" className="text-[9px] font-black">{filtered.length} REGISTOS</Badge>
                    </div>

                    <div className="divide-y divide-studio-border/30">
                        {filtered.length === 0 && !isLoading && (
                            <div className="p-20 text-center">
                                <EmptyState
                                    title="Nenhuma justificação encontrada"
                                    description="Não existem registos que correspondam aos filtros selecionados."
                                    icon={<AlertCircle className="w-16 h-16 opacity-10" />}
                                />
                            </div>
                        )}

                        {filtered.map((j) => {
                            const Status = STATUS_CONFIG[j.parecer_direcao || 'pendente']
                            return (
                                <div key={j.id} className="p-6 hover:bg-studio-brand/[0.01] transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className={`w-12 h-12 rounded-2xl bg-studio-muted/5 border border-studio-border flex items-center justify-center flex-shrink-0 group-hover:border-studio-brand/30 transition-colors`}>
                                            <User className="w-6 h-6 text-studio-foreground-lighter group-hover:text-studio-brand transition-colors" />
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-sm font-black text-studio-foreground uppercase tracking-tight truncate">{j.alunoNome}</h4>
                                                <Badge variant={Status.variant} className="text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                                    <Status.icon className="w-3 h-3" />
                                                    {Status.label}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                                <span className="text-[10px] font-bold text-studio-brand uppercase tracking-tighter flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {j.data_inicio ? `${new Date(j.data_inicio).toLocaleDateString()} → ${new Date(j.data_fim).toLocaleDateString()}` : `Aula: ${new Date(j.dataAula).toLocaleDateString()}`}
                                                </span>
                                                <span className="text-[10px] font-bold text-studio-foreground-lighter uppercase tracking-widest flex items-center gap-1">
                                                    <Stethoscope className="w-3 h-3 opacity-40" /> {j.motivo}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-studio-foreground-light font-medium italic mt-2 line-clamp-1 opacity-70">
                                                "{j.descricao || 'Sem observações adicionais.'}"
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 md:pl-6 border-l-0 md:border-l border-studio-border/30">
                                        {j.parecer_direcao === 'pendente' && isAdmin(user?.papel) ? (
                                            <>
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="text-red-500 hover:bg-red-500/5"
                                                    icon={<XCircle className="w-4 h-4" />}
                                                    onClick={() => handleAprove(j.id, 'indeferido')}
                                                >
                                                    Indeferir
                                                </Button>
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    icon={<CheckCircle2 className="w-4 h-4" />}
                                                    onClick={() => handleAprove(j.id, 'deferido')}
                                                >
                                                    Deferir
                                                </Button>
                                            </>
                                        ) : j.parecer_direcao !== 'pendente' ? (
                                            <div className="flex items-center gap-2 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-studio-foreground-lighter">Processado em {new Date(j.created_at).toLocaleDateString()}</p>
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </Card>
            </div>

            {/* Modal de Criação */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Submissão de Justificativa de Faltas" size="md">
                <form onSubmit={handleCreate} className="space-y-6">
                    <Select
                        name="aluno_id"
                        label="Estudante"
                        required
                        options={alunos.map(a => ({ value: a.id, label: a.nome }))}
                        leftIcon={<User className="w-4 h-4" />}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            name="motivo"
                            label="Motivo Normativo"
                            required
                            options={MOTIVOS.map(m => ({ value: m.value, label: m.label }))}
                            leftIcon={<ShieldAlert className="w-4 h-4" />}
                        />
                        <div className="p-4 rounded-xl bg-studio-muted/10 border border-studio-border/50 flex items-center gap-3">
                            <Clock className="w-5 h-5 text-studio-brand" />
                            <div>
                                <p className="text-[10px] font-black text-studio-foreground uppercase tracking-tighter">Limpeza Automática</p>
                                <p className="text-[9px] text-studio-foreground-lighter leading-none mt-0.5">Faltas serão regularizadas após aprovação.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input name="data_inicio" type="date" label="Início da Licença" required />
                        <Input name="data_fim" type="date" label="Término da Licença" required />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-studio-foreground-lighter tracking-widest px-1">Notas de Evidência / Descrição</label>
                        <textarea
                            name="descricao"
                            className="w-full h-24 p-4 rounded-2xl bg-studio-muted/5 border border-studio-border text-xs text-studio-foreground outline-none focus:ring-2 focus:ring-studio-brand transition-all placeholder:opacity-30"
                            placeholder="Descreva brevemente a situação ou anote o número do atestado médico..."
                        ></textarea>
                    </div>

                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                        <p className="text-[10px] text-amber-900 leading-relaxed font-bold opacity-70 uppercase tracking-tighter">
                            A submissão de justificações falsas ou documentos adulterados constitui falta grave passível de processo disciplinar conforme o regulamento interno.
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-studio-border/50">
                        <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" variant="primary" loading={createJustificativa.isPending}>Enviar para Auditoria</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
