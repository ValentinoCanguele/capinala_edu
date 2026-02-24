import { z } from 'zod'

export const horarioCreateSchema = z.object({
  turmaId: z.string().uuid(),
  disciplinaId: z.string().uuid(),
  professorId: z.string().uuid().optional(),
  salaId: z.string().uuid().optional(),
  diaSemana: z.number().int().min(1).max(7),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  horaFim: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM'),
  anoLetivoId: z.string().uuid(),
})

export const horarioUpdateSchema = horarioCreateSchema.partial()

export type HorarioCreate = z.infer<typeof horarioCreateSchema>
export type HorarioUpdate = z.infer<typeof horarioUpdateSchema>
