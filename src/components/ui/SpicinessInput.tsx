import type { Rating } from '../../types'

interface Props {
  value: Rating | null
  onChange?: (v: Rating) => void
  readOnly?: boolean
}

export default function SpicinessInput({ value, onChange, readOnly = false }: Props) {
  if (readOnly) {
    return (
      <div className="flex gap-0.5" aria-label={`Spiciness: ${value ?? 0} out of 5`}>
        {([1, 2, 3, 4, 5] as Rating[]).map((n) => (
          <span
            key={n}
            className="text-lg leading-none transition-opacity"
            style={{ opacity: value !== null && n <= value ? 1 : 0.2 }}
            aria-hidden
          >
            🌶️
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-0.5" role="radiogroup" aria-label="Spiciness level">
      {([1, 2, 3, 4, 5] as Rating[]).map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`Spiciness level ${n}`}
          onClick={() => onChange?.(n)}
          className="text-lg leading-none cursor-pointer p-0.5 rounded transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-dim"
          style={{ opacity: value !== null && n <= value ? 1 : 0.25 }}
        >
          🌶️
        </button>
      ))}
    </div>
  )
}
