import { z } from 'zod'

export const alunoFormSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
})

export type AlunoFormValues = z.infer<typeof alunoFormSchema>
