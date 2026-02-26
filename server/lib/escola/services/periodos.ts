import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import { getEscolaId } from '../core/authContext'


export async function listPeriodosByAnoLetivo(user: AuthUser, anoLetivoId: string) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    `SELECT p.id, p.numero, p.nome, p.data_inicio AS "dataInicio", p.data_fim AS "dataFim"
     FROM periodos p
     JOIN anos_letivos a ON a.id = p.ano_letivo_id
     WHERE p.ano_letivo_id = $1 AND a.escola_id = $2
     ORDER BY p.numero`,
    [anoLetivoId, escolaId]
  )
  return result.rows.map((r) => ({
    id: r.id,
    numero: r.numero,
    nome: r.nome ?? `Período ${r.numero}`,
    dataInicio: r.dataInicio ? String(r.dataInicio).slice(0, 10) : null,
    dataFim: r.dataFim ? String(r.dataFim).slice(0, 10) : null,
  }))
}

export async function getOrCreatePeriodosForAno(user: AuthUser, anoLetivoId: string) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const check = await db.query(
    `SELECT 1 FROM periodos p
     JOIN anos_letivos a ON a.id = p.ano_letivo_id
     WHERE p.ano_letivo_id = $1 AND a.escola_id = $2 LIMIT 1`,
    [anoLetivoId, escolaId]
  )
  if (check.rows.length === 0) {
    for (let n = 1; n <= 4; n++) {
      await db.query(
        'INSERT INTO periodos (ano_letivo_id, numero, nome) VALUES ($1, $2, $3) ON CONFLICT (ano_letivo_id, numero) DO NOTHING',
        [anoLetivoId, n, `${n}º bimestre`]
      )
    }
  }
  return listPeriodosByAnoLetivo(user, anoLetivoId)
}
