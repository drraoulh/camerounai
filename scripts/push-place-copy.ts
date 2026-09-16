/**
 * Push reformulated place copy to Supabase.
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env.local (anon RLS blocks UPDATE).
 *
 * Usage: npx tsx scripts/push-place-copy.ts
 */
import { createClient } from "@supabase/supabase-js";
import { placeCopyBySlug } from "../src/data/place-copy";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.\n" +
        "Add the service role key to .env.local, then re-run.\n" +
        "Meanwhile the app already serves reformulated copy via src/data/place-copy.ts.\n" +
        "Or run supabase/migrations/20260916001000_ayila_place_copy.sql in the SQL editor.",
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let ok = 0;
  let fail = 0;

  for (const [slug, c] of Object.entries(placeCopyBySlug)) {
    const { error } = await supabase
      .from("places")
      .update({
        description_fr: c.descriptionFr,
        description_en: c.descriptionEn,
        cultural_info_fr: c.culturalInfoFr ?? null,
        cultural_info_en: c.culturalInfoEn ?? null,
        estimated_cost_xaf: c.estimatedCostXaf ?? null,
        recommended_duration_hours: c.recommendedDurationHours ?? null,
        best_period: c.bestPeriod ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("slug", slug);

    if (error) {
      console.error("FAIL", slug, error.message);
      fail++;
    } else {
      console.log("OK", slug);
      ok++;
    }
  }

  console.log(`Done: ${ok} ok, ${fail} fail`);
  process.exit(fail ? 1 : 0);
}

main();
