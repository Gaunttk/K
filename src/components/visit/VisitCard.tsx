import { useNavigate } from 'react-router-dom'
import StarPicker from '../ui/StarPicker'
import type { VisitWithRelations } from '../../types'

interface Props {
  visit: VisitWithRelations
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function VisitCard({ visit }: Props) {
  const navigate = useNavigate()
  const thumb = visit.photos.find((p) => p.label === 'Full Meal') ?? visit.photos[0]
  const exterior = visit.photos.find((p) => p.label === 'Exterior')

  return (
    <button
      type="button"
      onClick={() => navigate(`/visit/${visit.id}`)}
      className="w-full text-left rounded-xl border border-border bg-surface hover:border-amber transition-all overflow-hidden"
    >
      {thumb && (
        <div className="h-40 w-full overflow-hidden">
          <img src={thumb.r2_url} alt="Full Meal" className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {exterior && (
              <img
                src={exterior.r2_url}
                alt="Exterior"
                className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
              />
            )}
            <h3 className="font-heading text-lg text-text leading-tight truncate">{visit.restaurant.name}</h3>
          </div>
          <StarPicker value={visit.overall_rating} readOnly size="sm" />
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>{formatDate(visit.visit_date)}</span>
          <span>·</span>
          <span>{visit.user.name}</span>
          {visit.total_cost != null && (
            <>
              <span>·</span>
              <span>${visit.total_cost.toFixed(2)}</span>
            </>
          )}
        </div>
        {visit.item_name && <p className="text-xs text-text-muted">{visit.item_name}</p>}
        {visit.meat_types.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {visit.meat_types.map((m) => (
              <span key={m} className="px-2 py-0.5 rounded-full bg-surface-2 text-xs text-text-muted border border-border">
                {m}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}
