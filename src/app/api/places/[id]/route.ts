import { NextResponse } from "next/server";
import { fetchDestinationById, fetchDestinations } from "@/lib/tourism-db";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const place = await fetchDestinationById(id);
  if (!place) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const all = await fetchDestinations();
  const related = all
    .filter(
      (d) =>
        d.id !== place.id &&
        (d.city === place.city || d.culturalZone === place.culturalZone),
    )
    .slice(0, 3);

  return NextResponse.json({ place, related });
}
