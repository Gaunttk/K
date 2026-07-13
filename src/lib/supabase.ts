import { createClient } from '@supabase/supabase-js'

function getStoredJwt(): string | null {
  try {
    const raw = localStorage.getItem('jgq_session')
    if (!raw) return null
    return (JSON.parse(raw) as { jwt?: string }).jwt ?? null
  } catch {
    return null
  }
}

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init = {}) => {
        const jwt = getStoredJwt()
        const headers = new Headers(init.headers as HeadersInit | undefined)
        if (jwt) headers.set('Authorization', `Bearer ${jwt}`)
        return fetch(input, { ...init, headers })
      },
    },
  },
)
