/**
 * Clean hotels.ts descriptions (HTML entities, mid-word spaces).
 * Usage: npx tsx scripts/clean-ayila-hotels.ts
 */
import { writeFileSync } from "fs";
import { hotels, type Hotel } from "../src/data/hotels";

function clean(s: string) {
  return s
    .replace(/&oelig;/gi, "œ")
    .replace(/&OElig;/gi, "Œ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&rsquo;|&lsquo;/gi, "'")
    .replace(/&rdquo;|&ldquo;/gi, '"')
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
    .replace(/\s+/g, " ")
    // Fix common mid-word splits from HTML tags, without joining real words
    .replace(/\b([Rr])\s+ésidence\b/g, "$1ésidence")
    .replace(/\b([Hh])\s+ébergement\b/g, "$1ébergement")
    .replace(/\b([Hh])\s+ôtel\b/g, "$1ôtel")
    .replace(/\b([Ss])\s+éjour/g, "$1éjour")
    .replace(/\b([ÉéEe])\s+vénement/g, "$1vénement")
    .replace(/\b([Ee])\s+xtérieu\s*r\b/g, "$1xtérieur")
    .replace(/\bt\s+ables\b/g, "tables")
    .replace(/\bl\s+es\b/g, "les")
    .replace(/citébalnéaire/gi, "cité balnéaire")
    .replace(/hautstanding/gi, "haut standing")
    .trim();
}

function normalizeCity(city: string) {
  const c = clean(city);
  if (/^yaounde$/i.test(c)) return "Yaoundé";
  if (/^ngaoundere$/i.test(c)) return "Ngaoundéré";
  if (/^kribi$/i.test(c)) return "Kribi";
  return c;
}

function enFromFr(fr: string, name: string, city: string) {
  let t = fr
    .replace(/\bCameroun\b/g, "Cameroon")
    .replace(/\bhôtel\b/gi, "hotel")
    .replace(/\bhébergement\b/gi, "accommodation")
    .replace(/\brésidence\b/gi, "residence")
    .replace(/\best un\b/g, "is a")
    .replace(/\best une\b/g, "is a")
    .replace(/\boffre\b/g, "offers")
    .replace(/\bau cœur de\b/gi, "in the heart of")
    .replace(/\bprès de\b/gi, "near")
    .replace(/\bSitué\b/g, "Located")
    .replace(/\bSituée\b/g, "Located");
  const cut = t.length > 900 ? t.slice(0, 880) : t;
  const last = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf("! "));
  t = (last > 200 ? cut.slice(0, last + 1) : cut).trim();
  const first = name.split(/\s+/)[0] || name;
  if (!t.toLowerCase().includes(first.toLowerCase())) {
    t = `${name}${city ? ` (${city})` : ""}. ${t}`;
  }
  return t;
}

function esc(s: string) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function toTs(list: Hotel[]) {
  const body = list
    .map(
      (h) => `  {
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
  }`,
    )
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

const cleaned: Hotel[] = hotels.map((h) => {
  const descriptionFr = clean(h.descriptionFr);
  const city = normalizeCity(h.city);
  return {
    ...h,
    city,
    neighbourhood: clean(h.neighbourhood),
    descriptionFr,
    descriptionEn: enFromFr(descriptionFr, h.name, city),
  };
});

writeFileSync("src/data/hotels.ts", toTs(cleaned), "utf8");
writeFileSync("tmp-ayila-hotels40.json", JSON.stringify(cleaned, null, 2), "utf8");
console.log("cleaned", cleaned.length);
console.log(cleaned[0].descriptionFr.slice(0, 140));
