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

function absolutize(src: string) {
  const s = src.replace(/&amp;/g, "&").trim();
  if (s.startsWith("http")) return s;
  if (s.startsWith("//")) return `https:${s}`;
  if (s.startsWith("/")) return `https://ayilaa.com${s}`;
  return `https://ayilaa.com/${s}`;
}

function score(u: string) {
  let s = 0;
  if (/og:|large|orig|full|1200|800|gallery|uploads|media/i.test(u)) s += 3;
  if (/thumb|small|50x|100x|icon|logo|avatar|sprite|favicon/i.test(u)) s -= 5;
  if (/\.(jpe?g|png|webp)/i.test(u)) s += 2;
  return s;
}

async function scrapeImages(url: string) {
  const res = await fetch(url, {
    headers: { "User-Agent": "VisitCameroonBot/1.0" },
  });
  const html = await res.text();

  const og =
    html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i)?.[1] ||
    null;

  const srcs = [...html.matchAll(/(?:src|data-src|data-lazy-src)=["']([^"']+)["']/gi)].map(
    (m) => m[1],
  );
  const bg = [...html.matchAll(/url\((['"]?)([^)'"]+)\1\)/gi)].map((m) => m[2]);

  const candidates = [...srcs, ...bg]
    .map(absolutize)
    .filter((s) => /\.(jpe?g|png|webp)(\?|$)/i.test(s) || /upload|media|image|photo|storage|cloudinary|ayila/i.test(s))
    .filter((s) => !/logo|icon|avatar|flag|sprite|svg|favicon|placeholder|blank|facebook|twitter|whatsapp/i.test(s));

  const uniq = [...new Set(candidates)].sort((a, b) => score(b) - score(a));
  const image = (og ? absolutize(og) : null) || uniq[0] || null;

  return { url, image, images: uniq.slice(0, 8) };
}

async function main() {
  const out = [];
  for (const url of URLS) {
    try {
      const row = await scrapeImages(url);
      console.log(url.split("/").pop(), "=>", row.image ? "OK" : "NONE", row.image?.slice(0, 90) || "");
      out.push(row);
    } catch (e) {
      console.error("FAIL", url, e);
      out.push({ url, image: null, images: [] });
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  writeFileSync("tmp-ayila-resto-images.json", JSON.stringify(out, null, 2), "utf8");
  console.log("done", out.filter((x) => x.image).length, "/", out.length);
}

main();
