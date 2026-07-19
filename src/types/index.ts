export type PhotoLabel = 'Full Meal' | 'Exterior' | 'Interior'
export type Rating = number
export type SpicinessLevel = 1 | 2 | 3 | 4 | 5
export type ItemType = 'Sandwich' | 'Plate'

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
  item_type: ItemType | null
  item_name: string | null
  total_cost: number | null
  regular_sauce_rating: Rating | null
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
  spiciness: SpicinessLevel
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
  spiciness: SpicinessLevel | null
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
  itemType: ItemType | null
  itemName: string
  totalCost: string
  ratings: {
    value: Rating | null
    quantity: Rating | null
    atmosphere: Rating | null
    staff: Rating | null
    overall: Rating | null
  }
  sides: SideFormItem[]
  regularSauceRating: Rating | null
  triedSpecialSauce: boolean | null
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

export interface AnalyticsMeatType {
  meat: string
  count: number
}

export interface AnalyticsRestaurant {
  id: string
  name: string
  visit_count: number
  avg_overall: number
}

export interface AnalyticsSauce {
  name: string
  count: number
  avg_rating: number
}

export interface AnalyticsItem {
  item_name: string
  item_type: ItemType | null
  count: number
}

export interface AnalyticsTotals {
  total_visits: number
  total_spent: number | null
  avg_cost: number | null
  avg_overall: number | null
}

export interface AnalyticsResponse {
  meatTypes: AnalyticsMeatType[]
  topRestaurants: AnalyticsRestaurant[]
  bestSauces: AnalyticsSauce[]
  items: AnalyticsItem[]
  totals: AnalyticsTotals
}
