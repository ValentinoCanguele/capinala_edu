import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import type { ComunicadoCreate, ComunicadoUpdate } from '../schemas/comunicado'
import { getEscolaId } from '../core/authContext'


export async function listComunicados(user: AuthUser) {
    const db = getDb()
    const escolaId = getEscolaId(user)
    const result = await db.query(
        `SELECT c.id, c.titulo, c.conteudo,
            c.destinatario_tipo AS "destinatarioTipo",
            c.turma_id AS "turmaId", t.nome AS "turmaNome",
            c.criado_por AS "criadoPor", p.nome AS "autorNome",
            c.publicado_em AS "publicadoEm"
     FROM comunicados c
     LEFT JOIN turmas t ON t.id = c.turma_id
     JOIN usuarios u ON u.id = c.criado_por
     JOIN pessoas p ON p.id = u.pessoa_id
     WHERE c.escola_id = $1
     ORDER BY c.publicado_em DESC
     LIMIT 100`,
        [escolaId]
    )
    return result.rows
}

export async function getComunicado(user: AuthUser, id: string) {
    const db = getDb()
    const escolaId = getEscolaId(user)
    const result = await db.query(
        `SELECT c.id, c.titulo, c.conteudo,
            c.destinatario_tipo AS "destinatarioTipo",
            c.turma_id AS "turmaId", t.nome AS "turmaNome",
            c.criado_por AS "criadoPor", p.nome AS "autorNome",
            c.publicado_em AS "publicadoEm"
     FROM comunicados c
     LEFT JOIN turmas t ON t.id = c.turma_id
     JOIN usuarios u ON u.id = c.criado_por
     JOIN pessoas p ON p.id = u.pessoa_id
     WHERE c.id = $1 AND c.escola_id = $2`,
        [id, escolaId]
    )
    return result.rows[0] ?? null
}

export async function createComunicado(user: AuthUser, data: ComunicadoCreate) {
    const db = getDb()
    const escolaId = getEscolaId(user)
    const result = await db.query(
        `INSERT INTO comunicados (escola_id, titulo, conteudo, destinatario_tipo, turma_id, criado_por)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
        [escolaId, data.titulo, data.conteudo, data.destinatarioTipo, data.turmaId ?? null, user.userId]
    )
    return { id: result.rows[0].id }
}

export async function updateComunicado(user: AuthUser, id: string, data: ComunicadoUpdate) {
    const db = getDb()
    const escolaId = getEscolaId(user)
    const updates: string[] = []
    const values: unknown[] = []
    let i = 1
    if (data.titulo !== undefined) {
        updates.push(`titulo = $${i++}`)
        values.push(data.titulo)
    }
    if (data.conteudo !== undefined) {
        updates.push(`conteudo = $${i++}`)
        values.push(data.conteudo)
    }
    if (data.destinatarioTipo !== undefined) {
        updates.push(`destinatario_tipo = $${i++}`)
        values.push(data.destinatarioTipo)
    }
    if (data.turmaId !== undefined) {
        updates.push(`turma_id = $${i++}`)
        values.push(data.turmaId)
    }
    if (updates.length === 0) return null
    values.push(id, escolaId, user.userId, user.papel)
    const result = await db.query(
        `UPDATE comunicados SET ${updates.join(', ')} WHERE id = $${i} AND escola_id = $${i + 1}
         AND (criado_por = $${i + 2} OR $${i + 3} IN ('admin', 'direcao'))
         RETURNING id`,
        values
    )
    return result.rows[0] ?? null
}

export async function deleteComunicado(user: AuthUser, id: string): Promise<boolean> {
    const db = getDb()
    const escolaId = getEscolaId(user)
    // Apenas admin/direcao ou o próprio autor pode apagar
    const result = await db.query(
        `DELETE FROM comunicados
     WHERE id = $1 AND escola_id = $2
       AND (criado_por = $3 OR $4 IN ('admin', 'direcao'))
     RETURNING id`,
        [id, escolaId, user.userId, user.papel]
    )
    return result.rowCount !== null && result.rowCount > 0
}
