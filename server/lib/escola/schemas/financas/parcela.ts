import { z } from 'zod'

export const statusParcelaSchema = z.enum([
  'aberta',
  'paga',
  'atrasada',
  'cancelada',
])

export const parcelaCreateSchema = z.object({
  anoLetivoId: z.string().uuid(),
  alunoId: z.string().uuid(),
  responsavelId: z.string().uuid().optional(),
  categoriaId: z.string().uuid(),
  valorOriginal: z.number().min(0),
  vencimento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (YYYY-MM-DD)'),
  descricao: z.string().optional(),
})

export const pagamentoCreateSchema = z.object({
  parcelaId: z.string().uuid(),
  dataPagamento: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (YYYY-MM-DD)'),
  valor: z.number().min(0, 'Valor deve ser >= 0'),
  formaPagamento: z.string().optional(),
})

export const gerarParcelasLoteSchema = z.object({
  anoLetivoId: z.string().uuid(),
  turmaId: z.string().uuid(),
  categoriaId: z.string().uuid(),
  valorOriginal: z.number().min(0),
  primeiroVencimento: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (YYYY-MM-DD)'),
  numeroParcelas: z.number().int().min(1).max(24),
  descricao: z.string().optional(),
})

export type ParcelaCreate = z.infer<typeof parcelaCreateSchema>
export type PagamentoCreate = z.infer<typeof pagamentoCreateSchema>
export type GerarParcelasLote = z.infer<typeof gerarParcelasLoteSchema>
