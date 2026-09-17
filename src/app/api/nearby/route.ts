import { NextResponse } from "next/server";
import {
  searchNearbyGoogle,
  type NearbyKind,
} from "@/lib/google-nearby";

export const runtime = "nodejs";

type Body = {
  lat?: number;
  lng?: number;
  radiusM?: number;
  kinds?: NearbyKind[];
  locale?: "fr" | "en";
};

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const lat = Number(body.lat);
  const lng = Number(body.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat_lng_required" }, { status: 400 });
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: "lat_lng_out_of_range" }, { status: 400 });
  }

  const result = await searchNearbyGoogle({
    lat,
    lng,
    radiusM: body.radiusM,
    kinds: body.kinds,
    language: body.locale === "en" ? "en" : "fr",
    maxPerKind: 8,
  });

  if (!result.configured) {
    return NextResponse.json({
      configured: false,
      places: [],
      message:
        "GOOGLE_PLACES_API_KEY manquante — ajoutez-la dans .env.local (Places API New).",
    });
  }

  if (result.error && result.places.length === 0) {
    return NextResponse.json(
      {
        configured: true,
        places: [],
        error: result.error,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    configured: true,
    places: result.places,
    count: result.places.length,
  });
}
