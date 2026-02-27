import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/useDebounce'
import { useQueryState } from '@/hooks/useQueryState'
import { useAuth } from '@/contexts/AuthContext'
import { canManageDisciplinas } from '@/lib/permissoes'
import { useDisciplinas } from '@/data/escola/queries'
import {
  useCreateDisciplina,
  useUpdateDisciplina,
  useDeleteDisciplina,
} from '@/data/escola/mutations'
import type { DisciplinaFormValues } from '@/schemas/disciplina'
import { Input } from '@/components/shared/Input'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { Badge } from '@/components/shared/Badge'
import { BookOpen, Search, PlusCircle, Filter, Edit2, Trash2, LayoutGrid } from 'lucide-react'

function DisciplinaForm({
  defaultNome,
  onSubmit,
  onCancel,
  isLoading,
}: {
  defaultNome: string
  onSubmit: (data: DisciplinaFormValues) => void
  onCancel: () => void
  isLoading: boolean
  onDirtyChange?: (dirty: boolean) => void
}) {
  const [nome, setNome] = useState(defaultNome)

  useEffect(() => {
    onDirtyChange?.(nome !== defaultNome)
  }, [nome, defaultNome, onDirtyChange])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim()) {
      toast.error('Nome é obrigatório')
      return
    }
    onSubmit({ nome: nome.trim() })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Nome da Disciplina Académica"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Ex: Engenharia de Software, Matemática Avançada..."
        autoFocus
        leftIcon={<BookOpen className="w-4 h-4" />}
        hint="O nome deve ser curto e institucional."
      />
      <div className="flex gap-3 justify-end pt-5 border-t border-studio-border/50">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={isLoading} variant="primary">
          {isLoading ? 'A guardar...' : 'Confirmar Disciplina'}
        </Button>
      </div>
    </form>
  )
}

