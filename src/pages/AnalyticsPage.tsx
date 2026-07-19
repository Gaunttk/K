import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import type { AnalyticsResponse, UserPublic } from '../types'

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 rounded-xl bg-surface border border-border flex flex-col gap-1">
      <span className="text-xs text-text-muted font-heading tracking-wider">{label}</span>
      <span className="text-2xl text-amber font-heading">{value}</span>
    </div>
  )
}

function BarRow({ label, count, max }: { label: string; count: number; max: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-text w-28 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
        <div className="h-full rounded-full bg-amber" style={{ width: `${(count / max) * 100}%` }} />
      </div>
      <span className="text-xs text-text-muted w-6 text-right">{count}</span>
    </div>
  )
}

export default function AnalyticsPage() {
  const navigate = useNavigate()
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [users, setUsers] = useState<UserPublic[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void api.get<UserPublic[]>('/users').then(setUsers).catch(() => {})
  }, [])

  useEffect(() => {
    void load(userId)
  }, [userId])

  async function load(filterUserId: string | null) {
    setLoading(true)
    try {
      const query = filterUserId ? `?userId=${filterUserId}` : ''
      const res = await api.get<AnalyticsResponse>(`/analytics${query}`)
      setData(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (error) return <div className="py-20 text-center text-accent-red">{error}</div>

  const userFilter = users.length > 1 && (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => setUserId(null)}
        className={`px-3 py-1.5 rounded-full text-xs font-heading tracking-wider transition-colors border ${
          userId === null ? 'bg-accent-red text-white border-accent-red' : 'border-border text-text-muted hover:text-text'
        }`}
      >
        Everyone
      </button>
      {users.map((u) => (
        <button
          key={u.id}
          type="button"
          onClick={() => setUserId(u.id)}
          className={`px-3 py-1.5 rounded-full text-xs font-heading tracking-wider transition-colors border ${
            userId === u.id ? 'bg-accent-red text-white border-accent-red' : 'border-border text-text-muted hover:text-text'
          }`}
        >
          {u.name}
        </button>
      ))}
    </div>
  )

  if (loading || !data) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl text-text">Analytics</h1>
        {userFilter}
        <div className="py-20 text-center text-text-muted">Loading...</div>
      </div>
    )
  }

  const maxMeat = Math.max(1, ...data.meatTypes.map((m) => m.count))
  const maxItem = Math.max(1, ...data.items.map((i) => i.count))

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl text-text">Analytics</h1>

      {userFilter}

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Total Visits" value={String(data.totals.total_visits)} />
        <StatTile label="Avg Overall" value={data.totals.avg_overall != null ? data.totals.avg_overall.toFixed(1) : '—'} />
        <StatTile label="Total Spent" value={data.totals.total_spent != null ? `$${data.totals.total_spent.toFixed(2)}` : '—'} />
        <StatTile label="Avg Bill" value={data.totals.avg_cost != null ? `$${data.totals.avg_cost.toFixed(2)}` : '—'} />
      </div>

      {/* Top restaurants */}
      <div className="p-4 rounded-xl bg-surface border border-border flex flex-col gap-3">
        <h2 className="font-heading text-sm text-text-muted tracking-wider">Top Restaurants</h2>
        {data.topRestaurants.length === 0 ? (
          <p className="text-sm text-text-muted">No visits yet.</p>
        ) : (
          data.topRestaurants.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => navigate(`/restaurants/${r.id}`)}
              className="flex items-center justify-between text-left hover:text-amber transition-colors"
            >
              <span className="text-sm text-text">{r.name}</span>
              <span className="text-xs text-text-muted">
                {r.avg_overall.toFixed(1)} ★ · {r.visit_count} visit{r.visit_count > 1 ? 's' : ''}
              </span>
            </button>
          ))
        )}
      </div>

      {/* Meat types */}
      <div className="p-4 rounded-xl bg-surface border border-border flex flex-col gap-3">
        <h2 className="font-heading text-sm text-text-muted tracking-wider">Meat Types</h2>
        {data.meatTypes.length === 0 ? (
          <p className="text-sm text-text-muted">No data yet.</p>
        ) : (
          data.meatTypes.map((m) => <BarRow key={m.meat} label={m.meat} count={m.count} max={maxMeat} />)
        )}
      </div>

      {/* Best sauces */}
      <div className="p-4 rounded-xl bg-surface border border-border flex flex-col gap-3">
        <h2 className="font-heading text-sm text-text-muted tracking-wider">Best Sauces</h2>
        {data.bestSauces.length === 0 ? (
          <p className="text-sm text-text-muted">No sauces logged yet.</p>
        ) : (
          data.bestSauces.map((s) => (
            <div key={s.name} className="flex items-center justify-between">
              <span className="text-sm text-text">{s.name}</span>
              <span className="text-xs text-text-muted">
                {s.avg_rating.toFixed(1)} ★ · {s.count}x
              </span>
            </div>
          ))
        )}
      </div>

      {/* Popular sandwiches/plates */}
      <div className="p-4 rounded-xl bg-surface border border-border flex flex-col gap-3">
        <h2 className="font-heading text-sm text-text-muted tracking-wider">Popular Sandwiches &amp; Plates</h2>
        {data.items.length === 0 ? (
          <p className="text-sm text-text-muted">No items logged yet.</p>
        ) : (
          data.items.map((i) => (
            <BarRow key={`${i.item_type ?? ''}-${i.item_name}`} label={i.item_name} count={i.count} max={maxItem} />
          ))
        )}
      </div>
    </div>
  )
}
