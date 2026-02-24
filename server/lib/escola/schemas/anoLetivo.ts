import { z } from 'zod'

export const anoLetivoCreateSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  dataInicio: z.string().min(1, 'Data início é obrigatória'),
  dataFim: z.string().min(1, 'Data fim é obrigatória'),
  escolaId: z.string().uuid().optional(),
})

export const anoLetivoUpdateSchema = anoLetivoCreateSchema.partial()

export type AnoLetivoCreate = z.infer<typeof anoLetivoCreateSchema>
export type AnoLetivoUpdate = z.infer<typeof anoLetivoUpdateSchema>
