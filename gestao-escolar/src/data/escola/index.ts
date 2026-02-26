/**
 * Barrel: re-exporta prefetches e hooks do módulo escola.
 * Permite importar de '@/data/escola' em vez de '@/data/escola/queries'.
 * prefetchTurmas e restantes prefetches ficam definidos em queries.ts.
 */
export {
  prefetchAlunos,
  prefetchAnosLetivos,
  prefetchAtas,
  prefetchComunicados,
  prefetchDashboardStats,
  prefetchDisciplinas,
  prefetchHorarios,
  prefetchMatrizes,
  prefetchModulos,
  prefetchOcorrencias,
  prefetchSalas,
  prefetchTurmas,
  prefetchUsuarios,
} from './queries'
