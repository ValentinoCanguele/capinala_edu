import { useState, useMemo, useEffect } from 'react'
import {
    Plus,
    Search,
    FileText,
    Calendar,
    Users,
    Trash2,
    Edit,
    Save,
    Eye,
    ShieldCheck,
    History,
    Printer,
    Clock,
    UserCheck
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useDebounce } from '@/hooks/useDebounce'
import { useQueryState } from '@/hooks/useQueryState'
import { useAuth } from '@/contexts/AuthContext'
import { canManageAtas } from '@/lib/permissoes'
import { useAtas, useTurmas, usePeriodos } from '@/data/escola/queries'
import { useCreateAta, useUpdateAta, useDeleteAta } from '@/data/escola/mutations'
import PageHeader from '@/components/PageHeader'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { Select } from '@/components/shared/Select'
import { Badge } from '@/components/shared/Badge'
import Modal from '@/components/shared/Modal'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { Textarea } from '@/components/shared/Textarea'
import EmptyState from '@/components/shared/EmptyState'

interface AtaEdicao {
    id: string
    titulo: string
    conteudo: string
    turmaId: string
    periodoId?: string | null
    dataReuniao: string
    participantes?: string[]
    decisoes?: string[]
}

export default function Atas() {
    const { user } = useAuth()
    const [filterFromUrl, setFilterFromUrl] = useQueryState('q')
    const [filter, setFilter] = useState(filterFromUrl)
    const debouncedFilter = useDebounce(filter, 400)
    const [turmaId, setTurmaId] = useQueryState('turmaId')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingAtaId, setEditingAtaId] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list')
    const [selectedAta, setSelectedAta] = useState<any>(null)

    useEffect(() => {
        setFilter(filterFromUrl)
    }, [filterFromUrl])

    useEffect(() => {
        setFilterFromUrl(debouncedFilter)
    }, [debouncedFilter, setFilterFromUrl])

    // Queries
    const { data: atas = [], isLoading } = useAtas({ turmaId: turmaId || undefined })
    const { data: turmas = [] } = useTurmas()
    const { data: periodos = [] } = usePeriodos(turmas.find(t => t.id === turmaId)?.anoLetivoId || null)

    // Mutations
    const createAta = useCreateAta()
    const updateAta = useUpdateAta()
    const deleteAta = useDeleteAta()

    // Form State
    const [form, setForm] = useState({
        titulo: '',
        conteudo: '',
        turmaId: '',
        periodoId: '',
        dataReuniao: new Date().toISOString().split('T')[0],
        participantes: [] as string[],
        decisoes: [] as string[],
    })

    const filteredAtas = useMemo(() => {
        return atas.filter(a =>
            a.titulo.toLowerCase().includes(debouncedFilter.toLowerCase()) ||
            a.turmaNome?.toLowerCase().includes(debouncedFilter.toLowerCase())
        )
    }, [atas, debouncedFilter])

    const handleOpenModal = (ata?: AtaEdicao) => {
        if (ata) {
            setEditingAtaId(ata.id)
            setForm({
                titulo: ata.titulo,
                conteudo: ata.conteudo,
                turmaId: ata.turmaId,
                periodoId: ata.periodoId || '',
                dataReuniao: ata.dataReuniao.split('T')[0],
                participantes: Array.isArray(ata.participantes) ? ata.participantes : [],
                decisoes: Array.isArray(ata.decisoes) ? ata.decisoes : [],
            })
        } else {
            setEditingAtaId(null)
            setForm({
                titulo: '',
                conteudo: '',
                turmaId: turmaId || '',
                periodoId: '',
                dataReuniao: new Date().toISOString().split('T')[0],
                participantes: [],
                decisoes: [],
            })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = () => {
        if (!form.titulo || !form.conteudo || !form.turmaId) {
            return toast.error('Por favor, preencha o título, conteúdo e selecione a turma.')
        }

        if (editingAtaId) {
            updateAta.mutate({ id: editingAtaId, ...form }, {
                onSuccess: () => {
                    toast.success('Ata atualizada com sucesso.')
                    setIsModalOpen(false)
                },
                onError: (err) => toast.error(err.message)
            })
        } else {
            createAta.mutate(form, {
                onSuccess: () => {
                    toast.success('Ata registada com sucesso.')
                    setIsModalOpen(false)
                },
                onError: (err) => toast.error(err.message)
            })
        }
    }

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (confirm('Tem a certeza que deseja eliminar esta ata? Esta ação não pode ser desfeita.')) {
            deleteAta.mutate(id, {
                onSuccess: () => toast.success('Ata eliminada.'),
                onError: (err) => toast.error(err.message)
            })
        }
    }

    const handleViewAta = (ata: any) => {
        setSelectedAta(ata)
        setViewMode('detail')
    }

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <PageHeader
                    title="Atas de Conselho"
                    subtitle="Memória institucional e registo de deliberações pedagógicas de rigor."
                    className="mb-0"
                />

                <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                    {viewMode === 'detail' && (
                        <Button variant="secondary" size="sm" onClick={() => setViewMode('list')} icon={<History className="w-4 h-4" />}>
                            Voltar à Lista
                        </Button>
                    )}
                    {viewMode === 'detail' && (
                        <Button variant="secondary" size="sm" onClick={handlePrint} icon={<Printer className="w-4 h-4" />}>
                            Imprimir
                        </Button>
                    )}
                    {canManageAtas(user?.papel) && viewMode === 'list' && (
                        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => handleOpenModal()}>
                            Nova Ata
                        </Button>
                    )}
                </div>
            </div>

            {viewMode === 'list' ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Filtros Side */}
                    <div className="lg:col-span-1 space-y-4">
                        <Card className="border-studio-border/60 shadow-lg p-5 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest px-1">Busca Textual</label>
                                <Input
                                    placeholder="Título ou Turma..."
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    leftIcon={<Search className="w-4 h-4 text-studio-brand" />}
                                    className="bg-studio-muted/30 border-studio-border/60"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest px-1">Filtro Estrutural</label>
                                <Select
                                    value={turmaId}
                                    onChange={(e) => setTurmaId(e.target.value)}
                                    leftIcon={<Users className="w-4 h-4 text-studio-brand" />}
                                    options={[
                                        { value: '', label: 'Todas as Turmas' },
                                        ...turmas.map(t => ({ value: t.id, label: t.nome }))
                                    ]}
                                    className="bg-studio-muted/30 border-studio-border/60"
                                />
                            </div>
                        </Card>

                        <div className="p-6 bg-studio-brand/5 border border-studio-brand/10 rounded-2xl space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-studio-brand/10 rounded-lg">
                                    <ShieldCheck className="w-4 h-4 text-studio-brand" />
                                </div>
                                <h3 className="text-xs font-black text-studio-brand uppercase tracking-widest">Protocolo Oficial</h3>
                            </div>
                            <p className="text-[10px] text-studio-foreground-light font-medium leading-relaxed opacity-80">
                                Todas as atas geradas pelo sistema ACMS possuem validade jurídica institucional, sendo rastreadas por auditores em tempo real.
                            </p>
                        </div>
                    </div>

                    {/* Lista Main */}
                    <div className="lg:col-span-3 space-y-4">
                        {isLoading ? (
                            <Card noPadding className="border-studio-border/60 shadow-xl overflow-hidden">
                                <SkeletonTable rows={5} columns={4} />
                            </Card>
                        ) : filteredAtas.length === 0 ? (
                            <Card className="border-studio-border/60 shadow-xl py-20">
                                <EmptyState
                                    title="Arquivo de Atas Vazio"
                                    description="Não existem registos de reuniões de conselho para os filtros aplicados. Comece criando uma nova ata."
                                    icon={<FileText className="w-16 h-16 text-studio-brand/20" />}
                                />
                            </Card>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-right-4 duration-500">
                                {filteredAtas.map((ata) => (
                                    <Card
                                        key={ata.id}
                                        onClick={() => handleViewAta(ata)}
                                        className="group cursor-pointer hover:border-studio-brand/40 hover:shadow-2xl hover:shadow-studio-brand/5 border-studio-border/60 shadow-md transition-all duration-500"
                                    >
                                        <div className="flex justify-between items-start gap-6">
                                            <div className="space-y-3 flex-1">
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="neutral" className="bg-studio-muted/40 font-black text-[9px] uppercase tracking-widest px-2 group-hover:bg-studio-brand/10 group-hover:text-studio-brand transition-colors">
                                                        {ata.turmaNome}
                                                    </Badge>
                                                    <span className="text-[10px] text-studio-foreground-lighter font-black uppercase tracking-[2px] flex items-center gap-1.5 opacity-60">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {new Date(ata.dataReuniao).toLocaleDateString('pt-AO')}
                                                    </span>
                                                    {ata.periodoNome && (
                                                        <div className="flex items-center gap-1 bg-studio-brand/5 px-2 py-0.5 rounded-full">
                                                            <Clock className="w-3 h-3 text-studio-brand/60" />
                                                            <span className="text-[9px] font-black text-studio-brand uppercase">{ata.periodoNome}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <h4 className="text-lg font-black text-studio-foreground group-hover:text-studio-brand transition-colors tracking-tight">
                                                    {ata.titulo}
                                                </h4>
                                                <p className="text-sm text-studio-foreground-light line-clamp-2 leading-relaxed font-medium">
                                                    {ata.conteudo}
                                                </p>
                                                <div className="flex items-center gap-6 pt-3">
                                                    <div className="flex -space-x-2">
                                                        {[1, 2, 3].map(i => (
                                                            <div key={i} className="w-7 h-7 rounded-lg border-2 border-white dark:border-studio-bg bg-studio-muted flex items-center justify-center shadow-sm">
                                                                <UserCheck className="w-4 h-4 text-studio-foreground-lighter" />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <span className="text-[10px] text-studio-foreground-lighter font-black uppercase tracking-widest">
                                                        {Array.isArray(ata.participantes) ? ata.participantes.length : 0} Deliberadores Presentes
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-end gap-2">
                                                <div className="p-3 bg-studio-muted/10 rounded-2xl border border-studio-border/40 group-hover:bg-studio-brand/5 group-hover:border-studio-brand/20 transition-all">
                                                    <Eye className="w-5 h-5 text-studio-foreground-lighter group-hover:text-studio-brand transition-colors" />
                                                </div>
                                                {canManageAtas(user?.papel) && (
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleOpenModal(ata) }}
                                                            className="p-2 text-studio-foreground-light hover:text-studio-brand hover:bg-studio-brand/5 rounded-lg transition-all"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleDelete(ata.id, e)}
                                                            className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
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
            ) : (
                <div className="animate-in fade-in zoom-in duration-500 max-w-5xl mx-auto">
                    <Card className="border-studio-border/60 shadow-2xl p-0 overflow-hidden bg-white dark:bg-studio-bg relative">
                        {/* Decorative Element */}
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <ShieldCheck className="w-64 h-64" />
                        </div>

                        <div className="p-10 lg:p-16 space-y-12">
                            <div className="flex justify-between items-start border-b border-studio-border/60 pb-8 relative z-10">
                                <div className="space-y-4">
                                    <Badge variant="brand" className="font-black text-[10px] tracking-[4px] px-3 py-1">ATA OFICIAL</Badge>
                                    <h2 className="text-4xl font-black text-studio-foreground tracking-tighter max-w-2xl">{selectedAta.titulo}</h2>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-studio-brand" />
                                            <span className="text-sm font-bold text-studio-foreground">{selectedAta.turmaNome}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-studio-brand" />
                                            <span className="text-sm font-bold text-studio-foreground">{new Date(selectedAta.dataReuniao).toLocaleDateString('pt-AO')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest">Protocolo ID</p>
                                    <p className="text-sm font-black text-studio-foreground">#{selectedAta.id.slice(0, 8).toUpperCase()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 relative z-10">
                                <div className="lg:col-span-3 space-y-8">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-studio-foreground-lighter uppercase tracking-[3px] flex items-center gap-2">
                                            <FileText className="w-4 h-4" /> Relatório de Deliberações
                                        </h4>
                                        <div className="text-base leading-relaxed text-studio-foreground font-medium bg-studio-muted/10 p-8 rounded-3xl border border-studio-border/40 whitespace-pre-wrap min-h-[400px]">
                                            {selectedAta.conteudo}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-studio-foreground-lighter uppercase tracking-[3px]">Participantes</h4>
                                        <div className="space-y-2">
                                            {selectedAta.participantes?.map((p: string, i: number) => (
                                                <div key={i} className="flex items-center gap-3 bg-studio-muted/10 p-2.5 rounded-xl border border-studio-border/30">
                                                    <div className="w-6 h-6 rounded-lg bg-studio-brand/10 flex items-center justify-center text-[9px] font-black text-studio-brand">
                                                        {p.slice(0, 1).toUpperCase()}
                                                    </div>
                                                    <span className="text-xs font-bold text-studio-foreground">{p}</span>
                                                </div>
                                            ))}
                                            {(!selectedAta.participantes || selectedAta.participantes.length === 0) && (
                                                <p className="text-xs text-studio-foreground-lighter italic">Nenhum participante listado.</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-6 bg-studio-muted/20 border border-studio-border/60 rounded-3xl space-y-6">
                                        <div className="text-center">
                                            <p className="text-[9px] font-black text-studio-foreground-lighter uppercase tracking-[3px] mb-8">Validado via ACMS</p>
                                            <div className="w-32 h-px bg-studio-foreground/60 mx-auto mb-2" />
                                            <p className="text-[8px] font-bold text-studio-foreground italic uppercase">Assinatura Certificada</p>
                                        </div>
                                        <div className="flex justify-center">
                                            <Badge variant="success" className="px-3 py-1 font-black text-[8px] uppercase tracking-widest opacity-60">Sessão Sincronizada</Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Modal de Criação/Edição */}
            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingAtaId ? 'Editar Ata de Conselho' : 'Registo de Nova Ata'}
                size="lg"
            >
                <div className="space-y-6 pt-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                            label="Turma da Reunião"
                            value={form.turmaId}
                            onChange={(e) => setForm({ ...form, turmaId: e.target.value })}
                            options={turmas.map(t => ({ value: t.id, label: t.nome }))}
                            disabled={!!editingAtaId}
                            leftIcon={<Users className="w-4 h-4 text-studio-brand" />}
                        />
                        <Select
                            label="Período Correspondente"
                            value={form.periodoId}
                            onChange={(e) => setForm({ ...form, periodoId: e.target.value })}
                            leftIcon={<Clock className="w-4 h-4 text-studio-brand" />}
                            options={[
                                { value: '', label: 'Geral / Não específico' },
                                ...periodos.map(p => ({ value: p.id, label: p.nome }))
                            ]}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Data da Reunião"
                            type="date"
                            value={form.dataReuniao}
                            onChange={(e) => setForm({ ...form, dataReuniao: e.target.value })}
                            leftIcon={<Calendar className="w-4 h-4 text-studio-brand" />}
                        />
                        <Input
                            label="Título da Ata"
                            placeholder="Ex: 1º Conselho de Turma - Avaliação Trimestral"
                            value={form.titulo}
                            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                            leftIcon={<FileText className="w-4 h-4 text-studio-brand" />}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest px-1">Corpo das Deliberações</label>
                        <Textarea
                            placeholder="Descreva detalhadamente o que foi discutido e deliberado nesta sessão de conselho..."
                            className="min-h-[300px] font-sans text-base leading-relaxed bg-studio-muted/20 border-studio-border/60 focus:ring-1 focus:ring-studio-brand rounded-2xl p-6"
                            value={form.conteudo}
                            onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-studio-border/60">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold uppercase tracking-widest text-[10px]">Cancelar</Button>
                        <Button
                            variant="primary"
                            icon={<Save className="w-4 h-4" />}
                            onClick={handleSubmit}
                            loading={createAta.isPending || updateAta.isPending}
                            className="rounded-xl font-bold uppercase tracking-widest text-[10px] px-8"
                        >
                            {editingAtaId ? 'Atualizar Ata' : 'Finalizar Registro'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
