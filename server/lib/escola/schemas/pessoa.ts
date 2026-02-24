import { z } from 'zod'

export const pessoaCreateSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  dataNascimento: z.string().optional(),
})

export const pessoaUpdateSchema = pessoaCreateSchema.partial()

export type PessoaCreate = z.infer<typeof pessoaCreateSchema>
export type PessoaUpdate = z.infer<typeof pessoaUpdateSchema>
