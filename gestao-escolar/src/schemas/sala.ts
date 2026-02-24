import { z } from 'zod'

export const salaFormSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(80),
  capacidade: z.coerce.number().int().min(0).optional().nullable(),
})

export type SalaFormValues = z.infer<typeof salaFormSchema>
