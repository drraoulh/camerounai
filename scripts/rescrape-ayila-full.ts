/**
 * Re-scrape Ayila detail pages with FULL overview text + structured meta,
 * then reformulate and UPDATE Supabase places (service role).
 *
 * Sources of URLs: tmp-ayila-sites50.json + src/data/restaurants.ts
 * Usage: npx tsx scripts/rescrape-ayila-full.ts
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { restaurants } from "../src/data/restaurants";

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
  ayilaUrl: string;
  slugHint: string;
  name: string;
  categories: string[];
  localisation: string;
  neighbourhood: string;
  city: string;
  priceFromXaf: number | null;
  rawDescription: string;
  descriptionFr: string;
  descriptionEn: string;
  culturalInfoFr: string;
  culturalInfoEn: string;
  image: string | null;
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
};

function decodeEntities(s: string) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&eacute;/gi, "é")
    .replace(/&Eacute;/g, "É")
    .replace(/&egrave;/gi, "è")
    .replace(/&Egrave;/g, "È")
    .replace(/&ecirc;/gi, "ê")
    .replace(/&agrave;/gi, "à")
    .replace(/&acirc;/gi, "â")
    .replace(/&ocirc;/gi, "ô")
    .replace(/&ucirc;/gi, "û")
    .replace(/&ugrave;/gi, "ù")
    .replace(/&ccedil;/gi, "ç")
    .replace(/&iuml;/gi, "ï")
    .replace(/&icirc;/gi, "î")
    .replace(/&ocirc;/gi, "ô")
    .replace(/&ouml;/gi, "ö")
    .replace(/&uuml;/gi, "ü")
    .replace(/&aacute;/gi, "á")
    .replace(/&iacute;/gi, "í")
    .replace(/&oacute;/gi, "ó")
    .replace(/&uacute;/gi, "ú")
    .replace(/&ntilde;/gi, "ñ")
    .replace(/&oe?lig;/gi, "œ")
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

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();
}

function extractOverview(html: string, title: string) {
  // Real body lives in <h5 id="apercu">…</h5> then <p itemprop="description">… until <!-- Horaires -->
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
    let block = html.slice(apercuId, end);
    // Prefer itemprop=description inner HTML when present
    const desc =
      block.match(/itemprop=["']description["'][^>]*>([\s\S]*)/i)?.[1] ||
      block.replace(/[\s\S]*?<\/h5>/i, "");
    let text = stripHtml(desc);
    text = text
      .replace(new RegExp(`^${escapeReg(decodeEntities(title))}\\s*`, "i"), "")
      .replace(/^\(A partir de[\s\S]{0,40}?XAF\s*\)\s*/i, "")
      .replace(/^•\s*Aperçu[\s\S]{0,80}?Autres\s*/i, "")
      .replace(/^,\s*Commentaires[\s\S]{0,80}?Autres\)\s*-->\s*/i, "")
      .replace(/^[\s:.\-–—]+/, "")
      .trim();
    if (text.length > 40) return text.replace(/\s+/g, " ").trim();
  }

  // Fallback: plain-text slice from first strong body cue
  const text = stripHtml(html);
  const cues = [
    text.search(/Situ[ée][e]?\s+(à|au|dans|sur|près|en)/i),
    text.search(
      new RegExp(
        `${escapeReg(decodeEntities(title))}\\s+(est|sont|offre|propose|se trouve)`,
        "i",
      ),
    ),
    text.search(/Bienvenue\s+(à|au|chez)/i),
  ].filter((i) => i >= 0);
  const start = cues.length ? Math.min(...cues) : 0;
  let chunk = text.slice(start);
  chunk = chunk
    .replace(/Horaires[\s\S]*$/i, "")
    .replace(/Connectez vous[\s\S]*$/i, "")
    .replace(/Avis des clients[\s\S]*$/i, "")
    .replace(/Localisation[\s\S]*$/i, "")
    .replace(/Vous aimerez peut[\s\S]*$/i, "")
    .replace(/Découvrez d'autres[\s\S]*$/i, "")
    .replace(/Téléchargez[\s\S]*$/i, "")
    .replace(/Toutes les Photos[\s\S]*$/i, "")
    .trim();
  return chunk.replace(/\s+/g, " ").trim();
}

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Reformulate: keep the full body, clean Visit Cameroon editorial voice. */
function reformulateFr(raw: string, name: string, city: string, cats: string[]): string {
  let t = raw
    .replace(/\s+/g, " ")
    .replace(/^[\s\S]{0,120}?•\s*Aperçu\s*•\s*Commentaires\s*•\s*Localisation\s*•\s*Autres\s*/i, "")
    .replace(/^,\s*Commentaires,\s*Localisation,\s*Autres\)\s*-->\s*/i, "")
    .replace(/Bienvenue sur Ayila[\s\S]{0,120}/gi, "")
    .replace(/\bAYILA['']A\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();

  // Soft cleanup of CTA / related tails
  t = t
    .replace(/\s*Pour plus d['']informations[\s\S]{0,180}$/i, "")
    .replace(/\s*Contactez[- ]nous[\s\S]{0,120}$/i, "")
    .replace(/\s*Réservez votre séjour[\s\S]{0,140}$/i, "")
    .replace(/\s*Découvrez d['']autres coins[\s\S]*$/i, "")
    .replace(/\s*Sites Touristiques,\s*Musée\s*$/i, "")
    .trim();

  t = decodeEntities(t);

  if (t.length < 60) {
    return `${name} est un lieu à ${city || "Cameroun"} (${cats.join(", ") || "tourisme"}). Fiche source Ayila'a peu renseignée : description à enrichir.`;
  }

  // Fix orphan starts like "sont un endroit..." after title strip
  if (/^(est|sont|offre|propose|se trouve|constitue|peut)\b/i.test(t)) {
    t = `${name} ${t}`;
  } else if (!new RegExp(escapeReg(name.split(/\s+/).slice(0, 2).join("\\s+")), "i").test(t.slice(0, 160))) {
    t = `${name}. ${t}`;
  }

  // Keep complete text; only soft-cap extreme outliers
  if (t.length > 3200) {
    const cut = t.slice(0, 3100);
    const last = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "), cut.lastIndexOf("? "));
    t = (last > 900 ? cut.slice(0, last + 1) : cut).trim();
  }
  return t;
}

