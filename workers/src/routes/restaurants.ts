import { neon } from '@neondatabase/serverless'
import type { Env } from '../types'

export async function handleRestaurants(request: Request, env: Env, path: string, url: URL): Promise<Response> {
  const sql = neon(env.DATABASE_URL)

  const placeMatch = path.match(/^\/restaurants\/place\/(.+)$/)
  if (placeMatch && request.method === 'GET') {
    const rows = await sql`SELECT * FROM restaurants WHERE google_place_id = ${decodeURIComponent(placeMatch[1]!)}`
    return ok(rows[0] ?? null)
  }

  const idMatch = path.match(/^\/restaurants\/([^/]+)$/)
  if (idMatch && request.method === 'GET') {
    const rows = await sql`SELECT * FROM restaurants WHERE id = ${idMatch[1]!}`
    if (!rows.length) return new Response('Not Found', { status: 404 })
    return ok(rows[0])
  }

  if (path === '/restaurants' && request.method === 'GET') {
    const q = url.searchParams.get('q') ?? ''
    const rows = await sql`SELECT * FROM restaurants WHERE name ILIKE ${'%' + q + '%'} ORDER BY name LIMIT 8`
    return ok(rows)
  }

  if (path === '/restaurants' && request.method === 'POST') {
    const body = await request.json() as {
      name: string; address: string; lat: number; lng: number; google_place_id?: string | null
    }
    const rows = await sql`
      INSERT INTO restaurants (name, address, lat, lng, google_place_id)
      VALUES (${body.name}, ${body.address}, ${body.lat}, ${body.lng}, ${body.google_place_id ?? null})
      ON CONFLICT (google_place_id) DO UPDATE SET name = EXCLUDED.name
      RETURNING *
    `
    return ok(rows[0], 201)
  }

  return new Response('Not Found', { status: 404 })
}

function ok(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}
