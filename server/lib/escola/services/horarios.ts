import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import type { HorarioCreate, HorarioUpdate } from '../schemas/horario'
import { getEscolaId } from '../core/authContext'


export async function listHorarios(user: AuthUser, turmaId?: string, anoLetivoId?: string) {
    const db = getDb()
    const escolaId = getEscolaId(user)
    const conditions = ['h.escola_id = $1']
    const values: unknown[] = [escolaId]
    let i = 2

    if (turmaId) {
        conditions.push(`h.turma_id = $${i++}`)
        values.push(turmaId)
    }
    if (anoLetivoId) {
        conditions.push(`h.ano_letivo_id = $${i++}`)
        values.push(anoLetivoId)
    }

    const result = await db.query(
        `SELECT h.id, h.turma_id AS "turmaId", t.nome AS "turmaNome",
            h.disciplina_id AS "disciplinaId", d.nome AS "disciplinaNome",
            h.professor_id AS "professorId", pp.nome AS "professorNome",
            h.sala_id AS "salaId", s.nome AS "salaNome",
            h.dia_semana AS "diaSemana",
            to_char(h.hora_inicio, 'HH24:MI') AS "horaInicio",
            to_char(h.hora_fim, 'HH24:MI') AS "horaFim",
            h.ano_letivo_id AS "anoLetivoId", al.nome AS "anoLetivo"
     FROM horarios h
     JOIN turmas t ON t.id = h.turma_id
     JOIN disciplinas d ON d.id = h.disciplina_id
     LEFT JOIN professores pr ON pr.id = h.professor_id
     LEFT JOIN pessoas pp ON pp.id = pr.pessoa_id
     LEFT JOIN salas s ON s.id = h.sala_id
     JOIN anos_letivos al ON al.id = h.ano_letivo_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY h.dia_semana, h.hora_inicio`,
        values
    )
    return result.rows
}

async function checkConflicts(db: any, escolaId: string, data: Partial<HorarioCreate> & { id?: string }) {
    if (!data.anoLetivoId || data.diaSemana === undefined || !data.horaInicio || !data.horaFim) {
        return; // Partial check bypass if not enough data
    }

    let query = `
        SELECT id, turma_id, professor_id, sala_id
        FROM horarios
        WHERE escola_id = $1
          AND ano_letivo_id = $2
          AND dia_semana = $3
          AND (
             (hora_inicio < $5::time AND hora_fim > $4::time)
          )
    `;
    const params: any[] = [escolaId, data.anoLetivoId, data.diaSemana, data.horaInicio, data.horaFim];

    if (data.id) {
        query += ` AND id != $6`;
        params.push(data.id);
    }

    const result = await db.query(query, params);

    for (const row of result.rows) {
        if (data.salaId && row.sala_id === data.salaId) throw new Error('Conflito de Motor (M1.1.2): Sala reservada neste bloco de tempo.');
        if (data.professorId && row.professor_id === data.professorId) throw new Error('Conflito de Motor (M1.1.2): Docente alocado noutra turma neste horário.');
        if (data.turmaId && row.turma_id === data.turmaId) throw new Error('Conflito de Motor (M1.1.2): Turma já tem aula atribuída neste horário.');
    }
}

export async function createHorario(user: AuthUser, data: HorarioCreate) {
    const db = getDb()
    const escolaId = getEscolaId(user)

    await checkConflicts(db, escolaId, data);

    const result = await db.query(
        `INSERT INTO horarios (escola_id, turma_id, disciplina_id, professor_id, sala_id, dia_semana, hora_inicio, hora_fim, ano_letivo_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7::time, $8::time, $9)
     RETURNING id`,
        [escolaId, data.turmaId, data.disciplinaId, data.professorId ?? null, data.salaId ?? null, data.diaSemana, data.horaInicio, data.horaFim, data.anoLetivoId]
    )
    return { id: result.rows[0].id }
}

export async function updateHorario(user: AuthUser, id: string, data: HorarioUpdate) {
    const db = getDb()
    const escolaId = getEscolaId(user)

    const existing = await db.query('SELECT * FROM horarios WHERE id = $1 AND escola_id = $2', [id, escolaId]);
    if (existing.rows.length === 0) throw new Error('Horário não encontrado');
    const curr = existing.rows[0];

    await checkConflicts(db, escolaId, {
        id,
        turmaId: data.turmaId !== undefined ? data.turmaId : curr.turma_id,
        professorId: data.professorId !== undefined ? data.professorId : curr.professor_id,
        salaId: data.salaId !== undefined ? data.salaId : curr.sala_id,
        diaSemana: data.diaSemana !== undefined ? data.diaSemana : curr.dia_semana,
        horaInicio: data.horaInicio !== undefined ? data.horaInicio : curr.hora_inicio,
        horaFim: data.horaFim !== undefined ? data.horaFim : curr.hora_fim,
        anoLetivoId: data.anoLetivoId !== undefined ? data.anoLetivoId : curr.ano_letivo_id
    } as Partial<HorarioCreate> & { id: string });

    const updates: string[] = []
    const values: unknown[] = []
    let i = 1

    if (data.turmaId !== undefined) { updates.push(`turma_id = $${i++}`); values.push(data.turmaId) }
    if (data.disciplinaId !== undefined) { updates.push(`disciplina_id = $${i++}`); values.push(data.disciplinaId) }
    if (data.professorId !== undefined) { updates.push(`professor_id = $${i++}`); values.push(data.professorId) }
    if (data.salaId !== undefined) { updates.push(`sala_id = $${i++}`); values.push(data.salaId) }
    if (data.diaSemana !== undefined) { updates.push(`dia_semana = $${i++}`); values.push(data.diaSemana) }
    if (data.horaInicio !== undefined) { updates.push(`hora_inicio = $${i++}::time`); values.push(data.horaInicio) }
    if (data.horaFim !== undefined) { updates.push(`hora_fim = $${i++}::time`); values.push(data.horaFim) }
    if (data.anoLetivoId !== undefined) { updates.push(`ano_letivo_id = $${i++}`); values.push(data.anoLetivoId) }

    if (updates.length === 0) return null

    const updateQuery = `UPDATE horarios SET ${updates.join(', ')} WHERE id = $${i++} AND escola_id = $${i} RETURNING id`
    values.push(id, escolaId)

    const result = await db.query(updateQuery, values)
    return result.rows[0] ?? null
}

