import { z } from 'zod'

const papelSchema = z.enum(['admin', 'direcao', 'professor', 'responsavel', 'aluno'])

export const usuarioCreateSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  papel: papelSchema,
  escolaId: z.string().uuid().optional().nullable(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  bi: z.string().optional(),
  telefone: z.string().optional(),
})

export const usuarioUpdateSchema = z.object({
  nome: z.string().min(1).optional(),
  email: z.string().email().optional(),
  papel: papelSchema.optional(),
  escolaId: z.string().uuid().optional().nullable(),
  bi: z.string().optional(),
  telefone: z.string().optional(),
})

export const resetPasswordSchema = z.object({
  novaSenha: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
})

export const setPermissoesSchema = z.object({
  codigos: z.array(z.string()),
})

export type UsuarioCreate = z.infer<typeof usuarioCreateSchema>
export type UsuarioUpdate = z.infer<typeof usuarioUpdateSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type SetPermissoesInput = z.infer<typeof setPermissoesSchema>
