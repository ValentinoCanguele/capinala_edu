import { z } from 'zod'

export const tipoCategoriaSchema = z.enum(['receita', 'despesa'])

export const categoriaFinanceiraCreateSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  tipo: tipoCategoriaSchema,
  ordem: z.number().int().min(0).optional().default(0),
  ativo: z.boolean().optional().default(true),
})

export const categoriaFinanceiraUpdateSchema = categoriaFinanceiraCreateSchema.partial()

export type CategoriaFinanceiraCreate = z.infer<typeof categoriaFinanceiraCreateSchema>
export type CategoriaFinanceiraUpdate = z.infer<typeof categoriaFinanceiraUpdateSchema>
