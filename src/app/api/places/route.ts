import { NextResponse } from "next/server";
import { fetchDestinations, fetchRegionsFromDb } from "@/lib/tourism-db";
import { isSupabaseConfigured } from "@/lib/supabase";

export async function GET(req: Request) {
  const full = new URL(req.url).searchParams.get("full") === "1";
  const places = await fetchDestinations();
  const regions = await fetchRegionsFromDb();
  const source = places[0]?.source?.includes("Supabase") ? "supabase" : "local";

  if (full) {
    return NextResponse.json({
      configured: isSupabaseConfigured(),
      source,
      places,
      regionsCount: regions.length,
    });
  }

  return NextResponse.json({
    configured: isSupabaseConfigured(),
    source,
    placesCount: places.length,
    regionsCount: regions.length,
    sample: places.slice(0, 3).map((p) => ({
      id: p.id,
      name: p.name,
      city: p.city,
      lat: p.lat,
      lng: p.lng,
    })),
  });
}
