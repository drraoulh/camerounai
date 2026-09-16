/**
 * Push ~50 Ayila tourist sites into Supabase places + place_images.
 * Skips slugs already present. Reformulates weak descriptions.
 *
 * Usage: npx tsx scripts/push-ayila-sites.ts
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "fs";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !serviceKey) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type Site = {
  id: string;
  name: string;
  nameEn: string;
  city: string;
  neighbourhood: string;
  category: string;
  localisation?: string;
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
  kribi: { citySlug: "kribi", regionSlug: "sud", zoneSlug: "sawa", lat: 2.9372, lng: 9.9078 },
  bafoussam: { citySlug: "bafoussam", regionSlug: "ouest", zoneSlug: "grassfields", lat: 5.4778, lng: 10.4176 },
  limbe: { citySlug: "limbe", regionSlug: "sud-ouest", zoneSlug: "sawa", lat: 4.0225, lng: 9.206 },
  foumban: { citySlug: "foumban", regionSlug: "ouest", zoneSlug: "grassfields", lat: 5.729, lng: 10.898 },
  mbouda: { citySlug: "bafoussam", regionSlug: "ouest", zoneSlug: "grassfields", lat: 5.627, lng: 10.254 },
  maroua: { citySlug: "maroua", regionSlug: "extreme-nord", zoneSlug: "sudano-sahelian", lat: 10.591, lng: 14.315 },
  garoua: { citySlug: "garoua", regionSlug: "nord", zoneSlug: "sudano-sahelian", lat: 9.301, lng: 13.392 },
  ngaoundere: { citySlug: "ngaoundere", regionSlug: "adamaoua", zoneSlug: "sudano-sahelian", lat: 7.327, lng: 13.584 },
  buea: { citySlug: "buea", regionSlug: "sud-ouest", zoneSlug: "sawa", lat: 4.156, lng: 9.232 },
  bamenda: { citySlug: "bamenda", regionSlug: "nord-ouest", zoneSlug: "grassfields", lat: 5.963, lng: 10.159 },
  ebolowa: { citySlug: "ebolowa", regionSlug: "sud", zoneSlug: "fang-beti", lat: 2.9, lng: 11.15 },
  bertoua: { citySlug: "bertoua", regionSlug: "est", zoneSlug: "fang-beti", lat: 4.577, lng: 13.685 },
  nkolmetet: { citySlug: "yaounde", regionSlug: "centre", zoneSlug: "fang-beti", lat: 3.55, lng: 11.55 },
  cameroun: { citySlug: "yaounde", regionSlug: "centre", zoneSlug: "fang-beti", lat: 3.848, lng: 11.5021 },
};

const CATEGORY_SLUG: Record<string, string> = {
  parc: "parc",
  parcs: "parc",
  musée: "musee",
  musee: "musee",
  museum: "musee",
  chute: "cascade",
  chutes: "cascade",
  "chutte d'eau": "cascade",
  cascade: "cascade",
  plage: "plage",
  mont: "montagne",
  montagne: "montagne",
  lac: "parc",
  ile: "plage",
  île: "plage",
  monument: "monument",
  chefferie: "patrimoine",
  royaume: "patrimoine",
  zoo: "parc",
  habitat: "patrimoine",
  galerie: "musee",
  art: "musee",
};

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();
}

function mapCategorySlug(label: string) {
  const n = norm(label);
  for (const [k, v] of Object.entries(CATEGORY_SLUG)) {
    if (n.includes(k)) return v;
  }
  return "activite";
}

function reformulate(s: Site): Site {
  const weak =
    /Restauration Hotels|Coins Restauration|Mettre en favoris|Afficher toutes|Téléchargez/i.test(
      s.descriptionFr,
    ) || s.descriptionFr.length < 60;

  const where = [s.neighbourhood, s.city].filter(Boolean).join(", ") || s.city;
  const price =
    s.priceFromXaf != null
      ? ` Entrée / visite souvent à partir d'environ ${s.priceFromXaf.toLocaleString("fr-FR")} XAF.`
      : "";

  if (!weak) {
    // light cleanup + ensure EN exists
    return {
      ...s,
      name: s.name.replace(/&amp;/g, "&").trim(),
      nameEn: s.nameEn.replace(/&amp;/g, "&").trim(),
      descriptionFr: s.descriptionFr.replace(/&amp;/g, "&").slice(0, 700),
      descriptionEn:
        s.descriptionEn.replace(/&amp;/g, "&").slice(0, 700) ||
        `${s.name} is a tourist attraction in ${where}.`,
    };
  }

  return {
    ...s,
    name: s.name.replace(/&amp;/g, "&").trim(),
    nameEn: s.nameEn.replace(/&amp;/g, "&").trim(),
    descriptionFr: `${s.name} (${s.category}) à ${where}${
      s.localisation ? ` · ${s.localisation}` : ""
    }. Site touristique recensésur Ayila'a, reformulé pour Visit Cameroon.${price}`.replace(
      "recensésur",
      "recensé sur",
    ),
    descriptionEn: `${s.name} (${s.category}) in ${where}${
      s.localisation ? ` · ${s.localisation}` : ""
    }. Tourist site listed on Ayila'a and rewritten for Visit Cameroon.${
      s.priceFromXaf != null
        ? ` From about ${s.priceFromXaf.toLocaleString("en-US")} XAF.`
        : ""
    }`,
  };
}

function wktPoint(lng: number, lat: number) {
  return `SRID=4326;POINT(${lng} ${lat})`;
}

async function ensureCity(
  citySlug: string,
  regionId: string,
  nameFr: string,
) {
  const { data: existing } = await supabase
    .from("cities")
    .select("id,slug,region_id")
    .eq("slug", citySlug)
    .maybeSingle();
  if (existing) return existing;
  const { data, error } = await supabase
    .from("cities")
    .insert({
      slug: citySlug,
      name_fr: nameFr,
      name_en: nameFr,
      region_id: regionId,
    })
    .select("id,slug,region_id")
    .single();
  if (error) throw error;
  return data;
}

async function main() {
  const raw = JSON.parse(readFileSync("tmp-ayila-sites50.json", "utf8")) as Site[];
  const sites = raw
    .filter((s) => s.image)
    .filter((s) => !/ayila.?a sarl/i.test(s.name))
    .map(reformulate)
    .slice(0, 50);

  writeFileSync("src/data/ayila-sites.ts", `export const ayilaSites = ${JSON.stringify(sites, null, 2)};\n`, "utf8");
  console.log("sites to push", sites.length);

  const [{ data: regions }, { data: cities }, { data: zones }, { data: cats }, { data: sources }, { data: existing }] =
    await Promise.all([
      supabase.from("regions").select("id,slug"),
      supabase.from("cities").select("id,slug,region_id,name_fr"),
      supabase.from("cultural_zones").select("id,slug"),
      supabase.from("categories").select("id,slug"),
      supabase.from("sources").select("id,name"),
      supabase.from("places").select("id,slug,name_fr"),
    ]);

  const regionBySlug = Object.fromEntries((regions || []).map((r) => [r.slug, r.id]));
  let cityBySlug = Object.fromEntries((cities || []).map((c) => [c.slug, c]));
  const zoneBySlug = Object.fromEntries((zones || []).map((z) => [z.slug, z.id]));
  const catBySlug = Object.fromEntries((cats || []).map((c) => [c.slug, c.id]));
  const existingSlugs = new Set((existing || []).map((p) => p.slug));
  const existingNames = new Set(
    (existing || []).map((p) => norm(p.name_fr).replace(/[^a-z0-9]+/g, "")),
  );

  let sourceId =
    (sources || []).find((s) => /ayila/i.test(s.name))?.id ||
    (sources || []).find((s) => /manuelle|manual/i.test(s.name))?.id ||
    null;

  let inserted = 0;
  let skipped = 0;
  let imagesOk = 0;

  for (const s of sites) {
    const nameKey = norm(s.name).replace(/[^a-z0-9]+/g, "");
    if (existingSlugs.has(s.id) || existingNames.has(nameKey)) {
      skipped++;
      continue;
    }

    const cityKey = norm(s.city);
    const meta =
      CITY_MAP[cityKey] ||
      Object.entries(CITY_MAP).find(([k]) => cityKey.includes(k) || k.includes(cityKey))?.[1] ||
      CITY_MAP.cameroun;

    let city = cityBySlug[meta.citySlug];
    if (!city) {
      try {
        city = await ensureCity(
          meta.citySlug,
          regionBySlug[meta.regionSlug],
          s.city,
        );
        cityBySlug[meta.citySlug] = city;
      } catch (e) {
        console.error("city FAIL", s.city, e);
        continue;
      }
    }

    const catSlug = mapCategorySlug(s.category);
    const categoryId = catBySlug[catSlug] || catBySlug.activite;
    const regionId = city.region_id || regionBySlug[meta.regionSlug];

    const row = {
      slug: s.id,
      name_fr: s.name,
      name_en: s.nameEn,
      region_id: regionId,
      city_id: city.id,
      cultural_zone_id: zoneBySlug[meta.zoneSlug],
      category_id: categoryId,
      description_fr: s.descriptionFr,
      description_en: s.descriptionEn,
      cultural_info_fr: [s.neighbourhood, s.localisation, s.category]
        .filter(Boolean)
        .join(" · "),
      cultural_info_en: [s.neighbourhood, s.localisation, s.category]
        .filter(Boolean)
        .join(" · "),
      estimated_cost_xaf: s.priceFromXaf,
      cost_reliability: "estimated",
      recommended_duration_hours: 3,
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
      console.error("FAIL", s.id, error?.message);
      continue;
    }
    inserted++;
    existingSlugs.add(s.id);
    existingNames.add(nameKey);

    await supabase.from("place_images").delete().eq("place_id", place.id);
    const { error: imgErr } = await supabase.from("place_images").insert({
      place_id: place.id,
      original_url: s.image,
      alt_fr: s.name,
      alt_en: s.nameEn,
      author: "Ayila'a",
      license: "source Ayila'a",
      source_name: "Ayila'a",
      retrieved_at: new Date().toISOString().slice(0, 10),
      is_primary: true,
    });
    if (imgErr) console.error("img FAIL", s.id, imgErr.message);
    else imagesOk++;
  }

  const { count } = await supabase
    .from("places")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);

  console.log({ inserted, skipped, imagesOk, publishedTotal: count });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
