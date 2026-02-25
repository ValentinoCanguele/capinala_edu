import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import { hojeISO } from '../../regras/financas'

function getEscolaId(user: AuthUser): string {
  if (user.escolaId) return user.escolaId
  throw new Error('Usuário sem escola definida')
}

export interface FluxoCaixaRow {
  data: string
  descricao: string
  tipo: 'entrada' | 'saida'
  valor: number
  categoriaNome: string
  saldoAcumulado: number
}

export async function getFluxoCaixa(
  user: AuthUser,
  dataInicio: string,
  dataFim: string
): Promise<FluxoCaixaRow[]> {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    `SELECT l.data, l.tipo, l.valor, l.descricao, c.nome AS "categoriaNome"
     FROM lancamentos l
     JOIN categorias_financeiras c ON c.id = l.categoria_id
     WHERE l.escola_id = $1 AND l.data >= $2::date AND l.data <= $3::date
     ORDER BY l.data ASC, l.created_at ASC`,
    [escolaId, dataInicio, dataFim]
  )
  let saldo = 0
  return result.rows.map((r) => {
    const valor = Number(r.valor)
    const entrada = r.tipo === 'entrada' ? valor : 0
    const saida = r.tipo === 'saida' ? valor : 0
    saldo += entrada - saida
    return {
      data: String(r.data).slice(0, 10),
      descricao: r.descricao ?? '',
      tipo: r.tipo,
      valor,
      categoriaNome: r.categoriaNome,
      saldoAcumulado: Math.round(saldo * 100) / 100,
    }
  })
}

export interface DRERow {
  categoriaNome: string
  tipo: 'receita' | 'despesa'
  total: number
}

export async function getDRESimplificado(
  user: AuthUser,
  dataInicio: string,
  dataFim: string
): Promise<{ receitas: DRERow[]; despesas: DRERow[]; totalReceitas: number; totalDespesas: number; resultado: number }> {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const result = await db.query(
    `SELECT c.nome AS "categoriaNome", c.tipo, l.tipo AS "lancamentoTipo",
            SUM(l.valor) AS total
     FROM lancamentos l
     JOIN categorias_financeiras c ON c.id = l.categoria_id
     WHERE l.escola_id = $1 AND l.data >= $2::date AND l.data <= $3::date
     GROUP BY c.id, c.nome, c.tipo, l.tipo
     ORDER BY c.tipo, total DESC`,
    [escolaId, dataInicio, dataFim]
  )
  const receitas: DRERow[] = []
  const despesas: DRERow[] = []
  let totalReceitas = 0
  let totalDespesas = 0
  for (const r of result.rows) {
    const total = Number(r.total)
    const row = { categoriaNome: r.categoriaNome, tipo: r.tipo, total }
    if (r.lancamentoTipo === 'entrada') {
      receitas.push(row)
      totalReceitas += total
    } else {
      despesas.push(row)
      totalDespesas += total
    }
  }
  return {
    receitas,
    despesas,
    totalReceitas,
    totalDespesas,
    resultado: Math.round((totalReceitas - totalDespesas) * 100) / 100,
  }
}

export interface InadimplenteRow {
  alunoId: string
  alunoNome: string
  parcelasAtrasadas: number
  valorTotalAberto: number
  diasAtraso: number
}

export async function getInadimplencia(
  user: AuthUser,
  anoLetivoId?: string,
  dataReferencia?: string
): Promise<InadimplenteRow[]> {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const ref = dataReferencia ?? hojeISO()
  const conditions = [
    'p.escola_id = $1',
    "p.status IN ('aberta', 'atrasada')",
    'p.vencimento < $2::date',
  ]
  const values: unknown[] = [escolaId, ref]
  let pos = 3
  if (anoLetivoId) {
    conditions.push(`p.ano_letivo_id = $${pos++}`)
    values.push(anoLetivoId)
  }
  const result = await db.query(
    `SELECT p.aluno_id AS "alunoId", pe.nome AS "alunoNome",
            COUNT(*)::int AS "parcelasAtrasadas",
            SUM(p.valor_atualizado) AS "valorTotalAberto",
            MAX(CURRENT_DATE - p.vencimento::date)::int AS "diasAtraso"
     FROM parcelas p
     JOIN alunos a ON a.id = p.aluno_id
     JOIN pessoas pe ON pe.id = a.pessoa_id
     WHERE ${conditions.join(' AND ')}
     GROUP BY p.aluno_id, pe.nome
     ORDER BY SUM(p.valor_atualizado) DESC`,
    values
  )
  return result.rows.map((r) => ({
    alunoId: r.alunoId,
    alunoNome: r.alunoNome,
    parcelasAtrasadas: r.parcelasAtrasadas,
    valorTotalAberto: Math.round(Number(r.valorTotalAberto) * 100) / 100,
    diasAtraso: r.diasAtraso ?? 0,
  }))
}

