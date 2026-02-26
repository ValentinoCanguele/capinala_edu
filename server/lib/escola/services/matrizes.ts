import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import { getEscolaId } from '../core/authContext'


export async function getMatrizes(user: AuthUser) {
    const db = getDb()
    const escolaId = getEscolaId(user)
    const result = await db.query(
        `SELECT m.*, 
            (SELECT count(*) FROM matriz_disciplinas md WHERE md.matriz_id = m.id) as "totalDisciplinas",
            (SELECT sum(carga_total) FROM matriz_disciplinas md WHERE md.matriz_id = m.id) as "cargaHorariaTotal"
         FROM matrizes_curriculares m
         WHERE m.escola_id = $1
         ORDER BY m.grau_escolar, m.nome`,
        [escolaId]
    )
    return result.rows
}

export async function getMatrizById(user: AuthUser, id: string) {
    const db = getDb()
    const escolaId = getEscolaId(user)

    const matriz = await db.query(
        'SELECT m.*, p.nome as matriz_pai_nome FROM matrizes_curriculares m LEFT JOIN matrizes_curriculares p ON p.id = m.matriz_pai_id WHERE m.id = $1 AND m.escola_id = $2',
        [id, escolaId]
    )
    if (matriz.rows.length === 0) throw new Error('Matriz não encontrada')

    const disciplinas = await db.query(
        'SELECT * FROM matriz_disciplinas WHERE matriz_id = $1 ORDER BY ordem',
        [id]
    )

    const precedencias = await db.query(
        `SELECT p.*, md_alvo.disciplina_name as alvo_nome, md_prec.disciplina_name as precedencia_nome
         FROM matriz_disciplina_precedencias p
         JOIN matriz_disciplinas md_alvo ON md_alvo.id = p.disciplina_alvo_id
         JOIN matriz_disciplinas md_prec ON md_prec.id = p.disciplina_precedente_id
         WHERE md_alvo.matriz_id = $1`,
        [id]
    )

    return {
        ...matriz.rows[0],
        disciplinas: disciplinas.rows,
        precedencias: precedencias.rows
    }
}

export async function createMatriz(user: AuthUser, data: {
    nome: string,
    grau_escolar: string,
    ano_letivo_inicio?: string,
    matriz_pai_id?: string,
    notas_normativas?: string
}) {
    const db = getDb()
    const escolaId = getEscolaId(user)

    const result = await db.query(
        `INSERT INTO matrizes_curriculares (escola_id, nome, grau_escolar, ano_letivo_inicio, matriz_pai_id, notas_normativas)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [escolaId, data.nome, data.grau_escolar, data.ano_letivo_inicio || null, data.matriz_pai_id || null, data.notas_normativas || '']
    )
    return result.rows[0]
}

export async function addDisciplinaToMatriz(user: AuthUser, data: {
    matriz_id: string,
    disciplina_name: string,
    carga_horaria_teorica: number,
    carga_horaria_pratica: number,
    ordem?: number,
    grupo?: string,
    formula_media?: string,
    peso_na_media?: number,
    obrigatoria?: boolean,
    nota_minima_aprovacao?: number
}) {
    const db = getDb()
    const result = await db.query(
        `INSERT INTO matriz_disciplinas (
            matriz_id, disciplina_name, carga_horaria_teorica, carga_horaria_pratica, 
            ordem, grupo, formula_media, peso_na_media, obrigatoria, nota_minima_aprovacao
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
            data.matriz_id, data.disciplina_name, data.carga_horaria_teorica, data.carga_horaria_pratica,
            data.ordem || 0, data.grupo || 'outro', data.formula_media || '(MAC * 0.4) + (NPP * 0.6)',
            data.peso_na_media || 1.0, data.obrigatoria !== undefined ? data.obrigatoria : true,
            data.nota_minima_aprovacao || 10.0
        ]
    )
    return result.rows[0]
}

/** 
 * M1.0.1: Herança de Matriz - Clona a estrutura completa de uma matriz existente para um novo ano letivo.
 */
export async function clonarMatriz(user: AuthUser, matrizOrigemId: string, novoNome: string, novoAnoLetivoId?: string) {
    const db = getDb()
    const escolaId = getEscolaId(user)

    // 1. Iniciar transação
    await db.query('BEGIN')
    try {
        // 2. Fetch matriz origem
        const origem = await db.query(
            'SELECT * FROM matrizes_curriculares WHERE id = $1 AND escola_id = $2',
            [matrizOrigemId, escolaId]
        )
        if (origem.rowCount === 0) throw new Error('Matriz de origem não encontrada')

        const o = origem.rows[0]

        // 3. Criar nova matriz herdando propriedades
        const nova = await db.query(
            `INSERT INTO matrizes_curriculares (escola_id, nome, grau_escolar, ano_letivo_inicio, matriz_pai_id, versao)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING *`,
            [escolaId, novoNome, o.grau_escolar, novoAnoLetivoId || o.ano_letivo_inicio, o.id, (o.versao || 1) + 1]
        )
        const novaId = nova.rows[0].id

        // 4. Clonar disciplinas
        const disciplinas = await db.query(
            'SELECT * FROM matriz_disciplinas WHERE matriz_id = $1',
            [matrizOrigemId]
        )

        for (const d of disciplinas.rows) {
            await db.query(
                `INSERT INTO matriz_disciplinas (
                    matriz_id, disciplina_name, carga_horaria_teorica, carga_horaria_pratica, 
                    ordem, grupo, formula_media, peso_na_media, obrigatoria, nota_minima_aprovacao
                 )
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
                [
                    novaId, d.disciplina_name, d.carga_horaria_teorica, d.carga_horaria_pratica,
                    d.ordem, d.grupo, d.formula_media, d.peso_na_media, d.obrigatoria, d.nota_minima_aprovacao
                ]
            )
        }

        await db.query('COMMIT')
        return nova.rows[0]
    } catch (e) {
        await db.query('ROLLBACK')
        throw e
    }
}

export async function vincularTurmaAMatriz(user: AuthUser, turmaId: string, matrizId: string | null) {
    const db = getDb()
    const escolaId = getEscolaId(user)

    const result = await db.query(
        'UPDATE turmas SET matriz_curricular_id = $1 WHERE id = $2 AND escola_id = $3 RETURNING *',
        [matrizId, turmaId, escolaId]
    )
    if (result.rowCount === 0) throw new Error('Turma não encontrada')
    return result.rows[0]
}

export async function addPrecedencia(user: AuthUser, data: {
    disciplina_alvo_id: string,
    disciplina_precedente_id: string,
    tipo_bloqueio?: string,
    nota_minima_requerida?: number
}) {
    const db = getDb()
    const result = await db.query(
        `INSERT INTO matriz_disciplina_precedencias (disciplina_alvo_id, disciplina_precedente_id, tipo_bloqueio, nota_minima_requerida)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [data.disciplina_alvo_id, data.disciplina_precedente_id, data.tipo_bloqueio || 'aprovacao', data.nota_minima_requerida || 10.0]
    )
    return result.rows[0]
}

export async function removePrecedencia(user: AuthUser, id: string) {
    const db = getDb()
    await db.query('DELETE FROM matriz_disciplina_precedencias WHERE id = $1', [id])
    return { success: true }
}
