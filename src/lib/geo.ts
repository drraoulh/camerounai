import type { Destination } from "./types";

/** Haversine distance in kilometres. */
export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function nearbyPlaces(
  places: Destination[],
  lat: number,
  lng: number,
  radiusKm = 80,
): (Destination & { distanceKm: number })[] {
  return places
    .map((p) => ({ ...p, distanceKm: distanceKm(lat, lng, p.lat, p.lng) }))
    .filter((p) => p.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

/** Approximate city centres for MVP when GPS is unavailable. */
export const cityCoords: Record<string, { lat: number; lng: number }> = {
  yaoundé: { lat: 3.848, lng: 11.502 },
  yaounde: { lat: 3.848, lng: 11.502 },
  douala: { lat: 4.051, lng: 9.768 },
  kribi: { lat: 2.937, lng: 9.907 },
  limbé: { lat: 4.023, lng: 9.215 },
  limbe: { lat: 4.023, lng: 9.215 },
  buea: { lat: 4.156, lng: 9.231 },
  foumban: { lat: 5.729, lng: 10.898 },
  bafoussam: { lat: 5.478, lng: 10.417 },
  maroua: { lat: 10.591, lng: 14.315 },
  waza: { lat: 11.333, lng: 14.683 },
};
