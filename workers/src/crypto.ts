const ITERATIONS = 100000
const PARAMS = { name: 'PBKDF2', iterations: ITERATIONS, hash: 'SHA-256' } as const

export async function hashPin(pin: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ ...PARAMS, salt }, key, 256)
  const saltB64 = btoa(String.fromCharCode(...salt))
  const hashB64 = btoa(String.fromCharCode(...new Uint8Array(bits)))
  return `pbkdf2:${saltB64}:${hashB64}`
}

export async function verifyPin(pin: string, stored: string): Promise<boolean> {
  if (!stored.startsWith('pbkdf2:')) return false
  const parts = stored.split(':')
  if (parts.length !== 3) return false
  const salt = Uint8Array.from(atob(parts[1]!), (c) => c.charCodeAt(0))
  const expected = Uint8Array.from(atob(parts[2]!), (c) => c.charCodeAt(0))
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pin), 'PBKDF2', false, ['deriveBits'])
  const actual = new Uint8Array(await crypto.subtle.deriveBits({ ...PARAMS, salt }, key, 256))
  if (actual.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < actual.length; i++) diff |= actual[i]! ^ expected[i]!
  return diff === 0
}
