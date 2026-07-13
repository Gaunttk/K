import { api } from './api'
import { getUploadUrl, uploadToR2 } from './r2'
import type { VisitFormData, AuthSession } from '../types'

export async function submitVisit(
  data: VisitFormData,
  _session: AuthSession,
  onProgress?: (step: string) => void,
): Promise<string> {
  const visitId = crypto.randomUUID()

  onProgress?.('Saving restaurant...')
  let restaurantId: string

  if (data.restaurant) {
    restaurantId = data.restaurant.id
  } else if (data.newRestaurant) {
    const rest = await api.post<{ id: string }>('/restaurants', data.newRestaurant)
    restaurantId = rest.id
  } else {
    throw new Error('No restaurant selected')
  }

  onProgress?.('Saving visit...')
  const sidesPayload = data.sides
    .filter((s) => s.name.trim() && s.rating)
    .map((s) => ({ name: s.name.trim(), rating: s.rating! }))

  const saucesPayload = data.sauces
    .filter((s) => s.name.trim() && s.rating && s.spiciness)
    .map((s) => ({
      name: s.name.trim(),
      flavor_descriptor: s.flavor_descriptor.trim() || null,
      rating: s.rating!,
      spiciness: s.spiciness!,
    }))

  await api.post('/visits', {
    id: visitId,
    restaurant_id: restaurantId,
    visit_date: data.visitDate,
    meat_types: data.meatTypes,
    value_rating: data.ratings.value!,
    quantity_rating: data.ratings.quantity!,
    atmosphere_rating: data.ratings.atmosphere!,
    staff_rating: data.ratings.staff!,
    overall_rating: data.ratings.overall!,
    comments: data.comments.trim() || null,
    sides: sidesPayload,
    sauces: saucesPayload,
  })

  const photosToUpload = data.photos.filter((p) => p.compressedFile)
  if (photosToUpload.length) {
    onProgress?.(`Uploading ${photosToUpload.length} photo(s)...`)
    const photoRecords = await Promise.all(
      photosToUpload.map(async (p) => {
        const { uploadUrl, r2Key, r2Url } = await getUploadUrl(visitId, p.label)
        await uploadToR2(p.compressedFile!, uploadUrl)
        return { label: p.label, r2_key: r2Key, r2_url: r2Url }
      }),
    )
    await api.post(`/visits/${visitId}/photos`, photoRecords)
  }

  onProgress?.('Done!')
  return visitId
}
