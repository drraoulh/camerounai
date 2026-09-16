/**
 * Scrape Ayila restauration page 2 (next 20) with descriptions + images.
 */
import { writeFileSync } from "fs";

const PAGE_URL = "https://ayilaa.com/fr/categorie/11/restauration?page=2";

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
    .slice(0, 60);
}

async function listPage() {
  const res = await fetch(PAGE_URL, {
    headers: { "User-Agent": "VisitCameroonBot/1.0" },
  });
  const html = await res.text();
  const links = [
    ...html.matchAll(
      /href="((?:https:\/\/ayilaa\.com)?\/fr\/(?:restauration|restaurant)\/[^"]+)"/gi,
    ),
  ]
    .map((m) => m[1])
    .map((h) => (h.startsWith("http") ? h : `https://ayilaa.com${h}`));
  return [...new Set(links)].slice(0, 20);
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
    /Adresse:\s*([^.]{3,80}?)\s*,\s*([^,]{2,40})\s*,\s*CM/i,
  );
  const neighbourhood = addrMatch?.[1]?.trim() || "";
  const city = addrMatch?.[2]?.trim() || "";

  const priceMatch = text.match(/A partir de\s+([\d\s,.]+)\s*XAF/i);
  const priceFromXaf = priceMatch
    ? parseInt(priceMatch[1].replace(/[\s.,]/g, ""), 10)
    : null;

  const catMatch = text.match(/Catégories:\s*([^.]{5,120})/i);
  const category = (catMatch?.[1] || "Restaurant")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s && s.toLowerCase() !== "restauration")[0] || "Restaurant";

  // description: after heading
  let body = "";
  const hIdx = text.indexOf(title);
  if (hIdx >= 0) body = text.slice(hIdx + title.length, hIdx + title.length + 900);
  body = body
    .replace(/Horaires[\s\S]*$/i, "")
    .replace(/Connectez vous[\s\S]*$/i, "")
    .replace(/Avis des clients[\s\S]*$/i, "")
    .replace(/Découvrez d'autres[\s\S]*$/i, "")
    .trim();

  // Prefer first real sentence block
  const sentences = body
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40 && !/Catégories:|Localisation:|Adresse:/i.test(s));
  const rawDesc = sentences.slice(0, 3).join(" ").slice(0, 520);

  const og =
    html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i)?.[1] ||
    null;
  const srcs = [...html.matchAll(/(?:src|data-src)=["']([^"']+)["']/gi)].map(
    (m) => absolutize(m[1]),
  );
  const s3 = [og ? absolutize(og) : "", ...srcs].find(
    (u) => u.includes("ayilaa.s3.") && /\.(jpe?g|png|webp)/i.test(u),
  );
  const image = s3 ? encodeImageUrl(s3) : "";

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
    priceFromXaf,
    descriptionFr: rawDesc || `${title} est une adresse de restauration recensée sur Ayila'a.`,
    descriptionEn: rawDesc
      ? `Restaurant listing reformulated from Ayila'a: ${rawDesc.slice(0, 400)}`
      : `${title} is a dining spot listed on Ayila'a.`,
    image,
    ayilaUrl: url,
    sourceNote: "Ayila'a · reformulé Visit Cameroon",
  };
}

async function main() {
  const links = await listPage();
  console.log("page2 links", links.length);
  const out = [];
  for (const url of links) {
    try {
      const row = await scrapeOne(url);
      console.log(row.id, row.image ? "img" : "noimg", row.city);
      out.push(row);
    } catch (e) {
      console.error("FAIL", url, e);
    }
    await new Promise((r) => setTimeout(r, 350));
  }
  writeFileSync("tmp-ayila-resto-page2.json", JSON.stringify(out, null, 2), "utf8");
  console.log("wrote", out.length);
}

main();
