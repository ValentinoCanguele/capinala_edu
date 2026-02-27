import { useState, useMemo } from 'react'
import { useAlunos, useAlunosFinanceiro, usePermissoes } from '@/data/escola/queries'
import { useCreateAluno, useUpdateAluno, useDeleteAluno } from '@/data/escola/mutations'
import { useAuth } from '@/contexts/AuthContext'
import { canCreateAluno, canEditAluno, canDeleteAluno } from '@/utils/permissions'
import { AlunoForm, AlunosList, AlunosFinanceiroList } from '@/components/alunos'
import Modal from '@/components/Modal'
import PageHeader from '@/components/PageHeader'
import { Badge } from '@/components/shared/Badge'
import { Button } from '@/components/shared/Button'
import { UserPlus, Wallet, Users, AlertCircle, Search, Filter, TrendingUp } from 'lucide-react'
import { exportFinanceiroExcel } from '@/utils/exportExcel'
import { exportFinanceiroPDF } from '@/utils/exportPDF'

export default function Alunos() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'geral' | 'financeiro'>('geral')
  const [filterInput, setFilterInput] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [isFormDirty, setIsFormDirty] = useState(false)

  const { data: alunos = [], isLoading: loadingAlunos, error: errorAlunos } = useAlunos()
  const { data: financeiro = [], isLoading: loadingFinanceiro, error: errorFinanceiro } = useAlunosFinanceiro()

  const createAluno = useCreateAluno()
  const updateAluno = useUpdateAluno()
  const deleteAluno = useDeleteAluno()

  const filteredAlunos = useMemo(() =>
    alunos.filter(a => a.nome.toLowerCase().includes(filterInput.toLowerCase()) || (a.email?.toLowerCase().includes(filterInput.toLowerCase()))),
    [alunos, filterInput]
  )

  const editingAluno = useMemo(() =>
    editingId ? alunos.find(a => a.id === editingId) : null,
    [alunos, editingId]
  )

  const stats = useMemo(() => {
    const total = financeiro.length
    const receita = financeiro.reduce((acc, a) => acc + a.valorPago, 0)
    const divida = financeiro.reduce((acc, a) => acc + a.valorDivida, 0)
    const taxaSucesso = total > 0 ? Math.round((financeiro.filter(a => a.statusFinanceiro === 'Regularizado').length / total) * 100) : 0
    return { total, receita, divida, taxaSucesso }
  }, [financeiro])

  const handleCreate = () => {
    setEditingId(null)
    setFormOpen(true)
    setIsFormDirty(false)
  }

  const handleEdit = (id: string) => {
    setEditingId(id)
    setFormOpen(true)
    setIsFormDirty(false)
  }

  const handleCloseForm = () => {
    if (isFormDirty) {
      if (!window.confirm('Existem alterações não guardadas. Deseja realmente sair?')) {
        return
      }
    }
    setFormOpen(false)
    setEditingId(null)
    setIsFormDirty(false)
  }

  const handleSubmit = (data: any) => {
    if (editingId) {
      updateAluno.mutate({ id: editingId, ...data }, {
        onSuccess: () => {
          setFormOpen(false)
          setEditingId(null)
          setIsFormDirty(false)
        }
      })
    } else {
      createAluno.mutate(data, {
        onSuccess: () => {
          setFormOpen(false)
          setIsFormDirty(false)
        }
      })
    }
  }

  const formatKz = (valor: number) => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(valor)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Estudantes & Matrículas"
        subtitle="Gestão central de identidades académicas, monitorização de assiduidade e situação financeira."
        actions={
          <div className="flex items-center gap-3">
            <div className="bg-studio-muted/10 p-1.5 rounded-2xl flex items-center shadow-inner border border-studio-border/50">
              <button
                onClick={() => setActiveTab('geral')}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'geral' ? 'bg-studio-bg text-studio-brand shadow-sm border border-studio-border/40' : 'text-studio-foreground-lighter hover:text-studio-foreground-light'}`}
              >
                Visão Geral
              </button>
              <button
                onClick={() => setActiveTab('financeiro')}
                className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'financeiro' ? 'bg-studio-bg text-studio-brand shadow-sm border border-studio-border/40' : 'text-studio-foreground-lighter hover:text-studio-foreground-light'}`}
              >
                <Wallet className="w-3.5 h-3.5" /> Financeiro
              </button>
            </div>

            {canCreateAluno(user?.papel) && activeTab === 'geral' && (
              <Button
                variant="primary"
                onClick={handleCreate}
                icon={<UserPlus className="w-4 h-4" />}
                className="ml-2 shadow-lg shadow-studio-brand/20 hover:shadow-xl transition-all rounded-xl font-black uppercase text-[10px] tracking-widest"
              >
                Registar Estudante
              </Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-6 rounded-[2rem] bg-studio-muted/10 border border-studio-border/40 flex items-center gap-5 group hover:border-studio-brand/30 transition-all">
          <div className="p-3.5 bg-studio-brand/10 rounded-2xl text-studio-brand group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-[2px]">Matrículas Ativas</p>
            <h3 className="text-2xl font-black text-studio-foreground tabular-nums">{stats.total}</h3>
          </div>
        </div>

        <div className="p-6 rounded-[2rem] bg-studio-muted/10 border border-studio-border/40 flex items-center gap-5 group hover:border-emerald-500/30 transition-all">
          <div className="p-3.5 bg-emerald-500/10 rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-[2px]">Receita Global</p>
            <h3 className="text-xl font-black text-emerald-600 tabular-nums truncate">{formatKz(stats.receita)}</h3>
          </div>
        </div>

        <div className="p-6 rounded-[2rem] bg-studio-muted/10 border border-studio-border/40 flex items-center gap-5 group hover:border-red-500/30 transition-all">
          <div className="p-3.5 bg-red-500/10 rounded-2xl text-red-500 group-hover:scale-110 transition-transform">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-[2px]">Passivo Ativo</p>
            <h3 className="text-xl font-black text-red-600 tabular-nums truncate">{formatKz(stats.divida)}</h3>
          </div>
        </div>

        <div className="p-6 rounded-[2rem] bg-studio-muted/10 border border-studio-border/40 flex flex-col justify-center gap-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-[2px]">Taxa de Saúde Financeira</p>
            <span className={`text-xs font-black ${stats.taxaSucesso >= 80 ? 'text-emerald-500' : 'text-blue-500'}`}>{stats.taxaSucesso}%</span>
          </div>
          <div className="h-2 w-full bg-studio-muted/20 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${stats.taxaSucesso >= 80 ? 'bg-emerald-500' : stats.taxaSucesso >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
              style={{ width: `${stats.taxaSucesso}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-studio-muted/10 p-4 rounded-2xl border border-studio-border/40">
        <div className="flex items-center gap-3 w-full max-w-md">
          <Search className="w-5 h-5 text-studio-foreground-lighter" />
          <input
            type="text"
            placeholder="Pesquisar por nome, email ou BI..."
            value={filterInput}
            onChange={(e) => setFilterInput(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-medium text-studio-foreground w-full placeholder:text-studio-foreground-lighter"
          />
        </div>
        <div className="flex items-center gap-4">
          {activeTab === 'financeiro' && (
            <div className="flex items-center gap-2 pr-4 border-r border-studio-border/40">
              <Badge variant="warning" className="text-[8px] font-black uppercase tracking-tighter">Dados em Tempo Real</Badge>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-studio-foreground-lighter" />
            <span className="text-xs font-black uppercase text-studio-foreground-lighter tracking-widest">{activeTab === 'geral' ? filteredAlunos.length : financeiro.length} Estudantes</span>
          </div>
        </div>
      </div>

      <Modal
        open={formOpen}
        onClose={handleCloseForm}
        title={editingId ? 'Editar Registo Académico' : 'Registar Nova Identidade Estudantil'}
      >
        <AlunoForm
          defaultValues={editingAluno}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          isLoading={createAluno.isPending || updateAluno.isPending}
          onDirtyChange={setIsFormDirty}
        />
      </Modal>

      {activeTab === 'geral' ? (
        <AlunosList
          alunos={filteredAlunos}
          filter={filterInput}
          onFilterChange={setFilterInput}
          onEdit={handleEdit}
          onDelete={(id) => {
            if (window.confirm('Eliminar permanentemente este registo?')) {
              deleteAluno.mutate(id)
            }
          }}
          onCreate={handleCreate}
          canEdit={canEditAluno(user?.papel)}
          canDelete={canDeleteAluno(user?.papel)}
          isLoading={loadingAlunos}
          error={errorAlunos}
        />
      ) : (
        <AlunosFinanceiroList
          alunos={financeiro}
          filter={filterInput}
          onFilterChange={setFilterInput}
          isLoading={loadingFinanceiro}
          error={errorFinanceiro}
          onExportExcel={() => exportFinanceiroExcel(financeiro)}
          onExportPDF={() => exportFinanceiroPDF(financeiro)}
        />
      )}
    </div>
  )
}
