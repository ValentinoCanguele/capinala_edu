/**
 * SortAndFilter — parse e validar sort (campo, direção) e filtros; seguro contra injection.
 */
import type { NextApiRequest } from 'next'

const ALLOWED_DIRECTIONS = new Set(['asc', 'desc'])

export interface SortParams {
  field: string
  direction: 'asc' | 'desc'
}

/**
 * Aceita apenas campos que existem em allowedFields (evita injection).
 */
export function getSortFromRequest(
  req: NextApiRequest,
  allowedFields: string[],
  defaultField: string,
  defaultDirection: 'asc' | 'desc' = 'asc'
): SortParams {
  const allowedSet = new Set(allowedFields.map((f) => f.toLowerCase()))
  const rawField = (req.query.sort as string) ?? defaultField
  const field = rawField.toLowerCase().replace(/[^a-z0-9_]/g, '')
  const dir = String(req.query.order ?? req.query.direction ?? defaultDirection).toLowerCase()
  const direction = ALLOWED_DIRECTIONS.has(dir) ? (dir as 'asc' | 'desc') : defaultDirection
  return {
    field: allowedSet.has(field) ? field : defaultField,
    direction,
  }
}

export function buildOrderByClause(sort: SortParams, columnMap: Record<string, string>): string {
  const column = columnMap[sort.field] ?? sort.field
  const dir = sort.direction === 'desc' ? 'DESC' : 'ASC'
  return `${column} ${dir}`
}
