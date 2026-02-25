import { z } from 'zod'

export const tipoLancamentoSchema = z.enum(['entrada', 'saida'])

export const lancamentoCreateSchema = z.object({
  tipo: tipoLancamentoSchema,
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (YYYY-MM-DD)'),
  valor: z.number().min(0, 'Valor deve ser >= 0'),
  categoriaId: z.string().uuid(),
  descricao: z.string().optional(),
  formaPagamento: z.string().optional(),
  referencia: z.string().optional(),
  anoLetivoId: z.string().uuid().optional(),
  alunoId: z.string().uuid().optional(),
  centroCusto: z.string().optional(),
})

export const lancamentoUpdateSchema = lancamentoCreateSchema.partial()

export type LancamentoCreate = z.infer<typeof lancamentoCreateSchema>
export type LancamentoUpdate = z.infer<typeof lancamentoUpdateSchema>
