/**
 * Scrape Ayila sites-touristiques (~50) with images + short descriptions.
 * Usage: npx tsx scripts/scrape-ayila-sites.ts
 */
import { writeFileSync } from "fs";

const BASE = "https://ayilaa.com/fr/categorie/14/sites-touristiques";
const TARGET = 50;

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function absolutize(src: string) {
  const s = src.replace(/&amp;/g, "&").replace(/&#039;/g, "'").trim();
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

async function listPage(page: number) {
  const url = page <= 1 ? BASE : `${BASE}?page=${page}`;
  const res = await fetch(url, {
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

async function scrapeOne(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": "VisitCameroonBot/1.0" },
  });
  const html = await res.text();
  const text = stripHtml(html);
  const title = (html.match(/<title>([^<]+)<\/title>/i)?.[1] || "")
    .replace(/Ayila'a\s*\|\s*/i, "")
    .replace(/&#039;/g, "'")
    .trim();

  const addrMatch = text.match(
    /Adresse:\s*([^.]{2,90}?)\s*,\s*([^,]{2,40})\s*,\s*CM/i,
  );
  const neighbourhood = addrMatch?.[1]?.trim() || "";
  const city = addrMatch?.[2]?.trim() || "";

  const priceMatch = text.match(/A partir de\s+([\d\s,.]+)\s*XAF/i);
  const priceFromXaf = priceMatch
    ? parseInt(priceMatch[1].replace(/[\s.,]/g, ""), 10)
    : null;

  const catMatch = text.match(/Catégories:\s*([^.]{5,140})/i);
  const categoryRaw = catMatch?.[1] || "Sites Touristiques";
  const category =
    categoryRaw
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s && !/^Sites Touristiques$/i.test(s))[0] ||
    "Site touristique";

  const locMatch = text.match(/Localisation:\s*([^.]{5,120})/i);
  const localisation = locMatch?.[1]?.trim() || "";

  // Prefer description under the H5/heading of the place name
  let body = "";
  const hIdx = text.lastIndexOf(title);
  if (hIdx >= 0) body = text.slice(hIdx + title.length, hIdx + title.length + 1200);
  body = body
    .replace(/Horaires[\s\S]*$/i, "")
    .replace(/Connectez vous[\s\S]*$/i, "")
    .replace(/Avis des clients[\s\S]*$/i, "")
    .replace(/Découvrez d'autres[\s\S]*$/i, "")
    .replace(/Téléchargez[\s\S]*$/i, "")
    .trim();

  const sentences = body
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(
      (s) =>
        s.length > 50 &&
        !/Catégories:|Localisation:|Adresse:|Restauration Hotels|Coins Restauration|Mettre en favoris/i.test(
          s,
        ),
    );
  const rawDesc = sentences.slice(0, 3).join(" ").slice(0, 650);

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
  const image = s3 ? encodeImageUrl(s3) : "";

  const where = [neighbourhood, city].filter(Boolean).join(", ") || city || "Cameroun";
  const descriptionFr =
    rawDesc ||
    `${title} est un site touristique à ${where}${
      localisation ? ` (${localisation})` : ""
    }. Recensé sur Ayila'a et reformulé pour Visit Cameroon.`;
  const descriptionEn =
    rawDesc.length > 80
      ? rawDesc
      : `${title} is a tourist site in ${where}${
          localisation ? ` (${localisation})` : ""
        }. Listed on Ayila'a and rewritten for Visit Cameroon.`;

  return {
    id: `${slugify(title)}-${slugify(neighbourhood || city || "cm")}`.replace(
      /-+/g,
      "-",
    ),
    name: title,
    nameEn: title,
    city: city || "Cameroun",
    neighbourhood: neighbourhood || "",
    category,
    localisation,
    priceFromXaf,
    descriptionFr: descriptionFr.slice(0, 700),
    descriptionEn: descriptionEn.slice(0, 700),
    image,
    ayilaUrl: url,
    sourceNote: "Ayila'a · reformulé Visit Cameroon",
  };
}

async function main() {
  const seen = new Set<string>();
  const links: string[] = [];
  for (let page = 1; page <= 8 && links.length < TARGET + 10; page++) {
    const batch = await listPage(page);
    console.log(`page ${page}: ${batch.length} links`);
    for (const l of batch) {
      if (seen.has(l)) continue;
      seen.add(l);
      links.push(l);
    }
    await new Promise((r) => setTimeout(r, 250));
  }

  console.log("unique links", links.length);
  const out = [];
  for (const url of links) {
    if (out.length >= TARGET) break;
    try {
      const row = await scrapeOne(url);
      if (!row.image) {
        console.log("skip noimg", row.name);
        continue;
      }
      // skip obvious junk titles
      if (!row.name || row.name.length < 2) continue;
      console.log(out.length + 1, row.name, row.city);
      out.push(row);
    } catch (e) {
      console.error("FAIL", url, e);
    }
    await new Promise((r) => setTimeout(r, 300));
  }

  writeFileSync("tmp-ayila-sites50.json", JSON.stringify(out, null, 2), "utf8");
  console.log("wrote", out.length);
}

main();
