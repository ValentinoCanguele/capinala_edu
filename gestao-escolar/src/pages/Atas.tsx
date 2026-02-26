import { useState, useMemo } from 'react'
import { Plus, Search, FileText, Calendar, Users, Trash2, Edit, Save, X, Eye, ShieldCheck, History } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAtas, useTurmas, usePeriodos } from '@/data/escola/queries'
import { useCreateAta, useUpdateAta, useDeleteAta } from '@/data/escola/mutations'
import PageHeader from '@/components/PageHeader'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { Select } from '@/components/shared/Select'
import { Badge } from '@/components/shared/Badge'
import { Modal } from '@/components/shared/Modal'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { Textarea } from '@/components/shared/Textarea'
import EmptyState from '@/components/shared/EmptyState'

export default function Atas() {
    const [filter, setFilter] = useState('')
    const [turmaId, setTurmaId] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingAtaId, setEditingAtaId] = useState<string | null>(null)

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
            a.titulo.toLowerCase().includes(filter.toLowerCase()) ||
            a.turmaNome?.toLowerCase().includes(filter.toLowerCase())
        )
    }, [atas, filter])

    const handleOpenModal = (ata?: any) => {
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
                turmaId: turmaId,
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

    const handleDelete = (id: string) => {
        if (confirm('Tem a certeza que deseja eliminar esta ata? Esta ação não pode ser desfeita.')) {
            deleteAta.mutate(id, {
                onSuccess: () => toast.success('Ata eliminada.'),
                onError: (err) => toast.error(err.message)
            })
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <PageHeader
                title="Atas de Conselho de Turma"
                subtitle="Registo digital e oficial de ocorrências, decisões pedagógicas e acompanhamento de turmas."
                actions={
                    <Button icon={<Plus className="w-4 h-4" />} onClick={() => handleOpenModal()}>
                        Nova Ata
                    </Button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filtros Side */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="p-4 space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-studio-foreground-lighter uppercase tracking-widest px-1">Procurar</label>
                            <Input
                                placeholder="Título ou Turma..."
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                leftIcon={<Search className="w-4 h-4" />}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-studio-foreground-lighter uppercase tracking-widest px-1">Filtro por Turma</label>
                            <Select
                                value={turmaId}
                                onChange={(e) => setTurmaId(e.target.value)}
                                options={[
                                    { value: '', label: 'Todas as Turmas' },
                                    ...turmas.map(t => ({ value: t.id, label: t.nome }))
                                ]}
                            />
                        </div>
                    </Card>

                    <Card className="p-4 bg-studio-brand/5 border-studio-brand/20">
                        <h3 className="text-xs font-bold text-studio-brand flex items-center gap-2 mb-2">
                            <ShieldCheck className="w-4 h-4" />
                            Integridade de Dados
                        </h3>
                        <p className="text-[10px] text-studio-foreground-light leading-relaxed">
                            As atas arquivadas no sistema possuem rastreabilidade total (Audit Log) e validade institucional para auditorias do Ministério da Educação.
                        </p>
                    </Card>
                </div>

                {/* Lista Main */}
                <div className="lg:col-span-3 space-y-4">
                    {isLoading ? (
                        <Card noPadding>
                            <SkeletonTable rows={5} columns={4} />
                        </Card>
                    ) : filteredAtas.length === 0 ? (
                        <EmptyState
                            title="Sem Atas Registadas"
                            description="Nenhum registo de conselho de turma foi encontrado para os filtros selecionados."
                            icon={<History className="w-12 h-12 text-studio-muted" />}
                            actionLabel="Criar Ata"
                            onAction={() => handleOpenModal()}
                        />
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredAtas.map((ata) => (
                                <Card key={ata.id} className="group hover:border-studio-brand/30 transition-all duration-300">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center gap-3">
                                                <Badge variant="neutral" className="bg-studio-muted/10">
                                                    {ata.turmaNome}
                                                </Badge>
                                                <span className="text-[10px] text-studio-foreground-lighter font-bold uppercase tracking-widest flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(ata.dataReuniao).toLocaleDateString()}
                                                </span>
                                                {ata.periodoNome && (
                                                    <Badge variant="brand" className="text-[9px]">
                                                        {ata.periodoNome}
                                                    </Badge>
                                                )}
                                            </div>
                                            <h4 className="text-base font-bold text-studio-foreground group-hover:text-studio-brand transition-colors">
                                                {ata.titulo}
                                            </h4>
                                            <p className="text-sm text-studio-foreground-light line-clamp-2 leading-relaxed">
                                                {ata.conteudo}
                                            </p>
                                            <div className="flex items-center gap-4 pt-2">
                                                <div className="flex -space-x-2">
                                                    {[1, 2, 3].map(i => (
                                                        <div key={i} className="w-6 h-6 rounded-full border-2 border-studio-bg bg-studio-muted flex items-center justify-center">
                                                            <Users className="w-3 h-3 text-studio-foreground-lighter" />
                                                        </div>
                                                    ))}
                                                </div>
                                                <span className="text-[10px] text-studio-foreground-lighter font-medium">
                                                    {Array.isArray(ata.participantes) ? ata.participantes.length : 0} participantes presentes
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button variant="ghost" size="icon" onClick={() => handleOpenModal(ata)} title="Editar">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10" onClick={() => handleDelete(ata.id)} title="Eliminar">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                            <Button variant="brand" size="icon" title="Ver Detalhes">
                                                <Eye className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

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
                        />
                        <Select
                            label="Período Correspondente"
                            value={form.periodoId}
                            onChange={(e) => setForm({ ...form, periodoId: e.target.value })}
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
                        />
                        <Input
                            label="Título da Ata"
                            placeholder="Ex: 1º Conselho de Turma - Avaliação Trimestral"
                            value={form.titulo}
                            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-studio-foreground block">Conteúdo das Deliberações</label>
                        <Textarea
                            placeholder="Descreva detalhadamente o que foi discutido e deliberado nesta sessão de conselho..."
                            className="min-h-[250px] font-sans text-base leading-relaxed"
                            value={form.conteudo}
                            onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-studio-border">
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button
                            icon={<Save className="w-4 h-4" />}
                            onClick={handleSubmit}
                            loading={createAta.isPending || updateAta.isPending}
                        >
                            {editingAtaId ? 'Atualizar Ata' : 'Finalizar e Guardar'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
