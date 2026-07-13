import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import type { NewRestaurantInput } from '../types'

let initialized = false

function ensureInit() {
  if (!initialized) {
    setOptions({
      key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
      v: 'weekly',
    })
    initialized = true
  }
}

export type PlaceResult = NewRestaurantInput & { displayName: string }

export async function attachAutocomplete(
  inputEl: HTMLInputElement,
  onSelect: (result: PlaceResult) => void,
): Promise<() => void> {
  ensureInit()
  const placesLib = await importLibrary('places') as google.maps.PlacesLibrary
  const autocomplete = new placesLib.Autocomplete(inputEl, {
    fields: ['name', 'formatted_address', 'geometry', 'place_id'],
    types: ['establishment'],
  })
  const listener = autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace()
    if (!place.geometry?.location) return
    onSelect({
      displayName: place.name ?? '',
      name: place.name ?? '',
      address: place.formatted_address ?? '',
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      google_place_id: place.place_id ?? null,
    })
  })
  return () => google.maps.event.removeListener(listener)
}

export async function loadMapsLib(): Promise<google.maps.MapsLibrary> {
  ensureInit()
  return importLibrary('maps') as Promise<google.maps.MapsLibrary>
}

export async function loadMarkerLib(): Promise<google.maps.MarkerLibrary> {
  ensureInit()
  return importLibrary('marker') as Promise<google.maps.MarkerLibrary>
}
