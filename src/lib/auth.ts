import { useState, useCallback } from 'react'
import type { AuthSession, PinAuthResponse } from '../types'

const SESSION_KEY = 'jgq_session'

export function getSession(): AuthSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthSession
    const [, payloadB64] = parsed.jwt.split('.')
    const payload = JSON.parse(atob(payloadB64)) as { exp: number }
    if (Date.now() / 1000 > payload.exp) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export async function login(userId: string, pin: string): Promise<AuthSession> {
  const url = `${import.meta.env.VITE_SUPABASE_URL as string}/functions/v1/pin-auth`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, pin }),
  })
  if (!res.ok) {
    const data = await res.json() as { error?: string }
    throw new Error(data.error ?? 'Login failed')
  }
  const { jwt, user } = await res.json() as PinAuthResponse
  const session: AuthSession = {
    userId: user.id,
    name: user.name,
    isAdmin: user.is_admin,
    jwt,
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY)
  window.location.href = '/'
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(() => getSession())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const doLogin = useCallback(async (userId: string, pin: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const s = await login(userId, pin)
      setSession(s)
      return s
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Login failed'
      setError(msg)
      throw e
    } finally {
      setIsLoading(false)
    }
  }, [])

  const doLogout = useCallback(() => {
    setSession(null)
    logout()
  }, [])

  return { session, isLoading, error, login: doLogin, logout: doLogout }
}
