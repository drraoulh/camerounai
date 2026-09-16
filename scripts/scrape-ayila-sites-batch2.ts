/**
 * Scrape 50 NEW Ayila tourist sites (category 14) not already in Supabase,
 * with full Aperçu description + geo meta, then INSERT places + images.
 *
 * Usage: npx tsx scripts/scrape-ayila-sites-batch2.ts
 */
import { createClient } from "@supabase/supabase-js";
import { writeFileSync, readFileSync, existsSync } from "fs";

const BASE = "https://ayilaa.com/fr/categorie/14/sites-touristiques";
const TARGET = 50;

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!url || !serviceKey) {
  console.error("Missing Supabase env");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type Scraped = {
  id: string;
  name: string;
  categories: string[];
  localisation: string;
  neighbourhood: string;
  city: string;
  priceFromXaf: number | null;
  descriptionFr: string;
  descriptionEn: string;
  culturalInfoFr: string;
  culturalInfoEn: string;
  image: string;
  ayilaUrl: string;
};

const CITY_META: Record<
  string,
  { citySlug: string; regionSlug: string; zoneSlug: string; lat: number; lng: number; nameFr: string }
> = {
  douala: { citySlug: "douala", regionSlug: "littoral", zoneSlug: "sawa", lat: 4.0511, lng: 9.7679, nameFr: "Douala" },
  yaounde: { citySlug: "yaounde", regionSlug: "centre", zoneSlug: "fang-beti", lat: 3.848, lng: 11.5021, nameFr: "Yaoundé" },
  kribi: { citySlug: "kribi", regionSlug: "sud", zoneSlug: "sawa", lat: 2.9372, lng: 9.9078, nameFr: "Kribi" },
  bafoussam: { citySlug: "bafoussam", regionSlug: "ouest", zoneSlug: "grassfields", lat: 5.4778, lng: 10.4176, nameFr: "Bafoussam" },
  limbe: { citySlug: "limbe", regionSlug: "sud-ouest", zoneSlug: "sawa", lat: 4.0225, lng: 9.206, nameFr: "Limbé" },
  buea: { citySlug: "buea", regionSlug: "sud-ouest", zoneSlug: "sawa", lat: 4.156, lng: 9.232, nameFr: "Buea" },
  foumban: { citySlug: "foumban", regionSlug: "ouest", zoneSlug: "grassfields", lat: 5.729, lng: 10.898, nameFr: "Foumban" },
  maroua: { citySlug: "maroua", regionSlug: "extreme-nord", zoneSlug: "sudano-sahelian", lat: 10.591, lng: 14.315, nameFr: "Maroua" },
  garoua: { citySlug: "garoua", regionSlug: "nord", zoneSlug: "sudano-sahelian", lat: 9.301, lng: 13.392, nameFr: "Garoua" },
  ngaoundere: { citySlug: "ngaoundere", regionSlug: "adamaoua", zoneSlug: "sudano-sahelian", lat: 7.327, lng: 13.584, nameFr: "Ngaoundéré" },
  bamenda: { citySlug: "bamenda", regionSlug: "nord-ouest", zoneSlug: "grassfields", lat: 5.963, lng: 10.159, nameFr: "Bamenda" },
  ebolowa: { citySlug: "ebolowa", regionSlug: "sud", zoneSlug: "fang-beti", lat: 2.9, lng: 11.15, nameFr: "Ebolowa" },
  bertoua: { citySlug: "bertoua", regionSlug: "est", zoneSlug: "fang-beti", lat: 4.577, lng: 13.685, nameFr: "Bertoua" },
  mbouda: { citySlug: "mbouda", regionSlug: "ouest", zoneSlug: "grassfields", lat: 5.627, lng: 10.254, nameFr: "Mbouda" },
  bafang: { citySlug: "bafang", regionSlug: "ouest", zoneSlug: "grassfields", lat: 5.157, lng: 10.177, nameFr: "Bafang" },
  kumba: { citySlug: "kumba", regionSlug: "sud-ouest", zoneSlug: "sawa", lat: 4.636, lng: 9.447, nameFr: "Kumba" },
  nkongsamba: { citySlug: "nkongsamba", regionSlug: "littoral", zoneSlug: "sawa", lat: 4.954, lng: 9.94, nameFr: "Nkongsamba" },
  ambam: { citySlug: "ambam", regionSlug: "sud", zoneSlug: "fang-beti", lat: 2.383, lng: 11.283, nameFr: "Ambam" },
  mbalmayo: { citySlug: "mbalmayo", regionSlug: "centre", zoneSlug: "fang-beti", lat: 3.52, lng: 11.5, nameFr: "Mbalmayo" },
  batoufam: { citySlug: "batoufam", regionSlug: "ouest", zoneSlug: "grassfields", lat: 5.28, lng: 10.48, nameFr: "Batoufam" },
  bandjoun: { citySlug: "bandjoun", regionSlug: "ouest", zoneSlug: "grassfields", lat: 5.37, lng: 10.41, nameFr: "Bandjoun" },
  figuil: { citySlug: "figuil", regionSlug: "nord", zoneSlug: "sudano-sahelian", lat: 9.75, lng: 13.97, nameFr: "Figuil" },
  mouanko: { citySlug: "mouanko", regionSlug: "littoral", zoneSlug: "sawa", lat: 3.62, lng: 9.78, nameFr: "Mouanko" },
  soa: { citySlug: "soa", regionSlug: "centre", zoneSlug: "fang-beti", lat: 3.98, lng: 11.6, nameFr: "Soa" },
  melong: { citySlug: "melong", regionSlug: "littoral", zoneSlug: "sawa", lat: 5.12, lng: 9.96, nameFr: "Melong" },
  banyo: { citySlug: "banyo", regionSlug: "adamaoua", zoneSlug: "sudano-sahelian", lat: 6.75, lng: 11.82, nameFr: "Banyo" },
  dschang: { citySlug: "dschang", regionSlug: "ouest", zoneSlug: "grassfields", lat: 5.45, lng: 10.05, nameFr: "Dschang" },
  bahouan: { citySlug: "bahouan", regionSlug: "ouest", zoneSlug: "grassfields", lat: 5.42, lng: 10.35, nameFr: "Bahouan" },
  yabassi: { citySlug: "yabassi", regionSlug: "littoral", zoneSlug: "sawa", lat: 4.45, lng: 9.97, nameFr: "Yabassi" },
  bamendjing: { citySlug: "bamendjing", regionSlug: "ouest", zoneSlug: "grassfields", lat: 5.65, lng: 10.5, nameFr: "Bamendjing" },
  nkolmetet: { citySlug: "nkolmetet", regionSlug: "centre", zoneSlug: "fang-beti", lat: 3.4, lng: 11.75, nameFr: "Nkolmétet" },
  noun: { citySlug: "noun", regionSlug: "ouest", zoneSlug: "grassfields", lat: 5.6, lng: 10.8, nameFr: "Noun" },
  edea: { citySlug: "edea", regionSlug: "littoral", zoneSlug: "sawa", lat: 3.8, lng: 10.13, nameFr: "Edéa" },
  sangmelima: { citySlug: "sangmelima", regionSlug: "sud", zoneSlug: "fang-beti", lat: 2.93, lng: 11.98, nameFr: "Sangmélima" },
  loum: { citySlug: "loum", regionSlug: "littoral", zoneSlug: "sawa", lat: 4.72, lng: 9.74, nameFr: "Loum" },
  tibati: { citySlug: "tibati", regionSlug: "adamaoua", zoneSlug: "sudano-sahelian", lat: 6.47, lng: 12.63, nameFr: "Tibati" },
  wum: { citySlug: "wum", regionSlug: "nord-ouest", zoneSlug: "grassfields", lat: 6.38, lng: 10.07, nameFr: "Wum" },
  mamfe: { citySlug: "mamfe", regionSlug: "sud-ouest", zoneSlug: "sawa", lat: 5.76, lng: 9.31, nameFr: "Mamfé" },
};

const CATEGORY_SLUG: Record<string, string> = {
  parc: "parc",
  parcs: "parc",
  musée: "musee",
  musee: "musee",
  museum: "musee",
  chute: "cascade",
  chutes: "cascade",
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

function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&eacute;/gi, "é")
    .replace(/&egrave;/gi, "è")
    .replace(/&ecirc;/gi, "ê")
    .replace(/&agrave;/gi, "à")
    .replace(/&acirc;/gi, "â")
    .replace(/&ocirc;/gi, "ô")
    .replace(/&ucirc;/gi, "û")
    .replace(/&ugrave;/gi, "ù")
    .replace(/&ccedil;/gi, "ç")
    .replace(/&iuml;/gi, "ï")
    .replace(/&icirc;/gi, "î")
    .replace(/&rsquo;|&lsquo;/gi, "'")
    .replace(/&rdquo;|&ldquo;/gi, '"')
    .replace(/&mdash;/gi, "–")
    .replace(/&ndash;/gi, "–")
    .replace(/&hellip;/gi, "…")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(html: string) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<\/h\d>/gi, "\n\n")
      .replace(/<li[^>]*>/gi, "• ")
      .replace(/<\/li>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/\n{3,}/g, "\n\n"),
  );
}

