import { z } from 'zod'
import { pessoaCreateSchema } from './pessoa'

export const alunoCreateSchema = pessoaCreateSchema.extend({
  escolaId: z.string().uuid().optional(),
})

export const alunoUpdateSchema = alunoCreateSchema.partial()

export type AlunoCreate = z.infer<typeof alunoCreateSchema>
export type AlunoUpdate = z.infer<typeof alunoUpdateSchema>
