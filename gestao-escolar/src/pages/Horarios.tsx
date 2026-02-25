import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useHorarios, useTurmas, useDisciplinas, useSalas, useAnosLetivos } from '@/data/escola/queries'
import { useCreateHorario, useDeleteHorario } from '@/data/escola/mutations'
import EmptyState from '@/components/EmptyState'
import Modal from '@/components/Modal'

const DIAS = ['', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

export default function Horarios() {
    const [searchParams, setSearchParams] = useSearchParams()
    const [turmaId, setTurmaId] = useState('')
    const [formOpen, setFormOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<string | null>(null)

    useEffect(() => {
        if (searchParams.get('acao') === 'novo') setFormOpen(true)
    }, [searchParams])

    const handleCloseForm = () => {
        setFormOpen(false)
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

    const { data: horarios = [], isLoading } = useHorarios(turmaId || undefined)
    const { data: turmas = [] } = useTurmas()
    const { data: disciplinas = [] } = useDisciplinas()
    const { data: salas = [] } = useSalas()
    const { data: anosLetivos = [] } = useAnosLetivos()
    const createHorario = useCreateHorario()
    const deleteHorario = useDeleteHorario()

    const [form, setForm] = useState({
        turmaId: '',
        disciplinaId: '',
        professorId: '',
        salaId: '',
        diaSemana: 1,
        horaInicio: '07:30',
        horaFim: '08:15',
        anoLetivoId: '',
    })

    const filtered = useMemo(() => {
        if (!turmaId) return horarios
        return horarios.filter((h) => h.turmaId === turmaId)
    }, [horarios, turmaId])

    // Agrupar por dia da semana
    const byDay = useMemo(() => {
        const map = new Map<number, typeof filtered>()
        for (const h of filtered) {
            const arr = map.get(h.diaSemana) ?? []
            arr.push(h)
            map.set(h.diaSemana, arr)
        }
        return map
    }, [filtered])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.turmaId || !form.disciplinaId || !form.anoLetivoId) return
        createHorario.mutate(
            {
                turmaId: form.turmaId,
                disciplinaId: form.disciplinaId,
                professorId: form.professorId || undefined,
                salaId: form.salaId || undefined,
                diaSemana: form.diaSemana,
                horaInicio: form.horaInicio,
                horaFim: form.horaFim,
                anoLetivoId: form.anoLetivoId,
            },
            {
                onSuccess: () => {
                    handleCloseForm()
                    toast.success('Horário criado.')
                },
                onError: (err) => toast.error(err.message),
            }
        )
    }

    const confirmDelete = () => {
        if (!itemToDelete) return
        deleteHorario.mutate(itemToDelete, {
            onSuccess: () => {
                toast.success('Horário eliminado.')
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

    return (
        <div>
            <Modal
                title="Eliminar horário"
                open={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                size="sm"
            >
                <p className="text-sm text-studio-foreground-light mb-4">
                    Tem a certeza que deseja eliminar este horário? Esta ação não pode ser desfeita.
                </p>
                <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setItemToDelete(null)} className="btn-secondary">Cancelar</button>
                    <button type="button" onClick={confirmDelete} disabled={deleteHorario.isPending} className="btn-primary bg-red-600 hover:bg-red-700 text-white disabled:opacity-50">
                        {deleteHorario.isPending ? 'A eliminar...' : 'Eliminar'}
                    </button>
                </div>
            </Modal>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-2xl font-semibold text-studio-foreground">Horários</h2>
                    <p className="text-studio-foreground-light text-sm mt-0.5">
                        Gestão de horários por turma. Conflitos de professor/sala são validados automaticamente.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => { setSearchParams({}); setFormOpen(true) }}
                    className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
                >
                    Novo horário
                </button>
            </div>

            {/* Filtro por turma */}
            <div className="mb-6">
                <label className="label">Filtrar por turma</label>
                <select
                    value={turmaId}
                    onChange={(e) => setTurmaId(e.target.value)}
                    className="input min-w-[200px]"
                >
                    <option value="">Todas as turmas</option>
                    {turmas.map((t) => (
                        <option key={t.id} value={t.id}>
                            {t.nome} ({t.anoLetivo})
                        </option>
                    ))}
                </select>
            </div>

            {/* Modal de criação */}
            {formOpen && (
                <div
                    className="fixed inset-0 z-10 flex items-center justify-center bg-black/40"
                    onClick={handleCloseForm}
                    role="presentation"
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="horario-form-title"
                        className="bg-studio-bg rounded-lg shadow-lg p-6 w-full max-w-md mx-4 border border-studio-border"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 id="horario-form-title" className="text-lg font-semibold text-studio-foreground mb-4">
                            Novo horário
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-3">
                            <div>
                                <label className="label">Turma *</label>
                                <select
                                    value={form.turmaId}
                                    onChange={(e) => setForm({ ...form, turmaId: e.target.value })}
                                    className="input w-full"
                                    required
                                >
                                    <option value="">Selecionar</option>
                                    {turmas.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.nome} ({t.anoLetivo})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Disciplina *</label>
                                <select
                                    value={form.disciplinaId}
                                    onChange={(e) => setForm({ ...form, disciplinaId: e.target.value })}
                                    className="input w-full"
                                    required
                                >
                                    <option value="">Selecionar</option>
                                    {disciplinas.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Sala</label>
                                <select
                                    value={form.salaId}
                                    onChange={(e) => setForm({ ...form, salaId: e.target.value })}
                                    className="input w-full"
                                >
                                    <option value="">Nenhuma</option>
                                    {salas.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.nome} {s.capacidade ? `(${s.capacidade} lugares)` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Ano Letivo *</label>
                                <select
                                    value={form.anoLetivoId}
                                    onChange={(e) => setForm({ ...form, anoLetivoId: e.target.value })}
                                    className="input w-full"
                                    required
                                >
                                    <option value="">Selecionar</option>
                                    {anosLetivos.map((a) => (
                                        <option key={a.id} value={a.id}>
                                            {a.nome}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="label">Dia *</label>
                                    <select
                                        value={form.diaSemana}
                                        onChange={(e) => setForm({ ...form, diaSemana: Number(e.target.value) })}
                                        className="input w-full"
                                    >
                                        {[1, 2, 3, 4, 5, 6].map((d) => (
                                            <option key={d} value={d}>
                                                {DIAS[d]}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Início *</label>
                                    <input
                                        type="time"
                                        value={form.horaInicio}
                                        onChange={(e) => setForm({ ...form, horaInicio: e.target.value })}
                                        className="input w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="label">Fim *</label>
                                    <input
                                        type="time"
                                        value={form.horaFim}
                                        onChange={(e) => setForm({ ...form, horaFim: e.target.value })}
                                        className="input w-full"
                                        required
                                    />
                                </div>
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
                                    disabled={createHorario.isPending}
                                    className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2 disabled:opacity-50"
                                >
                                    {createHorario.isPending ? 'A guardar...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Tabela de horários agrupada por dia */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="card p-8 text-center text-studio-foreground-lighter">A carregar...</div>
                ) : filtered.length === 0 ? (
                    <EmptyState
                        title="Nenhum horário registado"
                        description={'Clique em "Novo horário" para começar.'}
                        action={
                            <button
                                type="button"
                                onClick={() => { setSearchParams({}); setFormOpen(true) }}
                                className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
                            >
                                Novo horário
                            </button>
                        }
                    />
                ) : (
                    [1, 2, 3, 4, 5, 6].map((dia) => {
                        const items = byDay.get(dia)
                        if (!items || items.length === 0) return null
                        return (
                            <div key={dia} className="card overflow-hidden">
                                <div className="px-4 py-2 bg-studio-muted border-b border-studio-border">
                                    <h3 className="text-sm font-semibold text-studio-foreground">{DIAS[dia]}</h3>
                                </div>
                                <table className="min-w-full divide-y divide-studio-border">
                                    <thead className="bg-studio-muted/50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-studio-foreground-lighter uppercase">Hora</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-studio-foreground-lighter uppercase">Disciplina</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-studio-foreground-lighter uppercase">Turma</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-studio-foreground-lighter uppercase">Professor</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-studio-foreground-lighter uppercase">Sala</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-studio-foreground-lighter uppercase">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-studio-border">
                                        {items.map((h) => (
                                            <tr key={h.id} className="hover:bg-studio-muted/50">
                                                <td className="px-4 py-2 text-sm text-studio-foreground font-medium">
                                                    {h.horaInicio} – {h.horaFim}
                                                </td>
                                                <td className="px-4 py-2 text-sm text-studio-foreground">{h.disciplinaNome}</td>
                                                <td className="px-4 py-2 text-sm text-studio-foreground-light">{h.turmaNome}</td>
                                                <td className="px-4 py-2 text-sm text-studio-foreground-light">{h.professorNome ?? '—'}</td>
                                                <td className="px-4 py-2 text-sm text-studio-foreground-light">{h.salaNome ?? '—'}</td>
                                                <td className="px-4 py-2 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDelete(h.id)}
                                                        className="text-red-600 hover:underline text-sm"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
