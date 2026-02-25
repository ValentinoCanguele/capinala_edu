import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useComunicados, useTurmas } from '@/data/escola/queries'
import { useCreateComunicado, useUpdateComunicado, useDeleteComunicado } from '@/data/escola/mutations'
import EmptyState from '@/components/EmptyState'
import PageHeader from '@/components/PageHeader'
import Modal from '@/components/Modal'

export default function Comunicados() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [formOpen, setFormOpen] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)
    const { data: comunicados = [], isLoading } = useComunicados()

    useEffect(() => {
        if (searchParams.get('acao') === 'novo') {
            setEditingId(null)
            setFormOpen(true)
        }
    }, [searchParams])
    const { data: turmas = [] } = useTurmas()
    const createComunicado = useCreateComunicado()
    const updateComunicado = useUpdateComunicado()
    const deleteComunicado = useDeleteComunicado()

    const editing = editingId ? comunicados.find((c) => c.id === editingId) ?? null : null

    const [form, setForm] = useState({
        titulo: '',
        conteudo: '',
        destinatarioTipo: 'todos' as 'todos' | 'turma' | 'papel',
        turmaId: '',
    })

    useEffect(() => {
        if (editing) {
            setForm({
                titulo: editing.titulo,
                conteudo: editing.conteudo,
                destinatarioTipo: editing.destinatarioTipo as 'todos' | 'turma' | 'papel',
                turmaId: editing.turmaId ?? '',
            })
        } else if (formOpen) {
            setForm({ titulo: '', conteudo: '', destinatarioTipo: 'todos', turmaId: '' })
        }
    }, [editing, formOpen])

    const handleOpenCreate = () => {
        setEditingId(null)
        setFormOpen(true)
        setSearchParams({})
    }

    const handleOpenEdit = (id: string) => {
        setEditingId(id)
        setFormOpen(true)
    }

    const handleCloseForm = () => {
        setFormOpen(false)
        setEditingId(null)
        if (searchParams.get('acao') === 'novo') setSearchParams({})
    }

    useEffect(() => {
        if (!formOpen) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleCloseForm()
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [formOpen])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.titulo || !form.conteudo) return
        if (editingId) {
            updateComunicado.mutate(
                {
                    id: editingId,
                    titulo: form.titulo,
                    conteudo: form.conteudo,
                    destinatarioTipo: form.destinatarioTipo,
                    turmaId: form.turmaId || null,
                },
                {
                    onSuccess: () => {
                        handleCloseForm()
                        toast.success('Comunicado atualizado.')
                    },
                    onError: (err) => toast.error(err.message),
                }
            )
        } else {
            createComunicado.mutate(
                {
                    titulo: form.titulo,
                    conteudo: form.conteudo,
                    destinatarioTipo: form.destinatarioTipo,
                    turmaId: form.turmaId || undefined,
                },
                {
                    onSuccess: () => {
                        handleCloseForm()
                        toast.success('Comunicado publicado.')
                    },
                    onError: (err) => toast.error(err.message),
                }
            )
        }
    }

    const confirmDelete = () => {
        if (!itemToDelete) return
        deleteComunicado.mutate(itemToDelete, {
            onSuccess: () => {
                toast.success('Comunicado eliminado.')
                setItemToDelete(null)
            },
            onError: (err) => {
                toast.error(err.message)
                setItemToDelete(null)
            },
        })
    }

    const handleDelete = (id: string) => {
        setItemToDelete(id)
    }

    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString('pt-AO', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })
        } catch {
            return iso
        }
    }

    return (
        <div>
            <Modal
                title="Eliminar comunicado"
                open={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                size="sm"
            >
                <p className="text-sm text-studio-foreground-light mb-4">
                    Tem a certeza que deseja eliminar este comunicado? Esta ação não pode ser desfeita.
                </p>
                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => setItemToDelete(null)}
                        className="btn-secondary"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={confirmDelete}
                        disabled={deleteComunicado.isPending}
                        className="btn-primary bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                    >
                        {deleteComunicado.isPending ? 'A eliminar...' : 'Eliminar'}
                    </button>
                </div>
            </Modal>
            <PageHeader
                title="Comunicados"
                subtitle="Avisos e comunicados internos da escola."
                actions={
                    <button
                        type="button"
                        onClick={handleOpenCreate}
                        className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
                    >
                        Novo comunicado
                    </button>
                }
            />

            {/* Modal criar/editar */}
            {formOpen && (
                <div
                    className="fixed inset-0 z-10 flex items-center justify-center bg-black/40"
                    onClick={handleCloseForm}
                    role="presentation"
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="comunicado-form-title"
                        className="bg-studio-bg rounded-lg shadow-lg p-6 w-full max-w-lg mx-4 border border-studio-border"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 id="comunicado-form-title" className="text-lg font-semibold text-studio-foreground mb-4">
                            {editingId ? 'Editar comunicado' : 'Novo comunicado'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="label">Título *</label>
                                <input
                                    type="text"
                                    value={form.titulo}
                                    onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                                    className="input w-full"
                                    placeholder="Título do comunicado"
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">Conteúdo *</label>
                                <textarea
                                    value={form.conteudo}
                                    onChange={(e) => setForm({ ...form, conteudo: e.target.value })}
                                    className="input w-full min-h-[120px]"
                                    placeholder="Escreva o comunicado..."
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="label">Destinatário</label>
                                    <select
                                        value={form.destinatarioTipo}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                destinatarioTipo: e.target.value as 'todos' | 'turma' | 'papel',
                                                turmaId: '',
                                            })
                                        }
                                        className="input w-full"
                                    >
                                        <option value="todos">Todos</option>
                                        <option value="turma">Turma específica</option>
                                    </select>
                                </div>
                                {form.destinatarioTipo === 'turma' && (
                                    <div>
                                        <label className="label">Turma</label>
                                        <select
                                            value={form.turmaId}
                                            onChange={(e) => setForm({ ...form, turmaId: e.target.value })}
                                            className="input w-full"
                                        >
                                            <option value="">Selecionar</option>
                                            {turmas.map((t) => (
                                                <option key={t.id} value={t.id}>
                                                    {t.nome} ({t.anoLetivo})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseForm}
                                    className="btn-secondary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={createComunicado.isPending || updateComunicado.isPending}
                                    className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 disabled:opacity-50"
                                >
                                    {createComunicado.isPending || updateComunicado.isPending
                                        ? 'A guardar...'
                                        : editingId
                                            ? 'Guardar'
                                            : 'Publicar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Lista de comunicados */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="card p-8 text-center text-studio-foreground-lighter">A carregar...</div>
                ) : comunicados.length === 0 ? (
                    <EmptyState
                        title="Nenhum comunicado publicado"
                        description={'Clique em "Novo comunicado" para publicar o primeiro.'}
                        action={
                            <button
                                type="button"
                                onClick={handleOpenCreate}
                                className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
                            >
                                Novo comunicado
                            </button>
                        }
                    />
                ) : (
                    comunicados.map((c) => (
                        <div key={c.id} className="card p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-semibold text-studio-foreground">{c.titulo}</h3>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-studio-foreground-lighter">
                                        <span>{c.autorNome}</span>
                                        <span>·</span>
                                        <span>{formatDate(c.publicadoEm)}</span>
                                        {c.turmaNome && (
                                            <>
                                                <span>·</span>
                                                <span className="px-1.5 py-0.5 bg-studio-muted rounded text-studio-foreground-light">
                                                    {c.turmaNome}
                                                </span>
                                            </>
                                        )}
                                        {c.destinatarioTipo === 'todos' && (
                                            <>
                                                <span>·</span>
                                                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                                                    Todos
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <p className="mt-2 text-sm text-studio-foreground-light whitespace-pre-wrap">
                                        {c.conteudo}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => handleOpenEdit(c.id)}
                                        className="text-studio-brand hover:underline text-sm"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(c.id)}
                                        className="text-red-600 hover:underline text-sm"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}
