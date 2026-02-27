import { Edit2, Trash2, Users, MoreVertical, LayoutGrid, Search, Calendar } from 'lucide-react'
import type { Turma } from '@/data/escola/queries'
import EmptyState from '@/components/shared/EmptyState'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { Card } from '@/components/shared/Card'
import { ContextMenu, type MenuItem } from '@/components/shared/ContextMenu'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { ProgressBar } from '@/components/shared/ProgressBar'
import ListResultSummary from '@/components/shared/ListResultSummary'
import { Badge } from '@/components/shared/Badge'

const LOTACAO_MAX = 30

function LotacaoBar({ current, max = LOTACAO_MAX }: { current: number; max?: number }) {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0
  const variant = pct >= 100 ? 'error' : pct >= 80 ? 'warning' : 'success'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-[100px]">
        <ProgressBar
          value={pct}
          size="sm"
          variant={variant}
          className="h-1.5"
        />
      </div>
      <span className={`text-[10px] font-black uppercase tabular-nums tracking-tighter ${pct >= 100 ? 'text-red-500' : 'text-studio-foreground-lighter'}`}>
        {current}/{max}
      </span>
    </div>
  )
}

interface TurmasListProps {
  turmas: Turma[]
  filter?: string
  onFilterChange?: (value: string) => void
  totalCount?: number
  onGerirAlunos: (turmaId: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onCreate?: () => void
  canEdit?: boolean
  canDelete?: boolean
  canGerirAlunos?: boolean
  isLoading: boolean
  error: Error | null
}

export default function TurmasList({
  turmas,
  filter = '',
  onFilterChange,
  totalCount,
  onGerirAlunos,
  onEdit,
  onDelete,
  onCreate,
  canEdit = true,
  canDelete = true,
  canGerirAlunos = true,
  isLoading,
  error,
}: TurmasListProps) {
  const hasFilter = filter.length > 0
  const total = totalCount ?? turmas.length
  const showActions = canEdit || canDelete || canGerirAlunos

  return (
    <>
      {onFilterChange && (
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <Input
            placeholder="Pesquisar por nome ou ano letivo..."
            value={filter}
            onChange={(e) => onFilterChange(e.target.value)}
            onClear={() => onFilterChange('')}
            showClearButton
            leftIcon={<Search className="h-4 w-4" />}
            className="max-w-md"
            aria-label="Pesquisar turmas"
          />
          <ListResultSummary
            count={turmas.length}
            total={total}
            label="turma"
            hasFilter={hasFilter}
            onClearFilter={() => onFilterChange('')}
            isLoading={isLoading}
          />
        </div>
      )}
      <Card noPadding>
        {isLoading ? (
          <div role="status" aria-live="polite" aria-label="A carregar lista de turmas">
            <SkeletonTable rows={8} columns={4} />
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-500/5" role="alert">
            <p className="font-semibold">Erro ao carregar turmas</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        ) : turmas.length === 0 ? (
          <EmptyState
            title={hasFilter ? 'Nenhuma turma encontrada' : 'Nenhuma turma registada'}
            description={hasFilter ? 'Tente outro termo de pesquisa.' : 'As turmas são o eixo central da organização escolar. Crie a primeira para começar.'}
            icon={<LayoutGrid className="h-12 w-12" />}
            actionLabel={hasFilter || !onCreate ? undefined : 'Criar Nova Turma'}
            onAction={hasFilter || !onCreate ? undefined : onCreate}
          />
        ) : (
          <div className="overflow-x-auto max-h-[70vh] overflow-y-auto custom-scrollbar">
            <table className="min-w-full divide-y divide-studio-border/50" aria-label="Lista de turmas">
              <thead className="sticky top-0 z-30 bg-studio-bg">
                <tr className="bg-studio-muted/10">
                  <th scope="col" className="sticky left-0 z-40 px-6 py-4 text-left text-[10px] font-black text-studio-foreground-light uppercase tracking-widest bg-studio-muted/10 min-w-[180px] border-r border-studio-border/30 shadow-[2px_0_4px_rgba(0,0,0,0.04)]">
                    Turma / Unidade
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">
                    Vigência Académica
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-[10px] font-black text-studio-foreground-light uppercase tracking-widest min-w-[200px]">
                    Lotação & Ocupação
                  </th>
                  {showActions && (
                    <th scope="col" className="px-6 py-4 text-right text-[10px] font-black text-studio-foreground-light uppercase tracking-widest">
                      Gestão de Vagas
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-studio-border/20">
                {turmas.map((t) => {
                  const menuItems: MenuItem[] = []
                  if (canGerirAlunos) menuItems.push({ label: 'Gerir Estudantes', icon: <Users className="w-4 h-4" />, onClick: () => onGerirAlunos(t.id) })
                  if (canGerirAlunos && (canEdit || canDelete)) menuItems.push({ separator: true })
                  if (canEdit) menuItems.push({ label: 'Editar Configurações', icon: <Edit2 className="w-4 h-4" />, onClick: () => onEdit(t.id) })
                  if (canEdit && canDelete) menuItems.push({ separator: true })
                  if (canDelete) menuItems.push({ label: 'Remover Turma', icon: <Trash2 className="w-4 h-4" />, onClick: () => onDelete(t.id), danger: true })

                  return (
                    <tr key={t.id} className="group hover:bg-studio-brand/[0.01] transition-all duration-200">
                      <td className="sticky left-0 z-20 px-6 py-5 whitespace-nowrap bg-studio-bg border-r border-studio-border/30 group-hover:bg-studio-brand/[0.02] shadow-[2px_0_4px_rgba(0,0,0,0.02)]">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-studio-brand/10 border border-studio-brand/20 flex items-center justify-center font-black text-studio-brand shadow-sm transition-transform group-hover:scale-105">
                            {t.nome.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-studio-foreground group-hover:text-studio-brand transition-colors uppercase tracking-tight leading-none mb-1.5">{t.nome}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="neutral" className="text-[8px] font-black uppercase py-0 px-1.5 opacity-60">Matriz Regular</Badge>
                              {t.periodo && (
                                <Badge variant="info" className="text-[8px] font-black uppercase py-0 px-1.5 opacity-80">{t.periodo}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-studio-brand/60" />
                          <span className="text-[11px] font-black text-studio-foreground uppercase tracking-tight">{t.anoLetivo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <LotacaoBar current={t.alunoIds?.length ?? 0} max={t.capacidade ?? 30} />
                      </td>
                      {showActions && (
                        <td className="px-6 py-5 whitespace-nowrap text-right">
                          <div className="flex justify-end items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onGerirAlunos(t.id)}
                              className="text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:bg-studio-brand/5 text-studio-brand border border-transparent hover:border-studio-brand/20 rounded-xl"
                              icon={<Users className="w-3.5 h-3.5" />}
                            >
                              Matrículas
                            </Button>
                            <ContextMenu items={menuItems}>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-studio-foreground-lighter"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </ContextMenu>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