function reformulateEn(fr: string, name: string, city: string): string {
  // Full parallel EN: keep every sentence, lightly anglicize common tourism FR phrasing
  const sentences = fr
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) =>
      s
        .replace(/^Située?\s+/i, "Located ")
        .replace(/^Bienvenue\s+(à|au|chez)\s+/i, "Welcome to ")
        .replace(/\bau cœur de\b/gi, "in the heart of")
        .replace(/\bau sein de\b/gi, "within")
        .replace(/\bprès de\b/gi, "near")
        .replace(/\bnon loin de\b/gi, "not far from")
        .replace(/\bCameroun\b/g, "Cameroon")
        .replace(/\best un\b/g, "is a")
        .replace(/\best une\b/g, "is a")
        .replace(/\bsont un\b/g, "are a")
        .replace(/\bsont une\b/g, "are a")
        .replace(/\boffre\b/g, "offers")
        .replace(/\bpropose\b/g, "features")
        .replace(/\bpermet\b/g, "allows")
        .replace(/\bincontournable\b/gi, "must-see")
        .replace(/\bsite touristique\b/gi, "tourist site")
        .replace(/\bmusée\b/gi, "museum")
        .replace(/\bchefferie\b/gi, "chiefdom")
        .replace(/\brégion\b/gi, "region")
        .replace(/\bville de\b/gi, "city of")
        .replace(/\s+/g, " ")
        .trim(),
    );

  let t = sentences.join(" ");
  if (!new RegExp(escapeReg(name.split(/\s+/)[0] || name), "i").test(t.slice(0, 80))) {
    t = `${name}${city ? ` (${city})` : ""}. ${t}`;
  }
  if (t.length > 3200) {
    const cut = t.slice(0, 3100);
    const last = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "));
    t = (last > 900 ? cut.slice(0, last + 1) : cut).trim();
  }
  return t;
}

