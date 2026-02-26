import { useState } from 'react'
import { Search, MoreVertical, Edit2, Trash2, UserSearch, Hash, Mail, Calendar, Trash, CheckSquare, Square, UserMinus } from 'lucide-react'
import type { Aluno } from '@/data/escola/queries'
import EmptyState from '@/components/shared/EmptyState'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { Card } from '@/components/shared/Card'
import { Input } from '@/components/shared/Input'
import { Avatar } from '@/components/shared/Avatar'
import { ContextMenu, type MenuItem } from '@/components/shared/ContextMenu'
import { Button } from '@/components/shared/Button'

interface AlunosListProps {
  alunos: Aluno[]
  filter: string
  onFilterChange: (value: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onCreate?: () => void
  /** Esconder botão Editar e opção Eliminar quando false (ex.: professor só vê lista). */
  canEdit?: boolean
  canDelete?: boolean
  isLoading: boolean
  error: Error | null
}

export default function AlunosList({
  alunos,
  filter,
  onFilterChange,
  onEdit,
  onDelete,
  onCreate,
  canEdit = true,
  canDelete = true,
  isLoading,
  error,
}: AlunosListProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null)
  const hasFilter = filter.length > 0

  const toggleSelectAll = () => {
    if (selectedIds.size === alunos.length && alunos.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(alunos.map(a => a.id)))
    }
  }

  const handleSelect = (idx: number, e: React.MouseEvent) => {
    const id = alunos[idx].id
    const newSelected = new Set(selectedIds)
    const isShift = e.shiftKey

    if (isShift && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, idx)
      const end = Math.max(lastSelectedIndex, idx)
      const rangeIds = alunos.slice(start, end + 1).map(a => a.id)
      rangeIds.forEach(rid => newSelected.add(rid))
    } else {
      if (newSelected.has(id)) newSelected.delete(id)
      else newSelected.add(id)
    }

    setSelectedIds(newSelected)
    setLastSelectedIndex(idx)
  }

  return (
    <>
      <div className="mb-6">
        <Input
          placeholder="Pesquisar estudantes por nome ou email..."
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          className="max-w-md shadow-sm"
          autoFocus
          aria-label="Pesquisar estudantes por nome ou email"
        />
      </div>

      <Card noPadding>
        {isLoading ? (
          <SkeletonTable rows={8} columns={4} />
        ) : error ? (
          <div className="p-8 text-center text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-500/5" role="alert">
            <p className="font-semibold">Erro ao carregar alunos</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        ) : alunos.length === 0 ? (
          <EmptyState
            title={hasFilter ? 'Nenhum aluno encontrado' : 'Nenhum aluno registado'}
            description={hasFilter ? 'Tente outro termo de pesquisa ou verifique a ortografia.' : 'Comece por adicionar o primeiro estudante à plataforma.'}
            icon={<UserSearch className="h-12 w-12" />}
            actionLabel={!hasFilter && onCreate ? 'Registar Novo Aluno' : undefined}
            onAction={onCreate}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-studio-border/50" aria-label="Lista de alunos">
              <thead className="sticky top-0 z-10">
                <tr className="bg-studio-bg/95 backdrop-blur-md border-b border-studio-border/50">
                  <th scope="col" className="px-5 py-4 w-10 bg-studio-muted/5">
                    <button
                      onClick={toggleSelectAll}
                      className="flex items-center justify-center text-studio-muted hover:text-studio-brand transition-colors"
                    >
                      {selectedIds.size === alunos.length && alunos.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-studio-brand" />
                      ) : selectedIds.size > 0 ? (
                        <Square className="w-4 h-4 text-studio-brand opacity-50" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th scope="col" className="px-5 py-4 text-left text-[10px] font-black text-studio-foreground-light uppercase tracking-widest bg-studio-muted/5">
                    Identificação do Estudante
                  </th>
                  <th scope="col" className="px-5 py-4 text-left text-[10px] font-black text-studio-foreground-light uppercase tracking-widest bg-studio-muted/5">
                    Contacto Institucional
                  </th>
                  <th scope="col" className="px-5 py-4 text-left text-[10px] font-black text-studio-foreground-light uppercase tracking-widest bg-studio-muted/5">
                    Nascimento
                  </th>
                  {(canEdit || canDelete) && (
                    <th scope="col" className="px-5 py-4 text-right text-[10px] font-black text-studio-foreground-light uppercase tracking-widest bg-studio-muted/5">
                      Gestão
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-studio-border/30">
                {alunos.map((a, index) => {
                  const menuItems: MenuItem[] = []
                  if (canEdit) menuItems.push({ label: 'Editar Perfil', icon: <Edit2 className="w-4 h-4" />, onClick: () => onEdit(a.id) })
                  if (canEdit && canDelete) menuItems.push({ separator: true })
                  if (canDelete) menuItems.push({ label: 'Eliminar Registo', icon: <Trash2 className="w-4 h-4" />, onClick: () => onDelete(a.id), danger: true })

                  const isSelected = selectedIds.has(a.id)

                  return (
                    <tr
                      key={a.id}
                      className={`group transition-all duration-200 border-l-2 ${isSelected ? 'bg-studio-brand/[0.03] border-studio-brand' : 'hover:bg-studio-muted/5 border-transparent'}`}
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <button
                          onClick={(e) => handleSelect(index, e)}
                          className={`flex items-center justify-center transition-colors ${isSelected ? 'text-studio-brand' : 'text-studio-border group-hover:text-studio-foreground-lighter'}`}
                        >
                          {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          <Avatar name={a.nome} size="md" shape="square" />
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-bold text-studio-foreground group-hover:text-studio-brand transition-colors tracking-tight">
                              {a.nome}
                            </span>
                            <div className="flex items-center gap-1.5 opacity-50 text-[10px] font-mono uppercase tracking-tighter">
                              <Hash className="w-2.5 h-2.5" />
                              <span>ALN-{a.id.slice(-6).toUpperCase()}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-studio-foreground-light font-medium">
                          <Mail className="w-3.5 h-3.5 text-studio-muted" />
                          <span>{a.email || '—'}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm text-studio-foreground-lighter tabular-nums">
                          <Calendar className="w-3.5 h-3.5 text-studio-muted" />
                          <span>{a.dataNascimento}</span>
                        </div>
                      </td>
                      {(canEdit || canDelete) && (
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-1">
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(a.id)}
                              className="w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity text-studio-muted hover:text-studio-brand"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                          {menuItems.length > 0 && (
                            <ContextMenu items={menuItems}>
                              <Button variant="ghost" size="icon" className="w-8 h-8 text-studio-muted hover:text-studio-brand">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </ContextMenu>
                          )}
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

      {/* Floating Action Bar (Premium UI) */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-studio-foreground/95 backdrop-blur-md text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-8 animate-in slide-in-from-bottom-10 fade-in duration-500 z-[100] border border-white/10">
          <div className="flex items-center gap-3 pr-8 border-r border-white/10">
            <div className="bg-studio-brand h-6 w-6 rounded-full flex items-center justify-center text-xs font-black">
              {selectedIds.size}
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-white/80">Seleccionados</span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="text-white hover:bg-white/10 h-9 px-4">
              <UserMinus className="w-4 h-4 mr-2" />
              Suspender
            </Button>
            {canDelete && (
              <Button size="sm" variant="ghost" className="text-white hover:bg-red-500/20 hover:text-red-400 h-9 px-4">
                <Trash className="w-4 h-4 mr-2" />
                Eliminar {selectedIds.size > 1 ? 'Múltiplos' : ''}
              </Button>
            )}
            <div className="w-px h-6 bg-white/10 mx-2" />
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds(new Set())} className="text-white/60 hover:text-white h-9">
              Desmarcar
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
