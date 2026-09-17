/**
 * Scrape 40 hotels/hébergements from Ayila category 12.
 * Writes tmp-ayila-hotels40.json + src/data/hotels.ts
 *
 * Usage: npx tsx scripts/scrape-ayila-hotels.ts
 */
import { writeFileSync } from "fs";

const BASE = "https://ayilaa.com/fr/categorie/12/hotels-et-hebergements";
const TARGET = 40;

type Hotel = {
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

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

  // Fallback: strip + take chunk after title
  const text = stripHtml(html);
  const hIdx = text.indexOf(title);
  let body =
    hIdx >= 0
      ? text.slice(hIdx + title.length, hIdx + title.length + 2200)
      : text.slice(0, 2200);
  body = body
    .replace(/Horaires[\s\S]*$/i, "")
    .replace(/Connectez vous[\s\S]*$/i, "")
    .replace(/Avis des clients[\s\S]*$/i, "")
    .replace(/Catégories:[\s\S]*?(?=Adresse:|Localisation:|$)/i, "")
    .trim();
  return body.replace(/\s+/g, " ").trim();
}

function reformulateFr(raw: string, name: string, city: string) {
  let t = decodeEntities(raw)
    .replace(/\s+/g, " ")
    .replace(/\bAYILA['']A\b/gi, "")
    .replace(/\s*Pour plus d['']informations[\s\S]{0,180}$/i, "")
    .replace(/\s*Découvrez d['']autres coins[\s\S]*$/i, "")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();

  if (t.length < 60) {
    return `${name} est un hébergement à ${city || "Cameroun"}. Recensé sur Ayila'a pour Visit Cameroon.`;
  }
  if (/^(est|sont|offre|propose|se trouve|constitue|peut)\b/i.test(t)) {
    t = `${name} ${t}`;
  } else if (
    !new RegExp(escapeReg(name.split(/\s+/).slice(0, 2).join("\\s+")), "i").test(
      t.slice(0, 160),
    )
  ) {
    t = `${name}. ${t}`;
  }
  if (t.length > 1800) {
    const cut = t.slice(0, 1700);
    const last = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "));
    t = (last > 500 ? cut.slice(0, last + 1) : cut).trim();
  }
  return t;
}

function reformulateEn(fr: string, name: string, city: string) {
  let t = fr
    .replace(/\bau cœur de\b/gi, "in the heart of")
    .replace(/\bprès de\b/gi, "near")
    .replace(/\bCameroun\b/g, "Cameroon")
    .replace(/\best un\b/g, "is a")
    .replace(/\best une\b/g, "is a")
    .replace(/\boffre\b/g, "offers")
    .replace(/\bhôtel\b/gi, "hotel")
    .replace(/\bhébergement\b/gi, "accommodation")
    .replace(/\brésidence\b/gi, "residence")
    .trim();
  if (!new RegExp(escapeReg(name.split(/\s+/)[0] || name), "i").test(t.slice(0, 80))) {
    t = `${name}${city ? ` (${city})` : ""}. ${t}`;
  }
  return t.length > 1800 ? t.slice(0, 1700).trim() : t;
}

