import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import { getEscolaId } from '../core/authContext'


export async function getSalas(user: AuthUser) {
    const db = getDb()
    const escolaId = getEscolaId(user)
    const result = await db.query(
        'SELECT * FROM salas WHERE escola_id = $1 ORDER BY tipo, nome',
        [escolaId]
    )
    return result.rows
}

export async function createSala(user: AuthUser, data: {
    nome: string,
    capacidade: number,
    tipo?: string,
    equipamentos?: string[],
    area_m2?: number
}) {
    const db = getDb()
    const escolaId = getEscolaId(user)

    const result = await db.query(
        `INSERT INTO salas (escola_id, nome, capacidade, tipo, equipamentos, area_m2)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [escolaId, data.nome, data.capacidade, data.tipo || 'sala_aula', JSON.stringify(data.equipamentos || []), data.area_m2 || null]
    )
    return result.rows[0]
}

export async function updateSala(user: AuthUser, id: string, data: any) {
    const db = getDb()
    const escolaId = getEscolaId(user)

    // Mapping keys to DB snake_case for dynamic update
    const fieldMap: any = {
        nome: 'nome',
        capacidade: 'capacidade',
        tipo: 'tipo',
        equipamentos: 'equipamentos',
        area_m2: 'area_m2'
    }

    const fields: string[] = []
    const params: any[] = [id, escolaId]

    for (const [key, dbCol] of Object.entries(fieldMap)) {
        if (data[key] !== undefined) {
            params.push(key === 'equipamentos' ? JSON.stringify(data[key]) : data[key])
            fields.push(`${dbCol} = $${params.length}`)
        }
    }

    if (fields.length === 0) return await db.query('SELECT * FROM salas WHERE id = $1', [id]).then(r => r.rows[0])

    const result = await db.query(
        `UPDATE salas SET ${fields.join(', ')} WHERE id = $1 AND escola_id = $2 RETURNING *`,
        params
    )
    return result.rows[0]
}

export async function getAuditOcupacaoSalas(user: AuthUser, anoLetivoId: string) {
    const db = getDb()
    const escolaId = getEscolaId(user)

    // This query finds the "Occupation Optimizer" stats
    const result = await db.query(
        `SELECT 
            s.id as "salaId",
            s.nome as "salaNome",
            s.capacidade,
            s.tipo,
            (SELECT count(*) FROM horarios h WHERE h.sala_id = s.id AND h.ano_letivo_id = $2) as "totalAulasSemanais",
            (SELECT sum(EXTRACT(EPOCH FROM (h.hora_fim - h.hora_inicio))/3600) FROM horarios h WHERE h.sala_id = s.id AND h.ano_letivo_id = $2) as "totalHorasMensais"
         FROM salas s
         WHERE s.escola_id = $1
         ORDER BY s.tipo, s.nome`,
        [escolaId, anoLetivoId]
    )
    return result.rows
}
