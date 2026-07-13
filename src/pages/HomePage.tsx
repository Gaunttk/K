import { useState, useEffect, useRef } from 'react'
import { api } from '../lib/api'
import { loadMapsLib, loadMarkerLib } from '../lib/places'
import VisitCard from '../components/visit/VisitCard'
import type { VisitWithRelations, Restaurant } from '../types'

type Tab = 'feed' | 'map'

export default function HomePage() {
  const [tab, setTab] = useState<Tab>('feed')
  const [visits, setVisits] = useState<VisitWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)

  useEffect(() => {
    void loadVisits()
  }, [])

  async function loadVisits() {
    const data = await api.get<VisitWithRelations[]>('/visits/feed')
    setVisits(data)
    setLoading(false)
  }

  useEffect(() => {
    if (tab === 'map' && mapRef.current && !mapInstanceRef.current) {
      void initMap()
    }
  }, [tab])

  async function initMap() {
    if (!mapRef.current) return
    try {
      const mapsLib = await loadMapsLib()
      const markerLib = await loadMarkerLib()

      const map = new mapsLib.Map(mapRef.current, {
        center: { lat: 39.5, lng: -96 },
        zoom: 5,
        mapId: 'jgq-map',
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      })
      mapInstanceRef.current = map

      // Deduplicate by restaurant
      const seen = new Set<string>()
      const restaurants: Restaurant[] = []
      for (const v of visits) {
        if (!seen.has(v.restaurant.id)) {
          seen.add(v.restaurant.id)
          restaurants.push(v.restaurant)
        }
      }

      for (const r of restaurants) {
        const marker = new markerLib.AdvancedMarkerElement({
          map,
          position: { lat: r.lat, lng: r.lng },
          title: r.name,
        })
        marker.addListener('click', () => {
          window.location.href = `/restaurants/${r.id}`
        })
      }
    } catch {
      // Maps not available (no API key configured)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl text-text">Recent Visits</h1>
        <div className="flex rounded-lg border border-border overflow-hidden">
          {(['feed', 'map'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 text-xs font-heading tracking-wider transition-colors ${
                tab === t ? 'bg-accent-red text-white' : 'bg-surface text-text-muted hover:text-text'
              }`}
            >
              {t === 'feed' ? 'Feed' : 'Map'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'feed' ? (
        loading ? (
          <div className="py-20 text-center text-text-muted text-sm">Loading...</div>
        ) : visits.length === 0 ? (
          <div className="py-20 text-center text-text-muted text-sm">
            No visits yet. Log your first BBQ!
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {visits.map((v) => (
              <VisitCard key={v.id} visit={v} />
            ))}
          </div>
        )
      ) : (
        <div
          ref={mapRef}
          className="w-full rounded-xl overflow-hidden border border-border"
          style={{ height: 500 }}
        />
      )}
    </div>
  )
}
