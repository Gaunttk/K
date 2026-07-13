import StarPicker from '../../ui/StarPicker'
import type { VisitFormData, Rating } from '../../../types'

const RATING_FIELDS: { key: keyof VisitFormData['ratings']; label: string; hint: string }[] = [
  { key: 'overall', label: 'Overall', hint: 'Your gut-check score — independent of everything else' },
  { key: 'value', label: 'Value', hint: 'Was it worth the price?' },
  { key: 'quantity', label: 'Quantity / Portion', hint: 'Did you leave satisfied?' },
  { key: 'atmosphere', label: 'Atmosphere', hint: 'Vibe, décor, the whole experience' },
  { key: 'staff', label: 'Staff', hint: 'Service, friendliness, speed' },
]

interface Props {
  data: VisitFormData
  onChange: (d: VisitFormData) => void
  onNext: () => void
  onBack: () => void
}

export default function Step3Ratings({ data, onChange, onNext, onBack }: Props) {
  const allRated = Object.values(data.ratings).every((v) => v !== null)

  return (
    <div className="flex flex-col gap-6">
      {RATING_FIELDS.map(({ key, label, hint }) => (
        <div key={key} className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <span className="font-heading text-base tracking-wider">{label}</span>
            {data.ratings[key] !== null && (
              <span className="text-amber text-sm">{data.ratings[key]}/5</span>
            )}
          </div>
          <StarPicker
            value={data.ratings[key]}
            onChange={(v: Rating) => onChange({ ...data, ratings: { ...data.ratings, [key]: v } })}
            size="lg"
            label={label}
          />
          <p className="text-xs text-text-muted">{hint}</p>
        </div>
      ))}

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex-1 py-3 rounded-lg border border-border text-text-muted hover:text-text transition-colors font-heading tracking-wider">
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!allRated}
          className="flex-1 py-3 rounded-lg bg-accent-red text-white font-heading tracking-wider disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          Next
        </button>
      </div>
    </div>
  )
}
