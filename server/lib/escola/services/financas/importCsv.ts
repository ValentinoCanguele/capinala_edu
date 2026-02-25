import type { AuthUser } from '@/lib/db'
import { z } from 'zod'
import * as categoriasService from './categorias'
import * as lancamentosService from './lancamentos'

/** Colunas esperadas no CSV de lançamentos (igual ao export): Data, Tipo, Categoria, Valor, Descrição, Forma pagamento, Referência */
const lancamentoCsvRowSchema = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (YYYY-MM-DD)'),
  tipo: z.enum(['entrada', 'saida']),
  categoria: z.string().min(1, 'Categoria obrigatória'),
  valor: z.number().min(0, 'Valor deve ser >= 0'),
  descricao: z.string().optional(),
  formaPagamento: z.string().optional(),
  referencia: z.string().optional(),
})

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if ((c === ',' && !inQuotes) || c === '\r') {
      result.push(current.trim())
      current = ''
    } else if (c !== '\n' || !inQuotes) {
      current += c
    }
  }
  result.push(current.trim())
  return result
}

function parseCsvToRows(csvText: string): string[][] {
  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  if (lines.length === 0) return []
  return lines.map(parseCsvLine)
}

/** Converte linha de CSV (array de strings) para objeto com chaves normalizadas. Primeira linha = cabeçalho. */
function mapHeaderToRow(header: string[], values: string[]): Record<string, string> {
  const norm = (s: string) => s.toLowerCase().trim().replace(/\s+/g, ' ')
  const row: Record<string, string> = {}
  for (let i = 0; i < header.length; i++) {
    const key = norm(header[i])
    row[key] = values[i] ?? ''
  }
  return row
}

const HEADER_ALIASES: Record<string, string> = {
  data: 'data',
  tipo: 'tipo',
  categoria: 'categoria',
  valor: 'valor',
  descrição: 'descricao',
  descricao: 'descricao',
  'forma pagamento': 'formaPagamento',
  formapagamento: 'formaPagamento',
  referencia: 'referencia',
  referência: 'referencia',
}

function aliasKeys(row: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(row)) {
    const key = HEADER_ALIASES[k] ?? k
    out[key] = v
  }
  return out
}

export interface ImportLancamentosResult {
  importados: number
  erros: Array<{ linha: number; mensagem: string; dados?: string }>
}

/**
 * Importa lançamentos a partir de texto CSV.
 * Cabeçalho esperado: Data, Tipo, Categoria, Valor, Descrição, Forma pagamento, Referência.
 * Categoria é resolvida por nome (case-insensitive) nas categorias da escola.
 */
export async function importLancamentosCsv(
  user: AuthUser,
  csvText: string
): Promise<ImportLancamentosResult> {
  const result: ImportLancamentosResult = { importados: 0, erros: [] }
  // Remove UTF-8 BOM se existir (Excel e outros editores podem incluir)
  if (csvText.charCodeAt(0) === 0xfeff) {
    csvText = csvText.slice(1)
  }
  const rows = parseCsvToRows(csvText)
  if (rows.length < 2) {
    result.erros.push({ linha: 0, mensagem: 'CSV deve ter cabeçalho e pelo menos uma linha de dados' })
    return result
  }

  const categorias = await categoriasService.listCategoriasFinanceiras(user)
  const categoriaPorNome = new Map<string, string>()
  for (const c of categorias) {
    categoriaPorNome.set(c.nome.toLowerCase().trim(), c.id)
  }

  const header = rows[0].map((c) => c.toLowerCase().trim().replace(/\s+/g, ' '))
  const dataRows = rows.slice(1)

  for (let i = 0; i < dataRows.length; i++) {
    const lineNum = i + 2
    const raw = mapHeaderToRow(rows[0], dataRows[i])
    const row = aliasKeys(raw)
    // Ignorar linhas totalmente vazias (evita erro em linhas em branco no meio do CSV)
    const hasAnyField = [row.data, row.tipo, row.categoria, row.valor].some(
      (v) => v != null && String(v).trim() !== ''
    )
    if (!hasAnyField) continue

    const valorNum = row.valor ? parseFloat(String(row.valor).replace(',', '.')) : NaN
    const parsed = lancamentoCsvRowSchema.safeParse({
      data: row.data,
      tipo: row.tipo?.toLowerCase(),
      categoria: row.categoria,
      valor: Number.isFinite(valorNum) ? valorNum : undefined,
      descricao: row.descricao || undefined,
      formaPagamento: row.formaPagamento || undefined,
      referencia: row.referencia || undefined,
    })

    if (!parsed.success) {
      const msg = parsed.error.errors.map((e) => e.message).join('; ')
      result.erros.push({ linha: lineNum, mensagem: msg, dados: dataRows[i].join(', ') })
      continue
    }

    const catId = categoriaPorNome.get(parsed.data.categoria.toLowerCase().trim())
    if (!catId) {
      result.erros.push({
        linha: lineNum,
        mensagem: `Categoria não encontrada: "${parsed.data.categoria}"`,
        dados: dataRows[i].join(', '),
      })
      continue
    }

    try {
      await lancamentosService.createLancamento(user, {
        tipo: parsed.data.tipo,
        data: parsed.data.data,
        valor: parsed.data.valor,
        categoriaId: catId,
        descricao: parsed.data.descricao,
        formaPagamento: parsed.data.formaPagamento,
        referencia: parsed.data.referencia,
      })
      result.importados++
    } catch (e) {
      result.erros.push({
        linha: lineNum,
        mensagem: e instanceof Error ? e.message : 'Erro ao criar lançamento',
        dados: dataRows[i].join(', '),
      })
    }
  }

  return result
}
