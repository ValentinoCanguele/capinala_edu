import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useTurmaAlunos, useAlunos } from '@/data/escola/queries'
import { useAddMatricula, useRemoveMatricula } from '@/data/escola/mutations'
import Modal from '@/components/Modal'
import { Avatar } from '@/components/shared/Avatar'
import { Button } from '@/components/shared/Button'
import { Badge } from '@/components/shared/Badge'
import { DropdownSelect } from '@/components/shared/DropdownSelect'
import { UserPlus, UserMinus, Trash2, Search, Users, GraduationCap } from 'lucide-react'

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
      title={`Gestão de Matrículas: ${turmaNome}`}
      size="xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 bg-studio-brand/[0.02] border border-studio-brand/20 rounded-3xl space-y-5">
            <h4 className="text-[10px] font-black text-studio-brand uppercase tracking-widest flex items-center gap-2">
              <UserPlus className="w-4 h-4" /> Adicionar Estudante à Turma
            </h4>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest mb-2 block">Pesquisar Aluno</label>
                <DropdownSelect
                  placeholder="Digite o nome do aluno..."
                  value={alunoToAdd}
                  searchable
                  onChange={(val) => setAlunoToAdd(Array.isArray(val) ? val[0] : val)}
                  options={alunosForaDaTurma.map(a => ({
                    value: a.id,
                    label: `${a.nome} (${(a as any).codigo || 'S/ Código'})`,
                  }))}
                />
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={handleAddAluno}
                disabled={!alunoToAdd || addMatricula.isPending}
                loading={addMatricula.isPending}
                icon={<GraduationCap className="w-4 h-4" />}
              >
                Confirmar Matrícula
              </Button>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-amber-500/5 border border-amber-500/10">
            <p className="text-[10px] text-amber-900 leading-relaxed font-bold opacity-70 uppercase tracking-tighter">
              Atenção: A matrícula vincula o estudante ao histórico académico e financeiro desta turma.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4" /> Alunos Matriculados nesta Unidade
            </h4>
            <Badge variant="neutral" className="text-[9px] font-black">{turmaAlunos.length} Estudantes</Badge>
          </div>

          <div className="border border-studio-border/50 rounded-3xl overflow-hidden bg-white dark:bg-studio-bg divide-y divide-studio-border/20 max-h-[450px] overflow-y-auto custom-scrollbar shadow-sm">
            {alunosLoading ? (
              <div className="p-12 text-center text-studio-foreground-lighter text-[10px] font-black uppercase tracking-widest">Sincronizando...</div>
            ) : turmaAlunos.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Search className="w-10 h-10 mx-auto opacity-10" />
                <p className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest">Esta turma ainda está vazia.</p>
              </div>
            ) : (
              turmaAlunos.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between px-5 py-3 group hover:bg-studio-muted/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar name={a.alunoNome} size="sm" shape="square" className="shadow-sm border border-studio-border/50" />
                    <div>
                      <p className="text-xs font-black text-studio-foreground uppercase tracking-tight leading-none mb-1">{a.alunoNome}</p>
                      <p className="text-[9px] font-bold text-studio-foreground-lighter uppercase tracking-tighter">Matrícula Ativa</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAlunoToRemove(a.alunoId)}
                    disabled={removeMatricula.isPending}
                    className="p-2 opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {alunoToRemove !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-studio-bg p-8 rounded-3xl shadow-2xl border border-studio-border max-w-sm w-full mx-4 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <UserMinus className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-black text-studio-foreground uppercase tracking-tight">Remover Aluno?</h3>
              <p className="text-xs text-studio-foreground-light font-medium tracking-tight">O estudante será desvinculado dos diários e avaliações desta turma.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setAlunoToRemove(null)}>Recuar</Button>
              <Button variant="danger" className="flex-1" onClick={confirmRemoveAluno} loading={removeMatricula.isPending}>Remover</Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  )
}
