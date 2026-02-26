import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import { financasQueryKeys } from './financasQueries'

const ESCOLA_API = '/api/escola'
const FINANCAS = `${ESCOLA_API}/financas`

export interface CategoriaFinanceiraInput {
  nome: string
  tipo: 'receita' | 'despesa'
  ordem?: number
  ativo?: boolean
}

export function useCreateCategoriaFinanceira() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: CategoriaFinanceiraInput) => {
      const { data, error } = await api.post(`${FINANCAS}/categorias`, body)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financasQueryKeys.categorias })
    },
  })
}

export function useUpdateCategoriaFinanceira() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: CategoriaFinanceiraInput & { id: string }) => {
      const { data, error } = await api.put(`${FINANCAS}/categorias/${id}`, body)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: financasQueryKeys.categorias })
      queryClient.invalidateQueries({ queryKey: financasQueryKeys.categoria(id) })
    },
  })
}

export function useDeleteCategoriaFinanceira() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.delete(`${FINANCAS}/categorias/${id}`)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financasQueryKeys.categorias })
    },
  })
}

export interface LancamentoInput {
  tipo: 'entrada' | 'saida'
  data: string
  valor: number
  categoriaId: string
  descricao?: string
  formaPagamento?: string
  referencia?: string
  anoLetivoId?: string
  alunoId?: string
  centroCusto?: string
}

export function useCreateLancamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: LancamentoInput) => {
      const { data, error } = await api.post(`${FINANCAS}/lancamentos`, body)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escola', 'financas', 'lancamentos'] })
      queryClient.invalidateQueries({ queryKey: financasQueryKeys.dashboard })
    },
  })
}

export function useUpdateLancamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: Partial<LancamentoInput> & { id: string }) => {
      const { data, error } = await api.put(`${FINANCAS}/lancamentos/${id}`, body)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['escola', 'financas', 'lancamentos'] })
      queryClient.invalidateQueries({ queryKey: financasQueryKeys.lancamento(id) })
      queryClient.invalidateQueries({ queryKey: financasQueryKeys.dashboard })
    },
  })
}

export function useDeleteLancamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await api.delete(`${FINANCAS}/lancamentos/${id}`)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escola', 'financas', 'lancamentos'] })
      queryClient.invalidateQueries({ queryKey: financasQueryKeys.dashboard })
    },
  })
}

export interface ParcelaInput {
  anoLetivoId: string
  alunoId: string
  responsavelId?: string
  categoriaId: string
  valorOriginal: number
  vencimento: string
  descricao?: string
}

export function useCreateParcela() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: ParcelaInput) => {
      const { data, error } = await api.post(`${FINANCAS}/parcelas`, body)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escola', 'financas', 'parcelas'] })
      queryClient.invalidateQueries({ queryKey: financasQueryKeys.dashboard })
    },
  })
}

export interface GerarParcelasLoteInput {
  anoLetivoId: string
  turmaId: string
  categoriaId: string
  valorOriginal: number
  primeiroVencimento: string
  numeroParcelas: number
  descricao?: string
}

export function useGerarParcelasLote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: GerarParcelasLoteInput) => {
      const { data, error } = await api.post(`${FINANCAS}/parcelas/gerar-lote`, body)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['escola', 'financas', 'parcelas'] })
      queryClient.invalidateQueries({ queryKey: financasQueryKeys.dashboard })
    },
  })
}

export interface PagamentoInput {
  parcelaId: string
  dataPagamento: string
  valor: number
  formaPagamento?: string
}

export function useRegistrarPagamento() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: PagamentoInput) => {
      const { data, error } = await api.post(
        `${FINANCAS}/parcelas/${body.parcelaId}/pagamentos`,
        {
          dataPagamento: body.dataPagamento,
          valor: body.valor,
          formaPagamento: body.formaPagamento,
        }
      )
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['escola', 'financas', 'parcelas'] })
      queryClient.invalidateQueries({
        queryKey: financasQueryKeys.pagamentos(variables.parcelaId),
      })
      queryClient.invalidateQueries({ queryKey: financasQueryKeys.parcela(variables.parcelaId) })
      queryClient.invalidateQueries({ queryKey: financasQueryKeys.dashboard })
    },
  })
}

export interface ConfiguracaoFinanceiraInput {
  multaPercentual?: number
  jurosMensalPercentual?: number
  parcelasParaBloqueio?: number
}

export function useUpdateFinancasConfiguracao() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (body: ConfiguracaoFinanceiraInput) => {
      const { data, error } = await api.put(`${FINANCAS}/configuracao`, body)
      if (error) throw new Error(error.message)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financasQueryKeys.configuracao })
    },
  })
}
