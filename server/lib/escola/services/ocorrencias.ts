import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import { getEscolaId } from '../core/authContext'
import { registarAudit, criarAlerta } from './audit'

type TipoOcorrencia = 'advertencia_verbal' | 'advertencia_escrita' | 'participacao_disciplinar' | 'suspensao' | 'expulsao' | 'elogio'
type GravidadeOcorrencia = 'leve' | 'moderada' | 'grave' | 'critica'


export async function getOcorrencias(user: AuthUser, filters?: { alunoId?: string, turmaId?: string, resolvido?: boolean }) {
    const db = getDb()
    const escolaId = getEscolaId(user)

    let query = `
    SELECT od.*, 
           p.nome AS "studentName", 
           prof_p.nome AS "professorName",
           t.nome AS "turmaNome"
    FROM ocorrencias_disciplinares od
    JOIN alunos a ON a.id = od.aluno_id
    JOIN pessoas p ON p.id = a.pessoa_id
    LEFT JOIN professores prof ON prof.id = od.professor_id
    LEFT JOIN pessoas prof_p ON prof_p.id = prof.pessoa_id
    LEFT JOIN turmas t ON t.id = od.turma_id
    WHERE od.escola_id = $1
  `
    const params: any[] = [escolaId]

    if (filters?.alunoId) {
        params.push(filters.alunoId)
        query += ` AND od.aluno_id = $${params.length}`
    }
    if (filters?.turmaId) {
        params.push(filters.turmaId)
        query += ` AND od.turma_id = $${params.length}`
    }
    if (filters?.resolvido !== undefined) {
        params.push(filters.resolvido)
        query += ` AND od.resolvido = $${params.length}`
    }

    query += ` ORDER BY od.data_ocorrencia DESC, od.created_at DESC LIMIT 100`

    const result = await db.query(query, params)
    return result.rows
}

export async function createOcorrencia(user: AuthUser, data: {
    alunoId: string,
    turmaId?: string,
    tipo: TipoOcorrencia,
    gravidade: GravidadeOcorrencia,
    descricao: string,
    medidaTomada?: string,
    notificarEncarregado?: boolean,
    dataOcorrencia?: string
}) {
    const db = getDb()
    const escolaId = getEscolaId(user)

    // Tentar encontrar professorId se o user for professor
    let professorId = null
    if (user.papel === 'professor') {
        const profResult = await db.query('SELECT id FROM professores WHERE pessoa_id = $1 AND escola_id = $2', [user.pessoaId, escolaId])
        professorId = profResult.rows[0]?.id
    }

    const result = await db.query(
        `INSERT INTO ocorrencias_disciplinares 
      (escola_id, aluno_id, turma_id, professor_id, tipo, gravidade, descricao, medida_tomada, notificar_encarregado, data_ocorrencia)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
        [
            escolaId,
            data.alunoId,
            data.turmaId || null,
            professorId,
            data.tipo,
            data.gravidade,
            data.descricao,
            data.medidaTomada || null,
            data.notificarEncarregado ?? true,
            data.dataOcorrencia || new Date().toISOString().split('T')[0]
        ]
    )

    const row = result.rows[0]

    // Audit
    await registarAudit(user, {
        acao: 'ocorrencia_disciplinar',
        entidade: 'ocorrencias_disciplinares',
        entidadeId: row.id,
        dadosDepois: row
    })

    // Alerta automático para casos graves
    if (data.gravidade === 'grave' || data.gravidade === 'critica' || data.tipo === 'expulsao') {
        await criarAlerta(escolaId, {
            tipo: 'sistema',
            severidade: (data.gravidade === 'critica' || data.tipo === 'expulsao') ? 'critico' : 'atencao',
            titulo: `Ocorrência ${data.gravidade.toUpperCase()}: ${data.tipo.replace('_', ' ')}`,
            descricao: `Aluno: ${data.alunoId}. Descrição: ${data.descricao.slice(0, 100)}...`,
            alunoId: data.alunoId,
            turmaId: data.turmaId
        })
    }

    return row
}

export async function resolveOcorrencia(user: AuthUser, id: string, resolvido = true) {
    const db = getDb()
    const escolaId = getEscolaId(user)

    const result = await db.query(
        `UPDATE ocorrencias_disciplinares 
     SET resolvido = $1 
     WHERE id = $2 AND escola_id = $3
     RETURNING *`,
        [resolvido, id, escolaId]
    )

    if (result.rowCount === 0) throw new Error('Ocorrência não encontrada')
    return result.rows[0]
}

export async function deleteOcorrencia(user: AuthUser, id: string) {
    const db = getDb()
    const escolaId = getEscolaId(user)

    const result = await db.query(
        `DELETE FROM ocorrencias_disciplinares WHERE id = $1 AND escola_id = $2`,
        [id, escolaId]
    )

    if (result.rowCount === 0) throw new Error('Ocorrência não encontrada')
    return { success: true }
}
