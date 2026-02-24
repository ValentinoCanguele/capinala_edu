import pg from 'pg'

const { Pool } = pg

function getPool(): pg.Pool {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set')
  }
  return new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30000,
  })
}

let pool: pg.Pool | null = null

export function getDb(): pg.Pool {
  if (!pool) {
    pool = getPool()
  }
  return pool
}

export type Papel = 'admin' | 'direcao' | 'professor' | 'responsavel' | 'aluno'

export interface AuthUser {
  userId: string
  pessoaId: string
  escolaId: string | null
  papel: Papel
}
