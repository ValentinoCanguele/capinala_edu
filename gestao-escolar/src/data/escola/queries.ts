import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'

const ESCOLA_API = '/api/escola'

export interface Aluno {
  id: string
  nome: string
  email: string
  dataNascimento: string
}

export interface Turma {
  id: string
  nome: string
  anoLetivo: string
  anoLetivoId?: string
  alunoIds: string[]
}

export interface Disciplina {
  id: string
  nome: string
}

export interface AnoLetivo {
  id: string
  nome: string
  dataInicio: string
  dataFim: string
}

export interface Periodo {
  id: string
  numero: number
  nome: string
  dataInicio: string | null
  dataFim: string | null
}

export interface NotaRow {
  id: string
  alunoId: string
  alunoNome: string
  valor: number
}

const queryKeys = {
  alunos: ['escola', 'alunos'] as const,
  aluno: (id: string) => ['escola', 'aluno', id] as const,
  turmas: ['escola', 'turmas'] as const,
  turma: (id: string) => ['escola', 'turma', id] as const,
  disciplinas: ['escola', 'disciplinas'] as const,
  anosLetivos: ['escola', 'anosLetivos'] as const,
  periodos: (anoLetivoId: string) => ['escola', 'periodos', anoLetivoId] as const,
  notas: (turmaId: string, periodoId: string) =>
    ['escola', 'notas', turmaId, periodoId] as const,
  boletim: (alunoId: string, anoLetivoId?: string) =>
    ['escola', 'boletim', alunoId, anoLetivoId] as const,
  meuPapel: ['escola', 'meu-papel'] as const,
  meusFilhos: ['escola', 'meus-filhos'] as const,
  horarios: (turmaId?: string, anoLetivoId?: string) =>
    ['escola', 'horarios', turmaId, anoLetivoId] as const,
  salas: ['escola', 'salas'] as const,
  comunicados: ['escola', 'comunicados'] as const,
  comunicado: (id: string) => ['escola', 'comunicado', id] as const,
  anoLetivo: (id: string) => ['escola', 'anoLetivo', id] as const,
  dashboardStats: ['escola', 'dashboard-stats'] as const,
  auditLog: (entidade?: string) => ['escola', 'audit', entidade] as const,
  alertas: ['escola', 'alertas'] as const,
  categoriasFinancas: ['escola', 'financas', 'categorias'] as const,
  categoriaFinanceira: (id: string) =>
    ['escola', 'financas', 'categoria', id] as const,
  configuracaoFinancas: ['escola', 'financas', 'configuracao'] as const,
  lancamentos: (filtros: Record<string, unknown>) =>
    ['escola', 'financas', 'lancamentos', filtros] as const,
  parcelas: (filtros: Record<string, unknown>) =>
    ['escola', 'financas', 'parcelas', filtros] as const,
  parcela: (id: string) => ['escola', 'financas', 'parcela', id] as const,
  pagamentos: (parcelaId: string) =>
    ['escola', 'financas', 'pagamentos', parcelaId] as const,
  dashboardFinancas: ['escola', 'financas', 'dashboard'] as const,
  fluxoCaixa: (dataInicio: string, dataFim: string) =>
    ['escola', 'financas', 'fluxoCaixa', dataInicio, dataFim] as const,
  dre: (dataInicio: string, dataFim: string) =>
    ['escola', 'financas', 'dre', dataInicio, dataFim] as const,
  inadimplencia: (anoLetivoId?: string) =>
    ['escola', 'financas', 'inadimplencia', anoLetivoId] as const,
  modulos: ['escola', 'modulos'] as const,
  modulosCatalogo: ['escola', 'modulos', 'catalogo'] as const,
  modulo: (id: string) => ['escola', 'modulo', id] as const,
}

export interface Modulo {
  id: string
  chave: string
  nome: string
  descricao: string | null
  ativo: boolean
  ordem: number
  config: Record<string, unknown>
  permissoes: string[]
  imagem: string | null
  icone: string | null
  created_at: string
  updated_at: string
}

export interface ModuloCatalogo {
  chave: string
  nome: string
  descricao: string
  imagem?: string | null
  icone: string
  ordemDefault: number
  permissoesDefault: string[]
}

export interface ModulosComDisponiveis {
  instalados: Modulo[]
  disponiveis: ModuloCatalogo[]
}

