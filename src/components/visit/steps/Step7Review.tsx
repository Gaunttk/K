import { useState } from 'react'
import StarPicker from '../../ui/StarPicker'
import SpicinessInput from '../../ui/SpicinessInput'
import { submitVisit } from '../../../lib/visitSubmit'
import { getSession } from '../../../lib/auth'
import { useNavigate } from 'react-router-dom'
import type { VisitFormData } from '../../../types'

interface Props {
  data: VisitFormData
  onChange: (d: VisitFormData) => void
  onBack: () => void
  onSubmitSuccess: () => void
}

const RATING_LABELS = {
  overall: 'Overall',
  value: 'Value',
  quantity: 'Quantity',
  atmosphere: 'Atmosphere',
  staff: 'Staff',
} as const

export default function Step7Review({ data, onChange, onBack, onSubmitSuccess }: Props) {
  const [progress, setProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function handleSubmit() {
    const session = getSession()
    if (!session) return
    setError(null)
    try {
      const visitId = await submitVisit(data, session, setProgress)
      onSubmitSuccess()
      navigate(`/visit/${visitId}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save visit')
      setProgress(null)
    }
  }

  const restaurantName = data.restaurant?.name ?? data.newRestaurant?.name ?? '—'
  const photosAdded = data.photos.filter((p) => p.file).length

  return (
    <div className="flex flex-col gap-6">
      {/* Restaurant & date */}
      <section className="p-4 rounded-lg bg-surface-2 border border-border flex flex-col gap-1">
        <h3 className="font-heading text-lg text-amber">{restaurantName}</h3>
        <p className="text-sm text-text-muted">{data.visitDate}</p>
        {(data.itemName || data.totalCost) && (
          <p className="text-sm text-text">
            {data.itemType && <span className="text-text-muted">{data.itemType}: </span>}
            {data.itemName}
            {data.totalCost && <span className="text-amber ml-2">${Number(data.totalCost).toFixed(2)}</span>}
          </p>
        )}
        {data.meatTypes.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {data.meatTypes.map((m) => (
              <span key={m} className="px-2 py-0.5 rounded-full bg-surface text-xs border border-border">{m}</span>
            ))}
          </div>
        )}
      </section>

      {/* Ratings */}
      <section className="p-4 rounded-lg bg-surface-2 border border-border flex flex-col gap-3">
        <h4 className="font-heading text-sm text-text-muted tracking-wider">Ratings</h4>
        {(Object.keys(RATING_LABELS) as (keyof typeof RATING_LABELS)[]).map((key) => (
          <div key={key} className="flex items-center justify-between">
            <span className="text-sm text-text">{RATING_LABELS[key]}</span>
            <StarPicker value={data.ratings[key]} readOnly size="sm" />
          </div>
        ))}
      </section>

      {/* Sides */}
      {data.sides.filter((s) => s.name.trim()).length > 0 && (
        <section className="p-4 rounded-lg bg-surface-2 border border-border flex flex-col gap-2">
          <h4 className="font-heading text-sm text-text-muted tracking-wider">Sides</h4>
          {data.sides.filter((s) => s.name.trim()).map((s) => (
            <div key={s.localId} className="flex items-center justify-between">
              <span className="text-sm text-text">{s.name}</span>
              <StarPicker value={s.rating} readOnly size="sm" />
            </div>
          ))}
        </section>
      )}

      {/* Sauces */}
      {data.regularSauceRating !== null && (
        <section className="p-4 rounded-lg bg-surface-2 border border-border flex items-center justify-between">
          <span className="text-sm text-text">Regular Sauce</span>
          <StarPicker value={data.regularSauceRating} readOnly size="sm" />
        </section>
      )}
      {data.sauces.filter((s) => s.name.trim()).length > 0 && (
        <section className="p-4 rounded-lg bg-surface-2 border border-border flex flex-col gap-2">
          <h4 className="font-heading text-sm text-text-muted tracking-wider">Special Sauces</h4>
          {data.sauces.filter((s) => s.name.trim()).map((s) => (
            <div key={s.localId} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-text">{s.name}</span>
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
        </section>
      )}

      {/* Comments */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-heading text-text-muted tracking-wider">Overall Note (optional)</label>
        <textarea
          value={data.comments}
          onChange={(e) => onChange({ ...data, comments: e.target.value })}
          placeholder="Any other notes about this visit..."
          rows={3}
          className="input-base resize-none"
        />
      </div>

      {/* Photos summary */}
      <div className="text-sm text-text-muted">
        {photosAdded === 0 ? 'No photos added.' : `${photosAdded}/3 photo${photosAdded > 1 ? 's' : ''} ready to upload.`}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-error/10 border border-error text-error text-sm">{error}</div>
      )}

      {progress && (
        <div className="p-3 rounded-lg bg-amber/10 border border-amber/30 text-amber text-sm">{progress}</div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={!!progress}
          className="flex-1 py-3 rounded-lg border border-border text-text-muted hover:text-text transition-colors font-heading tracking-wider disabled:opacity-40"
        >
          Back
        </button>
        <button
          type="button"
          onClick={() => void handleSubmit()}
          disabled={!!progress}
          className="flex-1 py-3 rounded-lg bg-accent-red text-white font-heading tracking-wider disabled:opacity-60 hover:opacity-90 transition-opacity"
        >
          {progress ? 'Saving...' : 'Save Visit'}
        </button>
      </div>
    </div>
  )
}
