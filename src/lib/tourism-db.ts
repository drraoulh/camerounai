import { createSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";
import type { CulturalZone, Destination, DestinationCategory } from "@/lib/types";
import { destinations as localDestinations } from "@/data/destinations";
import { placeCopyBySlug } from "@/data/place-copy";
import { decodeHtmlEntities } from "@/lib/text";

type Named = { slug: string; name_fr: string; name_en: string };

type PlaceRow = {
  id: string;
  slug: string;
  name_fr: string;
  name_en: string;
  description_fr: string | null;
  description_en: string | null;
  cultural_info_fr: string | null;
  cultural_info_en: string | null;
  estimated_cost_xaf: number | null;
  recommended_duration_hours: number | null;
  best_period: string | null;
  has_local_guide: boolean | null;
  location: string | null;
  verified_at: string | null;
  is_published: boolean;
  city: Named | null;
  region: Named | null;
  cultural_zone: Named | null;
  category: Named | null;
  place_eco_tags?: { eco_tag: { slug: string; name_en: string; name_fr: string } | null }[] | null;
  place_images?: {
    original_url: string | null;
    storage_path: string | null;
    is_primary: boolean | null;
  }[] | null;
};

const ZONE_MAP: Record<string, CulturalZone> = {
  grassfields: "Grassfields",
  sawa: "Sawa",
  "fang-beti": "Fang-Beti",
  "sudano-sahelian": "Sudano-Sahelian",
  soudano: "Sudano-Sahelian",
};

const CATEGORY_MAP: Record<string, DestinationCategory> = {
  musee: "musee",
  museum: "musee",
  monument: "monument",
  parc: "parc",
  park: "parc",
  reserve: "reserve",
  plage: "plage",
  beach: "plage",
  cascade: "cascade",
  montagne: "montagne",
  mountain: "montagne",
  artisanat: "artisanat",
  gastronomie: "gastronomie",
  restauration: "restauration",
  hebergement: "hebergement",
  festival: "festival",
  activite: "activite",
  "patrimoine-culturel": "patrimoine",
  patrimoine: "patrimoine",
};

const CATEGORY_IMAGES: Record<string, string> = {
  musee:
    "https://images.unsplash.com/photo-1566127444979-b20d8e9c4a1c?auto=format&fit=crop&w=1600&q=80",
  monument:
    "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1600&q=80",
  parc: "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1600&q=80",
  reserve:
    "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1600&q=80",
  plage:
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
  cascade:
    "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1600&q=80",
  montagne:
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80",
  patrimoine:
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
  default:
    "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?auto=format&fit=crop&w=1600&q=80",
};

/** Parse PostGIS EWKB hex Point (little-endian, with SRID). */
export function parseEwkbPoint(hex: string | null | undefined): {
  lng: number;
  lat: number;
} {
  if (!hex || hex.length < 50) return { lng: 11.5, lat: 3.85 };
  try {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    const view = new DataView(bytes.buffer);
    const lng = view.getFloat64(9, true);
    const lat = view.getFloat64(17, true);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return { lng: 11.5, lat: 3.85 };
    }
    return { lng, lat };
  } catch {
    return { lng: 11.5, lat: 3.85 };
  }
}

function mapCategory(slug: string | undefined): DestinationCategory {
  if (!slug) return "activite";
  return CATEGORY_MAP[slug] ?? (slug.includes("patrimoine") ? "patrimoine" : "activite");
}

function mapZone(slug: string | undefined): CulturalZone {
  if (!slug) return "Fang-Beti";
  return ZONE_MAP[slug] ?? "Fang-Beti";
}

