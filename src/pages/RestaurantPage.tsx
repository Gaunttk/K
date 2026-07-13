import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'
import VisitCard from '../components/visit/VisitCard'
import StarPicker from '../components/ui/StarPicker'
import type { Restaurant, VisitWithRelations, Rating } from '../types'

function avg(vals: number[]): number {
  if (!vals.length) return 0
  return vals.reduce((a, b) => a + b, 0) / vals.length
}

function DirectionsUrl(address: string) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`
}

function GooglePlaceUrl(placeId: string) {
  return `https://maps.google.com/?q=place_id:${placeId}`
}

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>()
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [visits, setVisits] = useState<VisitWithRelations[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) void load(id)
  }, [id])

  async function load(restaurantId: string) {
    const [r, v] = await Promise.all([
      api.get<Restaurant>(`/restaurants/${restaurantId}`),
      api.get<VisitWithRelations[]>(`/visits?restaurantId=${restaurantId}`),
    ])
    setRestaurant(r)
    setVisits(v)
    setLoading(false)
  }

  if (loading) return <div className="py-20 text-center text-text-muted">Loading...</div>
  if (!restaurant) return <div className="py-20 text-center text-text-muted">Restaurant not found.</div>

  const overall = avg(visits.map((v) => v.overall_rating))
  const value = avg(visits.map((v) => v.value_rating))
  const quantity = avg(visits.map((v) => v.quantity_rating))
  const atmosphere = avg(visits.map((v) => v.atmosphere_rating))
  const staff = avg(visits.map((v) => v.staff_rating))

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="grain p-5 rounded-xl bg-surface border border-border">
        <h1 className="text-3xl text-text mb-1">{restaurant.name}</h1>
        <p className="text-sm text-text-muted mb-4">{restaurant.address}</p>
        <div className="flex gap-2 flex-wrap">
          <a
            href={DirectionsUrl(restaurant.address)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-accent-red text-white text-sm font-heading tracking-wider hover:opacity-90 transition-opacity"
          >
            Get Directions
          </a>
          {restaurant.google_place_id && (
            <a
              href={GooglePlaceUrl(restaurant.google_place_id)}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-lg border border-border text-text-muted text-sm font-heading tracking-wider hover:border-amber hover:text-text transition-colors"
            >
              View on Google
            </a>
          )}
        </div>
      </div>

      {/* Aggregate ratings */}
      {visits.length > 0 && (
        <div className="p-4 rounded-xl bg-surface border border-border flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm text-text-muted">
            <span className="font-heading tracking-wider">Ratings</span>
            <span>{visits.length} visit{visits.length > 1 ? 's' : ''}</span>
          </div>
          {[
            { label: 'Overall', val: overall },
            { label: 'Value', val: value },
            { label: 'Quantity', val: quantity },
            { label: 'Atmosphere', val: atmosphere },
            { label: 'Staff', val: staff },
          ].map(({ label, val }) => (
            <div key={label} className="flex items-center justify-between gap-4">
              <span className="text-sm text-text w-28">{label}</span>
              <div className="flex items-center gap-2 flex-1">
                <div className="flex-1 h-1.5 rounded-full bg-surface-2 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber transition-all"
                    style={{ width: `${(val / 5) * 100}%` }}
                  />
                </div>
                <StarPicker value={Math.round(val) as Rating} readOnly size="sm" />
                <span className="text-xs text-text-muted w-6 text-right">{val.toFixed(1)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Visit list */}
      <h2 className="text-xl text-text-muted">All Visits</h2>
      {visits.length === 0 ? (
        <p className="text-sm text-text-muted">No visits yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {visits.map((v) => <VisitCard key={v.id} visit={v} />)}
        </div>
      )}
    </div>
  )
}
