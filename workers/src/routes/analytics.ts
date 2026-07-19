import { neon } from '@neondatabase/serverless'
import type { Env } from '../types'

export async function handleAnalytics(env: Env): Promise<Response> {
  const sql = neon(env.DATABASE_URL)

  const [meatTypes, topRestaurants, bestSauces, items, totalsRows] = await Promise.all([
    sql`
      SELECT meat, COUNT(*)::int AS count
      FROM visits, unnest(meat_types) AS meat
      GROUP BY meat
      ORDER BY count DESC
    `,
    sql`
      SELECT r.id, r.name, COUNT(v.id)::int AS visit_count,
        ROUND(AVG(v.overall_rating)::numeric, 1)::float8 AS avg_overall
      FROM restaurants r
      JOIN visits v ON v.restaurant_id = r.id
      GROUP BY r.id, r.name
      ORDER BY avg_overall DESC, visit_count DESC
      LIMIT 10
    `,
    sql`
      SELECT name, COUNT(*)::int AS count,
        ROUND(AVG(rating)::numeric, 1)::float8 AS avg_rating
      FROM sauces
      GROUP BY name
      ORDER BY avg_rating DESC, count DESC
      LIMIT 10
    `,
    sql`
      SELECT item_name, item_type, COUNT(*)::int AS count
      FROM visits
      WHERE item_name IS NOT NULL AND item_name <> ''
      GROUP BY item_name, item_type
      ORDER BY count DESC
      LIMIT 10
    `,
    sql`
      SELECT COUNT(*)::int AS total_visits,
        ROUND(SUM(total_cost)::numeric, 2)::float8 AS total_spent,
        ROUND(AVG(total_cost)::numeric, 2)::float8 AS avg_cost,
        ROUND(AVG(overall_rating)::numeric, 1)::float8 AS avg_overall
      FROM visits
    `,
  ])

  return new Response(
    JSON.stringify({
      meatTypes,
      topRestaurants,
      bestSauces,
      items,
      totals: totalsRows[0],
    }),
    { headers: { 'Content-Type': 'application/json' } },
  )
}
