/**
 * TokenRefresh — renovar JWT antes de expirar; usado por POST /api/auth/refresh.
 */
import * as jose from 'jose'
import type { AuthUser } from '@/lib/db'

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-in-production'

export interface RefreshResult {
  token: string
  expiresIn?: number
}

export async function refreshTokenFromPayload(payload: {
  sub: string
  pessoaId: string
  escolaId?: string | null
  papel: AuthUser['papel']
}): Promise<RefreshResult> {
  const secret = new TextEncoder().encode(JWT_SECRET)
  const expiresIn = 60 * 60 * 24 // 24h
  const token = await new jose.SignJWT({
    pessoaId: payload.pessoaId,
    escolaId: payload.escolaId ?? null,
    papel: payload.papel,
  })
    .setSubject(payload.sub)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${expiresIn}s`)
    .sign(secret)

  return { token, expiresIn }
}