async function listPage(page: number) {
  const pageUrl = page <= 1 ? BASE : `${BASE}?page=${page}`;
  const res = await fetch(pageUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; VisitCameroonBot/1.0; +https://visitcameroon.local)",
      Accept: "text/html",
    },
  });
  if (!res.ok) {
    console.warn("list fail", pageUrl, res.status);
    return [] as string[];
  }
  const html = await res.text();
  const links = [
    ...html.matchAll(
      /href="((?:https:\/\/ayilaa\.com)?\/fr\/(?:hotels-et-hebergements|hotel|hotels|hebergement|hebergements|residence|residences|appartement|appartements|lodge|guesthouse)\/[^"]+)"/gi,
    ),
  ]
    .map((m) => m[1])
    .map((h) => (h.startsWith("http") ? h : `https://ayilaa.com${h}`))
    .filter((h) => !/categorie\//i.test(h));

  // Broader fallback: any /fr/<slug>/digits- pattern not categorie
  if (links.length < 5) {
    const broad = [
      ...html.matchAll(
        /href="((?:https:\/\/ayilaa\.com)?\/fr\/[a-z0-9-]+\/\d+-[^"?#]+)"/gi,
      ),
    ]
      .map((m) => m[1])
      .map((h) => (h.startsWith("http") ? h : `https://ayilaa.com${h}`))
      .filter((h) => !/categorie\//i.test(h))
      .filter((h) => !/restauration|restaurant|sites-touristiques/i.test(h));
    return [...new Set([...links, ...broad])];
  }
  return [...new Set(links)];
}

async function scrapeOne(ayilaUrl: string): Promise<Hotel | null> {
  const res = await fetch(ayilaUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; VisitCameroonBot/1.0; +https://visitcameroon.local)",
      Accept: "text/html",
    },
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
  const descriptionFr = reformulateFr(rawDescription, title, city);
  const descriptionEn = reformulateEn(descriptionFr, title, city);

  const og =
    html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i)?.[1] ||
    null;
  const srcs = [...html.matchAll(/(?:src|data-src)=["']([^"']+)["']/gi)].map((m) =>
    absolutize(m[1]),
  );
  const s3Candidates = [og ? absolutize(og) : "", ...srcs].filter(
    (u) =>
      u &&
      u.includes("ayilaa.s3.") &&
      /\.(jpe?g|png|webp)/i.test(u) &&
      !/build\/images/i.test(u),
  );
  const s3 =
    s3Candidates.find((u) => /\/media\//i.test(u) && !/\/logos?\//i.test(u)) ||
    s3Candidates.find((u) => !/\/logos?\//i.test(u)) ||
    s3Candidates[0];
  if (!s3) return null;

  const category =
    categories.find((c) => /hôtel|hotel|résidence|residence|lodge|appart/i.test(c)) ||
    categories[0] ||
    "Hôtel / Hébergement";

  return {
    id: `${slugify(title)}-${slugify(neighbourhood || city || "cm")}`.replace(
      /-+/g,
      "-",
    ),
    name: title,
    nameEn: title,
    city: city || "Cameroun",
    neighbourhood: neighbourhood || city || "",
    category,
    priceFromXaf: Number.isFinite(priceFromXaf) ? priceFromXaf : null,
    descriptionFr,
    descriptionEn,
    image: encodeImageUrl(s3),
    ayilaUrl,
    sourceNote: "Ayila'a · reformulé Visit Cameroon",
  };
}

function toTsModule(hotels: Hotel[]) {
  const body = hotels
    .map((h) => {
      const esc = (s: string) =>
        s
          .replace(/\\/g, "\\\\")
          .replace(/"/g, '\\"')
          .replace(/\n/g, "\\n");
      return `  {
    id: "${esc(h.id)}",
    name: "${esc(h.name)}",
    nameEn: "${esc(h.nameEn)}",
    city: "${esc(h.city)}",
    neighbourhood: "${esc(h.neighbourhood)}",
    category: "${esc(h.category)}",
    priceFromXaf: ${h.priceFromXaf === null ? "null" : h.priceFromXaf},
    descriptionFr: "${esc(h.descriptionFr)}",
    descriptionEn: "${esc(h.descriptionEn)}",
    image: "${esc(h.image)}",
    ayilaUrl: "${esc(h.ayilaUrl)}",
    sourceNote: "${esc(h.sourceNote)}",
  }`;
    })
    .join(",\n");

  return `/**
 * Hôtels & hébergements scrapés Ayila'a (catégorie 12) · 40 fiches.
 * Source: https://ayilaa.com/fr/categorie/12/hotels-et-hebergements
 */
export type Hotel = {
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

export const hotels: Hotel[] = [
${body},
];
`;
}

async function main() {
  console.log("Listing hotel pages…");
  const allLinks: string[] = [];
  for (let page = 1; page <= 6 && allLinks.length < TARGET * 2; page++) {
    const links = await listPage(page);
    console.log(`page ${page}: ${links.length} links`);
    if (links[0]) console.log("  sample", links[0]);
    for (const l of links) {
      if (!allLinks.includes(l)) allLinks.push(l);
    }
    await new Promise((r) => setTimeout(r, 350));
  }
  console.log("unique links", allLinks.length);

  const scraped: Hotel[] = [];
  const seenIds = new Set<string>();

  for (const link of allLinks) {
    if (scraped.length >= TARGET) break;
    try {
      const row = await scrapeOne(link);
      if (!row) {
        console.log("skip (no data/image)", link);
        continue;
      }
      if (seenIds.has(row.id)) continue;
      if (row.descriptionFr.length < 40) {
        console.log("skip short desc", row.name);
        continue;
      }
      seenIds.add(row.id);
      scraped.push(row);
      console.log(
        scraped.length,
        row.name,
        "|",
        row.city,
        "|",
        row.descriptionFr.length,
        "chars",
      );
    } catch (e) {
      console.error("FAIL", link, e);
    }
    await new Promise((r) => setTimeout(r, 400));
  }

  writeFileSync(
    "tmp-ayila-hotels40.json",
    JSON.stringify(scraped, null, 2),
    "utf8",
  );
  writeFileSync("src/data/hotels.ts", toTsModule(scraped), "utf8");
  console.log("done", {
    scraped: scraped.length,
    withImage: scraped.filter((h) => h.image).length,
    json: "tmp-ayila-hotels40.json",
    ts: "src/data/hotels.ts",
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
