import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useAlunos } from '@/data/escola/queries'
import {
  useCreateAluno,
  useUpdateAluno,
  useDeleteAluno,
} from '@/data/escola/mutations'
import type { AlunoFormValues } from '@/schemas/aluno'
import AlunoForm from '@/components/AlunoForm'
import Modal from '@/components/Modal'
import EmptyState from '@/components/EmptyState'
import PageHeader from '@/components/PageHeader'
import { TableSkeleton } from '@/components/PageSkeleton'

export default function Alunos() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
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
      filter
        ? alunos.filter((a) =>
          a.nome.toLowerCase().includes(filter.toLowerCase())
        )
        : alunos,
    [alunos, filter]
  )

  const editingAluno = editingId
    ? alunos.find((a) => a.id === editingId) ?? null
    : null

  const handleCreate = () => {
    setEditingId(null)
    setFormOpen(true)
    setSearchParams({})
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
    setFormOpen(true)
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

  const handleDelete = (id: string) => {
    setItemToDelete(id)
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
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => setItemToDelete(null)} className="btn-secondary">Cancelar</button>
          <button type="button" onClick={confirmDelete} disabled={deleteAluno.isPending} className="btn-primary bg-red-600 hover:bg-red-700 text-white disabled:opacity-50">
            {deleteAluno.isPending ? 'A eliminar...' : 'Eliminar'}
          </button>
        </div>
      </Modal>

      <PageHeader
        title="Alunos"
        subtitle="Listagem e cadastro de alunos."
        actions={
          <button
            type="button"
            onClick={handleCreate}
            className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
          >
            Novo aluno
          </button>
        }
      />

      <div className="mb-4">
        <input
          type="search"
          placeholder="Pesquisar por nome..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input max-w-xs"
        />
      </div>

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

      <div className="bg-studio-bg border border-studio-border rounded-lg overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : error ? (
          <div className="p-8 text-center text-red-600 dark:text-red-400" role="alert">
            Erro: {(error as Error).message}
          </div>
        ) : filteredAlunos.length === 0 ? (
          <EmptyState
            title={filter ? 'Nenhum aluno encontrado' : 'Nenhum aluno registado'}
            description={filter ? 'Tente outro termo de pesquisa.' : 'Clique em "Novo aluno" para começar.'}
            action={
              !filter ? (
                <button
                  type="button"
                  onClick={handleCreate}
                  className="btn-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-studio-brand focus-visible:ring-offset-2"
                >
                  Novo aluno
                </button>
              ) : undefined
            }
          />
        ) : (
          <table className="min-w-full divide-y divide-studio-border">
            <thead className="bg-studio-muted">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-studio-foreground-lighter uppercase">
                  Data nasc.
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-studio-foreground-lighter uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-studio-border">
              {filteredAlunos.map((a) => (
                <tr key={a.id} className="hover:bg-studio-muted/50">
                  <td className="px-4 py-3 text-sm text-studio-foreground">{a.nome}</td>
                  <td className="px-4 py-3 text-sm text-studio-foreground-light">{a.email}</td>
                  <td className="px-4 py-3 text-sm text-studio-foreground-light">
                    {a.dataNascimento}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <button
                      type="button"
                      onClick={() => handleEdit(a.id)}
                      className="text-studio-brand hover:underline mr-3"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(a.id)}
                      className="text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
