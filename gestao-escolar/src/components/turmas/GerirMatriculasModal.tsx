import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useTurmaAlunos, useAlunos } from '@/data/escola/queries'
import { useAddMatricula, useRemoveMatricula } from '@/data/escola/mutations'
import Modal from '@/components/Modal'

interface GerirMatriculasModalProps {
  turmaId: string
  turmaNome: string
  onClose: () => void
}

export default function GerirMatriculasModal({
  turmaId,
  turmaNome,
  onClose,
}: GerirMatriculasModalProps) {
  const [alunoToAdd, setAlunoToAdd] = useState('')
  const [alunoToRemove, setAlunoToRemove] = useState<string | null>(null)

  const { data: turmaAlunos = [], isLoading: alunosLoading } = useTurmaAlunos(turmaId)
  const { data: todosAlunos = [] } = useAlunos()
  const alunosForaDaTurma = useMemo(() => {
    const idsInTurma = new Set(turmaAlunos.map((a) => a.alunoId))
    return todosAlunos.filter((a) => !idsInTurma.has(a.id))
  }, [turmaAlunos, todosAlunos])

  const addMatricula = useAddMatricula()
  const removeMatricula = useRemoveMatricula()

  const handleAddAluno = () => {
    if (!alunoToAdd) return
    addMatricula.mutate(
      { turmaId, alunoId: alunoToAdd },
      {
        onSuccess: () => {
          toast.success('Aluno adicionado à turma.')
          setAlunoToAdd('')
        },
        onError: (err) => toast.error(err.message),
      }
    )
  }

  const confirmRemoveAluno = () => {
    if (!alunoToRemove) return
    removeMatricula.mutate(
      { turmaId, alunoId: alunoToRemove },
      {
        onSuccess: () => {
          toast.success('Aluno removido da turma.')
          setAlunoToRemove(null)
        },
        onError: (err) => {
          toast.error(err.message)
          setAlunoToRemove(null)
        },
      }
    )
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Gerir alunos — ${turmaNome}`}
      size="lg"
    >
      <div className="space-y-4">
        <div className="flex gap-2 flex-wrap items-end">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="gerir-add-aluno" className="label">
              Adicionar aluno
            </label>
            <select
              id="gerir-add-aluno"
              value={alunoToAdd}
              onChange={(e) => setAlunoToAdd(e.target.value)}
              className="input w-full"
            >
              <option value="">Selecionar aluno</option>
              {alunosForaDaTurma.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nome}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleAddAluno}
            disabled={!alunoToAdd || addMatricula.isPending}
            className="btn-primary disabled:opacity-50"
          >
            {addMatricula.isPending ? 'A adicionar...' : 'Adicionar'}
          </button>
        </div>
        <div>
          <h4 className="text-sm font-medium text-studio-foreground mb-2">
            Alunos na turma ({turmaAlunos.length})
          </h4>
          {alunosLoading ? (
            <div className="py-4 text-studio-foreground-lighter text-sm">
              A carregar...
            </div>
          ) : turmaAlunos.length === 0 ? (
            <p className="text-studio-foreground-light text-sm">
              Nenhum aluno. Use o campo acima para adicionar.
            </p>
          ) : (
            <ul className="border border-studio-border rounded-lg divide-y divide-studio-border max-h-64 overflow-y-auto">
              {turmaAlunos.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between px-3 py-2 hover:bg-studio-muted/50"
                >
                  <span className="text-sm text-studio-foreground">{a.alunoNome}</span>
                  <button
                    type="button"
                    onClick={() => setAlunoToRemove(a.alunoId)}
                    disabled={removeMatricula.isPending}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {alunoToRemove !== null && (
          <div className="p-3 rounded-lg border border-studio-border bg-studio-muted/30 flex items-center justify-between">
            <span className="text-sm text-studio-foreground-light">
              Remover aluno da turma?
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAlunoToRemove(null)}
                className="btn-secondary text-sm"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmRemoveAluno}
                disabled={removeMatricula.isPending}
                className="px-3 py-1.5 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {removeMatricula.isPending ? 'A remover...' : 'Remover'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
