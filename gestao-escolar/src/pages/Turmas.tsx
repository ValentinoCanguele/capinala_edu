import { useState, useMemo, useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/useDebounce'
import { useQueryState } from '@/hooks/useQueryState'
import { useAuth } from '@/contexts/AuthContext'
import { canCreateTurma, canDeleteTurma, canManageTurmaAlunos } from '@/lib/permissoes'
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
import { Card } from '@/components/shared/Card'
import { PlusCircle, Shield, Search } from 'lucide-react'

export default function Turmas() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [gerirTurmaId, setGerirTurmaId] = useState<string | null>(null)
  const [turmaToDelete, setTurmaToDelete] = useState<string | null>(null)
  const [filterFromUrl, setFilterFromUrl] = useQueryState('q')
  const [filterInput, setFilterInput] = useState(() => searchParams.get('q') ?? '')
  const debouncedFilter = useDebounce(filterInput, 400)
  const [isFormDirty, setIsFormDirty] = useState(false)
  const lastDeletedTurmaRef = useRef<{ nome: string; anoLetivo: string } | null>(null)

  useEffect(() => {
    setFilterInput(filterFromUrl)
  }, [filterFromUrl])

  useEffect(() => {
    setFilterFromUrl(debouncedFilter)
  }, [debouncedFilter, setFilterFromUrl])

  useEffect(() => {
    if (searchParams.get('acao') === 'novo') {
      setEditingId(null)
      setFormOpen(true)
    }
  }, [searchParams])

  const handleCloseForm = () => {
    if (isFormDirty && !window.confirm('Tem alterações não guardadas. Deseja sair?')) return
    setFormOpen(false)
    setEditingId(null)
    setIsFormDirty(false)
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

  const globalStats = useMemo(() => {
    const total = turmas.length
    const matriculados = turmas.reduce((acc, t) => acc + (t.alunoIds?.length ?? 0), 0)
    const capacidadeTotal = turmas.reduce((acc, t) => acc + (t.capacidade ?? 30), 0)
    const ocupacao = capacidadeTotal > 0 ? Math.round((matriculados / capacidadeTotal) * 100) : 0

    return { total, matriculados, ocupacao }
  }, [turmas])

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
    const turma = turmas.find((t) => t.id === turmaToDelete)
    if (turma) lastDeletedTurmaRef.current = { nome: turma.nome, anoLetivo: turma.anoLetivo ?? '' }
    deleteTurma.mutate(turmaToDelete, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['escola', 'turmas'] })
        setTurmaToDelete(null)
        toast.success(
          (t) => (
            <span className="flex items-center gap-3 flex-wrap">
              <span>Turma eliminada.</span>
              <button
                type="button"
                onClick={() => {
                  const payload = lastDeletedTurmaRef.current
                  if (payload) {
                    createTurma.mutate(
                      {
                        nome: payload.nome,
                        anoLetivo: payload.anoLetivo,
                        alunoIds: [],
                        periodo: 'Manhã',
                        capacidade: 30
                      },
                      {
                        onSuccess: () => {
                          queryClient.invalidateQueries({ queryKey: ['escola', 'turmas'] })
                          lastDeletedTurmaRef.current = null
                          toast.success('Turma restaurada.')
                        },
                        onError: (err) => toast.error(err.message),
                      }
                    )
                  }
                  lastDeletedTurmaRef.current = null
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
        lastDeletedTurmaRef.current = null
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
        title="Controlo de Turmas"
        subtitle="Gestão de unidades académicas, lotação institucional e organização de períodos lectivos."
        actions={
          canCreateTurma(user?.papel) ? (
            <Button
              onClick={handleCreate}
              icon={<PlusCircle className="w-4 h-4" />}
            >
              Arquitetar Turma
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-3xl bg-studio-muted/10 border border-studio-border/50 text-center space-y-1">
          <p className="text-[9px] font-black text-studio-foreground-lighter uppercase tracking-widest">Unidades Ativas</p>
          <p className="text-xl font-black text-studio-foreground">{globalStats.total}</p>
          <p className="text-[8px] font-bold text-studio-brand uppercase tracking-tighter">TOTAL DE TURMAS</p>
        </div>
        <div className="p-5 rounded-3xl bg-studio-muted/10 border border-studio-border/50 text-center space-y-1">
          <p className="text-[9px] font-black text-studio-foreground-lighter uppercase tracking-widest">Estudantes</p>
          <p className="text-xl font-black text-studio-foreground">{globalStats.matriculados}</p>
          <p className="text-[8px] font-bold text-studio-brand uppercase tracking-tighter">ALUNOS MATRICULADOS</p>
        </div>
        <div className="p-5 rounded-3xl bg-studio-muted/10 border border-studio-border/50 text-center space-y-1 md:col-span-2">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-black text-studio-foreground-lighter uppercase tracking-widest">Índice de Lotação Global</p>
            <span className={`text-xs font-black ${globalStats.ocupacao >= 90 ? 'text-red-500' : 'text-studio-brand'}`}>{globalStats.ocupacao}%</span>
          </div>
          <div className="h-2 w-full bg-studio-muted/20 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${globalStats.ocupacao >= 90 ? 'bg-red-500' : globalStats.ocupacao >= 70 ? 'bg-amber-500' : 'bg-studio-brand'}`}
              style={{ width: `${globalStats.ocupacao}%` }}
            />
          </div>
          <p className="text-[8px] font-bold text-studio-foreground-lighter uppercase tracking-tighter mt-1">CAPACIDADE TOTAL: {turmas.reduce((acc, t) => acc + (t.capacidade ?? 30), 0)} LUGARES</p>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-studio-muted/10 p-4 rounded-2xl border border-studio-border/40">
        <div className="flex items-center gap-3 w-full max-w-md">
          <Search className="w-5 h-5 text-studio-foreground-lighter" />
          <input
            type="text"
            placeholder="Pesquisar por nome ou ano letivo..."
            value={filterInput}
            onChange={(e) => setFilterInput(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-medium text-studio-foreground w-full placeholder:text-studio-foreground-lighter"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-studio-foreground-lighter" />
            <span className="text-xs font-black uppercase text-studio-foreground-lighter tracking-widest">{turmas.length} Turmas Registadas</span>
          </div>
        </div>
      </div>

      <Modal
        open={formOpen}
        onClose={handleCloseForm}
        title={editingId ? 'Editar Detalhes da Unidade' : 'Configurar Nova Unidade Académica'}
      >
        <TurmaForm
          defaultValues={
            editingTurma
              ? {
                nome: editingTurma.nome,
                anoLetivo: editingTurma.anoLetivo,
                periodo: editingTurma.periodo as any,
                sala: editingTurma.sala,
                capacidade: editingTurma.capacidade
              }
              : undefined
          }
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          isLoading={isFormLoading}
          onDirtyChange={setIsFormDirty}
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
        onCreate={canCreateTurma(user?.papel) ? handleCreate : undefined}
        canEdit={canCreateTurma(user?.papel)}
        canDelete={canDeleteTurma(user?.papel)}
        canGerirAlunos={canManageTurmaAlunos(user?.papel)}
        isLoading={isLoading}
        error={error ?? null}
        totalCount={turmas.length}
      />
    </div>
  )
}
