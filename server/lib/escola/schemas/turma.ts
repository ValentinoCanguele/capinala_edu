import { z } from 'zod'

export const turmaCreateSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  anoLetivo: z.string().min(1, 'Ano letivo é obrigatório'),
  anoLetivoId: z.string().uuid().optional(),
  alunoIds: z.array(z.string().uuid()).optional().default([]),
})

export const turmaUpdateSchema = turmaCreateSchema.partial()

export type TurmaCreate = z.infer<typeof turmaCreateSchema>
export type TurmaUpdate = z.infer<typeof turmaUpdateSchema>
