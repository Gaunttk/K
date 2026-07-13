import { supabase } from './supabase'
import { getUploadUrl, uploadToR2 } from './r2'
import type { VisitFormData, AuthSession } from '../types'

export async function submitVisit(
  data: VisitFormData,
  session: AuthSession,
  onProgress?: (step: string) => void,
): Promise<string> {
  const visitId = crypto.randomUUID()

  onProgress?.('Saving restaurant...')
  let restaurantId: string

  if (data.restaurant) {
    restaurantId = data.restaurant.id
  } else if (data.newRestaurant) {
    const { data: rest, error } = await supabase
      .from('restaurants')
      .insert(data.newRestaurant)
      .select('id')
      .single()
    if (error) throw error
    restaurantId = rest.id as string
  } else {
    throw new Error('No restaurant selected')
  }

  onProgress?.('Saving visit...')
  const { error: visitErr } = await supabase.from('visits').insert({
    id: visitId,
    restaurant_id: restaurantId,
    user_id: session.userId,
    visit_date: data.visitDate,
    meat_types: data.meatTypes,
    value_rating: data.ratings.value!,
    quantity_rating: data.ratings.quantity!,
    atmosphere_rating: data.ratings.atmosphere!,
    staff_rating: data.ratings.staff!,
    overall_rating: data.ratings.overall!,
    comments: data.comments.trim() || null,
  })
  if (visitErr) throw visitErr

  onProgress?.('Saving sides & sauces...')
  const sidesPayload = data.sides
    .filter((s) => s.name.trim() && s.rating)
    .map((s) => ({ visit_id: visitId, name: s.name.trim(), rating: s.rating! }))

  const saucesPayload = data.sauces
    .filter((s) => s.name.trim() && s.rating && s.spiciness)
    .map((s) => ({
      visit_id: visitId,
      name: s.name.trim(),
      flavor_descriptor: s.flavor_descriptor.trim() || null,
      rating: s.rating!,
      spiciness: s.spiciness!,
    }))

  await Promise.all([
    sidesPayload.length ? supabase.from('sides').insert(sidesPayload) : Promise.resolve(),
    saucesPayload.length ? supabase.from('sauces').insert(saucesPayload) : Promise.resolve(),
  ])

  const photosToUpload = data.photos.filter((p) => p.compressedFile)
  if (photosToUpload.length) {
    onProgress?.(`Uploading ${photosToUpload.length} photo(s)...`)
    const uploadResults = await Promise.all(
      photosToUpload.map(async (p) => {
        const { uploadUrl, r2Key, r2Url } = await getUploadUrl(visitId, p.label, session.jwt)
        await uploadToR2(p.compressedFile!, uploadUrl)
        return { visit_id: visitId, label: p.label, r2_key: r2Key, r2_url: r2Url }
      }),
    )
    const { error: photoErr } = await supabase.from('photos').insert(uploadResults)
    if (photoErr) throw photoErr
  }

  onProgress?.('Done!')
  return visitId
}
