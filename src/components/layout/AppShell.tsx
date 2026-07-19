import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { logout } from '../../lib/auth'
import ThemeToggle from './ThemeToggle'

export default function AppShell() {
  const navigate = useNavigate()

  function handleLogout() {
    logout()
  }

  return (
    <div className="flex flex-col min-h-dvh bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface border-b border-border grain">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <NavLink to="/home" className="font-heading text-2xl text-amber tracking-widest">
            JGQ
          </NavLink>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="w-9 h-9 flex items-center justify-center rounded-full border border-border hover:border-error hover:text-error transition-colors text-text-muted"
              aria-label="Log out"
            >
              <svg width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>

      {/* Bottom nav */}
      <nav className="sticky bottom-0 bg-surface border-t border-border">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-around">
          <NavLink
            to="/home"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-xs transition-colors ${
                isActive ? 'text-amber' : 'text-text-muted hover:text-text'
              }`
            }
          >
            <svg width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Feed
          </NavLink>
          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 text-xs transition-colors ${
                isActive ? 'text-amber' : 'text-text-muted hover:text-text'
              }`
            }
          >
            <svg width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18M9 17V9m4 8V5m4 12v-6" />
            </svg>
            Stats
          </NavLink>
          <button
            onClick={() => navigate('/visit/new')}
            className="flex flex-col items-center gap-0.5 text-xs bg-accent-red hover:bg-red-800 text-white px-4 py-2 rounded-full transition-colors font-heading tracking-wider"
          >
            <svg width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Log Visit
          </button>
        </div>
      </nav>
    </div>
  )
}
