import { z } from 'zod'

export const configuracaoFinanceiraUpdateSchema = z.object({
  multaPercentual: z.number().min(0).max(100).optional(),
  jurosMensalPercentual: z.number().min(0).max(100).optional(),
  parcelasParaBloqueio: z.number().int().min(0).optional(),
})

export type ConfiguracaoFinanceiraUpdate = z.infer<
  typeof configuracaoFinanceiraUpdateSchema
>
