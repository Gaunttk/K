export type PhotoLabel = 'Full Meal' | 'Exterior' | 'Interior'
export type Rating = 1 | 2 | 3 | 4 | 5

export interface UserPublic {
  id: string
  name: string
}

export interface Restaurant {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  google_place_id: string | null
  created_at: string
}

export interface Visit {
  id: string
  restaurant_id: string
  user_id: string
  visit_date: string
  meat_types: string[]
  value_rating: Rating
  quantity_rating: Rating
  atmosphere_rating: Rating
  staff_rating: Rating
  overall_rating: Rating
  comments: string | null
  created_at: string
}

export interface Side {
  id: string
  visit_id: string
  name: string
  rating: Rating
}

export interface Sauce {
  id: string
  visit_id: string
  name: string
  flavor_descriptor: string | null
  rating: Rating
  spiciness: Rating
}

export interface Photo {
  id: string
  visit_id: string
  label: PhotoLabel
  r2_key: string
  r2_url: string
  created_at: string
}

export interface VisitWithRelations extends Visit {
  restaurant: Restaurant
  user: UserPublic
  sides: Side[]
  sauces: Sauce[]
  photos: Photo[]
}

export interface RestaurantWithStats extends Restaurant {
  visit_count: number
  avg_overall: number
  avg_value: number
  avg_quantity: number
  avg_atmosphere: number
  avg_staff: number
}

export interface AuthSession {
  userId: string
  name: string
  isAdmin: boolean
  jwt: string
}

export interface NewRestaurantInput {
  name: string
  address: string
  lat: number
  lng: number
  google_place_id: string | null
}

export interface SideFormItem {
  localId: string
  name: string
  rating: Rating | null
}

export interface SauceFormItem {
  localId: string
  name: string
  flavor_descriptor: string
  rating: Rating | null
  spiciness: Rating | null
}

export type PhotoUploadState = 'idle' | 'compressing' | 'ready' | 'uploading' | 'done' | 'error'

export interface PhotoFormItem {
  label: PhotoLabel
  file: File | null
  compressedFile: File | null
  preview: string | null
  uploadState: PhotoUploadState
  r2Key?: string
  r2Url?: string
}

export interface VisitFormData {
  restaurant: Restaurant | null
  newRestaurant: NewRestaurantInput | null
  visitDate: string
  meatTypes: string[]
  ratings: {
    value: Rating | null
    quantity: Rating | null
    atmosphere: Rating | null
    staff: Rating | null
    overall: Rating | null
  }
  sides: SideFormItem[]
  sauces: SauceFormItem[]
  photos: [PhotoFormItem, PhotoFormItem, PhotoFormItem]
  comments: string
}

export interface PinAuthResponse {
  jwt: string
  user: UserPublic & { is_admin: boolean }
}

export interface UploadUrlResponse {
  uploadUrl: string
  r2Key: string
  r2Url: string
}

export interface CreateUserInput {
  name: string
  pin: string
  is_admin: boolean
}

export interface AdminUser {
  id: string
  name: string
  is_admin: boolean
  created_at: string
}
