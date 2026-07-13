import { neon } from '@neondatabase/serverless'
import type { Env } from '../types'

export async function handleUsers(_request: Request, env: Env): Promise<Response> {
  const sql = neon(env.DATABASE_URL)
  const rows = await sql`SELECT id, name FROM users ORDER BY name`
  return new Response(JSON.stringify(rows), { headers: { 'Content-Type': 'application/json' } })
}
