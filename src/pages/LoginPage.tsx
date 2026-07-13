import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth, getSession } from '../lib/auth'
import ThemeToggle from '../components/layout/ThemeToggle'
import type { UserPublic } from '../types'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading } = useAuth()
  const [users, setUsers] = useState<UserPublic[]>([])
  const [selected, setSelected] = useState<UserPublic | null>(null)
  const [pin, setPin] = useState('')
  const [shakeKey, setShakeKey] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const pinRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (getSession()) navigate('/home', { replace: true })
  }, [navigate])

  useEffect(() => {
    supabase.from('users').select('id, name').order('name').then(({ data }) => {
      if (data) setUsers(data as UserPublic[])
    })
  }, [])

  useEffect(() => {
    if (selected) setTimeout(() => pinRef.current?.focus(), 50)
  }, [selected])

  async function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected || pin.length < 4) return
    try {
      await login(selected.id, pin)
      navigate('/home', { replace: true })
    } catch {
      setShakeKey((k) => k + 1)
      setErrorMsg('Wrong PIN. Try again.')
      setPin('')
    }
  }

  return (
    <div className="min-h-dvh flex flex-col bg-bg grain">
      <div className="flex justify-end p-4">
        <ThemeToggle />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-12">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-7xl text-amber tracking-widest">JGQ</h1>
          <p className="text-text-muted text-sm tracking-widest mt-1">BBQ TRACKER</p>
        </div>

        {!selected ? (
          /* User picker */
          <div className="w-full max-w-sm flex flex-col gap-3">
            <p className="text-center text-sm text-text-muted mb-2">Who's logging in?</p>
            {users.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => { setSelected(u); setPin(''); setErrorMsg(null) }}
                className="w-full py-4 px-6 rounded-xl border border-border bg-surface hover:border-amber hover:bg-surface-2 transition-all font-heading text-xl tracking-wider text-left"
              >
                {u.name}
              </button>
            ))}
            {users.length === 0 && (
              <p className="text-center text-sm text-text-muted">No users yet. Set up via Supabase.</p>
            )}
          </div>
        ) : (
          /* PIN entry */
          <form onSubmit={(e) => void handlePinSubmit(e)} className="w-full max-w-xs flex flex-col gap-5">
            <div className="text-center">
              <p className="text-text-muted text-sm mb-1">Logging in as</p>
              <h2 className="text-3xl text-text">{selected.name}</h2>
            </div>

            <div key={shakeKey} className={shakeKey > 0 ? 'shake' : ''}>
              <input
                ref={pinRef}
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setErrorMsg(null) }}
                placeholder="Enter PIN"
                className="input-base text-center text-2xl tracking-[0.5em] placeholder:tracking-normal placeholder:text-lg"
                autoComplete="current-password"
              />
            </div>

            {errorMsg && (
              <p className="text-center text-sm text-error">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={pin.length < 4 || isLoading}
              className="w-full py-3 rounded-xl bg-accent-red text-white font-heading text-xl tracking-widest disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              {isLoading ? 'Checking...' : 'Enter'}
            </button>

            <button
              type="button"
              onClick={() => { setSelected(null); setPin(''); setErrorMsg(null) }}
              className="text-sm text-text-muted hover:text-text transition-colors text-center"
            >
              ← Back
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
