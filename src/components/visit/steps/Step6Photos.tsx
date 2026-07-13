import PhotoUpload from '../../ui/PhotoUpload'
import type { VisitFormData, PhotoFormItem, PhotoLabel } from '../../../types'

const PHOTO_LABELS: PhotoLabel[] = ['Full Meal', 'Exterior', 'Interior']

interface Props {
  data: VisitFormData
  onChange: (d: VisitFormData) => void
  onNext: () => void
  onBack: () => void
}

export default function Step6Photos({ data, onChange, onNext, onBack }: Props) {
  function updatePhoto(index: number, item: PhotoFormItem) {
    const next = [...data.photos] as typeof data.photos
    next[index] = item
    onChange({ ...data, photos: next })
  }

  const uploadedCount = data.photos.filter((p) => p.file).length
  const allUploaded = uploadedCount === 3

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-text-muted">
        Add up to 3 photos of your visit. You can skip and add later.
      </p>

      <div className="grid grid-cols-1 gap-4">
        {PHOTO_LABELS.map((label, i) => (
          <PhotoUpload
            key={label}
            item={data.photos[i]}
            onChange={(item) => updatePhoto(i, item)}
          />
        ))}
      </div>

      {!allUploaded && uploadedCount > 0 && (
        <div className="text-xs text-amber p-3 rounded-lg border border-amber/30 bg-amber/5">
          {uploadedCount}/3 photos added. You can continue without all 3.
        </div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex-1 py-3 rounded-lg border border-border text-text-muted hover:text-text transition-colors font-heading tracking-wider">
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          className="flex-1 py-3 rounded-lg bg-accent-red text-white font-heading tracking-wider hover:opacity-90 transition-opacity"
        >
          {uploadedCount === 0 ? 'Skip Photos' : 'Next'}
        </button>
      </div>
    </div>
  )
}