async function scrapeOne(ayilaUrl: string, slugHint: string): Promise<Scraped | null> {
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
  if (!title) return null;

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
    (u) => u.includes("ayilaa.s3.") && /\.(jpe?g|png|webp)/i.test(u),
  );

  return {
    ayilaUrl,
    slugHint,
    name: title,
    categories,
    localisation,
    neighbourhood,
    city,
    priceFromXaf,
    rawDescription,
    descriptionFr,
    descriptionEn,
    culturalInfoFr,
    culturalInfoEn,
    image: s3 ? encodeImageUrl(s3) : null,
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

function wktPoint(lng: number, lat: number) {
  return `SRID=4326;POINT(${lng} ${lat})`;
}

async function main() {
  const urls: { url: string; slug: string }[] = [];
  if (existsSync("tmp-ayila-sites50.json")) {
    const sites = JSON.parse(readFileSync("tmp-ayila-sites50.json", "utf8")) as {
      id: string;
      ayilaUrl: string;
      name?: string;
    }[];
    for (const s of sites) {
      if (/ayila'?a\s*sarl/i.test(s.name || s.id)) continue;
      urls.push({ url: s.ayilaUrl, slug: s.id });
    }
  }
  for (const r of restaurants) urls.push({ url: r.ayilaUrl, slug: r.id });

  // unique by url
  const seen = new Set<string>();
  const list = urls.filter((u) => {
    if (seen.has(u.url)) return false;
    seen.add(u.url);
    return true;
  });

  console.log("URLs to rescrape", list.length);
  const scraped: Scraped[] = [];
  for (const item of list) {
    try {
      const row = await scrapeOne(item.url, item.slug);
      if (!row) {
        console.log("FAIL empty", item.slug);
        continue;
      }
      console.log(
        "OK",
        row.name,
        "|",
        row.city || "?",
        "|",
        row.descriptionFr.length,
        "chars",
      );
      scraped.push(row);
    } catch (e) {
      console.error("FAIL", item.slug, e);
    }
    await new Promise((r) => setTimeout(r, 280));
  }

  writeFileSync("tmp-ayila-full-rescrape.json", JSON.stringify(scraped, null, 2), "utf8");
  console.log("saved", scraped.length);

  const [{ data: regions }, { data: cities }, { data: zones }, { data: places }] =
    await Promise.all([
      supabase.from("regions").select("id,slug"),
      supabase.from("cities").select("id,slug,region_id"),
      supabase.from("cultural_zones").select("id,slug"),
      supabase.from("places").select("id,slug,name_fr"),
    ]);

  const regionBySlug = Object.fromEntries((regions || []).map((r) => [r.slug, r.id]));
  const cityBySlug = Object.fromEntries(
    (cities || []).map((c) => [c.slug, c as { id: string; slug: string; region_id: string }]),
  );
  const zoneBySlug = Object.fromEntries((zones || []).map((z) => [z.slug, z.id]));
  const placeBySlug = Object.fromEntries((places || []).map((p) => [p.slug, p]));
  const placeByName = Object.fromEntries(
    (places || []).map((p) => [norm(p.name_fr).replace(/[^a-z0-9]+/g, ""), p]),
  );

  let updated = 0;
  let geoFixed = 0;
  let imgUpdated = 0;

  for (const s of scraped) {
    const place =
      placeBySlug[s.slugHint] ||
      placeByName[norm(s.name).replace(/[^a-z0-9]+/g, "")];
    if (!place) {
      console.log("skip no place", s.name);
      continue;
    }

    const patch: Record<string, unknown> = {
      description_fr: s.descriptionFr,
      description_en: s.descriptionEn,
      cultural_info_fr: s.culturalInfoFr,
      cultural_info_en: s.culturalInfoEn,
      estimated_cost_xaf: s.priceFromXaf,
      updated_at: new Date().toISOString(),
    };

    const cityKey = resolveCityKey(s.city, s.neighbourhood, s.name);
    if (cityKey && CITY_META[cityKey]) {
      const meta = CITY_META[cityKey];
      try {
        const city = await ensureCity(meta, regionBySlug, cityBySlug);
        patch.city_id = city.id;
        patch.region_id = city.region_id || regionBySlug[meta.regionSlug];
        patch.cultural_zone_id = zoneBySlug[meta.zoneSlug];
        patch.location = wktPoint(meta.lng, meta.lat);
        geoFixed++;
      } catch (e) {
        console.error("geo FAIL", s.name, e);
      }
    }

    const { error } = await supabase.from("places").update(patch).eq("id", place.id);
    if (error) {
      console.error("update FAIL", s.name, error.message);
      continue;
    }
    updated++;

    if (s.image) {
      await supabase.from("place_images").delete().eq("place_id", place.id).eq("is_primary", true);
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
      if (!imgErr) imgUpdated++;
    }
  }

  console.log({ updated, geoFixed, imgUpdated, scraped: scraped.length });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
