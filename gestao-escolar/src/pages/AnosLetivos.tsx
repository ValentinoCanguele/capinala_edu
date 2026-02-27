import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useDebounce } from '@/hooks/useDebounce'
import { useQueryState } from '@/hooks/useQueryState'
import { useAuth } from '@/contexts/AuthContext'
import { isAdmin } from '@/lib/permissoes'
import { useAnosLetivos } from '@/data/escola/queries'
import {
  useCreateAnoLetivo,
  useUpdateAnoLetivo,
} from '@/data/escola/mutations'
import type { AnoLetivoFormValues } from '@/schemas/anoLetivo'
import Modal from '@/components/Modal'
import EmptyState from '@/components/shared/EmptyState'
import PageHeader from '@/components/PageHeader'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { Badge } from '@/components/shared/Badge'
import { Input } from '@/components/shared/Input'
import { Calendar, PlusCircle, Search, Edit2, LayoutGrid, Clock, ShieldCheck } from 'lucide-react'
import { formatDateShort } from '@/utils/formatters'

function AnoLetivoForm({
  defaultValues,
  onSubmit,
  onCancel,
  isLoading,
}: {
  defaultValues: AnoLetivoFormValues | null
  onSubmit: (data: AnoLetivoFormValues) => void
  onCancel: () => void
  isLoading: boolean
  onDirtyChange?: (dirty: boolean) => void
}) {
  const [nome, setNome] = useState(defaultValues?.nome ?? '')
  const [dataInicio, setDataInicio] = useState(defaultValues?.dataInicio ?? '')
  const [dataFim, setDataFim] = useState(defaultValues?.dataFim ?? '')

  useEffect(() => {
    const isDirty =
      nome !== (defaultValues?.nome ?? '') ||
      dataInicio !== (defaultValues?.dataInicio ?? '') ||
      dataFim !== (defaultValues?.dataFim ?? '')

    onDirtyChange?.(isDirty)
  }, [nome, dataInicio, dataFim, defaultValues, onDirtyChange])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nome.trim() || !dataInicio || !dataFim) {
      toast.error('Preencha todos os campos.')
      return
    }
    onSubmit({ nome: nome.trim(), dataInicio, dataFim })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Designação do Ano Letivo"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Ex: 2024/2025"
        autoFocus
        required
        leftIcon={<Calendar className="w-4 h-4" />}
        hint="Exemplo: 2024, 2024/25 ou I Semestre 2024."
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Data de Abertura"
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          required
          leftIcon={<Clock className="w-4 h-4 text-emerald-500" />}
        />
        <Input
          label="Data de Encerramento"
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          required
          leftIcon={<Clock className="w-4 h-4 text-red-500" />}
        />
      </div>
      <div className="flex gap-3 justify-end pt-5 border-t border-studio-border/50">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={isLoading} variant="primary">
          {isLoading ? 'A guardar...' : 'Confirmar Ano Letivo'}
        </Button>
      </div>
    </form>
  )
}