export interface DashboardFinancas {
  receitasMes: number
  despesasMes: number
  saldoMes: number
  totalInadimplencia: number
  quantidadeInadimplentes: number
  parcelasAVencer7Dias: number
  parcelasVencidas: number
  evolucaoMensal: { mes: string; receitas: number; despesas: number }[]
}

export async function getDashboardFinancas(user: AuthUser): Promise<DashboardFinancas> {
  const db = getDb()
  const escolaId = getEscolaId(user)
  const inicioMes = new Date()
  inicioMes.setDate(1)
  inicioMes.setHours(0, 0, 0, 0)
  const fimMes = new Date(inicioMes)
  fimMes.setMonth(fimMes.getMonth() + 1)
  const dataInicioMes = inicioMes.toISOString().slice(0, 10)
  const dataFimMes = fimMes.toISOString().slice(0, 10)

  const [resMes, resInad, resVencer, resVencidas, resEvolucao] = await Promise.all([
    db.query(
      `SELECT tipo, SUM(valor) AS total FROM lancamentos
       WHERE escola_id = $1 AND data >= $2::date AND data <= $3::date
       GROUP BY tipo`,
      [escolaId, dataInicioMes, dataFimMes]
    ),
    db.query(
      `SELECT COUNT(DISTINCT aluno_id)::int AS qtd, COALESCE(SUM(valor_atualizado), 0) AS total
       FROM parcelas
       WHERE escola_id = $1 AND status IN ('aberta', 'atrasada') AND vencimento < CURRENT_DATE`,
      [escolaId]
    ),
    db.query(
      `SELECT COUNT(*)::int FROM parcelas
       WHERE escola_id = $1 AND status IN ('aberta', 'atrasada')
         AND vencimento >= CURRENT_DATE AND vencimento <= CURRENT_DATE + INTERVAL '7 days'`,
      [escolaId]
    ),
    db.query(
      `SELECT COUNT(*)::int FROM parcelas
       WHERE escola_id = $1 AND status IN ('aberta', 'atrasada') AND vencimento < CURRENT_DATE`,
      [escolaId]
    ),
    db.query(
      `SELECT date_trunc('month', data)::date AS mes, tipo, SUM(valor) AS total
       FROM lancamentos
       WHERE escola_id = $1 AND data >= CURRENT_DATE - INTERVAL '12 months'
       GROUP BY date_trunc('month', data), tipo
       ORDER BY mes ASC`,
      [escolaId]
    ),
  ])

  let receitasMes = 0
  let despesasMes = 0
  for (const r of resMes.rows) {
    const t = Number(r.total)
    if (r.tipo === 'entrada') receitasMes += t
    else despesasMes += t
  }

  const inad = resInad.rows[0]
  const totalInadimplencia = Number(inad?.total ?? 0)
  const quantidadeInadimplentes = inad?.qtd ?? 0
  const parcelasAVencer7Dias = Number(resVencer.rows[0]?.count ?? 0)
  const parcelasVencidas = Number(resVencidas.rows[0]?.count ?? 0)

  const byMonth: Record<string, { receitas: number; despesas: number }> = {}
  for (const r of resEvolucao.rows) {
    const mes = String(r.mes).slice(0, 7)
    if (!byMonth[mes]) byMonth[mes] = { receitas: 0, despesas: 0 }
    const t = Number(r.total)
    if (r.tipo === 'entrada') byMonth[mes].receitas += t
    else byMonth[mes].despesas += t
  }
  const evolucaoMensal = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, v]) => ({ mes, receitas: v.receitas, despesas: v.despesas }))

  return {
    receitasMes,
    despesasMes,
    saldoMes: Math.round((receitasMes - despesasMes) * 100) / 100,
    totalInadimplencia,
    quantidadeInadimplentes,
    parcelasAVencer7Dias,
    parcelasVencidas,
    evolucaoMensal,
  }
}
