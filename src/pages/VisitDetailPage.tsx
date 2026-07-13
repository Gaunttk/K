import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getSession } from '../lib/auth'
import StarPicker from '../components/ui/StarPicker'
import SpicinessInput from '../components/ui/SpicinessInput'
import type { VisitWithRelations } from '../types'

const RATING_LABELS = [
  { key: 'overall_rating', label: 'Overall' },
  { key: 'value_rating', label: 'Value' },
  { key: 'quantity_rating', label: 'Quantity' },
  { key: 'atmosphere_rating', label: 'Atmosphere' },
  { key: 'staff_rating', label: 'Staff' },
] as const

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function VisitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [visit, setVisit] = useState<VisitWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const session = getSession()

  useEffect(() => {
    if (id) void load(id)
  }, [id])

  async function load(visitId: string) {
    const { data } = await supabase
      .from('visits')
      .select(`
        *,
        restaurant:restaurants(*),
        user:users(id, name),
        sides(*),
        sauces(*),
        photos(*)
      `)
      .eq('id', visitId)
      .single()
    setVisit(data as VisitWithRelations)
    setLoading(false)
  }

  if (loading) return <div className="py-20 text-center text-text-muted">Loading...</div>
  if (!visit) return <div className="py-20 text-center text-text-muted">Visit not found.</div>

  const isOwner = session?.userId === visit.user_id

  return (
    <div className="flex flex-col gap-6">
      {/* Restaurant header */}
      <div className="grain p-5 rounded-xl bg-surface border border-border flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigate(`/restaurants/${visit.restaurant.id}`)}
          className="text-left"
        >
          <h1 className="text-3xl text-text hover:text-amber transition-colors">{visit.restaurant.name}</h1>
        </button>
        <p className="text-sm text-text-muted">{formatDate(visit.visit_date)}</p>
        <p className="text-xs text-text-muted">by {visit.user.name}</p>
      </div>

      {/* Meat types */}
      {visit.meat_types.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {visit.meat_types.map((m) => (
            <span key={m} className="px-3 py-1 rounded-full bg-surface-2 border border-border text-sm">
              {m}
            </span>
          ))}
        </div>
      )}

      {/* Ratings */}
      <div className="p-4 rounded-xl bg-surface border border-border flex flex-col gap-3">
        <h2 className="font-heading text-sm text-text-muted tracking-wider">Ratings</h2>
        {RATING_LABELS.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-text">{label}</span>
            <div className="flex items-center gap-2">
              <StarPicker value={visit[key]} readOnly size="sm" />
              <span className="text-xs text-text-muted w-4">{visit[key]}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Sides */}
      {visit.sides.length > 0 && (
        <div className="p-4 rounded-xl bg-surface border border-border flex flex-col gap-3">
          <h2 className="font-heading text-sm text-text-muted tracking-wider">Sides</h2>
          {visit.sides.map((s) => (
            <div key={s.id} className="flex items-center justify-between">
              <span className="text-sm text-text">{s.name}</span>
              <StarPicker value={s.rating} readOnly size="sm" />
            </div>
          ))}
        </div>
      )}

      {/* Sauces */}
      {visit.sauces.length > 0 && (
        <div className="p-4 rounded-xl bg-surface border border-border flex flex-col gap-3">
          <h2 className="font-heading text-sm text-text-muted tracking-wider">Sauces</h2>
          {visit.sauces.map((s) => (
            <div key={s.id} className="flex flex-col gap-1.5 border-b border-border last:border-0 pb-3 last:pb-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-text">{s.name}</span>
                <div className="flex items-center gap-2">
                  <StarPicker value={s.rating} readOnly size="sm" />
                  <SpicinessInput value={s.spiciness} readOnly />
                </div>
              </div>
              {s.flavor_descriptor && (
                <span className="text-xs text-text-muted">{s.flavor_descriptor}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Photos */}
      {visit.photos.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-heading text-sm text-text-muted tracking-wider">Photos</h2>
          <div className="grid grid-cols-3 gap-2">
            {visit.photos.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setLightbox(p.r2_url)}
                className="flex flex-col gap-1"
              >
                <img
                  src={p.r2_url}
                  alt={p.label}
                  className="w-full aspect-square object-cover rounded-lg border border-border hover:border-amber transition-colors"
                />
                <span className="text-xs text-text-muted text-center">{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      {visit.comments && (
        <div className="p-4 rounded-xl bg-surface border border-border">
          <h2 className="font-heading text-sm text-text-muted tracking-wider mb-2">Notes</h2>
          <p className="text-sm text-text leading-relaxed">{visit.comments}</p>
        </div>
      )}

      {/* Edit button (own visits only) */}
      {isOwner && (
        <button
          type="button"
          disabled
          className="w-full py-3 rounded-xl border border-border text-text-muted text-sm font-heading tracking-wider opacity-50 cursor-not-allowed"
          title="Edit coming soon"
        >
          Edit Visit
        </button>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-bg/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="Full size" className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      )}
    </div>
  )
}
