import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useDebounce } from '@/hooks/useDebounce'
import { useTurmas } from '@/data/escola/queries'
import {
  useCreateTurma,
  useUpdateTurma,
  useDeleteTurma,
} from '@/data/escola/mutations'
import type { TurmaFormValues } from '@/schemas/turma'
import { TurmaForm, TurmasList, GerirMatriculasModal } from '@/components/turmas'
import Modal from '@/components/Modal'
import PageHeader from '@/components/PageHeader'
import { Button } from '@/components/shared/Button'
import { PlusCircle } from 'lucide-react'

export default function Turmas() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [gerirTurmaId, setGerirTurmaId] = useState<string | null>(null)
  const [turmaToDelete, setTurmaToDelete] = useState<string | null>(null)
  const [filterInput, setFilterInput] = useState('')
  const debouncedFilter = useDebounce(filterInput, 400)

  useEffect(() => {
    if (searchParams.get('acao') === 'novo') {
      setEditingId(null)
      setFormOpen(true)
    }
  }, [searchParams])

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditingId(null)
    if (searchParams.get('acao') === 'novo') setSearchParams({})
  }

  const { data: turmas = [], isLoading, error } = useTurmas()
  const createTurma = useCreateTurma()
  const updateTurma = useUpdateTurma()
  const deleteTurma = useDeleteTurma()

  const filteredTurmas = useMemo(
    () =>
      debouncedFilter
        ? turmas.filter(
            (t) =>
              t.nome.toLowerCase().includes(debouncedFilter.toLowerCase()) ||
              (t.anoLetivo ?? '').toLowerCase().includes(debouncedFilter.toLowerCase())
          )
        : turmas,
    [turmas, debouncedFilter]
  )

  const editingTurma = editingId
    ? turmas.find((t) => t.id === editingId) ?? null
    : null
  const gerirTurma = gerirTurmaId ? turmas.find((t) => t.id === gerirTurmaId) ?? null : null

  const handleCreate = () => {
    setEditingId(null)
    setFormOpen(true)
    setSearchParams({})
  }

  const handleSubmit = (data: TurmaFormValues) => {
    if (editingId) {
      updateTurma.mutate(
        { id: editingId, ...data, alunoIds: editingTurma?.alunoIds ?? [] },
        {
          onSuccess: () => {
            handleCloseForm()
            toast.success('Turma atualizada.')
          },
          onError: (err) => toast.error(err.message),
        }
      )
    } else {
      createTurma.mutate(
        { ...data, alunoIds: [] },
        {
          onSuccess: () => {
            handleCloseForm()
            toast.success('Turma criada.')
          },
          onError: (err) => toast.error(err.message),
        }
      )
    }
  }

  const confirmDeleteTurma = () => {
    if (!turmaToDelete) return
    deleteTurma.mutate(turmaToDelete, {
      onSuccess: () => {
        toast.success('Turma eliminada.')
        setTurmaToDelete(null)
      },
      onError: (err) => {
        toast.error(err.message)
        setTurmaToDelete(null)
      },
    })
  }

  const isFormLoading = createTurma.isPending || updateTurma.isPending

  return (
    <div>
      <Modal
        title="Eliminar turma"
        open={!!turmaToDelete}
        onClose={() => setTurmaToDelete(null)}
        size="sm"
      >
        <p className="text-sm text-studio-foreground-light mb-4">
          Tem a certeza que deseja eliminar esta turma? Esta ação não pode ser desfeita e removerá todas as matrículas associadas.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setTurmaToDelete(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={confirmDeleteTurma}
            loading={deleteTurma.isPending}
            disabled={deleteTurma.isPending}
          >
            Eliminar Turma
          </Button>
        </div>
      </Modal>

      <PageHeader
        title="Turmas"
        subtitle="Listagem e cadastro de turmas e matrículas."
        actions={
          <Button
            onClick={handleCreate}
            icon={<PlusCircle className="w-4 h-4" />}
          >
            Nova Turma
          </Button>
        }
      />

      <Modal
        open={formOpen}
        onClose={handleCloseForm}
        title={editingId ? 'Editar turma' : 'Nova turma'}
      >
        <TurmaForm
          defaultValues={
            editingTurma
              ? { nome: editingTurma.nome, anoLetivo: editingTurma.anoLetivo }
              : undefined
          }
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          isLoading={isFormLoading}
        />
      </Modal>

      {gerirTurmaId && gerirTurma && (
        <GerirMatriculasModal
          turmaId={gerirTurmaId}
          turmaNome={gerirTurma.nome}
          onClose={() => setGerirTurmaId(null)}
        />
      )}

      <TurmasList
        turmas={filteredTurmas}
        filter={filterInput}
        onFilterChange={setFilterInput}
        onGerirAlunos={setGerirTurmaId}
        onEdit={(id) => {
          setEditingId(id)
          setFormOpen(true)
        }}
        onDelete={setTurmaToDelete}
        onCreate={handleCreate}
        isLoading={isLoading}
        error={error ?? null}
        totalCount={turmas.length}
      />
    </div>
  )
}