export function useAlunos() {
  return useQuery({
    queryKey: queryKeys.alunos,
    queryFn: async (): Promise<Aluno[]> => {
      const { data, error } = await api.get<Aluno[]>(`${ESCOLA_API}/alunos`)
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export function useTurmas() {
  return useQuery({
    queryKey: queryKeys.turmas,
    queryFn: async (): Promise<Turma[]> => {
      const { data, error } = await api.get<Turma[]>(`${ESCOLA_API}/turmas`)
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export function useDisciplinas() {
  return useQuery({
    queryKey: queryKeys.disciplinas,
    queryFn: async (): Promise<Disciplina[]> => {
      const { data, error } = await api.get<Disciplina[]>(`${ESCOLA_API}/disciplinas`)
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export function useDisciplina(id: string | null) {
  return useQuery({
    queryKey: ['escola', 'disciplina', id] as const,
    queryFn: async (): Promise<Disciplina | null> => {
      if (!id) return null
      const { data, error } = await api.get<Disciplina>(`${ESCOLA_API}/disciplinas/${id}`)
      if (error) throw new Error(error.message)
      return data ?? null
    },
    enabled: !!id,
  })
}

export function useAnosLetivos() {
  return useQuery({
    queryKey: queryKeys.anosLetivos,
    queryFn: async (): Promise<AnoLetivo[]> => {
      const { data, error } = await api.get<AnoLetivo[]>(`${ESCOLA_API}/anos-letivos`)
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export function useAnoLetivo(id: string | null) {
  return useQuery({
    queryKey: queryKeys.anoLetivo(id ?? ''),
    queryFn: async (): Promise<AnoLetivo | null> => {
      if (!id) return null
      const { data, error } = await api.get<AnoLetivo>(`${ESCOLA_API}/anos-letivos/${id}`)
      if (error) throw new Error(error.message)
      return data ?? null
    },
    enabled: !!id,
  })
}

export function usePeriodos(anoLetivoId: string | null) {
  return useQuery({
    queryKey: queryKeys.periodos(anoLetivoId ?? ''),
    queryFn: async (): Promise<Periodo[]> => {
      if (!anoLetivoId) return []
      const { data, error } = await api.get<Periodo[]>(
        `${ESCOLA_API}/periodos?anoLetivoId=${encodeURIComponent(anoLetivoId)}`
      )
      if (error) throw new Error(error.message)
      return data ?? []
    },
    enabled: !!anoLetivoId,
  })
}

export interface TurmaAlunoRow {
  id: string
  alunoId: string
  turmaId: string
  alunoNome: string
}

export function useTurmaAlunos(turmaId: string | null) {
  return useQuery({
    queryKey: ['escola', 'turma-alunos', turmaId] as const,
    queryFn: async (): Promise<TurmaAlunoRow[]> => {
      if (!turmaId) return []
      const { data, error } = await api.get<TurmaAlunoRow[]>(
        `${ESCOLA_API}/turmas/${turmaId}/alunos`
      )
      if (error) throw new Error(error.message)
      return data ?? []
    },
    enabled: !!turmaId,
  })
}

export function useNotas(turmaId: string | null, periodoId: string | null) {
  return useQuery({
    queryKey: queryKeys.notas(turmaId ?? '', periodoId ?? ''),
    queryFn: async (): Promise<NotaRow[]> => {
      if (!turmaId || !periodoId) return []
      const { data, error } = await api.get<NotaRow[]>(
        `${ESCOLA_API}/notas?turmaId=${encodeURIComponent(turmaId)}&periodoId=${encodeURIComponent(periodoId)}`
      )
      if (error) throw new Error(error.message)
      return data ?? []
    },
    enabled: !!turmaId && !!periodoId,
  })
}

export function useBoletim(alunoId: string | null, anoLetivoId?: string) {
  return useQuery({
    queryKey: queryKeys.boletim(alunoId ?? '', anoLetivoId),
    queryFn: async () => {
      if (!alunoId) return null
      const params = new URLSearchParams({ alunoId })
      if (anoLetivoId) params.set('anoLetivoId', anoLetivoId)
      const { data, error } = await api.get(`${ESCOLA_API}/boletins/${alunoId}?${params}`)
      if (error) throw new Error(error.message)
      return data
    },
    enabled: !!alunoId,
  })
}

export interface FrequenciaRow {
  id: string
  aulaId: string
  alunoId: string
  alunoNome: string
  status: 'presente' | 'falta' | 'justificada'
}

export function useFrequencia(aulaId: string | null) {
  return useQuery({
    queryKey: ['escola', 'frequencia', aulaId] as const,
    queryFn: async (): Promise<FrequenciaRow[]> => {
      if (!aulaId) return []
      const { data, error } = await api.get<FrequenciaRow[]>(
        `${ESCOLA_API}/frequencia/${aulaId}`
      )
      if (error) throw new Error(error.message)
      return data ?? []
    },
    enabled: !!aulaId,
  })
}

/* ── Horários ── */

export interface HorarioRow {
  id: string
  turmaId: string
  turmaNome: string
  disciplinaId: string
  disciplinaNome: string
  professorId: string | null
  professorNome: string | null
  salaId: string | null
  salaNome: string | null
  diaSemana: number
  horaInicio: string
  horaFim: string
  anoLetivoId: string
  anoLetivo: string
}

export function useHorarios(turmaId?: string, anoLetivoId?: string) {
  return useQuery({
    queryKey: queryKeys.horarios(turmaId, anoLetivoId),
    queryFn: async (): Promise<HorarioRow[]> => {
      const params = new URLSearchParams()
      if (turmaId) params.set('turmaId', turmaId)
      if (anoLetivoId) params.set('anoLetivoId', anoLetivoId)
      const qs = params.toString()
      const { data, error } = await api.get<HorarioRow[]>(
        `${ESCOLA_API}/horarios${qs ? `?${qs}` : ''}`
      )
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export interface SalaRow {
  id: string
  nome: string
  capacidade: number | null
}

export function useSalas() {
  return useQuery({
    queryKey: queryKeys.salas,
    queryFn: async (): Promise<SalaRow[]> => {
      const { data, error } = await api.get<SalaRow[]>(`${ESCOLA_API}/salas`)
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

/* ── Comunicados ── */

export interface ComunicadoRow {
  id: string
  titulo: string
  conteudo: string
  destinatarioTipo: string
  turmaId: string | null
  turmaNome: string | null
  criadoPor: string
  autorNome: string
  publicadoEm: string
}

export function useComunicados() {
  return useQuery({
    queryKey: queryKeys.comunicados,
    queryFn: async (): Promise<ComunicadoRow[]> => {
      const { data, error } = await api.get<ComunicadoRow[]>(`${ESCOLA_API}/comunicados`)
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export function useComunicado(id: string | null) {
  return useQuery({
    queryKey: queryKeys.comunicado(id ?? ''),
    queryFn: async (): Promise<ComunicadoRow | null> => {
      if (!id) return null
      const { data, error } = await api.get<ComunicadoRow>(`${ESCOLA_API}/comunicados/${id}`)
      if (error) throw new Error(error.message)
      return data ?? null
    },
    enabled: !!id,
  })
}

/* ── Dashboard Stats ── */

export interface DashboardStats {
  totalAlunos: number
  totalTurmas: number
  totalProfessores: number
  totalDisciplinas: number
  mediaGeral: number | null
  taxaPresenca: number | null
  alunosPorTurma: { turmaNome: string; total: number }[]
}

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboardStats,
    queryFn: async (): Promise<DashboardStats> => {
      const { data, error } = await api.get<DashboardStats>(`${ESCOLA_API}/dashboard/stats`)
      if (error) throw new Error(error.message)
      return data ?? { totalAlunos: 0, totalTurmas: 0, totalProfessores: 0, totalDisciplinas: 0, mediaGeral: null, taxaPresenca: null, alunosPorTurma: [] }
    },
  })
}

/* ── Audit Log ── */

export interface AuditLogEntry {
  id: string
  acao: string
  entidade: string
  entidadeId: string | null
  dadosAntes: Record<string, unknown> | null
  dadosDepois: Record<string, unknown> | null
  criadoEm: string
  usuarioNome: string | null
}

export function useAuditLog(entidade?: string, limit = 50) {
  return useQuery({
    queryKey: queryKeys.auditLog(entidade),
    queryFn: async (): Promise<AuditLogEntry[]> => {
      const params = new URLSearchParams()
      if (entidade) params.set('entidade', entidade)
      params.set('limit', String(limit))
      const { data, error } = await api.get<AuditLogEntry[]>(
        `${ESCOLA_API}/audit?${params}`
      )
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

/* ── Alertas ── */

export interface AlertaRow {
  id: string
  tipo: string
  severidade: 'info' | 'atencao' | 'critico'
  titulo: string
  descricao: string | null
  alunoId: string | null
  alunoNome: string | null
  turmaId: string | null
  turmaNome: string | null
  criadoEm: string
}

export function useAlertas() {
  return useQuery({
    queryKey: queryKeys.alertas,
    queryFn: async (): Promise<AlertaRow[]> => {
      const { data, error } = await api.get<AlertaRow[]>(`${ESCOLA_API}/alertas`)
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export interface CategoriaFinanceira {
  id: string
  nome: string
  tipo: 'receita' | 'despesa'
  ordem: number
  ativo: boolean
  createdAt: string
}

export function useCategoriasFinancas() {
  return useQuery({
    queryKey: queryKeys.categoriasFinancas,
    queryFn: async (): Promise<CategoriaFinanceira[]> => {
      const { data, error } = await api.get<CategoriaFinanceira[]>(
        `${ESCOLA_API}/financas/categorias`
      )
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export interface ConfiguracaoFinancas {
  multaPercentual: number
  jurosMensalPercentual: number
  parcelasParaBloqueio: number
}

export function useConfiguracaoFinancas() {
  return useQuery({
    queryKey: queryKeys.configuracaoFinancas,
    queryFn: async (): Promise<ConfiguracaoFinancas> => {
      const { data, error } = await api.get<ConfiguracaoFinancas>(
        `${ESCOLA_API}/financas/configuracao`
      )
      if (error) throw new Error(error.message)
      return data!
    },
  })
}

export interface LancamentoRow {
  id: string
  tipo: 'entrada' | 'saida'
  data: string
  valor: number
  categoriaId: string
  categoriaNome: string
  descricao: string
  formaPagamento: string
  referencia: string
  alunoId: string | null
  centroCusto: string
  anoLetivoId: string | null
}

export function useLancamentos(filtros: {
  tipo?: 'entrada' | 'saida'
  dataInicio?: string
  dataFim?: string
  categoriaId?: string
  anoLetivoId?: string
} = {}) {
  return useQuery({
    queryKey: queryKeys.lancamentos(filtros),
    queryFn: async (): Promise<LancamentoRow[]> => {
      const params = new URLSearchParams()
      if (filtros.tipo) params.set('tipo', filtros.tipo)
      if (filtros.dataInicio) params.set('dataInicio', filtros.dataInicio)
      if (filtros.dataFim) params.set('dataFim', filtros.dataFim)
      if (filtros.categoriaId) params.set('categoriaId', filtros.categoriaId)
      if (filtros.anoLetivoId) params.set('anoLetivoId', filtros.anoLetivoId)
      const qs = params.toString()
      const { data, error } = await api.get<LancamentoRow[]>(
        `${ESCOLA_API}/financas/lancamentos${qs ? `?${qs}` : ''}`
      )
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export interface ParcelaRow {
  id: string
  alunoId: string
  alunoNome: string
  responsavelId: string | null
  categoriaId: string
  categoriaNome: string
  valorOriginal: number
  valorAtualizado: number
  vencimento: string
  status: string
  descricao: string
  anoLetivoId: string
}

export function useParcelas(filtros: {
  anoLetivoId?: string
  alunoId?: string
  responsavelId?: string
  status?: string
  dataInicio?: string
  dataFim?: string
} = {}) {
  return useQuery({
    queryKey: queryKeys.parcelas(filtros),
    queryFn: async (): Promise<ParcelaRow[]> => {
      const params = new URLSearchParams()
      if (filtros.anoLetivoId) params.set('anoLetivoId', filtros.anoLetivoId)
      if (filtros.alunoId) params.set('alunoId', filtros.alunoId)
      if (filtros.responsavelId) params.set('responsavelId', filtros.responsavelId)
      if (filtros.status) params.set('status', filtros.status)
      if (filtros.dataInicio) params.set('dataInicio', filtros.dataInicio)
      if (filtros.dataFim) params.set('dataFim', filtros.dataFim)
      const qs = params.toString()
      const { data, error } = await api.get<ParcelaRow[]>(
        `${ESCOLA_API}/financas/parcelas${qs ? `?${qs}` : ''}`
      )
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export interface PagamentoRow {
  id: string
  parcelaId: string
  dataPagamento: string
  valor: number
  formaPagamento: string
  createdAt: string
}

export function usePagamentos(parcelaId: string | null) {
  return useQuery({
    queryKey: queryKeys.pagamentos(parcelaId ?? ''),
    queryFn: async (): Promise<PagamentoRow[]> => {
      if (!parcelaId) return []
      const { data, error } = await api.get<PagamentoRow[]>(
        `${ESCOLA_API}/financas/parcelas/${parcelaId}/pagamentos`
      )
      if (error) throw new Error(error.message)
      return data ?? []
    },
    enabled: !!parcelaId,
  })
}

export interface DashboardFinancas {
  receitasMes: number
  despesasMes: number
  saldoMes: number
  totalInadimplencia: number
  quantidadeInadimplentes: number
  parcelasAVencer7Dias: number
  parcelasVencidas: number
  evolucaoMensal: { mes: string; receitas: number; despesas: number }[]
}

export function useDashboardFinancas() {
  return useQuery({
    queryKey: queryKeys.dashboardFinancas,
    queryFn: async (): Promise<DashboardFinancas> => {
      const { data, error } = await api.get<DashboardFinancas>(
        `${ESCOLA_API}/financas/dashboard`
      )
      if (error) throw new Error(error.message)
      return data!
    },
  })
}

export interface FluxoCaixaRow {
  data: string
  descricao: string
  tipo: 'entrada' | 'saida'
  valor: number
  categoriaNome: string
  saldoAcumulado: number
}

export function useFluxoCaixa(dataInicio: string, dataFim: string) {
  return useQuery({
    queryKey: queryKeys.fluxoCaixa(dataInicio, dataFim),
    queryFn: async (): Promise<FluxoCaixaRow[]> => {
      const { data, error } = await api.get<FluxoCaixaRow[]>(
        `${ESCOLA_API}/financas/relatorios/fluxo-caixa?dataInicio=${encodeURIComponent(dataInicio)}&dataFim=${encodeURIComponent(dataFim)}`
      )
      if (error) throw new Error(error.message)
      return data ?? []
    },
    enabled: !!dataInicio && !!dataFim,
  })
}

export interface DRERow {
  categoriaNome: string
  tipo: string
  total: number
}

export interface DREFinancas {
  receitas: DRERow[]
  despesas: DRERow[]
  totalReceitas: number
  totalDespesas: number
  resultado: number
}

export function useDRE(dataInicio: string, dataFim: string) {
  return useQuery({
    queryKey: queryKeys.dre(dataInicio, dataFim),
    queryFn: async (): Promise<DREFinancas> => {
      const { data, error } = await api.get<DREFinancas>(
        `${ESCOLA_API}/financas/relatorios/dre?dataInicio=${encodeURIComponent(dataInicio)}&dataFim=${encodeURIComponent(dataFim)}`
      )
      if (error) throw new Error(error.message)
      return data!
    },
    enabled: !!dataInicio && !!dataFim,
  })
}

export interface InadimplenteRow {
  alunoId: string
  alunoNome: string
  parcelasAtrasadas: number
  valorTotalAberto: number
  diasAtraso: number
}

export function useInadimplencia(anoLetivoId?: string) {
  return useQuery({
    queryKey: queryKeys.inadimplencia(anoLetivoId),
    queryFn: async (): Promise<InadimplenteRow[]> => {
      const params = anoLetivoId
        ? `?anoLetivoId=${encodeURIComponent(anoLetivoId)}`
        : ''
      const { data, error } = await api.get<InadimplenteRow[]>(
        `${ESCOLA_API}/financas/relatorios/inadimplencia${params}`
      )
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export function useModulos() {
  return useQuery({
    queryKey: queryKeys.modulos,
    queryFn: async (): Promise<Modulo[]> => {
      const { data, error } = await api.get<Modulo[]>(`${ESCOLA_API}/modulos`)
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export function useModulosComDisponiveis() {
  return useQuery({
    queryKey: queryKeys.modulosCatalogo,
    queryFn: async (): Promise<ModulosComDisponiveis> => {
      const { data, error } = await api.get<ModulosComDisponiveis>(
        `${ESCOLA_API}/modulos?catalogo=1`
      )
      if (error) throw new Error(error.message)
      return data ?? { instalados: [], disponiveis: [] }
    },
  })
}

export function useModulo(id: string | null) {
  return useQuery({
    queryKey: queryKeys.modulo(id ?? ''),
    queryFn: async (): Promise<Modulo | null> => {
      if (!id) return null
      const { data, error } = await api.get<Modulo>(`${ESCOLA_API}/modulos/${id}`)
      if (error) throw new Error(error.message)
      return data ?? null
    },
    enabled: !!id,
  })
}

export { queryKeys }