export default function AnosLetivos() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterFromUrl, setFilterFromUrl] = useQueryState('q')
  const [filter, setFilter] = useState(() => searchParams.get('q') ?? '')
  const debouncedFilter = useDebounce(filter, 400)

  useEffect(() => {
    setFilter(filterFromUrl)
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
    if (isFormDirty && !window.confirm('Existem alterações não guardadas. Deseja sair?')) return
    setModalOpen(false)
    setEditingId(null)
    setIsFormDirty(false)
    if (searchParams.get('acao') === 'novo') setSearchParams({})
  }

  const { data: anos = [], isLoading, error } = useAnosLetivos()
  const createAno = useCreateAnoLetivo()
  const updateAno = useUpdateAnoLetivo()

  const filtered = useMemo(
    () =>
      debouncedFilter
        ? anos.filter((a) =>
          a.nome.toLowerCase().includes(debouncedFilter.toLowerCase())
        )
        : anos,
    [anos, debouncedFilter]
  )

  const editing = editingId ? anos.find((a) => a.id === editingId) ?? null : null

  const handleCreate = () => {
    setEditingId(null)
    setModalOpen(true)
    setSearchParams({})
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
    setModalOpen(true)
  }

  const handleSubmit = (data: AnoLetivoFormValues) => {
    if (editingId) {
      updateAno.mutate(
        { id: editingId, ...data },
        {
          onSuccess: () => {
            toast.success('Ano letivo atualizado.')
            handleCloseModal()
          },
          onError: (err) => toast.error(err.message),
        }
      )
    } else {
      createAno.mutate(data, {
        onSuccess: () => {
          toast.success('Ano letivo criado.')
          handleCloseModal()
        },
        onError: (err) => toast.error(err.message),
      })
    }
  }

  const isFormLoading = createAno.isPending || updateAno.isPending

  return (
    <div>
      <PageHeader
        title="Planeamento Temporal"
        subtitle="Configuração de anos lectivos, calendários e períodos de vigência institucional."
        actions={
          isAdmin(user?.papel) ? (
            <Button
              onClick={handleCreate}
              icon={<PlusCircle className="w-4 h-4" />}
            >
              Novo Ano Lectivo
            </Button>
          ) : undefined
        }
      />

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-studio-muted/10 p-4 rounded-2xl border border-studio-border/40">
        <div className="flex items-center gap-3 w-full max-w-md">
          <Search className="w-5 h-5 text-studio-foreground-lighter" />
          <input
            type="text"
            placeholder="Pesquisar ciclos lectivos..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-medium text-studio-foreground w-full placeholder:text-studio-foreground-lighter"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-studio-foreground-lighter" />
            <span className="text-xs font-black uppercase text-studio-foreground-lighter tracking-widest">{anos.length} Ciclos Registados</span>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={handleCloseModal}
        title={editingId ? 'Editar ano letivo' : 'Novo ano letivo'}
        size="md"
      >
        <AnoLetivoForm
          defaultValues={
            editing
              ? {
                nome: editing.nome,
                dataInicio: editing.dataInicio,
                dataFim: editing.dataFim,
              }
              : null
          }
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isLoading={isFormLoading}
          onDirtyChange={setIsFormDirty}
        />
      </Modal>

      <Card noPadding className="overflow-hidden border-studio-border/60">
        {isLoading ? (
          <SkeletonTable rows={10} columns={4} />
        ) : error ? (
          <div className="p-8 text-center text-red-600 dark:text-red-400" role="alert">
            Erro crítico: {(error as Error).message}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12">
            <EmptyState
              title={filter ? 'Nenhum ciclo encontrado' : 'Calendários Vazios'}
              description={filter ? 'Refine a sua pesquisa ou limpe os filtros.' : 'Defina os períodos lectivos para iniciar a gestão escolar.'}
              onAction={!filter && isAdmin(user?.papel) ? handleCreate : undefined}
              actionLabel="Criar Primeiro Ano Lectivo"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-studio-border/20" aria-label="Lista de anos letivos">
              <thead className="bg-studio-muted/10">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">Designação / Ciclo</th>
                  <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">Data Início</th>
                  <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">Data Fim</th>
                  <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">Estado</th>
                  {isAdmin(user?.papel) && (
                    <th scope="col" className="px-6 py-4 text-right text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">Gestão</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-studio-border/10">
                {filtered.map((a) => (
                  <tr key={a.id} className="group hover:bg-studio-brand/[0.01] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-studio-brand/10 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-studio-brand" />
                        </div>
                        <span className="text-sm font-black text-studio-foreground uppercase tracking-tight group-hover:text-studio-brand transition-colors">
                          {a.nome}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-studio-foreground-light tabular-nums">
                      {formatDateShort(a.dataInicio, true)}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-studio-foreground-light tabular-nums">
                      {formatDateShort(a.dataFim, true)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="success" className="text-[9px] font-black px-2 py-0.5 border-studio-border/50 uppercase">
                        Vigente
                      </Badge>
                    </td>
                    {isAdmin(user?.papel) && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Edit2 className="w-3.5 h-3.5" />}
                            onClick={() => handleEdit(a.id)}
                            className="text-[10px] font-black uppercase text-studio-brand"
                          >
                            Editar
                          </Button>
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
