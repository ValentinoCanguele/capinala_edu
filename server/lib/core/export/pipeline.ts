/**
 * ExportPipeline — orquestrar export (CSV, etc.): validação → query → formatação → stream.
 * Reutilizável por domínio (lançamentos, parcelas, inadimplência).
 */
export interface ExportColumn {
  key: string
  header: string
}

export function formatRowAsCsv(row: Record<string, unknown>, columns: ExportColumn[]): string {
  return columns
    .map((col) => {
      const v = row[col.key]
      const s = v == null ? '' : String(v)
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"`
        : s
    })
    .join(',')
}

export function csvHeader(columns: ExportColumn[]): string {
  return columns.map((c) => c.header).join(',')
}
