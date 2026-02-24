import { z } from 'zod'

export const matriculaCreateSchema = z.object({
  alunoId: z.string().uuid(),
  turmaId: z.string().uuid(),
})

export type MatriculaCreate = z.infer<typeof matriculaCreateSchema>
