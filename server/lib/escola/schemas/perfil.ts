import { z } from 'zod'

export const perfilUpdateSchema = z.object({
  nome: z.string().min(1).optional(),
  email: z.string().email().optional(),
  dataNascimento: z.string().optional(),
  telefone: z.string().optional(),
  bi: z.string().optional(),
  biEmitidoEm: z.string().optional(),
  biValidoAte: z.string().optional(),
})

export const alterarSenhaSchema = z.object({
  senhaAtual: z.string().min(1, 'Senha atual é obrigatória'),
  senhaNova: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
})

export type PerfilUpdate = z.infer<typeof perfilUpdateSchema>
export type AlterarSenhaInput = z.infer<typeof alterarSenhaSchema>
