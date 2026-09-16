import { writeFileSync } from "fs";
import { restaurants as base } from "../src/data/restaurants";
import images from "../tmp-ayila-resto-images.json";

type ImgRow = { url: string; image: string | null; images: string[] };

function pickImage(row: ImgRow) {
  const all = [row.image, ...row.images].filter(Boolean) as string[];
  const s3 = all.find((u) => u.includes("ayilaa.s3.") && /\.(jpe?g|png|webp)/i.test(u));
  const raw = s3 || all.find((u) => /\.(jpe?g|png|webp)/i.test(u) && !/build\/images/i.test(u));
  if (!raw) return "";
  // decode HTML entities then encode path safely for spaces / quotes
  const decoded = raw.replace(/&#039;/g, "'").replace(/&amp;/g, "&");
  try {
    const u = new URL(decoded);
    u.pathname = u.pathname
      .split("/")
      .map((p) => encodeURIComponent(decodeURIComponent(p)))
      .join("/");
    return u.toString();
  } catch {
    return encodeURI(decoded);
  }
}

const byUrl = new Map((images as ImgRow[]).map((r) => [r.url, pickImage(r)]));

const next = base.map((r) => ({
  ...r,
  image: byUrl.get(r.ayilaUrl) || "",
}));

const missing = next.filter((r) => !r.image);
console.log("with images", next.filter((r) => r.image).length, "missing", missing.map((m) => m.id));

const body = `/**
 * Restaurants scrapés Ayila'a (catégorie Restauration, page 1)
 * puis reformulés Visit Cameroon. Images = médias Ayila S3.
 */
export type Restaurant = {
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

export const restaurants: Restaurant[] = ${JSON.stringify(next, null, 2)};
`;

writeFileSync("src/data/restaurants.ts", body, "utf8");
console.log("wrote src/data/restaurants.ts");
