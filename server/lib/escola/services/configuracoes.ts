import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import { getEscolaId } from '../core/authContext'


export interface ConfigPedagogica {
    id: string
    escolaId: string
    anoLetivoId: string
    pesoT1: number
    pesoT2: number
    pesoT3: number
    minimaAprovacaoDireta: number
    minimaAcessoExame: number
    pesoMfaNoExame: number
    pesoExameFinal: number
    tipoArredondamento: 'aritmetico' | 'truncado' | 'normativo_angola'
    casasDecimais: number
    formulaNotaTrimestral: string
    formulaMfa: string
    toleranciaAtrasoMinutos: number
    limiteFaltasPercentagem: number
}

export async function getConfigPedagogica(user: AuthUser, anoLetivoId: string): Promise<ConfigPedagogica | null> {
    const db = getDb()
    const escolaId = getEscolaId(user)

    const result = await db.query(
        `SELECT 
       id, 
       escola_id AS "escolaId", 
       ano_letivo_id AS "anoLetivoId",
       peso_t1 AS "pesoT1",
       peso_t2 AS "pesoT2",
       peso_t3 AS "pesoT3",
       minima_aprovacao_direta AS "minimaAprovacaoDireta",
       minima_acesso_exame AS "minimaAcessoExame",
       peso_mfa_no_exame AS "pesoMfaNoExame",
       peso_exame_final AS "pesoExameFinal",
       tipo_arredondamento AS "tipoArredondamento",
       casas_decimais AS "casasDecimais",
       formula_nota_trimestral AS "formulaNotaTrimestral",
       formula_mfa AS "formulaMfa",
       tolerancia_atraso_minutos AS "toleranciaAtrasoMinutos",
       limite_faltas_percentagem AS "limiteFaltasPercentagem"
     FROM config_pedagogica
     WHERE escola_id = $1 AND ano_letivo_id = $2`,
        [escolaId, anoLetivoId]
    )

    if (result.rows.length === 0) {
        // Tentar criar padrão se não existir
        return await createDefaultConfig(user, anoLetivoId)
    }

    return result.rows[0]
}

async function createDefaultConfig(user: AuthUser, anoLetivoId: string): Promise<ConfigPedagogica> {
    const db = getDb()
    const escolaId = getEscolaId(user)

    const result = await db.query(
        `INSERT INTO config_pedagogica (escola_id, ano_letivo_id)
     VALUES ($1, $2)
     ON CONFLICT (escola_id, ano_letivo_id) DO UPDATE SET updated_at = now()
     RETURNING 
       id, escola_id AS "escolaId", ano_letivo_id AS "anoLetivoId",
       peso_t1 AS "pesoT1", peso_t2 AS "pesoT2", peso_t3 AS "pesoT3",
       minima_aprovacao_direta AS "minimaAprovacaoDireta",
       minima_acesso_exame AS "minimaAcessoExame",
       peso_mfa_no_exame AS "pesoMfaNoExame",
       peso_exame_final AS "pesoExameFinal",
       tipo_arredondamento AS "tipoArredondamento",
       casas_decimais AS "casasDecimais",
       formula_nota_trimestral AS "formulaNotaTrimestral",
       formula_mfa AS "formulaMfa",
       tolerancia_atraso_minutos AS "toleranciaAtrasoMinutos",
       limite_faltas_percentagem AS "limiteFaltasPercentagem"`,
        [escolaId, anoLetivoId]
    )
    return result.rows[0]
}

export async function updateConfigPedagogica(user: AuthUser, data: Partial<ConfigPedagogica>) {
    const db = getDb()
    const escolaId = getEscolaId(user)
    if (!data.anoLetivoId) throw new Error('anoLetivoId é obrigatório')

    const fields: string[] = []
    const params: any[] = [escolaId, data.anoLetivoId]

    const fieldMap: Record<string, string> = {
        pesoT1: 'peso_t1',
        pesoT2: 'peso_t2',
        pesoT3: 'peso_t3',
        minimaAprovacaoDireta: 'minima_aprovacao_direta',
        minimaAcessoExame: 'minima_acesso_exame',
        pesoMfaNoExame: 'peso_mfa_no_exame',
        pesoExameFinal: 'peso_exame_final',
        tipoArredondamento: 'tipo_arredondamento',
        casasDecimais: 'casas_decimais',
        formulaNotaTrimestral: 'formula_nota_trimestral',
        formulaMfa: 'formula_mfa',
        toleranciaAtrasoMinutos: 'tolerancia_atraso_minutos',
        limiteFaltasPercentagem: 'limite_faltas_percentagem'
    }

    for (const [key, dbCol] of Object.entries(fieldMap)) {
        if (data[key as keyof ConfigPedagogica] !== undefined) {
            params.push(data[key as keyof ConfigPedagogica])
            fields.push(`${dbCol} = $${params.length}`)
        }
    }

    if (fields.length === 0) return await getConfigPedagogica(user, data.anoLetivoId)

    params.push(new Date())
    fields.push(`updated_at = $${params.length}`)

    await db.query(
        `UPDATE config_pedagogica 
     SET ${fields.join(', ')} 
     WHERE escola_id = $1 AND ano_letivo_id = $2`,
        params
    )

    return await getConfigPedagogica(user, data.anoLetivoId)
}
