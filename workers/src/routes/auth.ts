import { neon } from '@neondatabase/serverless'
import { verifyPin } from '../crypto'
import { signJwt } from '../jwt'
import type { Env } from '../types'

export async function handleAuth(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as { userId?: string; pin?: string }
  if (!body.userId || !body.pin) return err('Bad Request', 400)

  const sql = neon(env.DATABASE_URL)
  const rows = await sql`SELECT id, name, pin_hash, is_admin FROM users WHERE id = ${body.userId}`
  if (!rows.length) return err('Invalid credentials', 401)

  const user = rows[0]!
  const valid = await verifyPin(body.pin, String(user.pin_hash))
  if (!valid) return err('Invalid credentials', 401)

  const jwt = await signJwt({ sub: String(user.id), is_admin: Boolean(user.is_admin) }, env.JWT_SECRET)
  return ok({ jwt, user: { id: user.id, name: user.name, is_admin: user.is_admin } })
}

function ok(data: unknown): Response {
  return new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })
}

function err(msg: string, status: number): Response {
  return new Response(JSON.stringify({ error: msg }), { status, headers: { 'Content-Type': 'application/json' } })
}
