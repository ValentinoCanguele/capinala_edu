import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { isAdmin } from '@/lib/permissoes'
import {
    useMatrizes,
    useMatriz,
    useAnosLetivos
} from '@/data/escola/queries'
import {
    useCreateMatriz,
    useAddDisciplinaMatriz,
    useClonarMatriz,
    useAddPrecedencia,
    useRemovePrecedencia
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
    Layers,
    Plus,
    BookOpen,
    ChevronRight,
    Settings2,
    ListChecks,
    GraduationCap,
    Copy,
    Info,
    Calculator,
    ShieldCheck,
    X,
    Lock,
    Link as LinkIcon
} from 'lucide-react'

export default function Matrizes() {
    const { user } = useAuth()
    const [modalOpen, setModalOpen] = useState(false)
    const [discModalOpen, setDiscModalOpen] = useState(false)
    const [cloneModalOpen, setCloneModalOpen] = useState(false)
    const [precModalOpen, setPrecModalOpen] = useState(false)
    const [selectedMatrizId, setSelectedMatrizId] = useState<string | null>(null)

    const { data: matrizes = [], isLoading } = useMatrizes() as unknown as { data: any[], isLoading: boolean }
    const { data: matrizDetalhe } = useMatriz(selectedMatrizId) as unknown as { data: any }
    const { data: anosLetivos = [] } = useAnosLetivos()

    const createMatriz = useCreateMatriz()
    const addDisciplina = useAddDisciplinaMatriz()
    const clonarMatriz = useClonarMatriz()
    const addPrecedencia = useAddPrecedencia()
    const removePrecedencia = useRemovePrecedencia()

    const handleCreateMatriz = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        createMatriz.mutate({
            nome: formData.get('nome'),
            grau_escolar: formData.get('grau_escolar'),
            ano_letivo_inicio: formData.get('ano_letivo_inicio'),
            notas_normativas: formData.get('notas_normativas')
        }, {
            onSuccess: () => {
                toast.success('Matriz Curricular criada com sucesso')
                setModalOpen(false)
            }
        })
    }

    const handleClonarMatriz = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!selectedMatrizId) return
        const formData = new FormData(e.currentTarget)
        clonarMatriz.mutate({
            matrizOrigemId: selectedMatrizId,
            novoNome: formData.get('novo_nome') as string,
            novoAnoLetivoId: formData.get('novo_ano_letivo') as string
        }, {
            onSuccess: (res) => {
                toast.success('Plano herdado e versionado com sucesso')
                setCloneModalOpen(false)
                setSelectedMatrizId(res.id)
            }
        })
    }

    const handleAddDisciplina = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!selectedMatrizId) return
        const formData = new FormData(e.currentTarget)
        addDisciplina.mutate({
            matriz_id: selectedMatrizId,
            disciplina_name: formData.get('disciplina_name'),
            carga_horaria_teorica: Number(formData.get('carga_t')),
            carga_horaria_pratica: Number(formData.get('carga_p')),
            ordem: Number(formData.get('ordem')),
            grupo: formData.get('grupo'),
            formula_media: formData.get('formula_media'),
            peso_na_media: Number(formData.get('peso')),
            obrigatoria: formData.get('obrigatoria') === 'true',
            nota_minima_aprovacao: Number(formData.get('nota_min'))
        }, {
            onSuccess: () => {
                toast.success('Configuração curricular atualizada')
                setDiscModalOpen(false)
            }
        })
    }

    const handleAddPrecedencia = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        addPrecedencia.mutate({
            disciplina_alvo_id: formData.get('alvo'),
            disciplina_precedente_id: formData.get('precedente'),
            tipo_bloqueio: formData.get('tipo'),
            nota_minima_requerida: Number(formData.get('nota'))
        }, {
            onSuccess: () => {
                toast.success('Regra de precedência ativada.')
                setPrecModalOpen(false)
            },
            onError: (err: any) => toast.error(err.message)
        })
    }

    return (
        <div className="space-y-6 pb-20 animate-fade-in">
            <PageHeader
                title="Rigor Curricular & Matrizes"
                subtitle="Gestão de planos de estudo, fórmulas de avaliação e herança académica."
                actions={
                    isAdmin(user?.papel) ? (
                        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => setModalOpen(true)}>
                            Novo Plano Estruturante
                        </Button>
                    ) : undefined
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* List Component */}
                <Card noPadding className="lg:col-span-4 overflow-hidden border-studio-border/60 shadow-xl h-fit">
                    <div className="p-4 border-b border-studio-border bg-studio-muted/10 flex items-center justify-between">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-studio-foreground-lighter flex items-center gap-2">
                            <ListChecks className="w-4 h-4" /> Repositório de Planos
                        </h3>
                        <Badge variant="neutral" className="text-[9px] font-black px-1.5 opacity-50">{matrizes.length}</Badge>
                    </div>

                    <div className="divide-y divide-studio-border/50 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {matrizes.length === 0 && !isLoading && (
                            <div className="p-12 text-center">
                                <Layers className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                <p className="text-[10px] font-bold text-studio-foreground-lighter uppercase tracking-widest leading-relaxed">Nenhuma matriz<br />configurada no sistema</p>
                            </div>
                        )}
                        {matrizes.map((m: any) => (
                            <button
                                key={m.id}
                                onClick={() => setSelectedMatrizId(m.id)}
                                className={`w-full text-left p-4 hover:bg-studio-brand/[0.02] transition-all group flex items-center justify-between border-l-4 ${selectedMatrizId === m.id ? 'bg-studio-brand/[0.03] border-l-studio-brand text-studio-brand' : 'border-l-transparent text-studio-foreground-light'}`}
                            >
                                <div className="min-w-0">
                                    <p className="text-xs font-black group-hover:text-studio-brand transition-colors truncate uppercase tracking-tight">{m.nome}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="neutral" className="text-[8px] uppercase font-black py-0 px-1.5">{m.grau_escolar}</Badge>
                                        <span className="text-[9px] font-bold text-studio-foreground-lighter uppercase flex items-center gap-1">
                                            v{m.versao || 1}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className={`w-4 h-4 transition-transform flex-shrink-0 ${selectedMatrizId === m.id ? 'translate-x-1 opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Detail Component */}
                <Card className="lg:col-span-8 space-y-8 min-h-[600px]">
                    {!selectedMatrizId ? (
                        <EmptyState
                            title="Plano de Estudos de Rigor"
                            description="Selecione ou crie um novo plano para definir disciplinas, fórmulas de média e regras de transição."
                            icon={<ShieldCheck className="w-16 h-16 opacity-10" />}
                            className="h-full flex flex-col justify-center"
                        />
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-2xl font-black text-studio-foreground uppercase tracking-tighter">{matrizDetalhe?.nome}</h2>
                                        <Badge variant="brand" className="text-[10px] font-black uppercase tracking-widest px-2">v{matrizDetalhe?.versao || 1}</Badge>
                                    </div>
                                    <p className="text-[10px] font-bold text-studio-foreground-lighter uppercase tracking-widest mt-1">Configuração Normativa Institucional</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="secondary" size="sm" icon={<Copy className="w-4 h-4" />} onClick={() => setCloneModalOpen(true)}>
                                        Herdar Plano
                                    </Button>
                                    <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setDiscModalOpen(true)}>
                                        Nova Disciplina
                                    </Button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="p-5 rounded-3xl bg-studio-muted/10 border border-studio-border/50 text-center space-y-1">
                                    <p className="text-[9px] font-black text-studio-foreground-lighter uppercase tracking-widest">Disciplinas</p>
                                    <p className="text-xl font-black text-studio-foreground">{matrizDetalhe?.totalDisciplinas || 0}</p>
                                    <p className="text-[8px] font-bold text-studio-brand uppercase tracking-tighter">COMPONENTES ATIVOS</p>
                                </div>
                                <div className="p-5 rounded-3xl bg-studio-muted/10 border border-studio-border/50 text-center space-y-1">
                                    <p className="text-[9px] font-black text-studio-foreground-lighter uppercase tracking-widest">Carga Semanal</p>
                                    <p className="text-xl font-black text-studio-foreground">{matrizDetalhe?.cargaHorariaTotal || 0}h</p>
                                    <p className="text-[8px] font-bold text-studio-brand uppercase tracking-tighter">TEÓRICO-PRÁTICA</p>
                                </div>
                                <div className="p-5 rounded-3xl bg-studio-muted/10 border border-studio-border/50 text-center space-y-1">
                                    <p className="text-[9px] font-black text-studio-foreground-lighter uppercase tracking-widest">Nível Alvo</p>
                                    <p className="text-xl font-black text-studio-brand">{matrizDetalhe?.grau_escolar}</p>
                                    <p className="text-[8px] font-bold text-studio-foreground-lighter uppercase tracking-tighter">PÚBLICO ALVO</p>
                                </div>
                                <div className="p-5 rounded-3xl bg-studio-muted/10 border border-studio-border/50 text-center space-y-1">
                                    <p className="text-[9px] font-black text-studio-foreground-lighter uppercase tracking-widest">Precedências</p>
                                    <p className="text-xl font-black text-studio-foreground">{matrizDetalhe?.precedencias?.length || 0}</p>
                                    <p className="text-[8px] font-bold text-amber-600 uppercase tracking-tighter">REGRAS DE BLOQUEIO</p>
                                </div>
                            </div>

                            {/* Disciplinas Table */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-xs font-black text-studio-foreground uppercase tracking-widest flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-studio-brand" /> Estrutura de Cadeiras
                                    </h3>
                                </div>
                                <div className="overflow-hidden border border-studio-border/60 rounded-3xl bg-studio-bg shadow-sm">
                                    <table className="min-w-full divide-y divide-studio-border/30 text-left">
                                        <thead className="bg-studio-muted/10">
                                            <tr className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest">
                                                <th className="px-6 py-4">Matriz / Grupo</th>
                                                <th className="px-6 py-4 text-center">Carga H.</th>
                                                <th className="px-6 py-4 text-center">Fórmula</th>
                                                <th className="px-6 py-4 text-right">Rigor</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-studio-border/20">
                                            {matrizDetalhe?.disciplinas?.map((d: any) => (
                                                <tr key={d.id} className="hover:bg-studio-brand/[0.01] group transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-xl bg-studio-brand/5 flex items-center justify-center font-black text-[10px] text-studio-brand border border-studio-brand/10">
                                                                {d.ordem}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-black text-studio-foreground uppercase tracking-tight">{d.disciplina_name}</p>
                                                                <Badge variant="neutral" className="text-[8px] font-black uppercase mt-1 px-1.5 opacity-60 tracking-widest">{d.grupo}</Badge>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-[11px] font-bold text-studio-foreground-light italic">{d.carga_horaria_teorica}T + {d.carga_horaria_pratica}P</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-studio-muted/20 border border-studio-border/50">
                                                            <Calculator className="w-3 h-3 text-studio-brand/60" />
                                                            <code className="text-[9px] font-black text-studio-brand font-mono">{d.formula_media}</code>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <p className="text-[10px] font-black text-studio-foreground leading-none">PESO: {d.peso_na_media}</p>
                                                        <p className="text-[9px] font-bold text-red-500/80 uppercase mt-1">MÍN: {d.nota_minima_aprovacao}</p>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Precedências Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-xs font-black text-studio-foreground uppercase tracking-widest flex items-center gap-2 text-amber-600">
                                        <Lock className="w-4 h-4" /> Regras de Precedência (M1.0.3)
                                    </h3>
                                    <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700" icon={<Plus className="w-4 h-4" />} onClick={() => setPrecModalOpen(true)}>
                                        Nova Regra
                                    </Button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {matrizDetalhe?.precedencias?.map((p: any) => (
                                        <div key={p.id} className="p-4 rounded-3xl border border-amber-600/20 bg-amber-600/[0.03] flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-amber-600/10 flex items-center justify-center text-amber-600">
                                                    <LinkIcon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[10px] font-black text-studio-foreground uppercase tracking-tighter">{p.alvo_nome}</p>
                                                        <Badge variant="danger" className="text-[8px] font-black px-1.5 uppercase">BLOQUEADO POR</Badge>
                                                    </div>
                                                    <p className="text-xs font-black text-studio-foreground-lighter uppercase tracking-tight mt-0.5">{p.precedencia_nome}</p>
                                                </div>
                                            </div>
                                            <button onClick={() => removePrecedencia.mutate(p.id)} className="p-2 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 rounded-xl text-red-500 transition-all">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {(!matrizDetalhe?.precedencias || matrizDetalhe.precedencias.length === 0) && (
                                        <div className="md:col-span-2 p-8 border-2 border-dashed border-studio-border/30 rounded-3xl text-center">
                                            <p className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest leading-loose">
                                                Não existem dependências curriculares ativas.<br />
                                                Todas as disciplinas estão disponíveis para livre trânsito.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Normative Rules */}
                            <div className="p-6 bg-studio-muted/10 border border-studio-border/50 rounded-3xl space-y-3 relative overflow-hidden">
                                <GraduationCap className="absolute -bottom-4 -right-4 w-32 h-32 opacity-5 text-studio-brand" />
                                <h4 className="text-[10px] font-black text-studio-foreground uppercase tracking-widest flex items-center gap-2">
                                    <Settings2 className="w-4 h-4 text-studio-brand" /> Regras Coletivas de Progressão
                                </h4>
                                <p className="text-[11px] text-studio-foreground-light font-medium leading-relaxed italic pr-12">
                                    {matrizDetalhe?.notas_normativas || "Nenhuma regra de transição global definida. O sistema usará os mínimos por disciplina como critério de aprovação automática."}
                                </p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* Modal Precedência */}
            <Modal open={precModalOpen} onClose={() => setPrecModalOpen(false)} title="Nova Regra de Restrição Académica" size="md">
                <form onSubmit={handleAddPrecedencia} className="space-y-6">
                    <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-2">
                        <div className="flex items-center gap-2 text-amber-600">
                            <AlertTriangle className="w-4 h-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Aviso de Regra Rigorosa</p>
                        </div>
                        <p className="text-[10px] text-amber-900 leading-relaxed font-bold opacity-70 uppercase tracking-tighter">
                            A disciplina ALVO será bloqueada para matrícula caso o aluno não possua o status de APROVADO na disciplina PRECEDENTE.
                        </p>
                    </div>

                    <Select
                        name="precedente"
                        label="Disciplina Atuante (Precedente)"
                        required
                        options={matrizDetalhe?.disciplinas?.map((d: any) => ({ value: d.id, label: d.disciplina_name })) || []}
                        leftIcon={<Lock className="w-4 h-4 text-amber-600" />}
                    />

                    <div className="flex justify-center p-2 opacity-30">
                        <ChevronRight className="w-6 h-6 rotate-90" />
                    </div>

                    <Select
                        name="alvo"
                        label="Disciplina Sofredora (Alvo)"
                        required
                        options={matrizDetalhe?.disciplinas?.map((d: any) => ({ value: d.id, label: d.disciplina_name })) || []}
                        leftIcon={<ShieldCheck className="w-4 h-4 text-studio-brand" />}
                    />

                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <Select
                            name="tipo"
                            label="Condição de Liberação"
                            options={[
                                { value: 'aprovacao', label: 'Aprovação Total (>= 10)' },
                                { value: 'nota_minima', label: 'Nota Mínima Customizada' },
                                { value: 'frequencia', label: 'Apenas Frequência' }
                            ]}
                        />
                        <Input name="nota" type="number" step="0.5" label="Nota Exigida" defaultValue={10.0} />
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-studio-border/50">
                        <Button variant="ghost" type="button" onClick={() => setPrecModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" variant="primary" loading={addPrecedencia.isPending}>Selar Regra de Bloqueio</Button>
                    </div>
                </form>
            </Modal>

            {/* Existing Modals (Simplified for brevity as they were already correct) */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Arquitetura de Novo Plano Académico">
                <form onSubmit={handleCreateMatriz} className="space-y-6">
                    <Input name="nome" label="Identificador da Matriz" required placeholder="Ex: Reforma Educativa - Elite 2024" />
                    <div className="grid grid-cols-2 gap-4">
                        <Input name="grau_escolar" label="Nível Académico" required placeholder="Ex: 10º Ano" />
                        <Select
                            name="ano_letivo_inicio"
                            label="Vigência"
                            options={anosLetivos.map(a => ({ value: a.id, label: a.nome }))}
                        />
                    </div>
                    <textarea
                        name="notas_normativas"
                        className="w-full h-24 p-4 rounded-3xl bg-studio-muted/5 border border-studio-border text-sm text-studio-foreground outline-none focus:ring-2 focus:ring-studio-brand transition-all placeholder:opacity-30"
                        placeholder="Instruções de transição de ciclo..."
                    ></textarea>
                    <div className="flex justify-end gap-3 pt-4 border-t border-studio-border/50">
                        <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" variant="primary">Criar Matriz</Button>
                    </div>
                </form>
            </Modal>

            {/* Inclusion of clone and add disc modal would go here, omitting for brevity in the summary but ensuring consistency */}
            <Modal open={cloneModalOpen} onClose={() => setCloneModalOpen(false)} title="Herança Académica (Versionamento)">
                <form onSubmit={handleClonarMatriz} className="space-y-6">
                    <Input name="novo_nome" label="Novo Nome" required defaultValue={`${matrizDetalhe?.nome} - v${(matrizDetalhe?.versao || 1) + 1}`} />
                    <Select
                        name="novo_ano_letivo"
                        label="Novo Ano Letivo"
                        options={anosLetivos.map(a => ({ value: a.id, label: a.nome }))}
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="ghost" type="button" onClick={() => setCloneModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" variant="primary">Confirmar Herança</Button>
                    </div>
                </form>
            </Modal>

            <Modal open={discModalOpen} onClose={() => setDiscModalOpen(false)} title="Componente Curricular de Precisão">
                <form onSubmit={handleAddDisciplina} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Input name="disciplina_name" label="Nomenclatura" required />
                        <Select name="grupo" label="Grupo" options={[{ value: 'ciencias', label: 'Ciências' }, { value: 'humanidades', label: 'Humanidades' }, { value: 'linguas', label: 'Línguas' }, { value: 'tecnicas', label: 'Técnicas' }, { value: 'outro', label: 'Outros' }]} />
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                        <Input name="carga_t" label="Teórica" type="number" defaultValue={2} />
                        <Input name="carga_p" label="Prática" type="number" defaultValue={2} />
                        <Input name="peso" label="Peso" type="number" step="0.1" defaultValue={1} />
                        <Input name="nota_min" label="Mínima" type="number" step="0.5" defaultValue={10} />
                    </div>
                    <Input name="formula_media" label="Fórmula JS" defaultValue="(MAC * 0.4) + (NPP * 0.6)" />
                    <div className="flex justify-end gap-3">
                        <Button variant="ghost" type="button" onClick={() => setDiscModalOpen(false)}>Cancelar</Button>
                        <Button type="submit" variant="primary">Validar Cadeira</Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
