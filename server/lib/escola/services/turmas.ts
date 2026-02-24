import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import type { TurmaCreate, TurmaUpdate } from '../schemas'

function getEscolaId(user: AuthUser): string {
  if (user.escolaId) return user.escolaId
  throw new Error('Usuário sem escola definida')
}

export async function listTurmas(user: AuthUser) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    `SELECT t.id, t.nome, a.nome AS "anoLetivo", t.ano_letivo_id AS "anoLetivoId"
     FROM turmas t
     JOIN anos_letivos a ON a.id = t.ano_letivo_id
     WHERE t.escola_id = $1
     ORDER BY a.data_inicio DESC, t.nome`,
    [escolaId]
  )
  const turmas = result.rows.map((r) => ({
    id: r.id,
    nome: r.nome,
    anoLetivo: r.anoLetivo,
    anoLetivoId: r.anoLetivoId,
  }))
  for (const t of turmas) {
    const mat = await db.query(
      'SELECT aluno_id AS "alunoId" FROM matriculas WHERE turma_id = $1',
      [t.id]
    )
    ;(t as Record<string, unknown>).alunoIds = mat.rows.map((r) => r.alunoId)
  }
  return turmas
}

export async function createTurma(user: AuthUser, data: TurmaCreate) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  let anoLetivoId = data.anoLetivoId
  if (!anoLetivoId && data.anoLetivo) {
    const al = await db.query(
      'SELECT id FROM anos_letivos WHERE escola_id = $1 AND nome = $2 LIMIT 1',
      [escolaId, data.anoLetivo]
    )
    if (al.rows.length > 0) anoLetivoId = al.rows[0].id
    else {
      const [inicio, fim] = data.anoLetivo.includes('/')
        ? data.anoLetivo.split('/').map((s) => s.trim())
        : [data.anoLetivo + '-09-01', String(Number(data.anoLetivo) + 1) + '-06-30']
      const insert = await db.query(
        `INSERT INTO anos_letivos (escola_id, nome, data_inicio, data_fim)
         VALUES ($1, $2, $3::date, $4::date) RETURNING id`,
        [escolaId, data.anoLetivo, inicio, fim]
      )
      anoLetivoId = insert.rows[0].id
    }
  }
  if (!anoLetivoId) throw new Error('Ano letivo é obrigatório')
  const result = await db.query(
    `INSERT INTO turmas (escola_id, ano_letivo_id, nome) VALUES ($1, $2, $3)
     RETURNING id, nome`,
    [escolaId, anoLetivoId, data.nome]
  )
  const turma = result.rows[0]
  const alunoIds = data.alunoIds ?? []
  for (const alunoId of alunoIds) {
    await db.query(
      'INSERT INTO matriculas (aluno_id, turma_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [alunoId, turma.id]
    )
  }
  const anoResult = await db.query(
    'SELECT nome FROM anos_letivos WHERE id = $1',
    [anoLetivoId]
  )
  return {
    id: turma.id,
    nome: turma.nome,
    anoLetivo: anoResult.rows[0]?.nome ?? data.anoLetivo,
    anoLetivoId,
    alunoIds,
  }
}

export async function getTurma(user: AuthUser, id: string) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    `SELECT t.id, t.nome, t.ano_letivo_id AS "anoLetivoId", a.nome AS "anoLetivo"
     FROM turmas t
     JOIN anos_letivos a ON a.id = t.ano_letivo_id
     WHERE t.id = $1 AND t.escola_id = $2`,
    [id, escolaId]
  )
  if (result.rows.length === 0) return null
  const r = result.rows[0]
  const mat = await db.query(
    'SELECT aluno_id AS "alunoId" FROM matriculas WHERE turma_id = $1',
    [id]
  )
  return {
    id: r.id,
    nome: r.nome,
    anoLetivo: r.anoLetivo,
    anoLetivoId: r.anoLetivoId,
    alunoIds: mat.rows.map((m) => m.alunoId),
  }
}

export async function updateTurma(user: AuthUser, id: string, data: TurmaUpdate) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const existing = await getTurma(user, id)
  if (!existing) return null
  if (data.nome !== undefined) {
    await db.query('UPDATE turmas SET nome = $1 WHERE id = $2 AND escola_id = $3', [
      data.nome,
      id,
      escolaId,
    ])
  }
  if (data.anoLetivo !== undefined || data.anoLetivoId !== undefined) {
    let anoLetivoId = data.anoLetivoId
    if (!anoLetivoId && data.anoLetivo) {
      const al = await db.query(
        'SELECT id FROM anos_letivos WHERE escola_id = $1 AND nome = $2 LIMIT 1',
        [escolaId, data.anoLetivo]
      )
      if (al.rows.length > 0) anoLetivoId = al.rows[0].id
    }
    if (anoLetivoId) {
      await db.query(
        'UPDATE turmas SET ano_letivo_id = $1 WHERE id = $2 AND escola_id = $3',
        [anoLetivoId, id, escolaId]
      )
    }
  }
  if (data.alunoIds !== undefined) {
    await db.query('DELETE FROM matriculas WHERE turma_id = $1', [id])
    for (const alunoId of data.alunoIds) {
      await db.query(
        'INSERT INTO matriculas (aluno_id, turma_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [alunoId, id]
      )
    }
  }
  return getTurma(user, id)
}

export async function deleteTurma(user: AuthUser, id: string): Promise<boolean> {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    'DELETE FROM turmas WHERE id = $1 AND escola_id = $2 RETURNING id',
    [id, escolaId]
  )
  return result.rowCount !== null && result.rowCount > 0
}
