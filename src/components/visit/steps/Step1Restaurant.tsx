import { useState } from 'react'
import { api } from '../../../lib/api'
import { getSession } from '../../../lib/auth'
import RestaurantSearch from '../../restaurant/RestaurantSearch'
import type { VisitFormData, Restaurant, NewRestaurantInput, Side, Sauce } from '../../../types'

interface Props {
  data: VisitFormData
  onChange: (d: VisitFormData) => void
  onNext: () => void
}

interface PriorVisit {
  id: string
  visit_date: string
  sides: Side[]
  sauces: Sauce[]
}

export default function Step1Restaurant({ data, onChange, onNext }: Props) {
  const [priorVisit, setPriorVisit] = useState<PriorVisit | null>(null)

  async function handleSelect(r: Restaurant | NewRestaurantInput) {
    const isExisting = 'id' in r
    const restaurantId = isExisting ? (r as Restaurant).id : null

    onChange({
      ...data,
      restaurant: isExisting ? (r as Restaurant) : null,
      newRestaurant: isExisting ? null : (r as NewRestaurantInput),
    })

    if (restaurantId) {
      const session = getSession()
      if (!session) return
      const prior = await api.get<PriorVisit | null>(
        `/visits/prior?restaurantId=${restaurantId}&userId=${session.userId}`
      )
      if (prior) setPriorVisit(prior)
    }
  }

  function handleCarryForward() {
    if (!priorVisit) return
    onChange({
      ...data,
      sides: priorVisit.sides.map((s) => ({
        localId: crypto.randomUUID(),
        name: s.name,
        rating: s.rating,
      })),
      sauces: priorVisit.sauces.map((s) => ({
        localId: crypto.randomUUID(),
        name: s.name,
        flavor_descriptor: s.flavor_descriptor ?? '',
        rating: s.rating,
        spiciness: s.spiciness,
      })),
    })
    setPriorVisit(null)
  }

  const selected = data.restaurant ?? data.newRestaurant

  return (
    <div className="flex flex-col gap-6">
      <RestaurantSearch onSelect={handleSelect} />

      {selected && (
        <div className="p-3 rounded-lg bg-surface-2 border border-amber text-sm">
          <span className="text-amber font-heading tracking-wider">Selected: </span>
          <span className="text-text">{'name' in selected ? selected.name : ''}</span>
        </div>
      )}

      {priorVisit && (
        <div className="p-4 rounded-lg bg-surface border border-border flex flex-col gap-3">
          <div className="text-sm text-text-muted">
            You visited here before ({new Date(priorVisit.visit_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}).
            Carry forward your sides & sauces?
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCarryForward}
              className="flex-1 py-2 rounded bg-accent-red text-white text-sm font-heading tracking-wider hover:opacity-90"
            >
              Yes, Carry Forward
            </button>
            <button
              type="button"
              onClick={() => setPriorVisit(null)}
              className="flex-1 py-2 rounded border border-border text-text-muted text-sm hover:text-text"
            >
              Start Fresh
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        disabled={!selected}
        onClick={onNext}
        className="w-full py-3 rounded-lg bg-accent-red text-white font-heading tracking-wider disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        Next
      </button>
    </div>
  )
}
