import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'

const ESCOLA_API = '/api/escola'
const FINANCAS = `${ESCOLA_API}/financas`

export interface LancamentosFilters {
  tipo?: 'entrada' | 'saida'
  dataInicio?: string
  dataFim?: string
  categoriaId?: string
  anoLetivoId?: string
}

export interface ParcelasFilters {
  anoLetivoId?: string
  alunoId?: string
  responsavelId?: string
  status?: string
  dataInicio?: string
  dataFim?: string
}

export const financasQueryKeys = {
  dashboard: ['escola', 'financas', 'dashboard'] as const,
  categorias: ['escola', 'financas', 'categorias'] as const,
  categoria: (id: string) => ['escola', 'financas', 'categoria', id] as const,
  lancamentos: (filters: LancamentosFilters) =>
    ['escola', 'financas', 'lancamentos', filters] as const,
  lancamento: (id: string) => ['escola', 'financas', 'lancamento', id] as const,
  parcelas: (filters: ParcelasFilters) =>
    ['escola', 'financas', 'parcelas', filters] as const,
  parcela: (id: string) => ['escola', 'financas', 'parcela', id] as const,
  pagamentos: (parcelaId: string) =>
    ['escola', 'financas', 'parcelas', parcelaId, 'pagamentos'] as const,
  configuracao: ['escola', 'financas', 'configuracao'] as const,
  fluxoCaixa: (dataInicio: string, dataFim: string) =>
    ['escola', 'financas', 'relatorios', 'fluxo-caixa', dataInicio, dataFim] as const,
  dre: (dataInicio: string, dataFim: string) =>
    ['escola', 'financas', 'relatorios', 'dre', dataInicio, dataFim] as const,
  inadimplencia: (anoLetivoId?: string) =>
    ['escola', 'financas', 'relatorios', 'inadimplencia', anoLetivoId] as const,
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

export function useFinancasDashboard() {
  return useQuery({
    queryKey: financasQueryKeys.dashboard,
    queryFn: async (): Promise<DashboardFinancas> => {
      const { data, error } = await api.get<DashboardFinancas>(`${FINANCAS}/dashboard`)
      if (error) throw new Error(error.message)
      if (!data) throw new Error('Sem dados')
      return data
    },
  })
}

export interface CategoriaFinanceira {
  id: string
  nome: string
  tipo: 'receita' | 'despesa'
  ordem: number
  ativo: boolean
}

export function useFinancasCategorias() {
  return useQuery({
    queryKey: financasQueryKeys.categorias,
    queryFn: async (): Promise<CategoriaFinanceira[]> => {
      const { data, error } = await api.get<CategoriaFinanceira[]>(`${FINANCAS}/categorias`)
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export function useFinancasCategoria(id: string | null) {
  return useQuery({
    queryKey: financasQueryKeys.categoria(id ?? ''),
    queryFn: async (): Promise<CategoriaFinanceira | null> => {
      if (!id) return null
      const { data, error } = await api.get<CategoriaFinanceira>(`${FINANCAS}/categorias/${id}`)
      if (error) throw new Error(error.message)
      return data ?? null
    },
    enabled: !!id,
  })
}

export interface LancamentoRow {
  id: string
  tipo: 'entrada' | 'saida'
  data: string
  valor: number
  categoriaId: string
  categoriaNome: string
  descricao: string | null
  formaPagamento: string | null
  referencia: string | null
  anoLetivoId: string | null
  alunoId: string | null
  alunoNome: string | null
  centroCusto: string | null
  createdAt: string
}

export function useFinancasLancamentos(filters: LancamentosFilters = {}) {
  return useQuery({
    queryKey: financasQueryKeys.lancamentos(filters),
    queryFn: async (): Promise<LancamentoRow[]> => {
      const params = new URLSearchParams()
      if (filters.tipo) params.set('tipo', filters.tipo)
      if (filters.dataInicio) params.set('dataInicio', filters.dataInicio)
      if (filters.dataFim) params.set('dataFim', filters.dataFim)
      if (filters.categoriaId) params.set('categoriaId', filters.categoriaId)
      if (filters.anoLetivoId) params.set('anoLetivoId', filters.anoLetivoId)
      const { data, error } = await api.get<LancamentoRow[]>(
        `${FINANCAS}/lancamentos?${params}`
      )
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export function useFinancasLancamento(id: string | null) {
  return useQuery({
    queryKey: financasQueryKeys.lancamento(id ?? ''),
    queryFn: async (): Promise<LancamentoRow | null> => {
      if (!id) return null
      const { data, error } = await api.get<LancamentoRow>(`${FINANCAS}/lancamentos/${id}`)
      if (error) throw new Error(error.message)
      return data ?? null
    },
    enabled: !!id,
  })
}

export interface ParcelaRow {
  id: string
  anoLetivoId: string
  alunoId: string
  alunoNome: string
  responsavelId: string | null
  categoriaId: string
  categoriaNome: string
  valorOriginal: number
  valorAtualizado: number
  vencimento: string
  status: 'aberta' | 'paga' | 'atrasada' | 'cancelada'
  descricao: string | null
  createdAt: string
}

export function useFinancasParcelas(filters: ParcelasFilters = {}) {
  return useQuery({
    queryKey: financasQueryKeys.parcelas(filters),
    queryFn: async (): Promise<ParcelaRow[]> => {
      const params = new URLSearchParams()
      if (filters.anoLetivoId) params.set('anoLetivoId', filters.anoLetivoId)
      if (filters.alunoId) params.set('alunoId', filters.alunoId)
      if (filters.responsavelId) params.set('responsavelId', filters.responsavelId)
      if (filters.status) params.set('status', filters.status)
      if (filters.dataInicio) params.set('dataInicio', filters.dataInicio)
      if (filters.dataFim) params.set('dataFim', filters.dataFim)
      const { data, error } = await api.get<ParcelaRow[]>(
        `${FINANCAS}/parcelas?${params}`
      )
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}

export function useFinancasParcela(id: string | null) {
  return useQuery({
    queryKey: financasQueryKeys.parcela(id ?? ''),
    queryFn: async (): Promise<ParcelaRow | null> => {
      if (!id) return null
      const { data, error } = await api.get<ParcelaRow>(`${FINANCAS}/parcelas/${id}`)
      if (error) throw new Error(error.message)
      return data ?? null
    },
    enabled: !!id,
  })
}

export interface PagamentoRow {
  id: string
  parcelaId: string
  dataPagamento: string
  valor: number
  formaPagamento: string | null
  createdAt: string
}

export function useFinancasPagamentos(parcelaId: string | null) {
  return useQuery({
    queryKey: financasQueryKeys.pagamentos(parcelaId ?? ''),
    queryFn: async (): Promise<PagamentoRow[]> => {
      if (!parcelaId) return []
      const { data, error } = await api.get<PagamentoRow[]>(
        `${FINANCAS}/parcelas/${parcelaId}/pagamentos`
      )
      if (error) throw new Error(error.message)
      return data ?? []
    },
    enabled: !!parcelaId,
  })
}

export interface ConfiguracaoFinanceira {
  multaPercentual: number
  jurosMensalPercentual: number
  parcelasParaBloqueio: number
}

export function useFinancasConfiguracao() {
  return useQuery({
    queryKey: financasQueryKeys.configuracao,
    queryFn: async (): Promise<ConfiguracaoFinanceira | null> => {
      const { data, error } = await api.get<ConfiguracaoFinanceira>(`${FINANCAS}/configuracao`)
      if (error) throw new Error(error.message)
      return data ?? null
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

export function useFinancasFluxoCaixa(dataInicio: string | null, dataFim: string | null) {
  return useQuery({
    queryKey: financasQueryKeys.fluxoCaixa(dataInicio ?? '', dataFim ?? ''),
    queryFn: async (): Promise<FluxoCaixaRow[]> => {
      if (!dataInicio || !dataFim) return []
      const params = new URLSearchParams({ dataInicio, dataFim })
      const { data, error } = await api.get<FluxoCaixaRow[]>(
        `${FINANCAS}/relatorios/fluxo-caixa?${params}`
      )
      if (error) throw new Error(error.message)
      return data ?? []
    },
    enabled: !!dataInicio && !!dataFim,
  })
}

export interface DRERow {
  categoriaNome: string
  tipo: 'receita' | 'despesa'
  total: number
}

export interface DREResponse {
  receitas: DRERow[]
  despesas: DRERow[]
  totalReceitas: number
  totalDespesas: number
  resultado: number
}

export function useFinancasDRE(dataInicio: string | null, dataFim: string | null) {
  return useQuery({
    queryKey: financasQueryKeys.dre(dataInicio ?? '', dataFim ?? ''),
    queryFn: async (): Promise<DREResponse | null> => {
      if (!dataInicio || !dataFim) return null
      const params = new URLSearchParams({ dataInicio, dataFim })
      const { data, error } = await api.get<DREResponse>(
        `${FINANCAS}/relatorios/dre?${params}`
      )
      if (error) throw new Error(error.message)
      return data ?? null
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

export function useFinancasInadimplencia(anoLetivoId?: string | null) {
  return useQuery({
    queryKey: financasQueryKeys.inadimplencia(anoLetivoId ?? undefined),
    queryFn: async (): Promise<InadimplenteRow[]> => {
      const params = new URLSearchParams()
      if (anoLetivoId) params.set('anoLetivoId', anoLetivoId)
      const { data, error } = await api.get<InadimplenteRow[]>(
        `${FINANCAS}/relatorios/inadimplencia?${params}`
      )
      if (error) throw new Error(error.message)
      return data ?? []
    },
  })
}
