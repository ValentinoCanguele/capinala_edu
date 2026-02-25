/**
 * QuotasService — verificar limites por escola (alunos, turmas, etc.); bloquear criação se exceder.
 */
import { getDb } from '@/lib/db'

export interface QuotaCheck {
  dentroDoLimite: boolean
  atual: number
  limite: number
  mensagem?: string
}

const DEFAULT_MAX_ALUNOS = 10_000
const DEFAULT_MAX_TURMAS = 500

export async function checkQuotaAlunos(escolaId: string): Promise<QuotaCheck> {
  const db = getDb()
  const r = await db.query(
    'SELECT COUNT(*)::int AS total FROM alunos WHERE escola_id = $1',
    [escolaId]
  )
  const atual = r.rows[0]?.total ?? 0
  const limite = DEFAULT_MAX_ALUNOS
  return {
    dentroDoLimite: atual < limite,
    atual,
    limite,
    mensagem: atual >= limite ? `Limite de ${limite} alunos atingido.` : undefined,
  }
}

export async function checkQuotaTurmas(escolaId: string): Promise<QuotaCheck> {
  const db = getDb()
  const r = await db.query(
    'SELECT COUNT(*)::int AS total FROM turmas WHERE escola_id = $1',
    [escolaId]
  )
  const atual = r.rows[0]?.total ?? 0
  const limite = DEFAULT_MAX_TURMAS
  return {
    dentroDoLimite: atual < limite,
    atual,
    limite,
    mensagem: atual >= limite ? `Limite de ${limite} turmas atingido.` : undefined,
  }
}
