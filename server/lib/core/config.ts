/**
 * ConfigLoader — carregar e validar variáveis de ambiente (Zod); expor config tipada.
 */
import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  JWT_SECRET: z.string().min(1).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
})

let cached: z.infer<typeof envSchema> | null = null

export function getConfig(): z.infer<typeof envSchema> {
  if (cached) return cached
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    throw new Error(`Config inválida: ${parsed.error.issues[0]?.message ?? 'Erro desconhecido'}`)
  }
  cached = parsed.data
  return cached
}

export type AppConfig = z.infer<typeof envSchema>
