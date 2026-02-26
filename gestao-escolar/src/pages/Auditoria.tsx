import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import { useAuditLog, useAlertas, useMeuPapel, type AuditLogEntry } from '@/data/escola/queries'
import { api } from '@/api/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { formatRelativeTime } from '@/utils/formatters'
import PageHeader from '@/components/PageHeader'
import { Card } from '@/components/shared/Card'
import { Badge, type BadgeVariant } from '@/components/shared/Badge'
import { Select } from '@/components/shared/Select'
import { Button } from '@/components/shared/Button'
import EmptyState from '@/components/shared/EmptyState'
import {
  Info,
  ShieldAlert,
  Download,
  Search,
  Database,
  Zap,
  Terminal,
  Fingerprint
} from 'lucide-react'
import Modal from '@/components/shared/Modal'

const ENTIDADES = [
  { value: '', label: 'Todo o Ecossistema' },
  { value: 'aluno', label: 'Estudantes' },
  { value: 'turma', label: 'Turmas' },
  { value: 'disciplina', label: 'Matrizes' },
  { value: 'notas', label: 'Avaliações' },
  { value: 'frequencia', label: 'Assiduidade' },
  { value: 'ocorrencia', label: 'Disciplina' },
]

const ACAO_LABELS: Record<string, { label: string, variant: BadgeVariant }> = {
  criar: { label: 'Criação', variant: 'success' },
  atualizar: { label: 'Mutação', variant: 'brand' },
  eliminar: { label: 'Remoção', variant: 'danger' },
  lancar_nota: { label: 'Graduação', variant: 'brand' },
  registar_frequencia: { label: 'Presença', variant: 'info' },
  publicar_comunicado: { label: 'Emissão', variant: 'brand' },
}

const ROLES_AUDITORIA: ('admin' | 'direcao')[] = ['admin', 'direcao']

