import { neon } from '@neondatabase/serverless'
import type { Env } from '../types'
import type { JwtPayload } from '../jwt'

const VISIT_SELECT = `
  SELECT v.*,
    row_to_json(r) AS restaurant,
    json_build_object('id', u.id, 'name', u.name) AS "user",
    COALESCE(json_agg(DISTINCT to_jsonb(s)) FILTER (WHERE s.id IS NOT NULL), '[]') AS sides,
    COALESCE(json_agg(DISTINCT to_jsonb(sc)) FILTER (WHERE sc.id IS NOT NULL), '[]') AS sauces,
    COALESCE(json_agg(DISTINCT to_jsonb(p)) FILTER (WHERE p.id IS NOT NULL), '[]') AS photos
  FROM visits v
  JOIN restaurants r ON r.id = v.restaurant_id
  JOIN users u ON u.id = v.user_id
  LEFT JOIN sides s ON s.visit_id = v.id
  LEFT JOIN sauces sc ON sc.visit_id = v.id
  LEFT JOIN photos p ON p.visit_id = v.id
`

interface VisitInsertBody {
  id: string
  restaurant_id: string
  visit_date: string
  meat_types: string[]
  value_rating: number
  quantity_rating: number
  atmosphere_rating: number
  staff_rating: number
  overall_rating: number
  comments: string | null
  sides: Array<{ name: string; rating: number }>
  sauces: Array<{ name: string; flavor_descriptor: string | null; rating: number; spiciness: number }>
}

export async function handleVisits(
  request: Request,
  env: Env,
  payload: JwtPayload,
  path: string,
  url: URL,
): Promise<Response> {
  const sql = neon(env.DATABASE_URL)

  if (path === '/visits/feed' && request.method === 'GET') {
    const rows = await sql(
      VISIT_SELECT + ' GROUP BY v.id, r.id, u.id ORDER BY v.visit_date DESC, v.created_at DESC LIMIT 60'
    )
    return ok(rows)
  }

  if (path === '/visits/prior' && request.method === 'GET') {
    const restaurantId = url.searchParams.get('restaurantId')
    const userId = url.searchParams.get('userId')
    if (!restaurantId || !userId) return ok(null)
    const rows = await sql`
      SELECT v.id, v.visit_date,
        COALESCE(json_agg(DISTINCT to_jsonb(s)) FILTER (WHERE s.id IS NOT NULL), '[]') AS sides,
        COALESCE(json_agg(DISTINCT to_jsonb(sc)) FILTER (WHERE sc.id IS NOT NULL), '[]') AS sauces
      FROM visits v
      LEFT JOIN sides s ON s.visit_id = v.id
      LEFT JOIN sauces sc ON sc.visit_id = v.id
      WHERE v.restaurant_id = ${restaurantId} AND v.user_id = ${userId}
      GROUP BY v.id
      ORDER BY v.visit_date DESC LIMIT 1
    `
    return ok(rows[0] ?? null)
  }

  if (path === '/visits' && request.method === 'GET') {
    const restaurantId = url.searchParams.get('restaurantId')
    if (!restaurantId) return ok([])
    const rows = await sql(
      VISIT_SELECT + ' WHERE v.restaurant_id = $1 GROUP BY v.id, r.id, u.id ORDER BY v.visit_date DESC, v.created_at DESC',
      [restaurantId]
    )
    return ok(rows)
  }

  const visitIdMatch = path.match(/^\/visits\/([^/]+)$/)
  if (visitIdMatch && request.method === 'GET') {
    const rows = await sql(
      VISIT_SELECT + ' WHERE v.id = $1 GROUP BY v.id, r.id, u.id',
      [visitIdMatch[1]!]
    )
    if (!rows.length) return new Response('Not Found', { status: 404 })
    return ok(rows[0])
  }

  if (path === '/visits' && request.method === 'POST') {
    const body = await request.json() as VisitInsertBody
    const queries = [
      sql`
        INSERT INTO visits (id, restaurant_id, user_id, visit_date, meat_types,
          value_rating, quantity_rating, atmosphere_rating, staff_rating, overall_rating, comments)
        VALUES (
          ${body.id}, ${body.restaurant_id}, ${payload.sub}, ${body.visit_date}, ${body.meat_types},
          ${body.value_rating}, ${body.quantity_rating}, ${body.atmosphere_rating},
          ${body.staff_rating}, ${body.overall_rating}, ${body.comments ?? null}
        )
      `,
      ...body.sides.map((s) => sql`INSERT INTO sides (visit_id, name, rating) VALUES (${body.id}, ${s.name}, ${s.rating})`),
      ...body.sauces.map((s) => sql`
        INSERT INTO sauces (visit_id, name, flavor_descriptor, rating, spiciness)
        VALUES (${body.id}, ${s.name}, ${s.flavor_descriptor ?? null}, ${s.rating}, ${s.spiciness})
      `),
    ]
    await sql.transaction(queries)
    return ok({ id: body.id }, 201)
  }

  return new Response('Not Found', { status: 404 })
}

function ok(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}
