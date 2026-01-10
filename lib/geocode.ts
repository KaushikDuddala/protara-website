/**
 * Geocodes a location using zip lookup (for US zip codes) or Nominatim.
 *
 * @param location - City, state, and country strings.
 * @returns Coordinates and the resolved state abbreviation, or `null` if lookup fails.
 */
export async function geocodeLocation(location: {
  city?: string | null
  state?: string | null
  country?: string | null
}): Promise<{ lat: number; lng: number; resolvedState?: string } | null> {
  let state = location.state?.trim() || ""
  const city = location.city?.trim() || ""
  const country = location.country?.trim() || "United States"

  console.log("geocoding", location)

  if (/^\d{5}$/.test(state)) {
    console.log("zip lookup", state)
    try {
      const zRes = await fetch(`https://api.zippopotam.us/us/${state}`)
      if (zRes.ok) {
        const zData = await zRes.json()
        const place = zData.places?.[0]
        if (place) {
          state = place["state abbreviation"] || place.state || state
          if (place.latitude && place.longitude) {
            console.log("zip resolved", place.latitude, place.longitude)
            return {
              lat: Number.parseFloat(place.latitude),
              lng: Number.parseFloat(place.longitude),
              resolvedState: state,
            }
          }
        }
      }
    } catch {
      // Zip lookup failed - continue to Nominatim.
    }
  }

  const parts = [city, state, country].filter(Boolean).join(", ")
  if (!parts) return null

  try {
    const params = new URLSearchParams({ format: "json", limit: "1" })
    if (city) params.set("city", city)
    if (state) params.set("state", state)
    if (country) params.set("country", country)

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      { headers: { "User-Agent": "ProtaraServer/1.0" } }
    )
    if (res.ok) {
      const data = await res.json()
      if (data?.[0]?.lat && data?.[0]?.lon) {
        console.log("nominatim resolved", data[0].lat, data[0].lon)
        return {
          lat: Number.parseFloat(data[0].lat),
          lng: Number.parseFloat(data[0].lon),
          resolvedState: location.state !== state ? state : undefined,
        }
      }
    }
  } catch {
    // Nominatim lookup failed.
  }

  return null
}