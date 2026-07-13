import { useState, useRef, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { attachAutocomplete } from '../../lib/places'
import type { Restaurant, NewRestaurantInput } from '../../types'

interface Props {
  onSelect: (r: Restaurant | NewRestaurantInput) => void
}

type Mode = 'existing' | 'new'

export default function RestaurantSearch({ onSelect }: Props) {
  const [mode, setMode] = useState<Mode>('existing')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Restaurant[]>([])
  const [searching, setSearching] = useState(false)
  const [pendingNew, setPendingNew] = useState<(NewRestaurantInput & { displayName: string }) | null>(null)
  const googleInputRef = useRef<HTMLInputElement>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (mode === 'new' && googleInputRef.current && import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
      void attachAutocomplete(googleInputRef.current, async (place) => {
        if (place.google_place_id) {
          const { data } = await supabase
            .from('restaurants')
            .select('*')
            .eq('google_place_id', place.google_place_id)
            .maybeSingle()
          if (data) {
            onSelect(data as Restaurant)
            return
          }
        }
        setPendingNew(place)
      }).then((cleanup) => {
        cleanupRef.current = cleanup
      })
    }
    return () => {
      cleanupRef.current?.()
      cleanupRef.current = null
    }
  }, [mode, onSelect])

  async function search(q: string) {
    setQuery(q)
    if (q.length < 2) { setResults([]); return }
    setSearching(true)
    const { data } = await supabase
      .from('restaurants')
      .select('*')
      .ilike('name', `%${q}%`)
      .limit(8)
    setResults((data as Restaurant[]) ?? [])
    setSearching(false)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Mode toggle */}
      <div className="flex rounded-lg border border-border overflow-hidden">
        {(['existing', 'new'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setResults([]); setQuery(''); setPendingNew(null) }}
            className={`flex-1 py-2 text-sm font-heading tracking-wider transition-colors ${
              mode === m ? 'bg-accent-red text-white' : 'bg-surface text-text-muted hover:text-text'
            }`}
          >
            {m === 'existing' ? 'Search Existing' : 'Add via Google'}
          </button>
        ))}
      </div>

      {mode === 'existing' && (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => void search(e.target.value)}
            placeholder="Type restaurant name..."
            className="input-base"
          />
          {searching && <div className="text-sm text-text-muted">Searching...</div>}
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelect(r)}
              className="text-left p-3 rounded-lg bg-surface-2 border border-border hover:border-amber transition-colors"
            >
              <div className="font-medium text-text">{r.name}</div>
              <div className="text-xs text-text-muted mt-0.5">{r.address}</div>
            </button>
          ))}
          {query.length >= 2 && !searching && results.length === 0 && (
            <p className="text-sm text-text-muted">No results. Switch to "Add via Google" to add a new restaurant.</p>
          )}
        </div>
      )}

      {mode === 'new' && (
        <div className="flex flex-col gap-3">
          <input
            ref={googleInputRef}
            type="text"
            placeholder="Search Google for a BBQ joint..."
            className="input-base"
          />
          {!import.meta.env.VITE_GOOGLE_MAPS_API_KEY && (
            <p className="text-xs text-error">Google Maps API key not configured.</p>
          )}
          {pendingNew && (
            <div className="p-3 rounded-lg bg-surface-2 border border-amber flex flex-col gap-2">
              <div className="text-sm font-heading text-amber">Confirm new restaurant?</div>
              <div className="font-medium text-text">{pendingNew.name}</div>
              <div className="text-xs text-text-muted">{pendingNew.address}</div>
              <div className="flex gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => { onSelect(pendingNew); setPendingNew(null) }}
                  className="flex-1 py-1.5 rounded bg-accent-red text-white text-sm font-heading tracking-wider hover:opacity-90 transition-opacity"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setPendingNew(null)}
                  className="flex-1 py-1.5 rounded border border-border text-text-muted text-sm hover:text-text transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
