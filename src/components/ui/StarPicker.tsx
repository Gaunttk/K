import type { Rating } from '../../types'

interface Props {
  value: Rating | null
  onChange?: (v: Rating) => void
  readOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const sizes = { sm: 18, md: 24, lg: 32 }

function Star({ filled, size }: { filled: boolean; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'var(--star-fill)' : 'none'}
      stroke={filled ? 'var(--star-fill)' : 'var(--border)'}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  )
}

export default function StarPicker({ value, onChange, readOnly = false, size = 'md', label }: Props) {
  const px = sizes[size]

  if (readOnly) {
    return (
      <div className="flex gap-0.5" aria-label={label ? `${label}: ${value ?? 0} out of 5` : undefined}>
        {([1, 2, 3, 4, 5] as Rating[]).map((n) => (
          <Star key={n} filled={value !== null && n <= value} size={px} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-0.5" role="radiogroup" aria-label={label ?? 'Rating'}>
      {([1, 2, 3, 4, 5] as Rating[]).map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onClick={() => onChange?.(n)}
          className="cursor-pointer p-0.5 rounded transition-opacity hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber"
        >
          <Star filled={value !== null && n <= value} size={px} />
        </button>
      ))}
    </div>
  )
}
