/**
 * Push to Supabase with service role:
 * 1) UPDATE place copy for existing 23 places
 * 2) UPSERT 40 restaurants (page1+page2) into places (category restauration)
 * 3) UPSERT primary images into place_images
 *
 * Usage: npx tsx scripts/push-to-supabase.ts
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "fs";
import { placeCopyBySlug } from "../src/data/place-copy";
import { restaurants as page1 } from "../src/data/restaurants";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type Resto = {
  id: string;
  name: string;
  nameEn: string;
  city: string;
  neighbourhood: string;
  category: string;
  priceFromXaf: number | null;
  descriptionFr: string;
  descriptionEn: string;
  image: string;
  ayilaUrl: string;
  sourceNote: string;
};

const CITY_MAP: Record<
  string,
  { citySlug: string; regionSlug: string; zoneSlug: string; lat: number; lng: number }
> = {
  douala: { citySlug: "douala", regionSlug: "littoral", zoneSlug: "sawa", lat: 4.0511, lng: 9.7679 },
  yaounde: { citySlug: "yaounde", regionSlug: "centre", zoneSlug: "fang-beti", lat: 3.848, lng: 11.5021 },
  yaoundé: { citySlug: "yaounde", regionSlug: "centre", zoneSlug: "fang-beti", lat: 3.848, lng: 11.5021 },
  kribi: { citySlug: "kribi", regionSlug: "sud", zoneSlug: "sawa", lat: 2.9372, lng: 9.9078 },
  bafoussam: { citySlug: "bafoussam", regionSlug: "ouest", zoneSlug: "grassfields", lat: 5.4778, lng: 10.4176 },
  limbe: { citySlug: "limbe", regionSlug: "sud-ouest", zoneSlug: "sawa", lat: 4.0225, lng: 9.206 },
  limbé: { citySlug: "limbe", regionSlug: "sud-ouest", zoneSlug: "sawa", lat: 4.0225, lng: 9.206 },
  cameroun: { citySlug: "douala", regionSlug: "littoral", zoneSlug: "sawa", lat: 4.0511, lng: 9.7679 },
};

function normCity(c: string) {
  return c
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();
}

function reformulatePage2(r: Resto): Resto {
  const bad = /Restauration Hotels|Coins Restauration|fast food/i.test(r.descriptionFr);
  if (!bad && r.descriptionFr.length > 80) return r;
  const where = [r.neighbourhood, r.city].filter(Boolean).join(", ");
  const cat = r.category || "Restaurant";
  const price =
    r.priceFromXaf != null
      ? ` À partir d'environ ${r.priceFromXaf.toLocaleString("fr-FR")} XAF.`
      : "";
  return {
    ...r,
    descriptionFr: `${r.name} (${cat}) à ${where}. Adresse de restauration recensée via Ayila'a, reformulée pour Visit Cameroon.${price}`,
    descriptionEn: `${r.name} (${cat}) in ${where}. Dining spot listed on Ayila'a and rewritten for Visit Cameroon.${
      r.priceFromXaf != null
        ? ` From about ${r.priceFromXaf.toLocaleString("en-US")} XAF.`
        : ""
    }`,
  };
}

function wktPoint(lng: number, lat: number) {
  return `SRID=4326;POINT(${lng} ${lat})`;
}

async function main() {
  const page2Raw = JSON.parse(
    readFileSync("tmp-ayila-resto-page2.json", "utf8"),
  ) as Resto[];
  const page2 = page2Raw.map(reformulatePage2);

  // dedupe by id
  const byId = new Map<string, Resto>();
  for (const r of [...page1, ...page2]) byId.set(r.id, r);
  const allRestos = [...byId.values()];
  writeFileSync(
    "src/data/restaurants.ts",
    `/**
 * Restaurants scrapés Ayila'a (pages 1-2) + reformulés Visit Cameroon.
 */
export type Restaurant = {
  id: string;
  name: string;
  nameEn: string;
  city: string;
  neighbourhood: string;
  category: string;
  priceFromXaf: number | null;
  descriptionFr: string;
  descriptionEn: string;
  image: string;
  ayilaUrl: string;
  sourceNote: string;
};

