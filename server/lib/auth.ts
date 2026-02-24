import type { NextApiRequest, NextApiResponse } from 'next'
import * as jose from 'jose'
import type { AuthUser } from './db'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'

export async function getAuthUser(req: NextApiRequest): Promise<AuthUser | null> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }
  const token = authHeader.slice(7)
  try {
    const secret = new TextEncoder().encode(JWT_SECRET)
    const { payload } = await jose.jwtVerify(token, secret)
    const sub = payload.sub
    const pessoaId = payload.pessoaId as string
    const escolaId = (payload.escolaId as string) ?? null
    const papel = payload.papel as AuthUser['papel']
    if (!sub || !pessoaId || !papel) return null
    return { userId: sub, pessoaId, escolaId, papel }
  } catch {
    return null
  }
}

export function requireAuth(
  req: NextApiRequest,
  res: NextApiResponse,
  handler: (user: AuthUser) => Promise<void>
): Promise<void> {
  return getAuthUser(req).then((user) => {
    if (!user) {
      res.status(401).json({ error: { message: 'Não autorizado' } })
      return
    }
    return handler(user)
  })
}

export async function signToken(payload: {
  sub: string
  pessoaId: string
  escolaId?: string | null
  papel: AuthUser['papel']
}): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET)
  return new jose.SignJWT({
    pessoaId: payload.pessoaId,
    escolaId: payload.escolaId ?? null,
    papel: payload.papel,
  })
    .setSubject(payload.sub)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)
}