export default function Disciplinas() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterFromUrl, setFilterFromUrl] = useQueryState('q')
  const [filterInput, setFilterInput] = useState(() => searchParams.get('q') ?? '')
  const debouncedFilter = useDebounce(filterInput, 400)
  const [itemToDelete, setItemToDelete] = useState<{ id: string, nome: string } | null>(null)
  const lastDeletedDisciplinaRef = useRef<{ nome: string } | null>(null)

  useEffect(() => {
    setFilterInput(filterFromUrl)
  }, [filterFromUrl])

  useEffect(() => {
    setFilterFromUrl(debouncedFilter)
  }, [debouncedFilter, setFilterFromUrl])

  useEffect(() => {
    if (searchParams.get('acao') === 'novo') {
      setEditingId(null)
      setModalOpen(true)
    }
  }, [searchParams])

  const [isFormDirty, setIsFormDirty] = useState(false)

  const handleCloseModal = () => {
    if (isFormDirty && !window.confirm('Existem alterações pendentes. Deseja sair?')) return
    setModalOpen(false)
    setEditingId(null)
    setIsFormDirty(false)
    if (searchParams.get('acao') === 'novo') setSearchParams({})
  }

  const { data: disciplinas = [], isLoading, error } = useDisciplinas()
  const createDisc = useCreateDisciplina()
  const updateDisc = useUpdateDisciplina()
  const deleteDisc = useDeleteDisciplina()

  const filtered = useMemo(
    () =>
      debouncedFilter
        ? disciplinas.filter((d) =>
          d.nome.toLowerCase().includes(debouncedFilter.toLowerCase())
        )
        : disciplinas,
    [disciplinas, debouncedFilter]
  )

  const editing = editingId
    ? disciplinas.find((d) => d.id === editingId) ?? null
    : null

  const handleCreate = () => {
    setEditingId(null)
    setModalOpen(true)
    setSearchParams({})
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
    setModalOpen(true)
  }

  const handleSubmit = (data: DisciplinaFormValues) => {
    if (editingId) {
      updateDisc.mutate(
        { id: editingId, ...data },
        {
          onSuccess: () => {
            toast.success('Disciplina atualizada.')
            handleCloseModal()
          },
          onError: (err) => toast.error(err.message),
        }
      )
    } else {
      createDisc.mutate(data, {
        onSuccess: () => {
          toast.success('Disciplina criada.')
          handleCloseModal()
        },
        onError: (err) => toast.error(err.message),
      })
    }
  }

  const confirmDelete = () => {
    if (!itemToDelete) return
    lastDeletedDisciplinaRef.current = { nome: itemToDelete.nome }
    deleteDisc.mutate(itemToDelete.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['escola', 'disciplinas'] })
        setItemToDelete(null)
        toast.success(
          (t) => (
            <span className="flex items-center gap-3 flex-wrap">
              <span>Disciplina eliminada.</span>
              <button
                type="button"
                onClick={() => {
                  const payload = lastDeletedDisciplinaRef.current
                  if (payload) {
                    createDisc.mutate(
                      { nome: payload.nome },
                      {
                        onSuccess: () => {
                          queryClient.invalidateQueries({ queryKey: ['escola', 'disciplinas'] })
                          lastDeletedDisciplinaRef.current = null
                          toast.success('Disciplina restaurada.')
                        },
                        onError: (err) => toast.error(err.message),
                      }
                    )
                  }
                  lastDeletedDisciplinaRef.current = null
                  toast.dismiss(t.id)
                }}
                className="font-semibold text-studio-brand hover:text-studio-foreground underline focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand rounded"
              >
                Desfazer
              </button>
            </span>
          ),
          { duration: 6000 }
        )
      },
      onError: (err) => {
        toast.error(err.message)
        lastDeletedDisciplinaRef.current = null
        setItemToDelete(null)
      },
    })
  }

  const handleDelete = (id: string, nome: string) => {
    setItemToDelete({ id, nome })
  }

  const isFormLoading = createDisc.isPending || updateDisc.isPending

  return (
    <div>
      <Modal
        title="Eliminar disciplina"
        open={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        size="sm"
      >
        <p className="text-sm text-studio-foreground-light mb-4">
          Tem a certeza que deseja eliminar a disciplina "{itemToDelete?.nome}"? Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setItemToDelete(null)} className="btn-secondary">Cancelar</button>
          <button type="button" onClick={confirmDelete} disabled={deleteDisc.isPending} className="btn-primary bg-red-600 hover:bg-red-700 text-white disabled:opacity-50">
            {deleteDisc.isPending ? 'A eliminar...' : 'Eliminar'}
          </button>
        </div>
      </Modal>

      <PageHeader
        title="Catálogo de Disciplinas"
        subtitle="Estrutura académica de currículos e componentes lectivas da instituição."
        actions={
          canManageDisciplinas(user?.papel) ? (
            <Button
              onClick={handleCreate}
              icon={<PlusCircle className="w-4 h-4" />}
            >
              Nova Disciplina
            </Button>
          ) : undefined
        }
      />

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-studio-muted/10 p-4 rounded-2xl border border-studio-border/40">
        <div className="flex items-center gap-3 w-full max-w-md">
          <Search className="w-5 h-5 text-studio-foreground-lighter" />
          <input
            type="text"
            placeholder="Filtrar por nome ou código lectivo..."
            value={filterInput}
            onChange={(e) => setFilterInput(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-medium text-studio-foreground w-full placeholder:text-studio-foreground-lighter"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-8 w-[1px] bg-studio-border hidden md:block" />
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-studio-foreground-lighter" />
            <span className="text-xs font-black uppercase text-studio-foreground-lighter tracking-widest">{disciplinas.length} Disciplinas Catálogadas</span>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Editar disciplina' : 'Nova disciplina'}
      >
        <DisciplinaForm
          defaultNome={editing?.nome ?? ''}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isLoading={isFormLoading}
          onDirtyChange={setIsFormDirty}
        />
      </Modal>

      <Card noPadding className="overflow-hidden border-studio-border/60">
        {isLoading ? (
          <SkeletonTable rows={10} columns={2} />
        ) : error ? (
          <div className="p-8 text-center text-red-600 dark:text-red-400" role="alert">
            Erro crítico de dados: {(error as Error).message}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title={filterInput ? 'Nenhum resultado para a busca' : 'Catálogo Vazio'}
              description={filterInput ? 'Verifique se o nome está correto ou limpe os filtros.' : 'A sua instituição ainda não possui disciplinas registadas.'}
              onAction={!filterInput ? handleCreate : undefined}
              actionLabel="Registar Primeira Disciplina"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-studio-border/20" aria-label="Lista de disciplinas">
              <thead className="bg-studio-muted/10">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-studio-foreground-light uppercase tracking-[0.2em]">
                    Designação Académica
                  </th>
                  {canManageDisciplinas(user?.papel) && (
                    <th scope="col" className="px-6 py-4 text-right text-[10px] font-black text-studio-foreground-light uppercase tracking-[0.2em]">
                      Gestão
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-studio-border/10">
                {filtered.map((d) => (
                  <tr key={d.id} className="group hover:bg-studio-brand/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-studio-brand/10 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-studio-brand" />
                        </div>
                        <span className="text-sm font-black text-studio-foreground uppercase tracking-tight group-hover:text-studio-brand transition-colors">
                          {d.nome}
                        </span>
                      </div>
                    </td>
                    {canManageDisciplinas(user?.papel) && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Edit2 className="w-3.5 h-3.5" />}
                            onClick={() => handleEdit(d.id)}
                            className="text-[10px] font-black uppercase text-studio-brand"
                          >
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            icon={<Trash2 className="w-4 h-4" />}
                            onClick={() => handleDelete(d.id, d.nome)}
                            className="text-red-400 hover:text-red-500 hover:bg-red-50"
                          />
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
