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
  const [error, setError] = useState<string | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([])

  useEffect(() => {
    void loadVisits()
  }, [])

  async function loadVisits() {
    try {
      const data = await api.get<VisitWithRelations[]>('/visits/feed')
      setVisits(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load visits')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (tab === 'map' && mapRef.current && !mapInstanceRef.current) {
      void initMap()
    }
  }, [tab])

  useEffect(() => {
    if (mapInstanceRef.current) void renderMarkers()
  }, [visits])

  async function initMap() {
    if (!mapRef.current) return
    try {
      const mapsLib = await loadMapsLib()

      const map = new mapsLib.Map(mapRef.current, {
        center: { lat: 39.5, lng: -96 },
        zoom: 5,
        mapId: 'jgq-map',
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        styles: [
          { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
          { featureType: 'poi', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
        ],
      })
      mapInstanceRef.current = map
      await renderMarkers()
    } catch (e) {
      console.error('Map init failed', e)
      setMapError(e instanceof Error ? e.message : 'Failed to load map')
    }
  }

  async function renderMarkers() {
    const map = mapInstanceRef.current
    if (!map) return
    try {
      const markerLib = await loadMarkerLib()

      for (const m of markersRef.current) m.map = null
      markersRef.current = []

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
        markersRef.current.push(marker)
      }
    } catch (e) {
      console.error('Marker render failed', e)
      setMapError(e instanceof Error ? e.message : 'Failed to load markers')
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
        ) : error ? (
          <div className="py-20 text-center text-accent-red text-sm">{error}</div>
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
        <>
          {mapError && (
            <div className="text-sm text-accent-red">{mapError}</div>
          )}
          <div
            ref={mapRef}
            className="w-full rounded-xl overflow-hidden border border-border"
            style={{ height: 500 }}
          />
        </>
      )}
    </div>
  )
}
