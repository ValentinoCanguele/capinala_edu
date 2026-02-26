import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import type { ConfiguracaoFinanceiraUpdate } from '../../schemas'
import { getEscolaId } from '../../core/authContext'


export async function getConfiguracaoFinanceira(user: AuthUser) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    `SELECT multa_percentual AS "multaPercentual",
            juros_mensal_percentual AS "jurosMensalPercentual",
            parcelas_para_bloqueio AS "parcelasParaBloqueio"
     FROM configuracao_financeira
     WHERE escola_id = $1`,
    [escolaId]
  )
  if (result.rows.length === 0) {
    await db.query(
      `INSERT INTO configuracao_financeira (escola_id)
       VALUES ($1)
       ON CONFLICT (escola_id) DO NOTHING`,
      [escolaId]
    )
    const retry = await db.query(
      `SELECT multa_percentual AS "multaPercentual",
              juros_mensal_percentual AS "jurosMensalPercentual",
              parcelas_para_bloqueio AS "parcelasParaBloqueio"
       FROM configuracao_financeira
       WHERE escola_id = $1`,
      [escolaId]
    )
    const r = retry.rows[0]
    return r
      ? {
          multaPercentual: Number(r.multaPercentual),
          jurosMensalPercentual: Number(r.jurosMensalPercentual),
          parcelasParaBloqueio: r.parcelasParaBloqueio,
        }
      : {
          multaPercentual: 2,
          jurosMensalPercentual: 1,
          parcelasParaBloqueio: 2,
        }
  }
  const r = result.rows[0]
  return {
    multaPercentual: Number(r.multaPercentual),
    jurosMensalPercentual: Number(r.jurosMensalPercentual),
    parcelasParaBloqueio: r.parcelasParaBloqueio,
  }
}

export async function updateConfiguracaoFinanceira(
  user: AuthUser,
  data: ConfiguracaoFinanceiraUpdate
) {
  await getConfiguracaoFinanceira(user)
  const db = getDb()
  const escolaId = getEscolaId(user)
  const fields: string[] = []
  const values: unknown[] = []
  let pos = 1
  if (data.multaPercentual !== undefined) {
    fields.push(`multa_percentual = $${pos++}`)
    values.push(data.multaPercentual)
  }
  if (data.jurosMensalPercentual !== undefined) {
    fields.push(`juros_mensal_percentual = $${pos++}`)
    values.push(data.jurosMensalPercentual)
  }
  if (data.parcelasParaBloqueio !== undefined) {
    fields.push(`parcelas_para_bloqueio = $${pos++}`)
    values.push(data.parcelasParaBloqueio)
  }
  if (fields.length === 0) return getConfiguracaoFinanceira(user)
  fields.push('updated_at = now()')
  values.push(escolaId)
  await db.query(
    `UPDATE configuracao_financeira SET ${fields.join(', ')} WHERE escola_id = $${pos}`,
    values
  )
  return getConfiguracaoFinanceira(user)
}
