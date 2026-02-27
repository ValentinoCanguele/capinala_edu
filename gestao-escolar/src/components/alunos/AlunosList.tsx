import { useState } from 'react'
import { Search, MoreVertical, Edit2, Trash2, Calendar, CheckSquare, Square, UserMinus, Filter, Phone, Mail, CreditCard, FileText, UserCheck, UserSearch, Trash } from 'lucide-react'
import type { Aluno } from '@/data/escola/queries'
import { formatAlunoDisplayId } from '@/utils/formatters'
import { exportCartaoEstudantePDF } from '@/utils/exportPDF'
import toast from 'react-hot-toast'
import { Badge } from '@/components/shared/Badge'
import { ContextMenu, type MenuItem } from '@/components/shared/ContextMenu'
import { Button } from '@/components/shared/Button'
import { Tooltip } from '@/components/shared/Tooltip'
import { Avatar } from '@/components/shared/Avatar'
import { SkeletonTable } from '@/components/shared/SkeletonTable'
import { Card } from '@/components/shared/Card'
import { Input } from '@/components/shared/Input'
import EmptyState from '@/components/shared/EmptyState'

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

  const handleEmitirCartao = (a: Aluno) => {
    try {
      exportCartaoEstudantePDF({
        escola: 'Instituto Capiñala',
        alunoNome: a.nome,
        alunoId: a.id,
        fotoUrl: a.fotoUrl
      })
      toast.success('Cartão gerado com sucesso.')
    } catch (e) {
      toast.error('Erro ao gerar cartão.')
    }
  }

  return (
    <>
      <div className="mb-6">
        <Input
          placeholder="Pesquisar estudantes por nome ou email..."
          value={filter}
          onChange={(e) => onFilterChange(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
          onClear={() => onFilterChange('')}
          className="max-w-md shadow-sm"
          autoFocus
          aria-label="Pesquisar estudantes por nome ou email"
        />
      </div>

      <Card noPadding>
        {isLoading ? (
          <div role="status" aria-live="polite" aria-label="A carregar lista de alunos">
            <SkeletonTable rows={8} columns={4} />
          </div>
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
          <div className="table-scroll-container overflow-x-auto">
            <table className="min-w-full divide-y divide-studio-border/50" aria-label="Lista de alunos">
              <thead>
                <tr className="bg-studio-bg/95 backdrop-blur-md border-b border-studio-border/50">
                  <th scope="col" className="sticky left-0 z-20 px-5 py-4 w-10 bg-studio-muted/5 border-r border-studio-border/30 shadow-[2px_0_4px_rgba(0,0,0,0.04)]">
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
                  <th scope="col" className="sticky left-10 z-20 px-5 py-4 text-left text-[10px] font-black text-studio-foreground-light uppercase tracking-widest bg-studio-muted/5 min-w-[200px] border-r border-studio-border/30 shadow-[2px_0_4px_rgba(0,0,0,0.04)]">
                    Estudante
                  </th>
                  <th scope="col" className="px-5 py-4 text-left text-[10px] font-black text-studio-foreground-light uppercase tracking-widest bg-studio-muted/5">
                    BI / Identificação
                  </th>
                  <th scope="col" className="px-5 py-4 text-left text-[10px] font-black text-studio-foreground-light uppercase tracking-widest bg-studio-muted/5">
                    Contacto / Email
                  </th>
                  <th scope="col" className="px-5 py-4 text-left text-[10px] font-black text-studio-foreground-light uppercase tracking-widest bg-studio-muted/5">
                    Nascimento
                  </th>
                  <th scope="col" className="px-5 py-4 text-left text-[10px] font-black text-studio-foreground-light uppercase tracking-widest bg-studio-muted/5">
                    Situação
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
                  menuItems.push({ label: 'Histórico Financeiro', icon: <FileText className="w-4 h-4" />, onClick: () => { } })
                  menuItems.push({ label: 'Emitir Cartão', icon: <CreditCard className="w-4 h-4" />, onClick: () => handleEmitirCartao(a) })
                  if (canEdit && canDelete) menuItems.push({ separator: true })
                  if (canDelete) menuItems.push({ label: 'Eliminar Registo', icon: <Trash2 className="w-4 h-4" />, onClick: () => onDelete(a.id), danger: true })

                  const isSelected = selectedIds.has(a.id)

                  return (
                    <tr
                      key={a.id}
                      className={`group transition-all duration-200 border-l-2 ${isSelected ? 'bg-studio-brand/[0.03] border-studio-brand' : 'hover:bg-studio-muted/5 border-transparent'}`}
                    >
                      <td className="sticky left-0 z-10 px-5 py-4 whitespace-nowrap bg-studio-bg border-r border-studio-border/30 group-hover:bg-studio-muted/5">
                        <button
                          onClick={(e) => handleSelect(index, e)}
                          className={`flex items-center justify-center transition-colors ${isSelected ? 'text-studio-brand' : 'text-studio-border group-hover:text-studio-foreground-lighter'}`}
                        >
                          {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="sticky left-10 z-10 px-5 py-4 whitespace-nowrap bg-studio-bg min-w-[200px] border-r border-studio-border/30 group-hover:bg-studio-muted/5">
                        <div className="flex items-center gap-4">
                          <Avatar name={a.nome} size="md" shape="square" className="border border-studio-border/50 shadow-sm" />
                          <span className="text-sm font-black text-studio-foreground group-hover:text-studio-brand transition-colors tracking-tight uppercase">
                            {a.nome}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-studio-foreground uppercase tracking-tight">{a.bi || 'Não Consta'}</span>
                          <Tooltip content={<span className="text-xs font-mono break-all">{a.id}</span>} position="top">
                            <span className="inline-flex items-center gap-1 rounded-md bg-studio-muted/60 px-1.5 py-0.5 text-[8px] font-mono font-medium text-studio-foreground-lighter tabular-nums cursor-default w-fit">
                              {formatAlunoDisplayId(a.id)}
                            </span>
                          </Tooltip>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap max-w-[200px] sm:max-w-[240px]">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-xs text-studio-foreground font-bold leading-none">
                            <Phone className="w-3 h-3 text-studio-brand" />
                            <span>{a.telefone || '—'}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-studio-foreground-lighter font-medium truncate">
                            <Mail className="w-2.5 h-2.5" />
                            <span className="truncate" title={a.email || undefined}>{a.email || '—'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-xs text-studio-foreground-lighter tabular-nums">
                          <Calendar className="w-3 h-3 text-studio-muted" />
                          <span>{a.dataNascimento}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <Badge variant="success" className="text-[9px] font-black px-2 py-0.5">
                          <UserCheck className="w-2.5 h-2.5 mr-1" />
                          MATRICULADO
                        </Badge>
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
                                aria-label={`Editar ${a.nome}`}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            {menuItems.length > 0 && (
                              <ContextMenu items={menuItems}>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="w-8 h-8 text-studio-muted hover:text-studio-brand"
                                  aria-label={`Mais opções para ${a.nome}`}
                                >
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
