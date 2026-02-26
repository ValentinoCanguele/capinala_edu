import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { useDebounce } from '@/hooks/useDebounce'
import { useQueryState } from '@/hooks/useQueryState'
import { useAuth } from '@/contexts/AuthContext'
import { canCreateAluno, canDeleteAluno } from '@/lib/permissoes'
import { useAlunos, useAlunosFinanceiro } from '@/data/escola/queries'
import {
  useCreateAluno,
  useUpdateAluno,
  useDeleteAluno,
} from '@/data/escola/mutations'
import type { AlunoFormValues } from '@/schemas/aluno'
import { AlunoForm, AlunosList, AlunosFinanceiroList } from '@/components/alunos'
import Modal from '@/components/Modal'
import PageHeader from '@/components/PageHeader'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { UserPlus, Wallet, Users, AlertCircle } from 'lucide-react'
import { exportFinanceiroExcel } from '@/utils/exportExcel'
import { exportFinanceiroPDF } from '@/utils/exportPDF'

export default function Alunos() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'geral' | 'financeiro'>('geral')
  const [filterFromUrl, setFilterFromUrl] = useQueryState('q')
  const [filterInput, setFilterInput] = useState(() => searchParams.get('q') ?? '')
  const debouncedFilter = useDebounce(filterInput, 400)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

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
    setFormOpen(false)
    setEditingId(null)
    if (searchParams.get('acao') === 'novo') setSearchParams({})
  }

  const { data: alunos = [], isLoading: alunosLoading, error } = useAlunos()
  const { data: financeiro = [], isLoading: financeiroLoading, error: financeiroError } = useAlunosFinanceiro()
  const createAluno = useCreateAluno()
  const updateAluno = useUpdateAluno()
  const deleteAluno = useDeleteAluno()

  const filteredAlunos = useMemo(
    () =>
      debouncedFilter
        ? alunos.filter((a) =>
          a.nome.toLowerCase().includes(debouncedFilter.toLowerCase())
        )
        : alunos,
    [alunos, debouncedFilter]
  )

  const editingAluno = editingId
    ? alunos.find((a) => a.id === editingId) ?? null
    : null

  const handleCreate = () => {
    setEditingId(null)
    setFormOpen(true)
    setSearchParams({})
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
        const toastId = toast.success('Aluno eliminado.', {
          duration: 6000
        })
        queryClient.invalidateQueries({ queryKey: ['escola', 'alunos'] })
        setItemToDelete(null)
      },
      onError: (err) => {
        toast.error(err.message)
        setItemToDelete(null)
      },
    })
  }

  // Dashboard calculations 🇦🇴
  const stats = useMemo(() => {
    const totalAlunos = financeiro.length;
    const receitaMensal = financeiro.reduce((acc, curr) => acc + curr.valorPago, 0);
    const dividaAtiva = financeiro.reduce((acc, curr) => acc + curr.valorDivida, 0);
    const regularizados = financeiro.filter(a => a.statusFinanceiro === 'Regularizado').length;

    return {
      total: totalAlunos,
      receita: receitaMensal,
      divida: dividaAtiva,
      taxaSucesso: totalAlunos > 0 ? Math.round((regularizados / totalAlunos) * 100) : 0
    }
  }, [financeiro]);

  const formatKz = (valor: number) => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(valor)
  }

  const handleExportExcel = () => {
    try {
      exportFinanceiroExcel(financeiro);
      toast.success('Relatório Excel exportado com sucesso.');
    } catch (e) {
      toast.error('Erro ao gerar a planilha.');
    }
  };

  const handleExportPDF = () => {
    try {
      exportFinanceiroPDF(financeiro);
      toast.success('Relatório PDF exportado com sucesso.');
    } catch (e) {
      toast.error('Erro ao gerar o PDF Institucional.');
      console.error(e);
    }
  };

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
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setItemToDelete(null)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={confirmDelete}
            loading={deleteAluno.isPending}
            disabled={deleteAluno.isPending}
          >
            Eliminar Aluno
          </Button>
        </div>
      </Modal>

      <PageHeader
        title="Estudantes & Matrículas"
        subtitle="Gestão geral de alunos, controlo de dívidas e dados institucionais."
        actions={
          <div className="flex items-center gap-3">
            <div className="bg-studio-muted/10 p-1 rounded-xl flex items-center shadow-inner border border-studio-border/50">
              <button
                onClick={() => setActiveTab('geral')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'geral' ? 'bg-studio-bg text-studio-foreground shadow-sm' : 'text-studio-muted hover:text-studio-foreground-lighter'}`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('financeiro')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'financeiro' ? 'bg-studio-bg text-studio-foreground shadow-sm' : 'text-studio-muted hover:text-studio-foreground-lighter'}`}
              >
                <Wallet className="w-3 h-3" /> Financeiro
              </button>
            </div>

            {canCreateAluno(user?.papel) && activeTab === 'geral' && (
              <Button
                variant="primary"
                onClick={handleCreate}
                icon={<UserPlus className="w-4 h-4" />}
                className="ml-2 shadow-lg hover:shadow-xl transition-all"
              >
                Novo Estudante
              </Button>
            )}
          </div>
        }
      />

      {activeTab === 'financeiro' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-studio-border/60 hover:border-studio-brand/30 transition-colors shadow-sm bg-gradient-to-br from-studio-bg to-studio-muted/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-studio-brand/10 rounded-xl">
                <Users className="w-5 h-5 text-studio-brand" />
              </div>
              <div>
                <p className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest">Matrículas Ativas</p>
                <h3 className="text-2xl font-black text-studio-foreground mt-0.5">{stats.total}</h3>
              </div>
            </div>
          </Card>

          <Card className="border-studio-border/60 hover:border-emerald-500/30 transition-colors shadow-sm bg-gradient-to-br from-studio-bg to-emerald-500/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <Wallet className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest">Receita Global</p>
                <h3 className="text-xl font-black text-emerald-500 truncate mt-0.5">
                  {formatKz(stats.receita)}
                </h3>
              </div>
            </div>
          </Card>

          <Card className="border-studio-border/60 hover:border-red-500/30 transition-colors shadow-sm bg-gradient-to-br from-studio-bg to-red-500/5">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                <p className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest">Passivo (Dívidas)</p>
                <h3 className="text-xl font-black text-red-500 truncate mt-0.5">
                  {formatKz(stats.divida)}
                </h3>
              </div>
            </div>
          </Card>

          <Card className="border-studio-border/60 shadow-sm bg-studio-bg flex flex-col justify-center">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest">Taxa de Sucesso</span>
              <span className="text-xs font-bold text-studio-foreground">{stats.taxaSucesso}%</span>
            </div>
            <div className="w-full bg-studio-border/50 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-1000 ${stats.taxaSucesso >= 80 ? 'bg-emerald-500' : stats.taxaSucesso >= 50 ? 'bg-warning' : 'bg-red-500'}`}
                style={{ width: `${stats.taxaSucesso}%` }}
              />
            </div>
          </Card>
        </div>
      )}

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

      {activeTab === 'geral' ? (
        <AlunosList
          alunos={filteredAlunos}
          filter={filterInput}
          onFilterChange={setFilterInput}
          onEdit={(id) => {
            setEditingId(id)
            setFormOpen(true)
          }}
          onDelete={setItemToDelete}
          onCreate={canCreateAluno(user?.papel) ? handleCreate : undefined}
          canEdit={canCreateAluno(user?.papel)}
          canDelete={canDeleteAluno(user?.papel)}
          isLoading={alunosLoading}
          error={error ?? null}
        />
      ) : (
        <AlunosFinanceiroList
          alunos={financeiro}
          filter={filterInput}
          onFilterChange={setFilterInput}
          isLoading={financeiroLoading}
          error={financeiroError ?? null}
          onExportExcel={handleExportExcel}
          onExportPDF={handleExportPDF}
        />
      )}
    </div>
  )
}
