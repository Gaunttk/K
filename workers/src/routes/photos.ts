import { neon } from '@neondatabase/serverless'
import type { Env } from '../types'

interface PhotoRecord {
  label: string
  r2_key: string
  r2_url: string
}

export async function handlePhotos(request: Request, env: Env, visitId: string): Promise<Response> {
  const body = await request.json() as PhotoRecord[]
  const sql = neon(env.DATABASE_URL)
  await sql.transaction(
    body.map((p) => sql`INSERT INTO photos (visit_id, label, r2_key, r2_url) VALUES (${visitId}, ${p.label}, ${p.r2_key}, ${p.r2_url})`)
  )
  return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } })
}
