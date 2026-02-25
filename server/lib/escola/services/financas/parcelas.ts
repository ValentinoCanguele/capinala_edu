import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import type { ParcelaCreate, PagamentoCreate } from '../../schemas'
import * as configService from './configuracao'
import * as matriculasService from '../matriculas'
import { calcularValorComMultaEJuros, hojeISO } from '../../regras/financas'

function getEscolaId(user: AuthUser): string {
  if (user.escolaId) return user.escolaId
  throw new Error('Usuário sem escola definida')
}

/** Adiciona n meses a uma data ISO (YYYY-MM-DD). */
function addMonths(isoDate: string, n: number): string {
  const d = new Date(isoDate + 'T12:00:00Z')
  d.setUTCMonth(d.getUTCMonth() + n)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Atualiza parcelas em atraso: status para atrasada e valor_atualizado com multa/juros. */
export async function atualizarParcelasAtrasadas(user: AuthUser): Promise<number> {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const config = await configService.getConfiguracaoFinanceira(user)
  const hoje = hojeISO()
  const result = await db.query(
    `SELECT id, valor_original, vencimento FROM parcelas
     WHERE escola_id = $1 AND status = 'aberta' AND vencimento < $2::date`,
    [escolaId, hoje]
  )
  let updated = 0
  for (const r of result.rows) {
    const valorAtualizado = calcularValorComMultaEJuros(
      Number(r.valor_original),
      String(r.vencimento).slice(0, 10),
      hoje,
      config
    )
    await db.query(
      `UPDATE parcelas SET status = 'atrasada', valor_atualizado = $1
       WHERE id = $2 AND escola_id = $3`,
      [valorAtualizado, r.id, escolaId]
    )
    updated++
  }
  return updated
}

export async function listParcelas(
  user: AuthUser,
  filtros: {
    anoLetivoId?: string
    alunoId?: string
    responsavelId?: string
    status?: string
    dataInicio?: string
    dataFim?: string
  } = {}
) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const conditions: string[] = ['p.escola_id = $1']
  const values: unknown[] = [escolaId]
  let pos = 2
  if (filtros.anoLetivoId) {
    conditions.push(`p.ano_letivo_id = $${pos++}`)
    values.push(filtros.anoLetivoId)
  }
  if (filtros.alunoId) {
    conditions.push(`p.aluno_id = $${pos++}`)
    values.push(filtros.alunoId)
  }
  if (filtros.responsavelId) {
    conditions.push(`p.responsavel_id = $${pos++}`)
    values.push(filtros.responsavelId)
  }
  if (filtros.status) {
    conditions.push(`p.status = $${pos++}`)
    values.push(filtros.status)
  }
  if (filtros.dataInicio) {
    conditions.push(`p.vencimento >= $${pos++}`)
    values.push(filtros.dataInicio)
  }
  if (filtros.dataFim) {
    conditions.push(`p.vencimento <= $${pos++}`)
    values.push(filtros.dataFim)
  }
  await atualizarParcelasAtrasadas(user)
  const result = await db.query(
    `SELECT p.id, p.aluno_id AS "alunoId", p.responsavel_id AS "responsavelId",
            p.categoria_id AS "categoriaId", p.valor_original AS "valorOriginal",
            p.valor_atualizado AS "valorAtualizado", p.vencimento, p.status,
            p.descricao, p.ano_letivo_id AS "anoLetivoId",
            pe.nome AS "alunoNome", c.nome AS "categoriaNome"
     FROM parcelas p
     JOIN alunos a ON a.id = p.aluno_id
     JOIN pessoas pe ON pe.id = a.pessoa_id
     JOIN categorias_financeiras c ON c.id = p.categoria_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY p.vencimento DESC, p.created_at DESC
     LIMIT 500`,
    values
  )
  return result.rows.map((r) => ({
    id: r.id,
    alunoId: r.alunoId,
    alunoNome: r.alunoNome,
    responsavelId: r.responsavelId,
    categoriaId: r.categoriaId,
    categoriaNome: r.categoriaNome,
    valorOriginal: Number(r.valorOriginal),
    valorAtualizado: Number(r.valorAtualizado),
    vencimento: String(r.vencimento).slice(0, 10),
    status: r.status,
    descricao: r.descricao ?? '',
    anoLetivoId: r.anoLetivoId,
  }))
}

export async function createParcela(user: AuthUser, data: ParcelaCreate) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const valorAtualizado = data.valorOriginal
  const result = await db.query(
    `INSERT INTO parcelas (
       escola_id, ano_letivo_id, aluno_id, responsavel_id, categoria_id,
       valor_original, valor_atualizado, vencimento, status, descricao
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::date, 'aberta', $9)
     RETURNING id, aluno_id AS "alunoId", categoria_id AS "categoriaId",
               valor_original AS "valorOriginal", valor_atualizado AS "valorAtualizado",
               vencimento, status, descricao, ano_letivo_id AS "anoLetivoId"`,
    [
      escolaId,
      data.anoLetivoId,
      data.alunoId,
      data.responsavelId ?? null,
      data.categoriaId,
      data.valorOriginal,
      valorAtualizado,
      data.vencimento,
      data.descricao ?? null,
    ]
  )
  const r = result.rows[0]
  return {
    id: r.id,
    alunoId: r.alunoId,
    categoriaId: r.categoriaId,
    valorOriginal: Number(r.valorOriginal),
    valorAtualizado: Number(r.valorAtualizado),
    vencimento: String(r.vencimento).slice(0, 10),
    status: r.status,
    descricao: r.descricao ?? '',
    anoLetivoId: r.anoLetivoId,
  }
}

