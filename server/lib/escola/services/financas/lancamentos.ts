import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import type { LancamentoCreate, LancamentoUpdate } from '../../schemas'

function getEscolaId(user: AuthUser): string {
  if (user.escolaId) return user.escolaId
  throw new Error('Usuário sem escola definida')
}

export async function listLancamentos(
  user: AuthUser,
  filtros: {
    tipo?: 'entrada' | 'saida'
    dataInicio?: string
    dataFim?: string
    categoriaId?: string
    anoLetivoId?: string
  } = {}
) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const conditions: string[] = ['escola_id = $1']
  const values: unknown[] = [escolaId]
  let pos = 2
  if (filtros.tipo) {
    conditions.push(`tipo = $${pos++}`)
    values.push(filtros.tipo)
  }
  if (filtros.dataInicio) {
    conditions.push(`data >= $${pos++}`)
    values.push(filtros.dataInicio)
  }
  if (filtros.dataFim) {
    conditions.push(`data <= $${pos++}`)
    values.push(filtros.dataFim)
  }
  if (filtros.categoriaId) {
    conditions.push(`categoria_id = $${pos++}`)
    values.push(filtros.categoriaId)
  }
  if (filtros.anoLetivoId) {
    conditions.push(`ano_letivo_id = $${pos++}`)
    values.push(filtros.anoLetivoId)
  }
  const result = await db.query(
    `SELECT l.id, l.tipo, l.data, l.valor, l.categoria_id AS "categoriaId",
            l.descricao, l.forma_pagamento AS "formaPagamento", l.referencia,
            l.aluno_id AS "alunoId", l.centro_custo AS "centroCusto",
            l.ano_letivo_id AS "anoLetivoId", c.nome AS "categoriaNome"
     FROM lancamentos l
     JOIN categorias_financeiras c ON c.id = l.categoria_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY l.data DESC, l.created_at DESC
     LIMIT 500`,
    values
  )
  return result.rows.map((r) => ({
    id: r.id,
    tipo: r.tipo,
    data: String(r.data).slice(0, 10),
    valor: Number(r.valor),
    categoriaId: r.categoriaId,
    categoriaNome: r.categoriaNome,
    descricao: r.descricao ?? '',
    formaPagamento: r.formaPagamento ?? '',
    referencia: r.referencia ?? '',
    alunoId: r.alunoId ?? null,
    centroCusto: r.centroCusto ?? '',
    anoLetivoId: r.anoLetivoId ?? null,
  }))
}

export async function createLancamento(user: AuthUser, data: LancamentoCreate) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    `INSERT INTO lancamentos (
       escola_id, ano_letivo_id, tipo, data, valor, categoria_id,
       descricao, forma_pagamento, referencia, aluno_id, centro_custo
     ) VALUES ($1, $2, $3, $4::date, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id, tipo, data, valor, categoria_id AS "categoriaId",
               descricao, forma_pagamento AS "formaPagamento", referencia,
               aluno_id AS "alunoId", centro_custo AS "centroCusto",
               ano_letivo_id AS "anoLetivoId"`,
    [
      escolaId,
      data.anoLetivoId ?? null,
      data.tipo,
      data.data,
      data.valor,
      data.categoriaId,
      data.descricao ?? null,
      data.formaPagamento ?? null,
      data.referencia ?? null,
      data.alunoId ?? null,
      data.centroCusto ?? null,
    ]
  )
  const r = result.rows[0]
  return {
    id: r.id,
    tipo: r.tipo,
    data: String(r.data).slice(0, 10),
    valor: Number(r.valor),
    categoriaId: r.categoriaId,
    descricao: r.descricao ?? '',
    formaPagamento: r.formaPagamento ?? '',
    referencia: r.referencia ?? '',
    alunoId: r.alunoId,
    centroCusto: r.centroCusto ?? '',
    anoLetivoId: r.anoLetivoId,
  }
}

export async function getLancamento(user: AuthUser, id: string) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    `SELECT id, tipo, data, valor, categoria_id AS "categoriaId",
            descricao, forma_pagamento AS "formaPagamento", referencia,
            aluno_id AS "alunoId", centro_custo AS "centroCusto",
            ano_letivo_id AS "anoLetivoId"
     FROM lancamentos
     WHERE id = $1 AND escola_id = $2`,
    [id, escolaId]
  )
  if (result.rows.length === 0) return null
  const r = result.rows[0]
  return {
    id: r.id,
    tipo: r.tipo,
    data: String(r.data).slice(0, 10),
    valor: Number(r.valor),
    categoriaId: r.categoriaId,
    descricao: r.descricao ?? '',
    formaPagamento: r.formaPagamento ?? '',
    referencia: r.referencia ?? '',
    alunoId: r.alunoId,
    centroCusto: r.centroCusto ?? '',
    anoLetivoId: r.anoLetivoId,
  }
}

export async function updateLancamento(
  user: AuthUser,
  id: string,
  data: LancamentoUpdate
) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const fields: string[] = []
  const values: unknown[] = []
  let pos = 1
  if (data.tipo !== undefined) {
    fields.push(`tipo = $${pos++}`)
    values.push(data.tipo)
  }
  if (data.data !== undefined) {
    fields.push(`data = $${pos++}::date`)
    values.push(data.data)
  }
  if (data.valor !== undefined) {
    fields.push(`valor = $${pos++}`)
    values.push(data.valor)
  }
  if (data.categoriaId !== undefined) {
    fields.push(`categoria_id = $${pos++}`)
    values.push(data.categoriaId)
  }
  if (data.descricao !== undefined) {
    fields.push(`descricao = $${pos++}`)
    values.push(data.descricao)
  }
  if (data.formaPagamento !== undefined) {
    fields.push(`forma_pagamento = $${pos++}`)
    values.push(data.formaPagamento)
  }
  if (data.referencia !== undefined) {
    fields.push(`referencia = $${pos++}`)
    values.push(data.referencia)
  }
  if (data.anoLetivoId !== undefined) {
    fields.push(`ano_letivo_id = $${pos++}`)
    values.push(data.anoLetivoId)
  }
  if (data.alunoId !== undefined) {
    fields.push(`aluno_id = $${pos++}`)
    values.push(data.alunoId)
  }
  if (data.centroCusto !== undefined) {
    fields.push(`centro_custo = $${pos++}`)
    values.push(data.centroCusto)
  }
  if (fields.length === 0) return getLancamento(user, id)
  values.push(id, escolaId)
  await db.query(
    `UPDATE lancamentos SET ${fields.join(', ')}
     WHERE id = $${pos} AND escola_id = $${pos + 1}`,
    values
  )
  return getLancamento(user, id)
}

export async function deleteLancamento(user: AuthUser, id: string) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    `DELETE FROM lancamentos WHERE id = $1 AND escola_id = $2 RETURNING id`,
    [id, escolaId]
  )
  return result.rowCount !== null && result.rowCount > 0
}
