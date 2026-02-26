import { z } from 'zod'

export const ataCreateSchema = z.object({
    turmaId: z.string().uuid(),
    periodoId: z.string().uuid().optional(),
    titulo: z.string().min(1, 'Título é obrigatório'),
    conteudo: z.string().min(1, 'Conteúdo é obrigatório'),
    dataReuniao: z.string().transform((v) => new Date(v)).optional(),
    participantes: z.array(z.string().uuid()).optional().default([]),
    decisoes: z.array(z.string()).optional().default([]),
    assinaturaDigital: z.string().optional(),
})

export const ataUpdateSchema = ataCreateSchema.partial()

export type AtaCreate = z.infer<typeof ataCreateSchema>
export type AtaUpdate = z.infer<typeof ataUpdateSchema>
