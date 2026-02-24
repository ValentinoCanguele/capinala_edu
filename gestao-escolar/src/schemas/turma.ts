import { z } from 'zod'

export const turmaFormSchema = z.object({
  nome: z.string().min(1, 'Nome da turma é obrigatório'),
  anoLetivo: z.string().min(1, 'Ano letivo é obrigatório'),
})

export type TurmaFormValues = z.infer<typeof turmaFormSchema>
