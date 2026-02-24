import { z } from 'zod'

export const disciplinaCreateSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  escolaId: z.string().uuid().optional(),
})

export const disciplinaUpdateSchema = disciplinaCreateSchema.partial()

export type DisciplinaCreate = z.infer<typeof disciplinaCreateSchema>
export type DisciplinaUpdate = z.infer<typeof disciplinaUpdateSchema>
