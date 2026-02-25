/**
 * JobScheduler — registar e agendar jobs (cron ou interval).
 */
export type JobFn = () => Promise<void>

const jobs: { name: string; fn: JobFn; intervalMs?: number; cron?: string }[] = []
let intervalHandle: ReturnType<typeof setInterval> | null = null

const DEFAULT_INTERVAL_MS = 60 * 60 * 1000 // 1h

export function registerJob(
  name: string,
  fn: JobFn,
  options: { intervalMs?: number; cron?: string } = {}
): void {
  jobs.push({
    name,
    fn,
    intervalMs: options.intervalMs ?? DEFAULT_INTERVAL_MS,
    cron: options.cron,
  })
}

export function startScheduler(): void {
  if (intervalHandle) return
  intervalHandle = setInterval(async () => {
    for (const job of jobs) {
      try {
        await job.fn()
      } catch (e) {
        console.error(`[JobScheduler] ${job.name} failed:`, e)
      }
    }
  }, DEFAULT_INTERVAL_MS)
}

export function stopScheduler(): void {
  if (intervalHandle) {
    clearInterval(intervalHandle)
    intervalHandle = null
  }
}

export function getRegisteredJobs(): string[] {
  return jobs.map((j) => j.name)
}
