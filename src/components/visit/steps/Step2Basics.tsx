import ChipSelect from '../../ui/ChipSelect'
import type { ItemType, VisitFormData } from '../../../types'

const MEAT_OPTIONS = ['Brisket', 'Ribs', 'Pulled Pork', 'Chicken', 'Sausage', 'Turkey', 'Burnt Ends', 'Tri-tip']
const ITEM_TYPES: ItemType[] = ['Sandwich', 'Plate']

interface Props {
  data: VisitFormData
  onChange: (d: VisitFormData) => void
  onNext: () => void
  onBack: () => void
}

export default function Step2Basics({ data, onChange, onNext, onBack }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-heading text-text-muted tracking-wider">Visit Date</label>
        <input
          type="date"
          value={data.visitDate}
          onChange={(e) => onChange({ ...data, visitDate: e.target.value })}
          className="input-base"
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-sm font-heading text-text-muted tracking-wider">Meats Tried</label>
        <ChipSelect
          options={MEAT_OPTIONS}
          selected={data.meatTypes}
          onChange={(meatTypes) => onChange({ ...data, meatTypes })}
          allowAdd
          placeholder="Add meat..."
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-heading text-text-muted tracking-wider">Sandwich or Plate?</label>
        <div className="flex gap-3">
          {ITEM_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onChange({ ...data, itemType: data.itemType === t ? null : t })}
              className={`flex-1 py-2.5 rounded-lg border font-heading tracking-wider text-sm transition-colors ${
                data.itemType === t
                  ? 'bg-accent-red text-white border-accent-red'
                  : 'border-border text-text-muted hover:text-text'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-heading text-text-muted tracking-wider">
          {data.itemType === 'Plate' ? 'Plate Name' : 'Sandwich Name'} (optional)
        </label>
        <input
          type="text"
          value={data.itemName}
          onChange={(e) => onChange({ ...data, itemName: e.target.value })}
          placeholder={data.itemType === 'Plate' ? 'e.g. 3-Meat Plate' : 'e.g. Chopped Brisket Sandwich'}
          className="input-base"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-heading text-text-muted tracking-wider">Total Bill Cost (optional)</label>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={data.totalCost}
          onChange={(e) => onChange({ ...data, totalCost: e.target.value })}
          placeholder="0.00"
          className="input-base"
        />
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex-1 py-3 rounded-lg border border-border text-text-muted hover:text-text transition-colors font-heading tracking-wider">
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!data.visitDate}
          className="flex-1 py-3 rounded-lg bg-accent-red text-white font-heading tracking-wider disabled:opacity-40 hover:opacity-90 transition-opacity"
        >
          Next
        </button>
      </div>
    </div>
  )
}
