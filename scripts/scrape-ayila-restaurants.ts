/**
 * Scrape Ayila restauration detail pages and dump raw text for reformulation.
 * Usage: npx tsx scripts/scrape-ayila-restaurants.ts
 */
import { writeFileSync } from "fs";

const URLS = [
  "https://ayilaa.com/fr/restauration/15260-okuko",
  "https://ayilaa.com/fr/restauration/10460-restaurant-manna-foods",
  "https://ayilaa.com/fr/restaurant/15844-le-moulin-de-france-bonamoussadi",
  "https://ayilaa.com/fr/restauration/12184-restaurant-o-san",
  "https://ayilaa.com/fr/restauration/15024-rooftop-love",
  "https://ayilaa.com/fr/restauration/15784-la-vache-noire-restaurant",
  "https://ayilaa.com/fr/restauration/8068-lounge-restaurant-taso-lounge",
  "https://ayilaa.com/fr/restauration/5253-restaurant-le-carino-pizzeria",
  "https://ayilaa.com/fr/restauration/4202-restaurant-chez-wou",
  "https://ayilaa.com/fr/restauration/3416-restaurant-chez-fadil",
  "https://ayilaa.com/fr/restauration/15596-bar-restaurant-bwambe-plage",
  "https://ayilaa.com/fr/restauration/15341-rhema-s-small-chops-and-cakes",
  "https://ayilaa.com/fr/restauration/13718-creperie-pizzaria-patisserie-pira-bliss-cake",
  "https://ayilaa.com/fr/restauration/13136-restaurant-glacier-violetta-glacier",
  "https://ayilaa.com/fr/restauration/11748-creperie-pizzaria-patisserie-les-douceurs-de-aissatou",
  "https://ayilaa.com/fr/restauration/11529-restaurant-en-ligne-marina-fastfood-juice",
  "https://ayilaa.com/fr/restauration/11104-creperie-pizzaria-patisserie-o-neals-pastries",
  "https://ayilaa.com/fr/restauration/6661-creperie-pizzaria-patisserie-my-sandies",
  "https://ayilaa.com/fr/restauration/6530-restaurant-les-cedres-bonamoussadi",
  "https://ayilaa.com/fr/restauration/5706-restaurant-grill-la-fourchette-de-thereza",
];

function stripHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&eacute;/g, "é")
    .replace(/&egrave;/g, "è")
    .replace(/&agrave;/g, "à")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function pickBetween(text: string, start: string, end: string) {
  const i = text.indexOf(start);
  if (i < 0) return "";
  const j = text.indexOf(end, i + start.length);
  return (j > i ? text.slice(i + start.length, j) : text.slice(i + start.length)).trim();
}

async function scrapeOne(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": "VisitCameroonBot/1.0" },
  });
  const html = await res.text();
  const text = stripHtml(html);
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const title = (titleMatch?.[1] ?? "")
    .replace(/Ayila'a\s*\|\s*/i, "")
    .trim();
  const address =
    pickBetween(text, "Adresse:", "Afficher") ||
    pickBetween(text, "Adresse:", "#####") ||
    "";
  // Prefer overview section after heading of same name
  let body = "";
  const hIdx = text.indexOf(title);
  if (hIdx >= 0) {
    body = text.slice(hIdx + title.length, hIdx + title.length + 1800);
  } else {
    body = text.slice(0, 1800);
  }
  body = body
    .replace(/Horaires[\s\S]*$/i, "")
    .replace(/Connectez vous[\s\S]*$/i, "")
    .replace(/Avis des clients[\s\S]*$/i, "")
    .trim();

  return { url, title, address: address.slice(0, 200), body: body.slice(0, 1600) };
}

async function main() {
  const out = [];
  for (const url of URLS) {
    try {
      const row = await scrapeOne(url);
      console.log("OK", row.title);
      out.push(row);
    } catch (e) {
      console.error("FAIL", url, e);
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  writeFileSync(
    "tmp-ayila-restaurants-raw.json",
    JSON.stringify(out, null, 2),
    "utf8",
  );
  console.log("wrote", out.length);
}

main();
