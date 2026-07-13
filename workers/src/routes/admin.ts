import { neon } from '@neondatabase/serverless'
import { hashPin } from '../crypto'
import type { Env } from '../types'
import type { JwtPayload } from '../jwt'

export async function handleAdmin(
  request: Request,
  env: Env,
  payload: JwtPayload,
  path: string,
): Promise<Response> {
  if (!payload.is_admin) return new Response('Forbidden', { status: 403 })

  const sql = neon(env.DATABASE_URL)
  const idMatch = path.match(/^\/admin\/users\/([^/]+)$/)
  const userId = idMatch?.[1]

  if (path === '/admin/users' && request.method === 'GET') {
    const rows = await sql`SELECT id, name, is_admin, created_at FROM users ORDER BY created_at`
    return ok(rows)
  }

  if (path === '/admin/users' && request.method === 'POST') {
    const body = await request.json() as { name: string; pin: string; is_admin: boolean }
    const pinHash = await hashPin(body.pin)
    const rows = await sql`
      INSERT INTO users (name, pin_hash, is_admin)
      VALUES (${body.name}, ${pinHash}, ${body.is_admin})
      RETURNING id, name, is_admin, created_at
    `
    return ok(rows[0], 201)
  }

  if (userId && request.method === 'PUT') {
    const body = await request.json() as { pin?: string; name?: string; is_admin?: boolean }
    if (body.pin) {
      const pinHash = await hashPin(body.pin)
      const rows = await sql`
        UPDATE users SET pin_hash = ${pinHash} WHERE id = ${userId}
        RETURNING id, name, is_admin, created_at
      `
      return ok(rows[0])
    }
    if (body.name !== undefined || body.is_admin !== undefined) {
      const rows = await sql`
        UPDATE users
        SET name = COALESCE(${body.name ?? null}, name),
            is_admin = COALESCE(${body.is_admin ?? null}, is_admin)
        WHERE id = ${userId}
        RETURNING id, name, is_admin, created_at
      `
      return ok(rows[0])
    }
    return ok({ ok: true })
  }

  if (userId && request.method === 'DELETE') {
    await sql`DELETE FROM users WHERE id = ${userId}`
    return ok({ success: true })
  }

  return new Response('Not Found', { status: 404 })
}

function ok(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}