function absolutize(src: string) {
  const s = decodeEntities(src);
  if (s.startsWith("http")) return s;
  if (s.startsWith("//")) return `https:${s}`;
  if (s.startsWith("/")) return `https://ayilaa.com${s}`;
  return `https://ayilaa.com/${s}`;
}

function encodeImageUrl(raw: string) {
  try {
    const u = new URL(raw);
    u.pathname = u.pathname
      .split("/")
      .map((p) => encodeURIComponent(decodeURIComponent(p)))
      .join("/");
    return u.toString();
  } catch {
    return encodeURI(raw);
  }
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
}

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();
}

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function nameKey(s: string) {
  return norm(s).replace(/[^a-z0-9]+/g, "");
}

function extractOverview(html: string, title: string) {
  const apercuId = html.search(/id=["']apercu["']/i);
  const horairesComment = html.search(/<!--\s*Horaires\s*-->/i);
  const horairesText = html.search(/Horaires/i);
  const end =
    horairesComment > apercuId
      ? horairesComment
      : horairesText > apercuId
        ? horairesText
        : -1;

  if (apercuId >= 0 && end > apercuId) {
    const block = html.slice(apercuId, end);
    const desc =
      block.match(/itemprop=["']description["'][^>]*>([\s\S]*)/i)?.[1] ||
      block.replace(/[\s\S]*?<\/h5>/i, "");
    let text = stripHtml(desc);
    text = text
      .replace(new RegExp(`^${escapeReg(decodeEntities(title))}\\s*`, "i"), "")
      .replace(/^\(A partir de[\s\S]{0,40}?XAF\s*\)\s*/i, "")
      .replace(/^[\s:.\-–—]+/, "")
      .trim();
    if (text.length > 40) return text.replace(/\s+/g, " ").trim();
  }
  return "";
}

function reformulateFr(raw: string, name: string, city: string, cats: string[]) {
  let t = decodeEntities(raw)
    .replace(/\s+/g, " ")
    .replace(/\bAYILA['']A\b/gi, "")
    .replace(/\s*Pour plus d['']informations[\s\S]{0,180}$/i, "")
    .replace(/\s*Découvrez d['']autres coins[\s\S]*$/i, "")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();

  if (t.length < 60) {
    return `${name} est un site touristique à ${city || "Cameroun"} (${cats.join(", ") || "tourisme"}). Recensé sur Ayila'a pour Visit Cameroon.`;
  }
  if (/^(est|sont|offre|propose|se trouve|constitue|peut)\b/i.test(t)) {
    t = `${name} ${t}`;
  } else if (!new RegExp(escapeReg(name.split(/\s+/).slice(0, 2).join("\\s+")), "i").test(t.slice(0, 160))) {
    t = `${name}. ${t}`;
  }
  if (t.length > 3200) {
    const cut = t.slice(0, 3100);
    const last = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "));
    t = (last > 900 ? cut.slice(0, last + 1) : cut).trim();
  }
  return t;
}

function reformulateEn(fr: string, name: string, city: string) {
  const sentences = fr
    .split(/(?<=[.!?])\s+/)
    .map((s) =>
      s
        .replace(/^Située?\s+/i, "Located ")
        .replace(/\bau cœur de\b/gi, "in the heart of")
        .replace(/\bprès de\b/gi, "near")
        .replace(/\bCameroun\b/g, "Cameroon")
        .replace(/\best un\b/g, "is a")
        .replace(/\best une\b/g, "is a")
        .replace(/\boffre\b/g, "offers")
        .replace(/\bsite touristique\b/gi, "tourist site")
        .replace(/\bmusée\b/gi, "museum")
        .trim(),
    )
    .filter(Boolean);
  let t = sentences.join(" ");
  if (!new RegExp(escapeReg(name.split(/\s+/)[0] || name), "i").test(t.slice(0, 80))) {
    t = `${name}${city ? ` (${city})` : ""}. ${t}`;
  }
  return t.length > 3200 ? t.slice(0, 3100).trim() : t;
}

async function listPage(page: number) {
  const pageUrl = page <= 1 ? BASE : `${BASE}?page=${page}`;
  const res = await fetch(pageUrl, {
    headers: { "User-Agent": "VisitCameroonBot/1.0" },
  });
  const html = await res.text();
  const links = [
    ...html.matchAll(
      /href="((?:https:\/\/ayilaa\.com)?\/fr\/(?:sites-touristiques|site-touristique|parcs|musee|chutte-deau|chefferie-royaume|mont|lac|ile|monument|zoo|plage|attractions)\/[^"]+)"/gi,
    ),
  ]
    .map((m) => m[1])
    .map((h) => (h.startsWith("http") ? h : `https://ayilaa.com${h}`))
    .filter((h) => !/categorie\//i.test(h));
  return [...new Set(links)];
}

async function scrapeOne(ayilaUrl: string): Promise<Scraped | null> {
  const res = await fetch(ayilaUrl, {
    headers: { "User-Agent": "VisitCameroonBot/1.0" },
  });
  if (!res.ok) return null;
  const html = await res.text();
  const text = stripHtml(html);

  const title = decodeEntities(
    (html.match(/<title>([^<]+)<\/title>/i)?.[1] || "")
      .replace(/Ayila'a\s*\|\s*/i, "")
      .trim(),
  );
  if (!title || /ayila'?a\s*sarl/i.test(title) || title === "404") return null;

  const catBlock =
    text.match(/Catégories:\s*([^.]{3,180}?)(?:Localisation:|Adresse:|$)/i)?.[1] ||
    "";
  const categories = catBlock
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const localisation =
    text.match(/Localisation:\s*([^.]{3,160}?)(?:Adresse:|Afficher|$)/i)?.[1]?.trim() ||
    "";

  const addr =
    text.match(/Adresse:\s*([^.]{3,120}?)\s*,\s*([^,]{2,50})\s*,\s*CM/i) ||
    text.match(/Adresse:\s*([^,]{2,80}),\s*([^,]{2,50})\s*,\s*CM/i);
  const neighbourhood = addr?.[1]?.trim() || "";
  const city = addr?.[2]?.trim() || "";

  const priceMatch = text.match(/A partir de\s+([\d\s,.]+)\s*XAF/i);
  const priceFromXaf = priceMatch
    ? parseInt(priceMatch[1].replace(/[\s.,]/g, ""), 10)
    : null;

  const rawDescription = extractOverview(html, title);
  const descriptionFr = reformulateFr(rawDescription, title, city, categories);
  const descriptionEn = reformulateEn(descriptionFr, title, city);

  const culturalInfoFr = [
    neighbourhood && `Quartier / lieu : ${neighbourhood}`,
    city && `Ville : ${city}`,
    localisation && `Localisation : ${localisation}`,
    categories.length && `Catégories : ${categories.join(", ")}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const culturalInfoEn = [
    neighbourhood && `Area: ${neighbourhood}`,
    city && `City: ${city}`,
    localisation && `Location note: ${localisation}`,
    categories.length && `Categories: ${categories.join(", ")}`,
  ]
    .filter(Boolean)
    .join(" · ");

  const og =
    html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i)?.[1] ||
    null;
  const srcs = [...html.matchAll(/(?:src|data-src)=["']([^"']+)["']/gi)].map((m) =>
    absolutize(m[1]),
  );
  const s3 = [og ? absolutize(og) : "", ...srcs].find(
    (u) =>
      u.includes("ayilaa.s3.") &&
      /\.(jpe?g|png|webp)/i.test(u) &&
      !/build\/images/i.test(u),
  );
  if (!s3) return null;

  return {
    id: `${slugify(title)}-${slugify(neighbourhood || city || "cm")}`.replace(/-+/g, "-"),
    name: title,
    categories,
    localisation,
    neighbourhood,
    city,
    priceFromXaf,
    descriptionFr,
    descriptionEn,
    culturalInfoFr,
    culturalInfoEn,
    image: encodeImageUrl(s3),
    ayilaUrl,
  };
}

function resolveCityKey(city: string, neighbourhood: string, name: string) {
  const blob = norm(`${city} ${neighbourhood} ${name}`);
  const entries = Object.entries(CITY_META).sort((a, b) => b[0].length - a[0].length);
  for (const [k] of entries) {
    if (blob.includes(k)) return k;
  }
  const nCity = norm(city);
  if (CITY_META[nCity]) return nCity;
  return null;
}

function mapCategorySlug(cats: string[]) {
  const n = norm(cats.join(" "));
  for (const [k, v] of Object.entries(CATEGORY_SLUG)) {
    if (n.includes(k)) return v;
  }
  return "activite";
}

function wktPoint(lng: number, lat: number) {
  return `SRID=4326;POINT(${lng} ${lat})`;
}

async function ensureCity(
  meta: (typeof CITY_META)[string],
  regionBySlug: Record<string, string>,
  cityBySlug: Record<string, { id: string; slug: string; region_id: string }>,
) {
  if (cityBySlug[meta.citySlug]) return cityBySlug[meta.citySlug];
  const { data, error } = await supabase
    .from("cities")
    .insert({
      slug: meta.citySlug,
      name_fr: meta.nameFr,
      name_en: meta.nameFr,
      region_id: regionBySlug[meta.regionSlug],
    })
    .select("id,slug,region_id")
    .single();
  if (error || !data) throw error || new Error("city insert failed");
  cityBySlug[meta.citySlug] = data;
  return data;
}

async function main() {
  const { data: existingPlaces } = await supabase.from("places").select("slug,name_fr");
  const existingSlugs = new Set((existingPlaces || []).map((p) => p.slug));
  const existingNames = new Set((existingPlaces || []).map((p) => nameKey(p.name_fr)));

  const knownUrls = new Set<string>();
  for (const file of ["tmp-ayila-sites50.json", "tmp-ayila-full-rescrape.json"]) {
    if (!existsSync(file)) continue;
    const rows = JSON.parse(readFileSync(file, "utf8")) as { ayilaUrl?: string }[];
    for (const r of rows) if (r.ayilaUrl) knownUrls.add(r.ayilaUrl);
  }

  console.log("existing places", existingSlugs.size, "known urls", knownUrls.size);

  const seen = new Set<string>();
  const candidateLinks: string[] = [];
  for (let page = 1; page <= 20 && candidateLinks.length < TARGET * 4; page++) {
    const batch = await listPage(page);
    console.log(`page ${page}: ${batch.length} links`);
    if (batch.length === 0) break;
    for (const l of batch) {
      if (seen.has(l) || knownUrls.has(l)) continue;
      seen.add(l);
      candidateLinks.push(l);
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  console.log("new candidate urls", candidateLinks.length);

  const scraped: Scraped[] = [];
  for (const link of candidateLinks) {
    if (scraped.length >= TARGET) break;
    try {
      const row = await scrapeOne(link);
      if (!row) {
        console.log("skip empty/noimg", link);
        continue;
      }
      if (/ayila'?a\s*sarl/i.test(row.name)) continue;
      if (existingSlugs.has(row.id) || existingNames.has(nameKey(row.name))) {
        console.log("skip already", row.name);
        knownUrls.add(link);
        continue;
      }
      console.log(scraped.length + 1, row.name, "|", row.city || "?", "|", row.descriptionFr.length, "chars");
      scraped.push(row);
      existingSlugs.add(row.id);
      existingNames.add(nameKey(row.name));
    } catch (e) {
      console.error("FAIL", link, e);
    }
    await new Promise((r) => setTimeout(r, 280));
  }

  writeFileSync("tmp-ayila-sites50-batch2.json", JSON.stringify(scraped, null, 2), "utf8");
  console.log("scraped new", scraped.length);

  const [{ data: regions }, { data: cities }, { data: zones }, { data: cats }, { data: sources }] =
    await Promise.all([
      supabase.from("regions").select("id,slug"),
      supabase.from("cities").select("id,slug,region_id"),
      supabase.from("cultural_zones").select("id,slug"),
      supabase.from("categories").select("id,slug"),
      supabase.from("sources").select("id,name"),
    ]);

  const regionBySlug = Object.fromEntries((regions || []).map((r) => [r.slug, r.id]));
  const cityBySlug = Object.fromEntries(
    (cities || []).map((c) => [c.slug, c as { id: string; slug: string; region_id: string }]),
  );
  const zoneBySlug = Object.fromEntries((zones || []).map((z) => [z.slug, z.id]));
  const catBySlug = Object.fromEntries((cats || []).map((c) => [c.slug, c.id]));
  const sourceId =
    (sources || []).find((s) => /ayila/i.test(s.name))?.id ||
    (sources || []).find((s) => /manuelle|manual/i.test(s.name))?.id ||
    null;

  let inserted = 0;
  let imagesOk = 0;

  for (const s of scraped) {
    const cityKey = resolveCityKey(s.city, s.neighbourhood, s.name);
    const meta = (cityKey && CITY_META[cityKey]) || CITY_META.yaounde;

    let city;
    try {
      city = await ensureCity(meta, regionBySlug, cityBySlug);
    } catch (e) {
      console.error("city FAIL", s.name, e);
      continue;
    }

    const catSlug = mapCategorySlug(s.categories);
    const row = {
      slug: s.id,
      name_fr: s.name,
      name_en: s.name,
      region_id: city.region_id || regionBySlug[meta.regionSlug],
      city_id: city.id,
      cultural_zone_id: zoneBySlug[meta.zoneSlug],
      category_id: catBySlug[catSlug] || catBySlug.activite,
      description_fr: s.descriptionFr,
      description_en: s.descriptionEn,
      cultural_info_fr: s.culturalInfoFr,
      cultural_info_en: s.culturalInfoEn,
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
      console.error("FAIL insert", s.name, error?.message);
      continue;
    }
    inserted++;

    await supabase.from("place_images").delete().eq("place_id", place.id);
    const { error: imgErr } = await supabase.from("place_images").insert({
      place_id: place.id,
      original_url: s.image,
      alt_fr: s.name,
      alt_en: s.name,
      author: "Ayila'a",
      license: "source Ayila'a",
      source_name: "Ayila'a",
      retrieved_at: new Date().toISOString().slice(0, 10),
      is_primary: true,
    });
    if (imgErr) console.error("img FAIL", s.name, imgErr.message);
    else imagesOk++;
  }

  const { count } = await supabase
    .from("places")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true);

  console.log({ inserted, imagesOk, scraped: scraped.length, publishedTotal: count });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