function mapPlace(row: PlaceRow): Destination {
  const { lat, lng } = parseEwkbPoint(row.location);
  const category = mapCategory(row.category?.slug);
  const ecoTags =
    row.place_eco_tags
      ?.map((x) => x.eco_tag?.name_en || x.eco_tag?.slug)
      .filter((x): x is string => Boolean(x)) ?? [];
  const copy = placeCopyBySlug[row.slug];
  const primaryImg =
    row.place_images?.find((i) => i.is_primary)?.original_url ||
    row.place_images?.[0]?.original_url ||
    null;

  const nameFr = decodeHtmlEntities(row.name_fr);
  const nameEnRaw = decodeHtmlEntities(row.name_en || "");
  const descFr = decodeHtmlEntities(
    copy?.descriptionFr ?? row.description_fr ?? "",
  );
  const descEnRaw = decodeHtmlEntities(
    copy?.descriptionEn ?? row.description_en ?? "",
  );
  const culturalFr = decodeHtmlEntities(
    copy?.culturalInfoFr ?? row.cultural_info_fr ?? "",
  );
  const culturalEnRaw = decodeHtmlEntities(
    copy?.culturalInfoEn ?? row.cultural_info_en ?? "",
  );

  // Prefer curated English name; then DB name_en when it differs from FR.
  const nameEn =
    copy?.nameEn ||
    (nameEnRaw && nameEnRaw !== nameFr ? nameEnRaw : nameEnRaw || nameFr);
  const descriptionEn =
    descEnRaw && descEnRaw !== descFr ? descEnRaw : descEnRaw || descFr;
  const culturalInfoEn =
    culturalEnRaw && culturalEnRaw !== culturalFr
      ? culturalEnRaw
      : culturalEnRaw || culturalFr;

  return {
    id: row.slug,
    name: nameFr,
    nameEn,
    region: row.region?.name_fr ?? "",
    regionEn: row.region?.name_en ?? row.region?.name_fr ?? "",
    city: row.city?.name_fr ?? "",
    cityEn: row.city?.name_en ?? row.city?.name_fr ?? "",
    department: "",
    culturalZone: mapZone(row.cultural_zone?.slug),
    category,
    descriptionFr: descFr,
    descriptionEn,
    lat,
    lng,
    activities: row.category?.name_fr ? [row.category.name_fr] : [],
    estimatedCostFcfa: copy?.estimatedCostXaf ?? row.estimated_cost_xaf ?? 0,
    recommendedDurationHours:
      copy?.recommendedDurationHours ?? row.recommended_duration_hours ?? 2,
    bestPeriod: copy?.bestPeriod ?? row.best_period ?? "",
    culturalInfoFr: culturalFr,
    culturalInfoEn,
    ecoTags,
    communityActivities: [],
    localGuide: Boolean(row.has_local_guide),
    image: primaryImg || CATEGORY_IMAGES[category] || CATEGORY_IMAGES.default,
    source: copy?.sourceNote ?? "Supabase · MINTOUL",
    verifiedAt: row.verified_at ?? "",
  };
}

const PLACE_SELECT = `
  id, slug, name_fr, name_en,
  description_fr, description_en,
  cultural_info_fr, cultural_info_en,
  estimated_cost_xaf, recommended_duration_hours, best_period,
  has_local_guide, location, verified_at, is_published,
  city:cities(name_fr, name_en, slug),
  region:regions(name_fr, name_en, slug),
  cultural_zone:cultural_zones(name_fr, name_en, slug),
  category:categories(slug, name_fr, name_en),
  place_eco_tags(eco_tag:eco_tags(slug, name_en, name_fr)),
  place_images(original_url, storage_path, is_primary)
`.replace(/\s+/g, " ").trim();

/** Fetch published places from Supabase; fall back to local seed. */
export async function fetchDestinations(): Promise<Destination[]> {
  if (!isSupabaseConfigured()) {
    return applyPlaceCopyToLocal(localDestinations);
  }

  const supabase = createSupabaseClient();
  if (!supabase) return applyPlaceCopyToLocal(localDestinations);

  const { data, error } = await supabase
    .from("places")
    .select(PLACE_SELECT)
    .eq("is_published", true)
    .order("name_fr");

  if (error || !data?.length) {
    console.warn("[tourism-db] places fallback:", error?.message);
    return applyPlaceCopyToLocal(localDestinations);
  }

  return (data as unknown as PlaceRow[]).map(mapPlace);
}

function applyPlaceCopyToLocal(list: Destination[]): Destination[] {
  return list.map((d) => {
    const copy = placeCopyBySlug[d.id];
    if (!copy) return d;
    return {
      ...d,
      nameEn: copy.nameEn ?? d.nameEn,
      descriptionFr: copy.descriptionFr,
      descriptionEn: copy.descriptionEn,
      culturalInfoFr: copy.culturalInfoFr ?? d.culturalInfoFr,
      culturalInfoEn: copy.culturalInfoEn ?? d.culturalInfoEn,
      estimatedCostFcfa: copy.estimatedCostXaf ?? d.estimatedCostFcfa,
      recommendedDurationHours:
        copy.recommendedDurationHours ?? d.recommendedDurationHours,
      bestPeriod: copy.bestPeriod ?? d.bestPeriod,
      source: copy.sourceNote ?? d.source,
    };
  });
}

export async function fetchDestinationById(id: string): Promise<Destination | null> {
  if (!isSupabaseConfigured()) {
    return localDestinations.find((d) => d.id === id) ?? null;
  }

  const supabase = createSupabaseClient();
  if (!supabase) {
    return localDestinations.find((d) => d.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("places")
    .select(PLACE_SELECT)
    .eq("is_published", true)
    .eq("slug", id)
    .maybeSingle();

  if (error || !data) {
    return localDestinations.find((d) => d.id === id) ?? null;
  }

  return mapPlace(data as unknown as PlaceRow);
}

export async function fetchRegionsFromDb() {
  const supabase = createSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("regions")
    .select("slug, name_fr, name_en")
    .order("name_fr");
  return data ?? [];
}
