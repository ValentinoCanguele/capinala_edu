import { z } from 'zod'

export const alunoFormSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').or(z.literal('')),
  dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  telefone: z.string().optional(),
  bi: z.string().optional(),
  biValidoAte: z.string().optional(),
})

export type AlunoFormValues = z.infer<typeof alunoFormSchema>
