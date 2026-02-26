import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { getDb } from '@/lib/db'
import { signToken } from '@/lib/auth'
import { jsonSuccess, jsonError } from '@/lib/apiWrapper'

const bodySchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

function zodMessage(err: z.ZodError): string {
  const first = err.issues[0]
  return first?.message ?? err.message ?? 'Dados inválidos'
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST')
      return jsonError(res, 'Method not allowed', 405)
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body ?? {}
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return jsonError(res, zodMessage(parsed.error), 400)
    }
    const { email, password } = parsed.data

    const db = getDb()
    const pessoaResult = await db.query(
      'SELECT id FROM pessoas WHERE email = $1',
      [email]
    )
    if (pessoaResult.rows.length === 0) {
      return jsonError(res, 'Email ou senha inválidos', 401)
    }
    const pessoaId = pessoaResult.rows[0].id
    const userResult = await db.query(
      'SELECT id, escola_id, papel, password_hash FROM usuarios WHERE pessoa_id = $1 LIMIT 1',
      [pessoaId]
    )
    if (userResult.rows.length === 0) {
      return jsonError(res, 'Email ou senha inválidos', 401)
    }
    const row = userResult.rows[0]
    const storedPassword = row.password_hash == null ? '' : String(row.password_hash)
    if (storedPassword !== password) {
      return jsonError(res, 'Email ou senha inválidos', 401)
    }
    const token = await signToken({
      sub: String(row.id),
      pessoaId: String(pessoaId),
      escolaId: row.escola_id,
      papel: String(row.papel) as 'admin' | 'direcao' | 'professor' | 'responsavel' | 'aluno',
    })
    return jsonSuccess(res, { token, papel: row.papel, userId: row.id })
  } catch (err) {
    if (res.writableEnded) return
    const message =
      err instanceof Error && err.message === 'DATABASE_URL is not set'
        ? 'Base de dados não configurada. Defina DATABASE_URL em server/.env'
        : err instanceof Error && (err as NodeJS.ErrnoException).code === 'ECONNREFUSED'
          ? 'Base de dados indisponível. Inicie o PostgreSQL (ex.: bash server/scripts/setup-postgres.sh)'
          : err instanceof Error
            ? err.message
            : 'Erro no servidor. Tente de novo.'
    return jsonError(res, message, 503)
  }
}
