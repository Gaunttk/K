import { createClient } from 'npm:@supabase/supabase-js@^2.110'
import bcryptjs from 'npm:bcryptjs@^2.4.3'
import { jwtVerify } from 'npm:jose@^5.10'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
} as const

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

interface JwtPayload {
  sub?: string
  is_admin?: boolean
}

async function requireAdmin(req: Request): Promise<JwtPayload | null> {
  const auth = req.headers.get('Authorization')?.replace('Bearer ', '')
  if (!auth) return null
  try {
    const secret = new TextEncoder().encode(Deno.env.get('SUPABASE_JWT_SECRET')!)
    const { payload } = await jwtVerify(auth, secret)
    if (!payload.is_admin) return null
    return payload as JwtPayload
  } catch {
    return null
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  const payload = await requireAdmin(req)
  if (!payload) return json({ error: 'Forbidden' }, 403)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const url = new URL(req.url)
  const segments = url.pathname.split('/').filter(Boolean)
  const userId = segments[segments.length - 1] !== 'admin-users' ? segments[segments.length - 1] : undefined

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, is_admin, created_at')
      .order('created_at')
    if (error) return json({ error: error.message }, 500)
    return json(data)
  }

  if (req.method === 'POST') {
    const body = await req.json() as { name?: string; pin?: string; is_admin?: boolean }
    const { name, pin, is_admin } = body
    if (!name || !pin) return json({ error: 'name and pin required' }, 400)
    if (pin.length < 4 || pin.length > 6) return json({ error: 'PIN must be 4-6 digits' }, 400)
    const pin_hash = await bcryptjs.hash(pin, 10)
    const { data, error } = await supabase
      .from('users')
      .insert({ name, pin_hash, is_admin: is_admin ?? false })
      .select('id, name, is_admin, created_at')
      .single()
    if (error) return json({ error: error.message }, 500)
    return json(data, 201)
  }

  if (req.method === 'PUT' && userId) {
    const body = await req.json() as { name?: string; pin?: string; is_admin?: boolean }
    const updates: Record<string, unknown> = {}
    if (body.name !== undefined) updates.name = body.name
    if (body.is_admin !== undefined) updates.is_admin = body.is_admin
    if (body.pin !== undefined) {
      if (body.pin.length < 4 || body.pin.length > 6) return json({ error: 'PIN must be 4-6 digits' }, 400)
      updates.pin_hash = await bcryptjs.hash(body.pin, 10)
    }
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select('id, name, is_admin, created_at')
      .single()
    if (error) return json({ error: error.message }, 500)
    return json(data)
  }

  if (req.method === 'DELETE' && userId) {
    const { error } = await supabase.from('users').delete().eq('id', userId)
    if (error) return json({ error: error.message }, 500)
    return json({ success: true })
  }

  return json({ error: 'Not found' }, 404)
})
