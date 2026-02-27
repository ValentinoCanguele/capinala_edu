import { z } from 'zod'

export const turmaFormSchema = z.object({
  nome: z.string().min(1, 'Nome da turma é obrigatório'),
  anoLetivo: z.string().min(1, 'Ano letivo é obrigatório'),
  periodo: z.enum(['Manhã', 'Tarde', 'Noite', 'Integral']).default('Manhã'),
  sala: z.string().optional(),
  capacidade: z.number().min(1).max(100).default(30),
})

export type TurmaFormValues = z.infer<typeof turmaFormSchema>
