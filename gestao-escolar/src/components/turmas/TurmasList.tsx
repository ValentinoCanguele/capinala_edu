import { Edit2, Trash2, Users, MoreVertical, LayoutGrid, Search } from 'lucide-react'
import type { Turma } from '@/data/escola/queries'
import EmptyState from '@/components/shared/EmptyState'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { Avatar } from '@/components/shared/Avatar'
import { Card } from '@/components/shared/Card'
import { ContextMenu, type MenuItem } from '@/components/shared/ContextMenu'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { ProgressBar } from '@/components/shared/ProgressBar'
import ListResultSummary from '@/components/shared/ListResultSummary'

const LOTACAO_MAX = 30

function LotacaoBar({ current, max = LOTACAO_MAX }: { current: number; max?: number }) {
  const pct = max > 0 ? Math.min(100, (current / max) * 100) : 0
  const variant = pct >= 100 ? 'error' : pct >= 80 ? 'warning' : 'brand'
  return (
    <div className="w-24 min-w-[6rem]">
      <ProgressBar
        value={pct}
        size="sm"
        variant={variant}
        label={`${current}/${max}`}
        className="text-xs"
      />
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
        <table className="min-w-full divide-y divide-studio-border/50" aria-label="Lista de turmas">
          <thead className="sticky top-0 z-10 bg-studio-bg/95 backdrop-blur-sm">
            <tr className="bg-studio-muted/10">
              <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-studio-foreground-light uppercase tracking-wider">
                Turma
              </th>
              <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-studio-foreground-light uppercase tracking-wider">
                Ano Letivo
              </th>
              <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-studio-foreground-light uppercase tracking-wider">
                Lotação Atual
              </th>
              {showActions && (
                <th scope="col" className="px-5 py-3 text-right text-xs font-semibold text-studio-foreground-light uppercase tracking-wider">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-studio-border/30">
            {turmas.map((t) => {
              const menuItems: MenuItem[] = []
              if (canGerirAlunos) menuItems.push({ label: 'Gerir Estudantes', icon: <Users className="w-4 h-4" />, onClick: () => onGerirAlunos(t.id) })
              if (canGerirAlunos && (canEdit || canDelete)) menuItems.push({ separator: true })
              if (canEdit) menuItems.push({ label: 'Editar Configurações', icon: <Edit2 className="w-4 h-4" />, onClick: () => onEdit(t.id) })
              if (canEdit && canDelete) menuItems.push({ separator: true })
              if (canDelete) menuItems.push({ label: 'Remover Turma', icon: <Trash2 className="w-4 h-4" />, onClick: () => onDelete(t.id), danger: true })

              return (
                <tr key={t.id} className="group hover:bg-studio-muted/20 transition-all duration-200">
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar name={t.nome} shape="square" size="md" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-studio-foreground group-hover:text-studio-brand transition-colors">{t.nome}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-studio-foreground-light font-medium">
                    {t.anoLetivo}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-sm text-studio-foreground-lighter">
                    <LotacaoBar current={t.alunoIds?.length ?? 0} max={30} />
                  </td>
                  {showActions && (
                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    {menuItems.length > 0 ? (
                      <ContextMenu items={menuItems}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label={`Mais opções para turma ${t.nome}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </ContextMenu>
                    ) : null}
                  </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </Card>
    </>
  )
}
