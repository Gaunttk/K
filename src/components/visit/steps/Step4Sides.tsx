import StarPicker from '../../ui/StarPicker'
import type { VisitFormData, SideFormItem, Rating } from '../../../types'

interface Props {
  data: VisitFormData
  onChange: (d: VisitFormData) => void
  onNext: () => void
  onBack: () => void
}

export default function Step4Sides({ data, onChange, onNext, onBack }: Props) {
  function addSide() {
    onChange({
      ...data,
      sides: [...data.sides, { localId: crypto.randomUUID(), name: '', rating: null }],
    })
  }

  function updateSide(localId: string, patch: Partial<SideFormItem>) {
    onChange({
      ...data,
      sides: data.sides.map((s) => (s.localId === localId ? { ...s, ...patch } : s)),
    })
  }

  function removeSide(localId: string) {
    onChange({ ...data, sides: data.sides.filter((s) => s.localId !== localId) })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {data.sides.map((side) => (
          <div key={side.localId} className="p-3 rounded-lg bg-surface-2 border border-border flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={side.name}
                onChange={(e) => updateSide(side.localId, { name: e.target.value })}
                placeholder="Side name (e.g. Mac & Cheese)"
                className="input-base flex-1"
              />
              <button
                type="button"
                onClick={() => removeSide(side.localId)}
                className="text-text-muted hover:text-error transition-colors text-xl leading-none w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>
            <StarPicker
              value={side.rating}
              onChange={(v: Rating) => updateSide(side.localId, { rating: v })}
              label={side.name || 'Side rating'}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addSide}
        className="py-2.5 rounded-lg border-2 border-dashed border-border text-text-muted hover:border-amber hover:text-text transition-colors text-sm font-heading tracking-wider"
      >
        + Add Side
      </button>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex-1 py-3 rounded-lg border border-border text-text-muted hover:text-text transition-colors font-heading tracking-wider">
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 py-3 rounded-lg bg-accent-red text-white font-heading tracking-wider hover:opacity-90 transition-opacity"
        >
          Next
        </button>
      </div>
    </div>
  )
}
