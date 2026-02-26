import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import type { AtaCreate, AtaUpdate } from '../schemas'
import { getEscolaId } from '../core/authContext'
import { registarAudit } from './audit'


export interface AtaRow {
    id: string
    escolaId: string
    turmaId: string
    turmaNome?: string
    periodoId: string | null
    periodoNome?: string
    titulo: string
    conteudo: string
    dataReuniao: string
    participantes: string[]
    decisoes: string[]
    assinaturaDigital: string | null
    criadoPor: string | null
    createdAt: string
    updatedAt: string
}

export async function listAtas(user: AuthUser, filters: { turmaId?: string; periodoId?: string } = {}) {
    const db = getDb()
    const escolaId = getEscolaId(user)
    const { turmaId, periodoId } = filters

    let query = `
    SELECT 
      a.*, 
      t.nome AS "turmaNome",
      p.nome AS "periodoNome"
    FROM atas a
    JOIN turmas t ON t.id = a.turma_id
    LEFT JOIN periodos p ON p.id = a.periodo_id
    WHERE a.escola_id = $1
  `
    const params: any[] = [escolaId]

    if (turmaId) {
        params.push(turmaId)
        query += ` AND a.turma_id = $${params.length}`
    }
    if (periodoId) {
        params.push(periodoId)
        query += ` AND a.periodo_id = $${params.length}`
    }

    query += ` ORDER BY a.data_reuniao DESC, a.created_at DESC`

    const result = await db.query(query, params)
    return result.rows
}

export async function getAta(user: AuthUser, id: string) {
    const db = getDb()
    const escolaId = getEscolaId(user)

    const result = await db.query(
        `SELECT 
      a.*, 
      t.nome AS "turmaNome",
      p.nome AS "periodoNome"
     FROM atas a
     JOIN turmas t ON t.id = a.turma_id
     LEFT JOIN periodos p ON p.id = a.periodo_id
     WHERE a.id = $1 AND a.escola_id = $2`,
        [id, escolaId]
    )

    return result.rows[0] || null
}

export async function createAta(user: AuthUser, data: AtaCreate) {
    const db = getDb()
    const escolaId = getEscolaId(user)

    const result = await db.query(
        `INSERT INTO atas (
      escola_id, turma_id, periodo_id, titulo, conteudo, 
      data_reuniao, participantes, decisoes, assinatura_digital, criado_por
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id`,
        [
            escolaId,
            data.turmaId,
            data.periodoId || null,
            data.titulo,
            data.conteudo,
            data.dataReuniao || new Date(),
            JSON.stringify(data.participantes || []),
            JSON.stringify(data.decisoes || []),
            data.assinaturaDigital || null,
            user.userId,
        ]
    )

    const newId = result.rows[0].id

    await registarAudit(user, {
        acao: 'criar_ata',
        entidade: 'atas',
        entidadeId: newId,
        dadosDepois: data,
    })

    return getAta(user, newId)
}

export async function updateAta(user: AuthUser, id: string, data: AtaUpdate) {
    const db = getDb()
    const escolaId = getEscolaId(user)

    // Verify existence
    const existing = await getAta(user, id)
    if (!existing) return null

    const fields: string[] = []
    const params: any[] = [id, escolaId]

    if (data.titulo !== undefined) {
        params.push(data.titulo)
        fields.push(`titulo = $${params.length}`)
    }
    if (data.conteudo !== undefined) {
        params.push(data.conteudo)
        fields.push(`conteudo = $${params.length}`)
    }
    if (data.dataReuniao !== undefined) {
        params.push(data.dataReuniao)
        fields.push(`data_reuniao = $${params.length}`)
    }
    if (data.participantes !== undefined) {
        params.push(JSON.stringify(data.participantes))
        fields.push(`participantes = $${params.length}`)
    }
    if (data.decisoes !== undefined) {
        params.push(JSON.stringify(data.decisoes))
        fields.push(`decisoes = $${params.length}`)
    }
    if (data.assinaturaDigital !== undefined) {
        params.push(data.assinaturaDigital)
        fields.push(`assinatura_digital = $${params.length}`)
    }
    if (data.periodoId !== undefined) {
        params.push(data.periodoId)
        fields.push(`periodo_id = $${params.length}`)
    }

    if (fields.length === 0) return existing

    params.push(new Date())
    fields.push(`updated_at = $${params.length}`)

    const query = `
    UPDATE atas 
    SET ${fields.join(', ')} 
    WHERE id = $1 AND escola_id = $2
  `

    await db.query(query, params)

    await registarAudit(user, {
        acao: 'atualizar_ata',
        entidade: 'atas',
        entidadeId: id,
        dadosAntes: existing,
        dadosDepois: data,
    })

    return getAta(user, id)
}

export async function deleteAta(user: AuthUser, id: string) {
    const db = getDb()
    const escolaId = getEscolaId(user)

    const result = await db.query(
        'DELETE FROM atas WHERE id = $1 AND escola_id = $2 RETURNING id',
        [id, escolaId]
    )

    if (result.rowCount && result.rowCount > 0) {
        await registarAudit(user, {
            acao: 'eliminar_ata',
            entidade: 'atas',
            entidadeId: id,
        })
        return true
    }

    return false
}
