/**
 * CacheWarmupJob — pré-aquecer cache (ex: dashboard stats) antes do pico de uso.
 */
import { cacheSet } from '@/lib/core/cache'

export async function runCacheWarmupJob(): Promise<void> {
  // Placeholder: chamar endpoints internos ou queries e cacheSet com TTL.
  cacheSet('warmup:lastRun', new Date().toISOString(), 60_000)
  await Promise.resolve()
}
