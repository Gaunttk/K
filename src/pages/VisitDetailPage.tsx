import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { getSession } from '../lib/auth'
import { getUploadUrl, uploadToR2 } from '../lib/r2'
import StarPicker from '../components/ui/StarPicker'
import SpicinessInput from '../components/ui/SpicinessInput'
import PhotoUpload from '../components/ui/PhotoUpload'
import type { ItemType, PhotoFormItem, PhotoLabel, Rating, VisitWithRelations } from '../types'

const ALL_PHOTO_LABELS: PhotoLabel[] = ['Full Meal', 'Exterior', 'Interior']

function emptyPhotoItem(label: PhotoLabel): PhotoFormItem {
  return { label, file: null, compressedFile: null, preview: null, uploadState: 'idle' }
}

const RATING_LABELS = [
  { key: 'overall_rating', label: 'Overall' },
  { key: 'value_rating', label: 'Value' },
  { key: 'quantity_rating', label: 'Quantity' },
  { key: 'atmosphere_rating', label: 'Atmosphere' },
  { key: 'staff_rating', label: 'Staff' },
] as const

const ITEM_TYPES: ItemType[] = ['Sandwich', 'Plate']

interface EditForm {
  visitDate: string
  itemType: ItemType | null
  itemName: string
  totalCost: string
  ratings: Record<(typeof RATING_LABELS)[number]['key'], Rating | null>
  regularSauceRating: Rating | null
  comments: string
}