export const restaurants: Restaurant[] = ${JSON.stringify(allRestos, null, 2)};
`,
    "utf8",
  );
  console.log("local restaurants file:", allRestos.length);

  // lookups
  const [{ data: regions }, { data: cities }, { data: zones }, { data: cats }, { data: sources }] =
    await Promise.all([
      supabase.from("regions").select("id,slug"),
      supabase.from("cities").select("id,slug,region_id"),
      supabase.from("cultural_zones").select("id,slug"),
      supabase.from("categories").select("id,slug"),
      supabase.from("sources").select("id,name"),
    ]);

  const regionBySlug = Object.fromEntries((regions || []).map((r) => [r.slug, r.id]));
  const cityBySlug = Object.fromEntries((cities || []).map((c) => [c.slug, c]));
  const zoneBySlug = Object.fromEntries((zones || []).map((z) => [z.slug, z.id]));
  const catResto = (cats || []).find((c) => c.slug === "restauration")?.id;
  if (!catResto) throw new Error("category restauration missing");

  let sourceId =
    (sources || []).find((s) => /ayila/i.test(s.name))?.id ||
    (sources || []).find((s) => /manuelle|manual/i.test(s.name))?.id ||
    null;

  if (!(sources || []).some((s) => /ayila/i.test(s.name))) {
    const { data: src, error } = await supabase
      .from("sources")
      .insert({
        name: "Ayila'a",
        url: "https://ayilaa.com",
        notes: "Annuaire lieux Cameroun · contenus reformulés Visit Cameroon",
      })
      .select("id")
      .single();
    if (!error && src) sourceId = src.id;
  }

  // 1) update existing place copy
  let updatedPlaces = 0;
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
    if (error) console.error("place update FAIL", slug, error.message);
    else updatedPlaces++;
  }
  console.log("updated place copy:", updatedPlaces);

  // 2) upsert restaurants
  let inserted = 0;
  let imagesOk = 0;
  for (const r of allRestos) {
    const key = normCity(r.city);
    const meta = CITY_MAP[key] || CITY_MAP.douala;
    const city = cityBySlug[meta.citySlug];
    if (!city) {
      console.error("missing city", meta.citySlug, r.id);
      continue;
    }
    const regionId = city.region_id || regionBySlug[meta.regionSlug];
    const zoneId = zoneBySlug[meta.zoneSlug];

    const row = {
      slug: r.id,
      name_fr: r.name,
      name_en: r.nameEn,
      region_id: regionId,
      city_id: city.id,
      cultural_zone_id: zoneId,
      category_id: catResto,
      description_fr: r.descriptionFr,
      description_en: r.descriptionEn,
      cultural_info_fr: `${r.neighbourhood} · ${r.category}`,
      cultural_info_en: `${r.neighbourhood} · ${r.category}`,
      estimated_cost_xaf: r.priceFromXaf,
      cost_reliability: "estimated",
      recommended_duration_hours: 2,
      best_period: "Toute l'année",
      has_local_guide: false,
      is_published: true,
      source_id: sourceId,
      location: wktPoint(meta.lng, meta.lat),
      verified_at: new Date().toISOString().slice(0, 10),
      updated_at: new Date().toISOString(),
    };

    const { data: place, error } = await supabase
      .from("places")
      .upsert(row, { onConflict: "slug" })
      .select("id,slug")
      .single();

    if (error || !place) {
      console.error("resto FAIL", r.id, error?.message);
      continue;
    }
    inserted++;

    if (r.image) {
      // wipe previous primary images for this place then insert
      await supabase.from("place_images").delete().eq("place_id", place.id);
      const { error: imgErr } = await supabase.from("place_images").insert({
        place_id: place.id,
        original_url: r.image,
        storage_path: null,
        alt_fr: r.name,
        alt_en: r.nameEn,
        author: "Ayila'a",
        license: "source Ayila'a",
        source_name: "Ayila'a",
        retrieved_at: new Date().toISOString().slice(0, 10),
        is_primary: true,
      });
      if (imgErr) console.error("image FAIL", r.id, imgErr.message);
      else imagesOk++;
    }
  }

  const { count } = await supabase
    .from("places")
    .select("*", { count: "exact", head: true })
    .eq("category_id", catResto)
    .eq("is_published", true);

  console.log({
    restosUpserted: inserted,
    imagesOk,
    restaurationPublished: count,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