export default function Auditoria() {
  const [entidade, setEntidade] = useState('')
  const [filterQuery, setFilterQuery] = useState('')
  const [selectedEntry, setSelectedEntry] = useState<AuditLogEntry | null>(null)
  const queryClient = useQueryClient()
  const { data: meuPapel, isLoading: papelLoading } = useMeuPapel()

  const canViewAuditoria = meuPapel?.papel && ROLES_AUDITORIA.includes(meuPapel.papel as 'admin' | 'direcao')

  const { data: log = [], isLoading: _logLoading } = useAuditLog(
    entidade || undefined,
    100,
    !!canViewAuditoria
  )

  const { data: alertas = [] } = useAlertas(!!canViewAuditoria)

  const resolveAlerta = useMutation({
    mutationFn: async (alertaId: string) => {
      const { data, error } = await api.patch('/api/escola/alertas', { alertaId })
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas'] })
      toast.success('Alerta institucional arquivado.')
    },
    onError: (err: unknown) => toast.error(err instanceof Error ? err.message : String(err))
  })

  const filteredLog = useMemo(() => {
    return log.filter(entry =>
      (entry.usuarioNome || '').toLowerCase().includes(filterQuery.toLowerCase()) ||
      (entry.entidade || '').toLowerCase().includes(filterQuery.toLowerCase()) ||
      (entry.acao || '').toLowerCase().includes(filterQuery.toLowerCase())
    )
  }, [log, filterQuery])

  const exportCSV = () => {
    const headers = ['Data', 'Hora', 'Ação', 'Entidade', 'Autor', 'ID Alvo']
    const content = filteredLog.map(e => [
      new Date(e.criadoEm).toLocaleDateString(),
      new Date(e.criadoEm).toLocaleTimeString(),
      e.acao,
      e.entidade,
      e.usuarioNome || 'Sistema',
      e.entidadeId
    ].join(','))

    const blob = new Blob([[headers.join(','), ...content].join('\n')], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit_report_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  if (!papelLoading && !canViewAuditoria) {
    return (
      <div className="space-y-6">
        <PageHeader title="Câmara de Auditoria" subtitle="Acesso restrito a oficiais superiores." />
        <Card>
          <EmptyState
            title="Acesso Reservado"
            description="Este terminal contém dados sensíveis e requer privilégios de Direção ou Administração."
            icon={<ShieldAlert className="w-16 h-16 text-red-500/20" />}
            actionLabel="Retornar ao Centro de Controle"
            onAction={() => window.location.href = '/'}
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Auditoria & Rastreabilidade"
        subtitle="Forensic analytics do ecossistema escolar: rastreio de mutações e alertas críticos."
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" icon={<Download className="w-4 h-4" />} onClick={exportCSV}>Exportar Relatório</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
        <Card className="lg:col-span-1 p-5 space-y-6 border-studio-border/60 shadow-lg h-fit">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-studio-brand" />
              <h3 className="text-xs font-black text-studio-foreground uppercase tracking-widest">Filtros de Inspeção</h3>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-studio-foreground-lighter" />
              <input
                className="w-full pl-10 pr-4 py-2 bg-studio-muted/10 border border-studio-border rounded-xl text-xs font-bold focus:ring-2 focus:ring-studio-brand outline-none transition-all"
                placeholder="Pesquisar autor ou ação..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
              />
            </div>
            <Select
              label="Escopo da Entidade"
              value={entidade}
              onChange={(e) => setEntidade(e.target.value)}
              options={ENTIDADES}
            />
          </div>

          <div className="pt-6 border-t border-studio-border/50">
            <h4 className="text-[10px] font-black text-studio-foreground-lighter uppercase tracking-widest mb-4">Métricas de Integridade</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-studio-muted/5 p-3 rounded-xl border border-studio-border/40">
                <span className="text-[10px] font-bold text-studio-foreground-lighter uppercase">Eventos/24h</span>
                <Badge variant="brand">{filteredLog.length}</Badge>
              </div>
              <div className="flex justify-between items-center bg-red-500/5 p-3 rounded-xl border border-red-500/10">
                <span className="text-[10px] font-bold text-red-600 uppercase">Alertas Críticos</span>
                <Badge variant="danger" pulse>{alertas.filter(a => a.severidade === 'critico').length}</Badge>
              </div>
            </div>
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-6">
          {/* Alertas Ativos */}
          {alertas.length > 0 && (
            <div className="space-y-3 animate-pulse-slow">
              {alertas.map((a) => (
                <div key={a.id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${a.severidade === 'critico' ? 'bg-red-500/5 border-red-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${a.severidade === 'critico' ? 'bg-red-500/10 text-red-600' : 'bg-amber-500/10 text-amber-600'}`}>
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-studio-foreground uppercase tracking-tight">{a.titulo}</h4>
                    <p className="text-xs text-studio-foreground-light truncate">{a.descricao}</p>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => resolveAlerta.mutate(a.id)}>Arquivar</Button>
                </div>
              ))}
            </div>
          )}

          {/* Log List */}
          <Card noPadding className="overflow-hidden border-studio-border/60 shadow-xl">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-studio-border/50 text-left">
                <thead className="bg-studio-muted/5 text-[10px] font-black uppercase tracking-widest text-studio-foreground-lighter">
                  <tr>
                    <th className="px-6 py-4">Estampado Temporal</th>
                    <th className="px-6 py-4">Ação Técnica</th>
                    <th className="px-6 py-4">Alvo Institucional</th>
                    <th className="px-6 py-4">Oficial Responsável</th>
                    <th className="px-6 py-4 text-right">Dados</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-studio-border/30">
                  {filteredLog.map((entry) => {
                    const actionCfg = ACAO_LABELS[entry.acao] || { label: entry.acao, variant: 'neutral' }
                    return (
                      <tr key={entry.id} className="hover:bg-studio-brand/[0.01] transition-colors group">
                        <td className="px-6 py-4">
                          <p className="text-xs font-black text-studio-foreground leading-none mb-1">{formatRelativeTime(entry.criadoEm)}</p>
                          <p className="text-[10px] font-bold text-studio-foreground-lighter uppercase tracking-tighter">{new Date(entry.criadoEm).toLocaleString()}</p>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={actionCfg.variant} className="text-[10px] font-black uppercase tracking-widest">{actionCfg.label}</Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Database className="w-3.5 h-3.5 text-studio-brand/50" />
                            <span className="text-xs font-bold text-studio-foreground capitalize">{entry.entidade}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-sm bg-studio-muted border border-studio-border/50 flex items-center justify-center text-[10px] font-black uppercase text-studio-foreground-lighter">
                              {entry.usuarioNome?.slice(0, 1) || 'S'}
                            </div>
                            <span className="text-xs font-semibold text-studio-foreground-light">{entry.usuarioNome || 'System Core'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 opacity-20 group-hover:opacity-100"
                            icon={<Terminal className="w-4 h-4" />}
                            onClick={() => setSelectedEntry(entry)}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      <Modal open={!!selectedEntry} onClose={() => setSelectedEntry(null)} title="Inspeção de Payload de Dados" size="md">
        {selectedEntry && (
          <div className="space-y-6">
            <div className="p-4 bg-studio-bg border border-studio-border rounded-2xl space-y-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-studio-foreground-lighter px-1">
                <span>Estado de Mutação</span>
                <span>Diferencial de Dados</span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-zinc-950 p-6 rounded-3xl overflow-auto border-4 border-zinc-900 group relative">
                  <div className="absolute top-4 right-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">JSON Payload</div>
                  <pre className="text-emerald-400 font-mono text-[11px] leading-relaxed">
                    {JSON.stringify(selectedEntry.dadosDepois || selectedEntry, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex gap-3">
              <Info className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-[10px] text-amber-700 leading-relaxed font-bold uppercase tracking-tighter">
                ESTE REGISTO É IMUTÁVEL. QUALQUER TENTATIVA DE ALTERAÇÃO DO LOG SERÁ DETETADA PELO SISTEMA DE AUDITORIA DE SEGUNDA CAMADA.
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
