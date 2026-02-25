import { getDb } from '@/lib/db'
import type { AuthUser } from '@/lib/db'
import { assertPermissao } from '@/lib/escola/permissoes'
import type { ModuloUpdate } from '@/lib/escola/schemas/modulo'
import {
  getEntradaCatalogo,
  MODULOS_CATALOGO,
  type EntradaCatalogo,
} from '@/lib/escola/modulosCatalogo'

export interface ModuloRow {
  id: string
  chave: string
  nome: string
  descricao: string | null
  ativo: boolean
  ordem: number
  config: Record<string, unknown>
  permissoes: string[]
  imagem: string | null
  icone: string | null
  created_at: string
  updated_at: string
}

function mapRow(r: {
  id: string
  chave: string
  nome: string
  descricao: string | null
  ativo: boolean
  ordem: number
  config: unknown
  permissoes: unknown
  imagem?: string | null
  icone?: string | null
  created_at: string
  updated_at: string
}): ModuloRow {
  return {
    id: r.id,
    chave: r.chave,
    nome: r.nome,
    descricao: r.descricao,
    ativo: r.ativo,
    ordem: r.ordem,
    config: (r.config as Record<string, unknown>) ?? {},
    permissoes: Array.isArray(r.permissoes)
      ? (r.permissoes as string[])
      : typeof r.permissoes === 'string'
        ? (JSON.parse(r.permissoes) as string[])
        : [],
    imagem: r.imagem ?? null,
    icone: r.icone ?? null,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }
}

/**
 * Lista todos os módulos (para gestão ou para construir menu).
 * Quem gere: apenas admin. Para menu o front filtra por ativo e permissoes.
 */
const COLS =
  'id, chave, nome, descricao, ativo, ordem, config, permissoes, imagem, icone, created_at, updated_at'

export async function listModulos(user: AuthUser): Promise<ModuloRow[]> {
  const db = getDb()
  const result = await db.query(
    `SELECT ${COLS} FROM sistema_modulos ORDER BY ordem ASC, nome ASC`
  )
  return result.rows.map(mapRow)
}

/** Lista instalados + entradas do catálogo ainda não instaladas (para admin). */
export interface ModulosComDisponiveis {
  instalados: ModuloRow[]
  disponiveis: EntradaCatalogo[]
}

export async function listModulosComDisponiveis(
  user: AuthUser
): Promise<ModulosComDisponiveis> {
  const instalados = await listModulos(user)
  const chavesInstaladas = new Set(instalados.map((m) => m.chave))
  const disponiveis = MODULOS_CATALOGO.filter((e) => !chavesInstaladas.has(e.chave))
  return { instalados, disponiveis }
}

/** Instala um módulo novo a partir do catálogo. Apenas admin. */
export async function installModulo(
  user: AuthUser,
  chave: string
): Promise<ModuloRow> {
  assertPermissao(user, ['admin'], 'instalar módulos')
  const entrada = getEntradaCatalogo(chave)
  if (!entrada) throw new Error(`Módulo "${chave}" não existe no catálogo`)
  const db = getDb()
  const existing = await db.query(
    'SELECT id FROM sistema_modulos WHERE chave = $1',
    [chave]
  )
  if (existing.rows.length > 0) throw new Error('Módulo já está instalado')
  const result = await db.query(
    `INSERT INTO sistema_modulos (chave, nome, descricao, ativo, ordem, permissoes, imagem, icone)
     VALUES ($1, $2, $3, true, $4, $5, $6, $7)
     RETURNING ${COLS}`,
    [
      entrada.chave,
      entrada.nome,
      entrada.descricao,
      entrada.ordemDefault,
      JSON.stringify(entrada.permissoesDefault),
      entrada.imagem ?? null,
      entrada.icone ?? null,
    ]
  )
  return mapRow(result.rows[0])
}

/**
 * Devolve um módulo por id. Apenas admin/direcao podem alterar.
 */
export async function getModulo(user: AuthUser, id: string): Promise<ModuloRow | null> {
  const db = getDb()
  const result = await db.query(
    `SELECT ${COLS} FROM sistema_modulos WHERE id = $1`,
    [id]
  )
  const row = result.rows[0]
  return row ? mapRow(row) : null
}

/**
 * Atualiza um módulo (instalar/desinstalar = ativo, nome, ordem, config, permissoes).
 * Apenas admin pode gerir módulos.
 */
export async function updateModulo(
  user: AuthUser,
  id: string,
  data: ModuloUpdate
): Promise<ModuloRow> {
  assertPermissao(user, ['admin'], 'gerir módulos do sistema')

  const db = getDb()
  const updates: string[] = []
  const values: unknown[] = []
  let pos = 1

  if (data.nome !== undefined) {
    updates.push(`nome = $${pos++}`)
    values.push(data.nome)
  }
  if (data.descricao !== undefined) {
    updates.push(`descricao = $${pos++}`)
    values.push(data.descricao)
  }
  if (data.ativo !== undefined) {
    updates.push(`ativo = $${pos++}`)
    values.push(data.ativo)
  }
  if (data.ordem !== undefined) {
    updates.push(`ordem = $${pos++}`)
    values.push(data.ordem)
  }
  if (data.config !== undefined) {
    updates.push(`config = $${pos++}`)
    values.push(JSON.stringify(data.config))
  }
  if (data.permissoes !== undefined) {
    updates.push(`permissoes = $${pos++}`)
    values.push(JSON.stringify(data.permissoes))
  }
  if (data.imagem !== undefined) {
    updates.push(`imagem = $${pos++}`)
    values.push(data.imagem)
  }
  if (data.icone !== undefined) {
    updates.push(`icone = $${pos++}`)
    values.push(data.icone)
  }

  if (updates.length === 0) {
    const existing = await getModulo(user, id)
    if (!existing) throw new Error('Módulo não encontrado')
    return existing
  }

  values.push(id)
  await db.query(
    `UPDATE sistema_modulos SET ${updates.join(', ')} WHERE id = $${pos}`,
    values
  )
  const updated = await getModulo(user, id)
  if (!updated) throw new Error('Módulo não encontrado')
  return updated
}
