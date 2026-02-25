import { z } from 'zod'

const papelSchema = z.enum(['admin', 'direcao', 'professor', 'responsavel', 'aluno'])

export const moduloUpdateSchema = z.object({
  nome: z.string().min(1).optional(),
  descricao: z.string().nullable().optional(),
  ativo: z.boolean().optional(),
  ordem: z.number().int().min(0).optional(),
  config: z.record(z.unknown()).optional(),
  permissoes: z.array(papelSchema).optional(),
  imagem: z.string().nullable().optional(),
  icone: z.string().nullable().optional(),
})

export const moduloInstalarSchema = z.object({
  chave: z.string().min(1, 'Chave é obrigatória'),
})

export type ModuloUpdate = z.infer<typeof moduloUpdateSchema>
export type ModuloInstalarInput = z.infer<typeof moduloInstalarSchema>
