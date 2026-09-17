/**
 * Google Places API (New) — Nearby Search (server-side only).
 * Docs: https://developers.google.com/maps/documentation/places/web-service/nearby-search
 */

export type NearbyKind = "restaurant" | "lodging" | "attraction";

export type GoogleNearbyPlace = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number | null;
  userRatingCount: number | null;
  types: string[];
  kind: NearbyKind;
  mapsUrl: string;
  distanceKm: number | null;
};

const TYPE_MAP: Record<NearbyKind, string> = {
  restaurant: "restaurant",
  lodging: "lodging",
  attraction: "tourist_attraction",
};

function haversineKm(
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

type GooglePlaceRaw = {
  id?: string;
  displayName?: { text?: string };
  formattedAddress?: string;
  location?: { latitude?: number; longitude?: number };
  rating?: number;
  userRatingCount?: number;
  types?: string[];
  googleMapsUri?: string;
};

async function searchOneType(opts: {
  apiKey: string;
  lat: number;
  lng: number;
  radiusM: number;
  kind: NearbyKind;
  maxResults: number;
  language: string;
}): Promise<GoogleNearbyPlace[]> {
  const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": opts.apiKey,
      "X-Goog-FieldMask": [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.location",
        "places.rating",
        "places.userRatingCount",
        "places.types",
        "places.googleMapsUri",
      ].join(","),
    },
    body: JSON.stringify({
      includedTypes: [TYPE_MAP[opts.kind]],
      maxResultCount: Math.min(Math.max(opts.maxResults, 1), 20),
      languageCode: opts.language,
      locationRestriction: {
        circle: {
          center: { latitude: opts.lat, longitude: opts.lng },
          radius: opts.radiusM,
        },
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `Google Nearby ${opts.kind} failed (${res.status}): ${errText.slice(0, 240)}`,
    );
  }

  const data = (await res.json()) as { places?: GooglePlaceRaw[] };
  const places = data.places ?? [];

  return places
    .map((p): GoogleNearbyPlace | null => {
      const lat = p.location?.latitude;
      const lng = p.location?.longitude;
      const name = p.displayName?.text?.trim();
      if (!name || lat == null || lng == null) return null;
      const id = p.id || `${name}-${lat}-${lng}`;
      return {
        id,
        name,
        address: p.formattedAddress?.trim() || "",
        lat,
        lng,
        rating: typeof p.rating === "number" ? p.rating : null,
        userRatingCount:
          typeof p.userRatingCount === "number" ? p.userRatingCount : null,
        types: p.types ?? [],
        kind: opts.kind,
        mapsUrl:
          p.googleMapsUri ||
          `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}&query_place_id=${encodeURIComponent(id)}`,
        distanceKm: haversineKm(opts.lat, opts.lng, lat, lng),
      };
    })
    .filter((p): p is GoogleNearbyPlace => p != null)
    .sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
}

export async function searchNearbyGoogle(opts: {
  lat: number;
  lng: number;
  radiusM?: number;
  kinds?: NearbyKind[];
  maxPerKind?: number;
  language?: "fr" | "en";
}): Promise<{
  configured: boolean;
  places: GoogleNearbyPlace[];
  error?: string;
}> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim();
  if (!apiKey) {
    return { configured: false, places: [], error: "missing_key" };
  }

  const kinds = opts.kinds?.length
    ? opts.kinds
    : (["restaurant", "lodging", "attraction"] as NearbyKind[]);
  const radiusM = Math.min(Math.max(opts.radiusM ?? 4000, 100), 50000);
  const maxPerKind = opts.maxPerKind ?? 8;
  const language = opts.language === "en" ? "en" : "fr";

  try {
    const batches = await Promise.all(
      kinds.map((kind) =>
        searchOneType({
          apiKey,
          lat: opts.lat,
          lng: opts.lng,
          radiusM,
          kind,
          maxResults: maxPerKind,
          language,
        }),
      ),
    );
    return { configured: true, places: batches.flat() };
  } catch (e) {
    return {
      configured: true,
      places: [],
      error: e instanceof Error ? e.message : "nearby_failed",
    };
  }
}
