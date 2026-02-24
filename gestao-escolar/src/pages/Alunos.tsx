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
import { TableSkeleton } from '@/components/PageSkeleton'

export default function Alunos() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState('')

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

  const handleDelete = (id: string) => {
    if (!window.confirm('Eliminar este aluno?')) return
    deleteAluno.mutate(id, {
      onSuccess: () => toast.success('Aluno eliminado.'),
      onError: (err) => toast.error(err.message),
    })
  }

  const isFormLoading = createAluno.isPending || updateAluno.isPending

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-studio-foreground">Alunos</h2>
          <p className="text-studio-foreground-light text-sm mt-0.5">
            Listagem e cadastro. Dados da API /api/escola/alunos.
          </p>
        </div>
        <button type="button" onClick={handleCreate} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-studio-brand hover:bg-studio-brand-hover">
          Novo aluno
        </button>
      </div>

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
          <div className="p-8 text-center text-red-600">
            Erro: {(error as Error).message}
          </div>
        ) : filteredAlunos.length === 0 ? (
          <div className="p-8 text-center text-studio-foreground-lighter">
            {filter ? 'Nenhum aluno encontrado.' : 'Nenhum aluno registado.'}
          </div>
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