export async function getParcela(user: AuthUser, id: string) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    `SELECT p.id, p.aluno_id AS "alunoId", p.responsavel_id AS "responsavelId",
            p.categoria_id AS "categoriaId", p.valor_original AS "valorOriginal",
            p.valor_atualizado AS "valorAtualizado", p.vencimento, p.status,
            p.descricao, p.ano_letivo_id AS "anoLetivoId",
            pe.nome AS "alunoNome", c.nome AS "categoriaNome"
     FROM parcelas p
     JOIN alunos a ON a.id = p.aluno_id
     JOIN pessoas pe ON pe.id = a.pessoa_id
     JOIN categorias_financeiras c ON c.id = p.categoria_id
     WHERE p.id = $1 AND p.escola_id = $2`,
    [id, escolaId]
  )
  if (result.rows.length === 0) return null
  const r = result.rows[0]
  return {
    id: r.id,
    alunoId: r.alunoId,
    alunoNome: r.alunoNome,
    responsavelId: r.responsavelId,
    categoriaId: r.categoriaId,
    categoriaNome: r.categoriaNome,
    valorOriginal: Number(r.valorOriginal),
    valorAtualizado: Number(r.valorAtualizado),
    vencimento: String(r.vencimento).slice(0, 10),
    status: r.status,
    descricao: r.descricao ?? '',
    anoLetivoId: r.anoLetivoId,
  }
}

export async function listPagamentosByParcela(user: AuthUser, parcelaId: string) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    `SELECT pg.id, pg.parcela_id AS "parcelaId", pg.data_pagamento AS "dataPagamento",
            pg.valor, pg.forma_pagamento AS "formaPagamento", pg.created_at AS "createdAt"
     FROM pagamentos pg
     JOIN parcelas p ON p.id = pg.parcela_id
     WHERE pg.parcela_id = $1 AND p.escola_id = $2
     ORDER BY pg.data_pagamento DESC`,
    [parcelaId, escolaId]
  )
  return result.rows.map((r) => ({
    id: r.id,
    parcelaId: r.parcelaId,
    dataPagamento: String(r.dataPagamento).slice(0, 10),
    valor: Number(r.valor),
    formaPagamento: r.formaPagamento ?? '',
    createdAt: r.createdAt ? String(r.createdAt).slice(0, 19) : '',
  }))
}

export async function registrarPagamento(user: AuthUser, data: PagamentoCreate) {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const client = await db.connect()
  try {
    const parcelaCheck = await client.query(
      `SELECT id, valor_atualizado, status FROM parcelas
       WHERE id = $1 AND escola_id = $2`,
      [data.parcelaId, escolaId]
    )
    if (parcelaCheck.rows.length === 0) return null
    const parcela = parcelaCheck.rows[0]
    await client.query(
      `INSERT INTO pagamentos (parcela_id, data_pagamento, valor, forma_pagamento)
       VALUES ($1, $2::date, $3, $4)`,
      [data.parcelaId, data.dataPagamento, data.valor, data.formaPagamento ?? null]
    )
    const valorRestante = Number(parcela.valor_atualizado) - data.valor
    const newStatus = valorRestante <= 0 ? 'paga' : 'aberta'
    await client.query(
      `UPDATE parcelas SET status = $1, valor_atualizado = $2
       WHERE id = $3 AND escola_id = $4`,
      [newStatus, Math.max(0, valorRestante), data.parcelaId, escolaId]
    )
  } finally {
    client.release()
  }
  return getParcela(user, data.parcelaId)
}

export interface GerarParcelasLoteInput {
  anoLetivoId: string
  turmaId: string
  categoriaId: string
  valorOriginal: number
  primeiroVencimento: string
  numeroParcelas: number
  descricao?: string
}

export interface GerarParcelasLoteResult {
  criadas: number
  alunos: number
}

/**
 * Gera parcelas em lote para todos os alunos da turma: cada aluno recebe
 * numeroParcelas parcelas com vencimentos mensais a partir de primeiroVencimento.
 */
export async function gerarParcelasLote(
  user: AuthUser,
  input: GerarParcelasLoteInput
): Promise<GerarParcelasLoteResult> {
  const matriculas = await matriculasService.listMatriculasByTurma(
    user,
    input.turmaId
  )
  let criadas = 0
  for (const m of matriculas) {
    const alunoId = m.alunoId as string
    for (let i = 0; i < input.numeroParcelas; i++) {
      const vencimento = addMonths(input.primeiroVencimento, i)
      await createParcela(user, {
        anoLetivoId: input.anoLetivoId,
        alunoId,
        categoriaId: input.categoriaId,
        valorOriginal: input.valorOriginal,
        vencimento,
        descricao: input.descricao
          ? `${input.descricao} (${i + 1}/${input.numeroParcelas})`
          : `Parcela ${i + 1}/${input.numeroParcelas}`,
      })
      criadas++
    }
  }
  return { criadas, alunos: matriculas.length }
}