export async function deleteHorario(user: AuthUser, id: string): Promise<boolean> {
    const db = getDb()
    const escolaId = getEscolaId(user)
    const result = await db.query(
        'DELETE FROM horarios WHERE id = $1 AND escola_id = $2 RETURNING id',
        [id, escolaId]
    )
    return result.rowCount !== null && result.rowCount > 0
}

export async function listSalas(user: AuthUser) {
    const db = getDb()
    const escolaId = getEscolaId(user)
    const result = await db.query(
        `SELECT id, nome, capacidade FROM salas WHERE escola_id = $1 ORDER BY nome`,
        [escolaId]
    )
    return result.rows
}

export async function createSala(user: AuthUser, data: { nome: string; capacidade?: number }) {
    const db = getDb()
    const escolaId = getEscolaId(user)
    const result = await db.query(
        `INSERT INTO salas (escola_id, nome, capacidade) VALUES ($1, $2, $3) RETURNING id, nome, capacidade`,
        [escolaId, data.nome, data.capacidade ?? null]
    )
    return result.rows[0]
}

export async function getSala(user: AuthUser, id: string) {
    const db = getDb()
    const escolaId = getEscolaId(user)
    const result = await db.query(
        `SELECT id, nome, capacidade FROM salas WHERE id = $1 AND escola_id = $2`,
        [id, escolaId]
    )
    return result.rows[0] ?? null
}

export async function updateSala(
    user: AuthUser,
    id: string,
    data: { nome?: string; capacidade?: number }
) {
    const db = getDb()
    const escolaId = getEscolaId(user)
    const updates: string[] = []
    const values: unknown[] = []
    let i = 1
    if (data.nome !== undefined) {
        updates.push(`nome = $${i++}`)
        values.push(data.nome)
    }
    if (data.capacidade !== undefined) {
        updates.push(`capacidade = $${i++}`)
        values.push(data.capacidade)
    }
    if (updates.length === 0) return null
    values.push(id, escolaId)
    const result = await db.query(
        `UPDATE salas SET ${updates.join(', ')} WHERE id = $${i++} AND escola_id = $${i} RETURNING id, nome, capacidade`,
        values
    )
    return result.rows[0] ?? null
}

export async function deleteSala(user: AuthUser, id: string): Promise<boolean> {
    const db = getDb()
    const escolaId = getEscolaId(user)
    const result = await db.query(
        'DELETE FROM salas WHERE id = $1 AND escola_id = $2 RETURNING id',
        [id, escolaId]
    )
    return result.rowCount !== null && result.rowCount > 0
}

/** Horários de um professor específico */
export async function listHorariosProfessor(user: AuthUser, anoLetivoId?: string) {
    const db = getDb()
    const escolaId = getEscolaId(user)
    const conditions = ['h.escola_id = $1', 'pr.pessoa_id = $2']
    const values: unknown[] = [escolaId, user.pessoaId]
    let i = 3
    if (anoLetivoId) {
        conditions.push(`h.ano_letivo_id = $${i++}`)
        values.push(anoLetivoId)
    }
    const result = await db.query(
        `SELECT h.id, h.turma_id AS "turmaId", t.nome AS "turmaNome",
            h.disciplina_id AS "disciplinaId", d.nome AS "disciplinaNome",
            h.sala_id AS "salaId", s.nome AS "salaNome",
            h.dia_semana AS "diaSemana",
            to_char(h.hora_inicio, 'HH24:MI') AS "horaInicio",
            to_char(h.hora_fim, 'HH24:MI') AS "horaFim"
     FROM horarios h
     JOIN turmas t ON t.id = h.turma_id
     JOIN disciplinas d ON d.id = h.disciplina_id
     JOIN professores pr ON pr.id = h.professor_id
     LEFT JOIN salas s ON s.id = h.sala_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY h.dia_semana, h.hora_inicio`,
        values
    )
    return result.rows
}
