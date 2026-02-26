import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import { getEscolaId } from '../core/authContext'
import { registarAudit } from './audit'


export interface ExameInput {
    alunoId: string
    turmaId: string
    disciplinaId: string
    periodoId?: string | null
    tipo: 'recurso' | 'melhoria' | 'especial'
    valor: number
    dataExame?: string
}

export async function listExames(user: AuthUser, filters: { turmaId?: string; disciplinaId?: string } = {}) {
    const db = getDb()
    const escolaId = getEscolaId(user)
    const { turmaId, disciplinaId } = filters

    let query = `
    SELECT 
      e.*, 
      p.nome AS "studentName",
      d.nome AS "subjectName"
    FROM exames e
    JOIN alunos a ON a.id = e.aluno_id
    JOIN pessoas p ON p.id = a.pessoa_id
    JOIN disciplinas d ON d.id = e.disciplina_id
    WHERE a.escola_id = $1
  `
    const params: any[] = [escolaId]

    if (turmaId) {
        params.push(turmaId)
        query += ` AND e.turma_id = $${params.length}`
    }
    if (disciplinaId) {
        params.push(disciplinaId)
        query += ` AND e.disciplina_id = $${params.length}`
    }

    const result = await db.query(query, params)
    return result.rows
}

export async function upsertExame(user: AuthUser, data: ExameInput) {
    const db = getDb()
    const escolaId = getEscolaId(user)

    const result = await db.query(
        `INSERT INTO exames (
      aluno_id, turma_id, disciplina_id, periodo_id, tipo, valor, data_exame
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (aluno_id, turma_id, disciplina_id, periodo_id, tipo) 
    DO UPDATE SET valor = EXCLUDED.valor, data_exame = EXCLUDED.data_exame
    RETURNING id`,
        [
            data.alunoId,
            data.turmaId,
            data.disciplinaId,
            data.periodoId || null,
            data.tipo,
            data.valor,
            data.dataExame || new Date()
        ]
    )

    const id = result.rows[0].id

    await registarAudit(user, {
        acao: 'lancar_exame',
        entidade: 'exames',
        entidadeId: id,
        dadosDepois: data
    })

    return true
}

export async function deleteExame(user: AuthUser, id: string) {
    const db = getDb()
    const escolaId = getEscolaId(user)

    // Verify ownership via student's school
    const result = await db.query(
        `DELETE FROM exames e
     USING alunos a
     WHERE e.id = $1 AND e.aluno_id = a.id AND a.escola_id = $2
     RETURNING e.id`,
        [id, escolaId]
    )

    if (result.rowCount && result.rowCount > 0) {
        await registarAudit(user, {
            acao: 'eliminar_exame',
            entidade: 'exames',
            entidadeId: id
        })
        return true
    }
    return false
}
