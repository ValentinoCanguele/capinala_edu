import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useDebounce } from '@/hooks/useDebounce'
import { useAuth } from '@/contexts/AuthContext'
import { canCreateAluno, canDeleteAluno } from '@/lib/permissoes'
import { useAlunos } from '@/data/escola/queries'
import {
  useCreateAluno,
  useUpdateAluno,
  useDeleteAluno,
} from '@/data/escola/mutations'
import type { AlunoFormValues } from '@/schemas/aluno'
import { AlunoForm, AlunosList } from '@/components/alunos'
import Modal from '@/components/Modal'
import PageHeader from '@/components/PageHeader'
import { Button } from '@/components/shared/Button'
import { UserPlus } from 'lucide-react'

export default function Alunos() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterInput, setFilterInput] = useState('')
  const debouncedFilter = useDebounce(filterInput, 400)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

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

  const { data: alunos = [], isLoading, error } = useAlunos()
  const createAluno = useCreateAluno()
  const updateAluno = useUpdateAluno()
  const deleteAluno = useDeleteAluno()

  const filteredAlunos = useMemo(
    () =>
      debouncedFilter
        ? alunos.filter((a) =>
          a.nome.toLowerCase().includes(debouncedFilter.toLowerCase())
        )
        : alunos,
    [alunos, debouncedFilter]
  )

  const editingAluno = editingId
    ? alunos.find((a) => a.id === editingId) ?? null
    : null

  const handleCreate = () => {
    setEditingId(null)
    setFormOpen(true)
    setSearchParams({})
  }

  const handleSubmit = (data: AlunoFormValues) => {
    if (editingId) {
      updateAluno.mutate(
        { id: editingId, ...data },
        {
          onSuccess: () => {
            handleCloseForm()
            toast.success('Aluno atualizado.')
          },
          onError: (err) => toast.error(err.message),
        }
      )
    } else {
      createAluno.mutate(data, {
        onSuccess: () => {
          handleCloseForm()
          toast.success('Aluno criado.')
        },
        onError: (err) => toast.error(err.message),
      })
    }
  }

  const confirmDelete = () => {
    if (!itemToDelete) return
    deleteAluno.mutate(itemToDelete, {
      onSuccess: () => {
        toast.success('Aluno eliminado.')
        setItemToDelete(null)
      },
      onError: (err) => {
        toast.error(err.message)
        setItemToDelete(null)
      },
    })
  }

  const isFormLoading = createAluno.isPending || updateAluno.isPending

  return (
    <div>
      <Modal
        title="Eliminar aluno"
        open={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        size="sm"
      >
        <p className="text-sm text-studio-foreground-light mb-4">
          Tem a certeza que deseja eliminar este aluno? Esta ação não pode ser desfeita.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setItemToDelete(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            loading={deleteAluno.isPending}
            disabled={deleteAluno.isPending}
          >
            Eliminar Aluno
          </Button>
        </div>
      </Modal>

      <PageHeader
        title="Alunos"
        subtitle="Listagem e cadastro de alunos."
        actions={
          canCreateAluno(user?.papel) ? (
            <Button
              onClick={handleCreate}
              icon={<UserPlus className="w-4 h-4" />}
            >
              Novo Aluno
            </Button>
          ) : undefined
        }
      />

      <Modal
        open={formOpen}
        onClose={handleCloseForm}
        title={editingId ? 'Editar aluno' : 'Novo aluno'}
      >
        <AlunoForm
          defaultValues={
            editingAluno
              ? {
                nome: editingAluno.nome,
                email: editingAluno.email,
                dataNascimento: editingAluno.dataNascimento,
              }
              : undefined
          }
          isNew={!editingId}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          isLoading={isFormLoading}
        />
      </Modal>

      <AlunosList
        alunos={filteredAlunos}
        filter={filterInput}
        onFilterChange={setFilterInput}
        onEdit={(id) => {
          setEditingId(id)
          setFormOpen(true)
        }}
        onDelete={setItemToDelete}
        onCreate={canCreateAluno(user?.papel) ? handleCreate : undefined}
        canEdit={canCreateAluno(user?.papel)}
        canDelete={canDeleteAluno(user?.papel)}
        isLoading={isLoading}
        error={error ?? null}
      />
    </div>
  )
}
