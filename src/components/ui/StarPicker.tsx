import { useRef, useCallback, type PointerEvent, type KeyboardEvent } from 'react'
import type { Rating } from '../../types'

interface Props {
  value: Rating | null
  onChange?: (v: Rating) => void
  readOnly?: boolean
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

const sizes = { sm: 18, md: 24, lg: 32 }

function clampRating(v: number): Rating {
  return Math.min(5, Math.max(0.1, Math.round(v * 10) / 10))
}

function Star({ fillPct, size }: { fillPct: number; size: number }) {
  return (
    <span className="relative inline-block shrink-0" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="var(--border)"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="absolute inset-0"
      >
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
      {fillPct > 0 && (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="var(--star-fill)"
          stroke="var(--star-fill)"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - fillPct}% 0 0)` }}
        >
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
        </svg>
      )}
    </span>
  )
}

export default function StarPicker({ value, onChange, readOnly = false, size = 'md', label }: Props) {
  const px = sizes[size]
  const trackRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)

  const computeValue = useCallback((clientX: number): Rating => {
    const el = trackRef.current
    if (!el) return 0.1
    const rect = el.getBoundingClientRect()
    const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    return clampRating(fraction * 5)
  }, [])

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    if (readOnly || !onChange) return
    draggingRef.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    onChange(computeValue(e.clientX))
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current || readOnly || !onChange) return
    onChange(computeValue(e.clientX))
  }

  function handlePointerUp() {
    draggingRef.current = false
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (readOnly || !onChange) return
    const current = value ?? 0
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      onChange(clampRating(current + 0.1))
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      onChange(clampRating(current - 0.1))
    }
  }

  const stars = [1, 2, 3, 4, 5].map((n) => {
    const fillPct = value == null ? 0 : Math.min(100, Math.max(0, (value - (n - 1)) * 100))
    return <Star key={n} fillPct={fillPct} size={px} />
  })

  if (readOnly) {
    return (
      <div className="flex items-center gap-1.5" aria-label={label ? `${label}: ${value ?? 0} out of 5` : undefined}>
        <div className="flex gap-0.5">{stars}</div>
        {value != null && <span className="text-xs text-text-muted tabular-nums">{value.toFixed(1)}</span>}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={label ?? 'Rating'}
        aria-valuemin={0.1}
        aria-valuemax={5}
        aria-valuenow={value ?? 0}
        aria-valuetext={value != null ? `${value.toFixed(1)} out of 5` : 'unrated'}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        className="flex gap-0.5 cursor-pointer touch-none select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded p-0.5"
      >
        {stars}
      </div>
      <span className="text-xs text-text-muted w-8 tabular-nums">{value != null ? value.toFixed(1) : '—'}</span>
    </div>
  )
}
