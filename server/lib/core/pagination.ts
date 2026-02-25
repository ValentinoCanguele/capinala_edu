/**
 * PaginationHelper — calcular offset/limit e metadados (total, hasMore) a partir de query params.
 */
import type { NextApiRequest } from 'next'

export interface PaginationParams {
  page: number
  limit: number
  offset: number
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

const DEFAULT_PAGE = 1
const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

export function getPaginationFromRequest(req: NextApiRequest): PaginationParams {
  const page = Math.max(1, parseInt(String(req.query.page), 10) || DEFAULT_PAGE)
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, parseInt(String(req.query.limit), 10) || DEFAULT_LIMIT)
  )
  const offset = (page - 1) * limit
  return { page, limit, offset }
}

export function buildPaginationMeta(
  params: PaginationParams,
  total: number
): PaginationMeta {
  const totalPages = Math.ceil(total / params.limit) || 1
  return {
    page: params.page,
    limit: params.limit,
    total,
    totalPages,
    hasMore: params.page < totalPages,
  }
}
