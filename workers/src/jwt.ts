import { SignJWT, jwtVerify } from 'jose'

export interface JwtPayload {
  sub: string
  is_admin: boolean
}

export async function signJwt(payload: JwtPayload, secret: string): Promise<string> {
  const key = new TextEncoder().encode(secret)
  return new SignJWT({ is_admin: payload.is_admin })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(key)
}

export async function verifyJwt(token: string, secret: string): Promise<JwtPayload | null> {
  try {
    const key = new TextEncoder().encode(secret)
    const { payload } = await jwtVerify(token, key)
    if (typeof payload.sub !== 'string') return null
    return { sub: payload.sub, is_admin: Boolean(payload.is_admin) }
  } catch {
    return null
  }
}
