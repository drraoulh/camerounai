import { writeFileSync } from "fs";
import { placeCopyBySlug } from "../src/data/place-copy";

function esc(s: string) {
  return s.replace(/'/g, "''");
}

const lines: string[] = [
  "-- Reformulated descriptions from Ayila'a + Visit Cameroon editorial",
  "-- Run in Supabase SQL editor. Images will be added later.",
  "",
];

for (const [slug, c] of Object.entries(placeCopyBySlug)) {
  lines.push(`UPDATE places SET
  description_fr = '${esc(c.descriptionFr)}',
  description_en = '${esc(c.descriptionEn)}',
  cultural_info_fr = '${esc(c.culturalInfoFr ?? "")}',
  cultural_info_en = '${esc(c.culturalInfoEn ?? "")}',
  estimated_cost_xaf = ${c.estimatedCostXaf ?? "NULL"},
  recommended_duration_hours = ${c.recommendedDurationHours ?? "NULL"},
  best_period = '${esc(c.bestPeriod ?? "")}',
  updated_at = now()
WHERE slug = '${esc(slug)}';`);
  lines.push("");
}

writeFileSync(
  "supabase/migrations/20260916001000_ayila_place_copy.sql",
  lines.join("\n"),
  "utf8",
);
console.log("wrote", Object.keys(placeCopyBySlug).length, "updates");
