import { z } from 'zod'

export const notaSchema = z.object({
  alunoId: z.string().uuid(),
  turmaId: z.string().uuid(),
  disciplinaId: z.string().uuid(),
  periodoId: z.string().uuid(),
  valor: z.number().min(0).max(20),
  mac: z.number().min(0).max(20).optional(),
  npp: z.number().min(0).max(20).optional(),
  ne: z.number().min(0).max(20).optional(),
  formula_aplicada: z.string().optional(),
})

export const notaBatchSchema = z.object({
  turmaId: z.string().uuid(),
  periodoId: z.string().uuid().optional(),
  bimestre: z.number().min(1).max(4).optional(),
  disciplinaId: z.string().uuid().optional(),
  notas: z.array(z.object({
    alunoId: z.string().uuid(),
    valor: z.number().min(0).max(20),
    mac: z.number().min(0).max(20).optional(),
    npp: z.number().min(0).max(20).optional(),
    ne: z.number().min(0).max(20).optional(),
  })),
})

export type NotaInput = z.infer<typeof notaSchema>
export type NotaBatchInput = z.infer<typeof notaBatchSchema>