function toEditForm(visit: VisitWithRelations): EditForm {
  return {
    visitDate: visit.visit_date,
    itemType: visit.item_type,
    itemName: visit.item_name ?? '',
    totalCost: visit.total_cost != null ? String(visit.total_cost) : '',
    ratings: {
      overall_rating: visit.overall_rating,
      value_rating: visit.value_rating,
      quantity_rating: visit.quantity_rating,
      atmosphere_rating: visit.atmosphere_rating,
      staff_rating: visit.staff_rating,
    },
    regularSauceRating: visit.regular_sauce_rating,
    comments: visit.comments ?? '',
  }
}

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function VisitDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [visit, setVisit] = useState<VisitWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<EditForm | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [addingPhotos, setAddingPhotos] = useState(false)
  const [photoItems, setPhotoItems] = useState<PhotoFormItem[]>([])
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const session = getSession()

  useEffect(() => {
    if (id) void load(id)
  }, [id])

  async function load(visitId: string) {
    try {
      const data = await api.get<VisitWithRelations>(`/visits/${visitId}`)
      setVisit(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load visit')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="py-20 text-center text-text-muted">Loading...</div>
  if (error) return <div className="py-20 text-center text-accent-red">{error}</div>
  if (!visit) return <div className="py-20 text-center text-text-muted">Visit not found.</div>

  const isOwner = session?.userId === visit.user_id

  function startEdit() {
    if (!visit) return
    setForm(toEditForm(visit))
    setSaveError(null)
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
    setForm(null)
    setSaveError(null)
  }

  async function saveEdit() {
    if (!form || !id) return
    setSaving(true)
    setSaveError(null)
    try {
      await api.put(`/visits/${id}`, {
        visit_date: form.visitDate,
        item_type: form.itemType,
        item_name: form.itemName.trim() || null,
        total_cost: form.totalCost.trim() ? Number(form.totalCost) : null,
        regular_sauce_rating: form.regularSauceRating,
        value_rating: form.ratings.value_rating!,
        quantity_rating: form.ratings.quantity_rating!,
        atmosphere_rating: form.ratings.atmosphere_rating!,
        staff_rating: form.ratings.staff_rating!,
        overall_rating: form.ratings.overall_rating!,
        comments: form.comments.trim() || null,
      })
      await load(id)
      setEditing(false)
      setForm(null)
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  const missingPhotoLabels = visit
    ? ALL_PHOTO_LABELS.filter((label) => !visit.photos.some((p) => p.label === label))
    : []

  function startAddPhotos() {
    setPhotoItems(missingPhotoLabels.map(emptyPhotoItem))
    setPhotoError(null)
    setAddingPhotos(true)
  }

  function cancelAddPhotos() {
    setAddingPhotos(false)
    setPhotoItems([])
    setPhotoError(null)
  }

  function updatePhotoItem(index: number, item: PhotoFormItem) {
    setPhotoItems((items) => items.map((it, i) => (i === index ? item : it)))
  }

  async function submitPhotos() {
    if (!id) return
    const toUpload = photoItems.filter((p) => p.compressedFile)
    if (!toUpload.length) return
    setUploadingPhotos(true)
    setPhotoError(null)
    try {
      const records = await Promise.all(
        toUpload.map(async (p) => {
          const { uploadUrl, r2Key, r2Url } = await getUploadUrl(id, p.label)
          await uploadToR2(p.compressedFile!, uploadUrl)
          return { label: p.label, r2_key: r2Key, r2_url: r2Url }
        }),
      )
      await api.post(`/visits/${id}/photos`, records)
      await load(id)
      setAddingPhotos(false)
      setPhotoItems([])
    } catch (e) {
      setPhotoError(e instanceof Error ? e.message : 'Failed to upload photos')
    } finally {
      setUploadingPhotos(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Restaurant header */}
      <div className="grain p-5 rounded-xl bg-surface border border-border flex flex-col gap-2">
        <button
          type="button"
          onClick={() => navigate(`/restaurants/${visit.restaurant.id}`)}
          className="text-left"
        >
          <h1 className="text-3xl text-text hover:text-amber transition-colors">{visit.restaurant.name}</h1>
        </button>
        {editing && form ? (
          <div className="flex flex-col gap-3 mt-1">
            <input
              type="date"
              value={form.visitDate}
              onChange={(e) => setForm({ ...form, visitDate: e.target.value })}
              max={new Date().toISOString().split('T')[0]}
              className="input-base"
            />
            <div className="flex gap-3">
              {ITEM_TYPES.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, itemType: form.itemType === t ? null : t })}
                  className={`flex-1 py-2 rounded-lg border font-heading tracking-wider text-sm transition-colors ${
                    form.itemType === t
                      ? 'bg-accent-red text-white border-accent-red'
                      : 'border-border text-text-muted hover:text-text'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={form.itemName}
              onChange={(e) => setForm({ ...form, itemName: e.target.value })}
              placeholder="Sandwich or plate name"
              className="input-base"
            />
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={form.totalCost}
              onChange={(e) => setForm({ ...form, totalCost: e.target.value })}
              placeholder="Total bill cost"
              className="input-base"
            />
          </div>
        ) : (
          <>
            <p className="text-sm text-text-muted">{formatDate(visit.visit_date)}</p>
            <p className="text-xs text-text-muted">by {visit.user.name}</p>
            {(visit.item_name || visit.total_cost != null) && (
              <div className="flex items-center gap-2 text-sm text-text mt-1">
                {visit.item_name && (
                  <span>
                    {visit.item_type && <span className="text-text-muted">{visit.item_type}: </span>}
                    {visit.item_name}
                  </span>
                )}
                {visit.total_cost != null && (
                  <span className="text-amber">${visit.total_cost.toFixed(2)}</span>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Meat types */}
      {visit.meat_types.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {visit.meat_types.map((m) => (
            <span key={m} className="px-3 py-1 rounded-full bg-surface-2 border border-border text-sm">
              {m}
            </span>
          ))}
        </div>
      )}

      {/* Ratings */}
      <div className="p-4 rounded-xl bg-surface border border-border flex flex-col gap-3">
        <h2 className="font-heading text-sm text-text-muted tracking-wider">Ratings</h2>
        {editing && form ? (
          <>
            {RATING_LABELS.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-text">{label}</span>
                <StarPicker
                  value={form.ratings[key]}
                  onChange={(v) => setForm({ ...form, ratings: { ...form.ratings, [key]: v } })}
                  size="sm"
                  label={label}
                />
              </div>
            ))}
            <div className="flex items-center justify-between">
              <span className="text-sm text-text">Regular Sauce</span>
              <StarPicker
                value={form.regularSauceRating}
                onChange={(v) => setForm({ ...form, regularSauceRating: v })}
                size="sm"
                label="Regular sauce rating"
              />
            </div>
          </>
        ) : (
          <>
            {RATING_LABELS.map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-text">{label}</span>
                <StarPicker value={visit[key]} readOnly size="sm" />
              </div>
            ))}
            {visit.regular_sauce_rating != null && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-text">Regular Sauce</span>
                <StarPicker value={visit.regular_sauce_rating} readOnly size="sm" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Sides */}
      {visit.sides.length > 0 && (
        <div className="p-4 rounded-xl bg-surface border border-border flex flex-col gap-3">
          <h2 className="font-heading text-sm text-text-muted tracking-wider">Sides</h2>
          {visit.sides.map((s) => (
            <div key={s.id} className="flex items-center justify-between">
              <span className="text-sm text-text">{s.name}</span>
              <StarPicker value={s.rating} readOnly size="sm" />
            </div>
          ))}
        </div>
      )}

      {/* Sauces */}
      {visit.sauces.length > 0 && (
        <div className="p-4 rounded-xl bg-surface border border-border flex flex-col gap-3">
          <h2 className="font-heading text-sm text-text-muted tracking-wider">Sauces</h2>
          {visit.sauces.map((s) => (
            <div key={s.id} className="flex flex-col gap-1.5 border-b border-border last:border-0 pb-3 last:pb-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-text">{s.name}</span>
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
        </div>
      )}

      {/* Photos */}
      {visit.photos.length > 0 && (
        <div className="flex flex-col gap-3">
          <h2 className="font-heading text-sm text-text-muted tracking-wider">Photos</h2>
          <div className="grid grid-cols-3 gap-2">
            {visit.photos.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setLightbox(p.r2_url)}
                className="flex flex-col gap-1"
              >
                <img
                  src={p.r2_url}
                  alt={p.label}
                  className="w-full aspect-square object-cover rounded-lg border border-border hover:border-amber transition-colors"
                />
                <span className="text-xs text-text-muted text-center">{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add photos (own visits only, when slots remain) */}
      {isOwner && missingPhotoLabels.length > 0 && (
        <div className="flex flex-col gap-3">
          {addingPhotos ? (
            <div className="flex flex-col gap-4">
              <h2 className="font-heading text-sm text-text-muted tracking-wider">Add Photos</h2>
              <div className="grid grid-cols-1 gap-4">
                {photoItems.map((item, i) => (
                  <PhotoUpload key={item.label} item={item} onChange={(next) => updatePhotoItem(i, next)} />
                ))}
              </div>
              {photoError && (
                <div className="p-3 rounded-lg bg-error/10 border border-error text-error text-sm">{photoError}</div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={cancelAddPhotos}
                  disabled={uploadingPhotos}
                  className="flex-1 py-3 rounded-lg border border-border text-text-muted hover:text-text transition-colors font-heading tracking-wider disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void submitPhotos()}
                  disabled={uploadingPhotos || !photoItems.some((p) => p.compressedFile)}
                  className="flex-1 py-3 rounded-lg bg-accent-red text-white font-heading tracking-wider disabled:opacity-40 hover:opacity-90 transition-opacity"
                >
                  {uploadingPhotos ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={startAddPhotos}
              className="w-full py-3 rounded-xl border border-border text-text hover:border-amber transition-colors text-sm font-heading tracking-wider"
            >
              + Add Photos
            </button>
          )}
        </div>
      )}

      {/* Comments */}
      {editing && form ? (
        <div className="p-4 rounded-xl bg-surface border border-border flex flex-col gap-2">
          <h2 className="font-heading text-sm text-text-muted tracking-wider">Overall Note</h2>
          <textarea
            value={form.comments}
            onChange={(e) => setForm({ ...form, comments: e.target.value })}
            placeholder="Any other notes about this visit..."
            rows={3}
            className="input-base resize-none"
          />
        </div>
      ) : (
        visit.comments && (
          <div className="p-4 rounded-xl bg-surface border border-border">
            <h2 className="font-heading text-sm text-text-muted tracking-wider mb-2">Notes</h2>
            <p className="text-sm text-text leading-relaxed">{visit.comments}</p>
          </div>
        )
      )}

      {saveError && (
        <div className="p-3 rounded-lg bg-error/10 border border-error text-error text-sm">{saveError}</div>
      )}

      {/* Edit controls (own visits only) */}
      {isOwner && (
        editing ? (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={cancelEdit}
              disabled={saving}
              className="flex-1 py-3 rounded-xl border border-border text-text-muted hover:text-text transition-colors font-heading tracking-wider disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => void saveEdit()}
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-accent-red text-white font-heading tracking-wider disabled:opacity-60 hover:opacity-90 transition-opacity"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={startEdit}
            className="w-full py-3 rounded-xl border border-border text-text hover:border-amber transition-colors text-sm font-heading tracking-wider"
          >
            Edit Visit
          </button>
        )
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-bg/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <img src={lightbox} alt="Full size" className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      )}
    </div>
  )
}
