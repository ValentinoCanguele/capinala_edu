import { getAuthHeader } from '@/lib/auth'

const API_BASE = import.meta.env.VITE_API_BASE ?? ''

/**
 * Faz o download de um ficheiro CSV da API (export) com o token de autenticação.
 */
export async function downloadExportCsv(path: string, filename: string): Promise<void> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`
  const res = await fetch(url, {
    method: 'GET',
    headers: { ...getAuthHeader() },
    credentials: 'include',
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  const blob = await res.blob()
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

const LANCAMENTOS_CSV_HEADER =
  'Data,Tipo,Categoria,Valor,Descrição,Forma pagamento,Referência'

/** Linhas de exemplo para o modelo de importação (entrada e saída). */
const LANCAMENTOS_CSV_EXAMPLES = [
  '2025-01-15,entrada,Mensalidades,150.00,Mensalidade Jan,Transferência,REF-001',
  '2025-01-20,saida,Material escolar,85.50,Compras material,,',
]

/**
 * Gera e descarrega um CSV modelo para importação de lançamentos (cabeçalho + exemplos).
 */
export function downloadLancamentosCsvTemplate(): void {
  const csv = [LANCAMENTOS_CSV_HEADER, ...LANCAMENTOS_CSV_EXAMPLES].join('\r\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'modelo-lancamentos.csv'
  link.click()
  URL.revokeObjectURL(link.href)
}
