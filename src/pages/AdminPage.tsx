import { useState, useEffect } from 'react'
import { getSession } from '../lib/auth'
import type { AdminUser, CreateUserInput } from '../types'

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false)
  const [secretInput, setSecretInput] = useState('')
  const [secretError, setSecretError] = useState(false)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [newUser, setNewUser] = useState<CreateUserInput>({ name: '', pin: '', is_admin: false })
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const adminFnUrl = `${import.meta.env.VITE_API_URL as string}/admin/users`

  function checkSecret(e: React.FormEvent) {
    e.preventDefault()
    if (secretInput === import.meta.env.VITE_ADMIN_SECRET) {
      setUnlocked(true)
    } else {
      setSecretError(true)
      setSecretInput('')
    }
  }

  async function loadUsers() {
    const session = getSession()
    if (!session) return
    setLoading(true)
    try {
      const res = await fetch(adminFnUrl, {
        headers: { Authorization: `Bearer ${session.jwt}` },
      })
      const data = await res.json() as AdminUser[]
      setUsers(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (unlocked) void loadUsers()
  }, [unlocked])

  async function createUser(e: React.FormEvent) {
    e.preventDefault()
    const session = getSession()
    if (!session) return
    setCreating(true)
    setError(null)
    setSuccess(null)
    try {
      const res = await fetch(adminFnUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.jwt}`,
        },
        body: JSON.stringify(newUser),
      })
      if (!res.ok) {
        const d = await res.json() as { error?: string }
        throw new Error(d.error ?? 'Failed to create user')
      }
      setNewUser({ name: '', pin: '', is_admin: false })
      setSuccess('User created successfully.')
      void loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setCreating(false)
    }
  }

  async function deleteUser(id: string, name: string) {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return
    const session = getSession()
    if (!session) return
    await fetch(`${adminFnUrl}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.jwt}` },
    })
    void loadUsers()
  }

  async function resetPin(id: string, name: string) {
    const pin = window.prompt(`New PIN for ${name} (4-6 digits):`)
    if (!pin || pin.length < 4) return
    const session = getSession()
    if (!session) return
    await fetch(`${adminFnUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.jwt}`,
      },
      body: JSON.stringify({ pin }),
    })
    setSuccess(`PIN updated for ${name}.`)
  }

  if (!unlocked) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-bg px-4">
        <form onSubmit={checkSecret} className="w-full max-w-xs flex flex-col gap-4">
          <h1 className="font-heading text-3xl text-amber text-center">Admin Access</h1>
          <input
            type="password"
            value={secretInput}
            onChange={(e) => { setSecretInput(e.target.value); setSecretError(false) }}
            placeholder="Admin PIN"
            className={`input-base text-center text-xl tracking-widest ${secretError ? 'border-error' : ''}`}
            autoFocus
          />
          {secretError && <p className="text-center text-sm text-error">Incorrect PIN.</p>}
          <button
            type="submit"
            className="py-3 rounded-xl bg-accent-red text-white font-heading tracking-wider hover:opacity-90"
          >
            Enter
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-bg px-4 py-8">
      <div className="max-w-lg mx-auto flex flex-col gap-8">
        <h1 className="font-heading text-3xl text-amber">Admin Panel</h1>

        {/* Create user */}
        <section className="p-5 rounded-xl border border-border bg-surface flex flex-col gap-4">
          <h2 className="font-heading text-lg text-text-muted tracking-wider">New User</h2>
          <form onSubmit={(e) => void createUser(e)} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              className="input-base"
              required
            />
            <input
              type="password"
              placeholder="PIN (4-6 digits)"
              value={newUser.pin}
              onChange={(e) => setNewUser({ ...newUser, pin: e.target.value.replace(/\D/g, '') })}
              maxLength={6}
              className="input-base"
              required
            />
            <label className="flex items-center gap-2 text-sm text-text cursor-pointer">
              <input
                type="checkbox"
                checked={newUser.is_admin}
                onChange={(e) => setNewUser({ ...newUser, is_admin: e.target.checked })}
                className="accent-amber"
              />
              Admin user
            </label>
            {error && <p className="text-sm text-error">{error}</p>}
            {success && <p className="text-sm text-amber">{success}</p>}
            <button
              type="submit"
              disabled={creating || !newUser.name || newUser.pin.length < 4}
              className="py-2.5 rounded-lg bg-accent-red text-white font-heading tracking-wider disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {creating ? 'Creating...' : 'Create User'}
            </button>
          </form>
        </section>

        {/* User list */}
        <section className="flex flex-col gap-3">
          <h2 className="font-heading text-lg text-text-muted tracking-wider">Users</h2>
          {loading ? (
            <p className="text-sm text-text-muted">Loading...</p>
          ) : (
            users.map((u) => (
              <div key={u.id} className="p-4 rounded-xl border border-border bg-surface flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-text">{u.name}</div>
                  {u.is_admin && <div className="text-xs text-amber">Admin</div>}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void resetPin(u.id, u.name)}
                    className="px-3 py-1.5 rounded border border-border text-text-muted text-xs hover:border-amber hover:text-text transition-colors"
                  >
                    Reset PIN
                  </button>
                  <button
                    type="button"
                    onClick={() => void deleteUser(u.id, u.name)}
                    className="px-3 py-1.5 rounded border border-error/40 text-error/70 text-xs hover:border-error hover:text-error transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  )
}
