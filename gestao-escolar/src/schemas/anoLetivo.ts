import { z } from 'zod'

export const anoLetivoFormSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(80),
  dataInicio: z.string().min(1, 'Data de início é obrigatória'),
  dataFim: z.string().min(1, 'Data de fim é obrigatória'),
})

export type AnoLetivoFormValues = z.infer<typeof anoLetivoFormSchema>
