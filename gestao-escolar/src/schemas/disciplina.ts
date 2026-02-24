import { z } from 'zod'

export const disciplinaFormSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório').max(120),
})

export type DisciplinaFormValues = z.infer<typeof disciplinaFormSchema>
