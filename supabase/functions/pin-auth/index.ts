import { createClient } from 'npm:@supabase/supabase-js@^2.110'
import bcryptjs from 'npm:bcryptjs@^2.4.3'
import { SignJWT } from 'npm:jose@^5.10'

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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })

  try {
    const { userId, pin } = await req.json() as { userId?: string; pin?: string }
    if (!userId || !pin) return json({ error: 'userId and pin required' }, 400)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, pin_hash, is_admin')
      .eq('id', userId)
      .single()

    if (error || !user) return json({ error: 'Invalid credentials' }, 401)

    const valid = await bcryptjs.compare(pin as string, user.pin_hash as string)
    if (!valid) return json({ error: 'Invalid credentials' }, 401)

    const secret = new TextEncoder().encode(Deno.env.get('SUPABASE_JWT_SECRET')!)

    const jwt = await new SignJWT({
      sub: user.id as string,
      role: 'authenticated',
      iss: 'supabase',
      is_admin: user.is_admin as boolean,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('30d')
      .sign(secret)

    return json({ jwt, user: { id: user.id, name: user.name, is_admin: user.is_admin } })
  } catch (err) {
    console.error('pin-auth error:', err)
    return json({ error: 'Internal server error' }, 500)
  }
})
