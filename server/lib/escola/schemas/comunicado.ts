import { z } from 'zod'

export const comunicadoCreateSchema = z.object({
    titulo: z.string().min(1, 'Título obrigatório').max(200),
    conteudo: z.string().min(1, 'Conteúdo obrigatório'),
    destinatarioTipo: z.enum(['todos', 'turma', 'papel']).default('todos'),
    turmaId: z.string().uuid().optional(),
})

export const comunicadoUpdateSchema = z.object({
    titulo: z.string().min(1).max(200).optional(),
    conteudo: z.string().min(1).optional(),
    destinatarioTipo: z.enum(['todos', 'turma', 'papel']).optional(),
    turmaId: z.string().uuid().nullable().optional(),
})

export type ComunicadoCreate = z.infer<typeof comunicadoCreateSchema>
export type ComunicadoUpdate = z.infer<typeof comunicadoUpdateSchema>
