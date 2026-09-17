import { NextResponse } from "next/server";
import { generateTripPlan } from "@/lib/trip-planner";
import { fetchDestinations } from "@/lib/tourism-db";
import type { Locale, TripRequest } from "@/lib/types";

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<TripRequest>;
  const locale: Locale = body.locale === "en" ? "en" : "fr";

  const request: TripRequest = {
    destination: body.destination?.trim() || "Yaoundé",
    days: Math.min(14, Math.max(1, Number(body.days) || 3)),
    budgetFcfa: Math.max(10000, Number(body.budgetFcfa) || 150000),
    people: Math.max(1, Number(body.people) || 2),
    interests: Array.isArray(body.interests)
      ? body.interests.map(String)
      : String(body.interests ?? "culture, nature")
          .split(/[,;]+/)
          .map((s) => s.trim())
          .filter(Boolean),
    travelType: body.travelType ? String(body.travelType) : undefined,
    hotelTier: body.hotelTier ? String(body.hotelTier) : undefined,
    locale,
  };

  const catalog = await fetchDestinations();
  const plan = generateTripPlan(request, catalog);
  return NextResponse.json({
    plan,
    request,
    source: catalog[0]?.source ?? "local",
  });
}
