/**
 * ImportPipeline — orquestrar import: parse ficheiro → validar lotes → persistir com transação.
 * Usado por lançamentos CSV e outros imports em lote.
 */
export interface ImportResult<T> {
  importados: number
  erros: Array<{ linha?: number; mensagem: string; dados?: T }>
}

export interface ImportPipelineOptions<T, R> {
  parseRow: (line: string, index: number) => T | null
  validateRow: (row: T) => { ok: true } | { ok: false; message: string }
  persistRow: (row: T) => Promise<R>
}

export async function runImportPipeline<T, R>(
  lines: string[],
  options: ImportPipelineOptions<T, R>
): Promise<ImportResult<T>> {
  const erros: ImportResult<T>['erros'] = []
  let importados = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const row = options.parseRow(line, i + 1)
    if (row === null) {
      erros.push({ linha: i + 1, mensagem: 'Linha inválida' })
      continue
    }

    const validation = options.validateRow(row)
    if (!validation.ok) {
      erros.push({ linha: i + 1, mensagem: validation.message, dados: row })
      continue
    }

    try {
      await options.persistRow(row)
      importados += 1
    } catch (e) {
      erros.push({
        linha: i + 1,
        mensagem: e instanceof Error ? e.message : 'Erro ao persistir',
        dados: row,
      })
    }
  }

  return { importados, erros }
}
