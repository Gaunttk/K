import StarPicker from '../../ui/StarPicker'
import SpicinessInput from '../../ui/SpicinessInput'
import type { VisitFormData, SauceFormItem, Rating } from '../../../types'

interface Props {
  data: VisitFormData
  onChange: (d: VisitFormData) => void
  onNext: () => void
  onBack: () => void
}

export default function Step5Sauces({ data, onChange, onNext, onBack }: Props) {
  function addSauce() {
    onChange({
      ...data,
      sauces: [
        ...data.sauces,
        { localId: crypto.randomUUID(), name: '', flavor_descriptor: '', rating: null, spiciness: null },
      ],
    })
  }

  function updateSauce(localId: string, patch: Partial<SauceFormItem>) {
    onChange({
      ...data,
      sauces: data.sauces.map((s) => (s.localId === localId ? { ...s, ...patch } : s)),
    })
  }

  function removeSauce(localId: string) {
    onChange({ ...data, sauces: data.sauces.filter((s) => s.localId !== localId) })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {data.sauces.map((sauce) => (
          <div key={sauce.localId} className="p-4 rounded-lg bg-surface-2 border border-border flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={sauce.name}
                onChange={(e) => updateSauce(sauce.localId, { name: e.target.value })}
                placeholder="Sauce name (e.g. Carolina Mustard)"
                className="input-base flex-1"
              />
              <button
                type="button"
                onClick={() => removeSauce(sauce.localId)}
                className="text-text-muted hover:text-error transition-colors text-xl leading-none w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>
            <input
              type="text"
              value={sauce.flavor_descriptor}
              onChange={(e) => updateSauce(sauce.localId, { flavor_descriptor: e.target.value })}
              placeholder="Flavor notes (e.g. Sweet & Tangy)"
              className="input-base text-sm"
            />
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-muted font-heading tracking-wider">Quality</span>
                <StarPicker
                  value={sauce.rating}
                  onChange={(v: Rating) => updateSauce(sauce.localId, { rating: v })}
                  label={`${sauce.name || 'sauce'} quality`}
                />
              </div>
              <div className="flex flex-col gap-1 items-end">
                <span className="text-xs text-text-muted font-heading tracking-wider">Heat</span>
                <SpicinessInput
                  value={sauce.spiciness}
                  onChange={(v: Rating) => updateSauce(sauce.localId, { spiciness: v })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addSauce}
        className="py-2.5 rounded-lg border-2 border-dashed border-border text-text-muted hover:border-amber hover:text-text transition-colors text-sm font-heading tracking-wider"
      >
        + Add Sauce
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
