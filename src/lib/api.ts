const BASE = import.meta.env.VITE_API_URL as string

function getJwt(): string | null {
  try { return JSON.parse(localStorage.getItem('jgq_session') ?? 'null')?.jwt as string | null }
  catch { return null }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const jwt = getJwt()
  const headers = new Headers((init?.headers as HeadersInit | undefined) ?? {})
  if (jwt) headers.set('Authorization', `Bearer ${jwt}`)
  const res = await fetch(BASE + path, { ...init, headers })
  if (!res.ok) {
    const text = await res.text()
    let msg = text
    try { msg = (JSON.parse(text) as { error?: string }).error ?? text } catch { /* keep raw text */ }
    throw new Error(msg || `HTTP ${res.status}`)
  }
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string) => req<T>(path),
  post: <T>(path: string, body: unknown) =>
    req<T>(path, { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }),
  put: <T>(path: string, body: unknown) =>
    req<T>(path, { method: 'PUT', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }),
  delete: <T>(path: string) => req<T>(path, { method: 'DELETE' }),
}
