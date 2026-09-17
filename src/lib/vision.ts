import type { Destination, Locale } from "./types";
import { contentTokens } from "./chat-intent";
import { hfCaptionImage, hfChatCompletion, hasHuggingFace } from "./huggingface";

export type VisionCategory =
  | "monument"
  | "nature"
  | "plage"
  | "gastronomie"
  | "artisanat"
  | "architecture"
  | "culture"
  | "autre";

export type VisionAnalysis = {
  captionFr: string;
  captionEn: string;
  category: VisionCategory;
  landmarks: string[];
  regionsGuess: string[];
  keywords: string[];
  confidence: number;
  provider: "huggingface" | "local";
};

export type VisionMatch = {
  place: Destination;
  score: number;
};

const CATEGORY_HINTS: Record<VisionCategory, string[]> = {
  monument: ["monument", "statue", "memorial", "réunification", "palace", "palais"],
  nature: ["parc", "forest", "forêt", "montagne", "cascade", "waterfall", "wildlife", "nature"],
  plage: ["plage", "beach", "ocean", "mer", "kribi", "limbe"],
  gastronomie: ["food", "plat", "restaurant", "ndolé", "cuisine", "meal"],
  artisanat: ["craft", "artisanat", "mask", "masque", "bead", "perle", "marché"],
  architecture: ["hut", "case", "chefferie", "mosque", "église", "building", "mud"],
  culture: ["festival", "danse", "dance", "tradition", "chefferie", "lamidat"],
  autre: [],
};

function parseJsonBlock(text: string): Partial<VisionAnalysis> | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]) as Partial<VisionAnalysis>;
  } catch {
    return null;
  }
}

function normalizeCategory(raw: string | undefined): VisionCategory {
  const c = (raw || "autre").toLowerCase();
  if (c.includes("plage") || c.includes("beach")) return "plage";
  if (c.includes("gastro") || c.includes("food") || c.includes("cuisine"))
    return "gastronomie";
  if (c.includes("artisan") || c.includes("craft")) return "artisanat";
  if (c.includes("archi") || c.includes("hut") || c.includes("case"))
    return "architecture";
  if (c.includes("nature") || c.includes("parc") || c.includes("forest"))
    return "nature";
  if (c.includes("monument") || c.includes("statue")) return "monument";
  if (c.includes("culture") || c.includes("festival")) return "culture";
  return "autre";
}

function categoryFromCaption(caption: string): VisionCategory {
  const lower = caption.toLowerCase();
  for (const [cat, hints] of Object.entries(CATEGORY_HINTS) as [
    VisionCategory,
    string[],
  ][]) {
    if (hints.some((h) => lower.includes(h))) return cat;
  }
  return "autre";
}

async function analyzeWithHuggingFace(
  imageDataUrl: string,
  locale: Locale,
): Promise<VisionAnalysis | null> {
  if (!hasHuggingFace()) return null;

  const caption = await hfCaptionImage(imageDataUrl);
  if (!caption) return null;

  const structured = await hfChatCompletion({
    system:
      locale === "fr"
        ? `Tu structures une analyse tourisme Cameroun. Réponds UNIQUEMENT en JSON:
{"captionFr":"...","captionEn":"...","category":"monument|nature|plage|gastronomie|artisanat|architecture|culture|autre","landmarks":[],"regionsGuess":[],"keywords":[],"confidence":0.0}`
        : `Structure a Cameroon tourism vision analysis. Reply ONLY JSON:
{"captionFr":"...","captionEn":"...","category":"monument|nature|plage|gastronomie|artisanat|architecture|culture|autre","landmarks":[],"regionsGuess":[],"keywords":[],"confidence":0.0}`,
    user: `Légende image / Image caption: ${caption}`,
    maxTokens: 280,
    temperature: 0.2,
  });

  const parsed = structured ? parseJsonBlock(structured) : null;
  if (parsed) {
    return {
      captionFr: parsed.captionFr || caption,
      captionEn: parsed.captionEn || caption,
      category: normalizeCategory(parsed.category) || categoryFromCaption(caption),
      landmarks: parsed.landmarks ?? [],
      regionsGuess: parsed.regionsGuess ?? [],
      keywords: parsed.keywords?.length
        ? parsed.keywords
        : contentTokens(caption),
      confidence:
        typeof parsed.confidence === "number" ? parsed.confidence : 0.55,
      provider: "huggingface",
    };
  }

  return {
    captionFr: caption,
    captionEn: caption,
    category: categoryFromCaption(caption),
    landmarks: [],
    regionsGuess: [],
    keywords: contentTokens(caption),
    confidence: 0.45,
    provider: "huggingface",
  };
}

function analyzeLocal(imageDataUrl: string): VisionAnalysis {
  const sizeHint = imageDataUrl.length;
  return {
    captionFr:
      "Image reçue. Ajoutez HUGGINGFACE_API_KEY dans .env.local pour activer la vision Hugging Face.",
    captionEn:
      "Image received. Add HUGGINGFACE_API_KEY in .env.local to enable Hugging Face vision.",
    category: "autre",
    landmarks: [],
    regionsGuess: [],
    keywords: sizeHint > 5000 ? ["photo", "voyage"] : ["photo"],
    confidence: 0.1,
    provider: "local",
  };
}

export async function analyzeTourismImage(
  imageDataUrl: string,
  locale: Locale,
): Promise<VisionAnalysis> {
  return (
    (await analyzeWithHuggingFace(imageDataUrl, locale)) ??
    analyzeLocal(imageDataUrl)
  );
}

export function matchPlacesFromVision(
  analysis: VisionAnalysis,
  catalog: Destination[],
  limit = 5,
): VisionMatch[] {
  const tokens = new Set(
    [
      ...analysis.keywords,
      ...analysis.landmarks,
      ...analysis.regionsGuess,
      ...CATEGORY_HINTS[analysis.category],
      analysis.captionFr,
      analysis.captionEn,
    ]
      .join(" ")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .split(/[^\p{L}\p{N}]+/u)
      .filter((w) => w.length > 2),
  );

  const categoryMap: Partial<Record<VisionCategory, string[]>> = {
    monument: ["monument", "patrimoine", "musee"],
    nature: ["parc", "reserve", "cascade", "montagne"],
    plage: ["plage"],
    gastronomie: ["restauration", "gastronomie"],
    artisanat: ["artisanat"],
    architecture: ["patrimoine", "monument"],
    culture: ["patrimoine", "musee", "festival"],
  };

  const preferredCats = categoryMap[analysis.category] ?? [];

  return catalog
    .map((place) => {
      const blob = [
        place.name,
        place.nameEn,
        place.city,
        place.region,
        place.category,
        place.culturalZone,
        place.descriptionFr,
        ...place.activities,
      ]
        .join(" ")
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{M}/gu, "");

      let score = 0;
      for (const t of tokens) {
        if (blob.includes(t)) score += t.length > 4 ? 3 : 1;
      }
      if (preferredCats.includes(place.category)) score += 4;
      if (
        analysis.regionsGuess.some((r) =>
          blob.includes(
            r
              .toLowerCase()
              .normalize("NFD")
              .replace(/\p{M}/gu, ""),
          ),
        )
      ) {
        score += 5;
      }
      return { place, score };
    })
    .filter((x) => x.score >= 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function formatVisionAnswer(
  analysis: VisionAnalysis,
  matches: VisionMatch[],
  locale: Locale,
): string {
  const isFr = locale === "fr";
  const caption = isFr ? analysis.captionFr : analysis.captionEn;
  const conf = Math.round(analysis.confidence * 100);

  const header = isFr
    ? `Analyse vision (${analysis.provider}, confiance ~${conf}%) :\n${caption}`
    : `Vision analysis (${analysis.provider}, ~${conf}% confidence):\n${caption}`;

  const metaParts = [
    isFr ? `Catégorie : ${analysis.category}` : `Category: ${analysis.category}`,
  ];
  if (analysis.landmarks.length) {
    metaParts.push(
      isFr
        ? `Repères : ${analysis.landmarks.join(", ")}`
        : `Landmarks: ${analysis.landmarks.join(", ")}`,
    );
  }
  if (analysis.regionsGuess.length) {
    metaParts.push(
      isFr
        ? `Région possible : ${analysis.regionsGuess.join(", ")}`
        : `Possible region: ${analysis.regionsGuess.join(", ")}`,
    );
  }

  let body = `${header}\n${metaParts.join(" · ")}`;

  if (matches.length > 0) {
    const list = matches
      .map((m, i) => {
        const name = isFr ? m.place.name : m.place.nameEn;
        return `${i + 1}. ${name} (${m.place.city})`;
      })
      .join("\n");
    body += isFr
      ? `\n\nLieux Visit Cameroon proches de cette image :\n${list}\n\nDemandez un itinéraire ou plus de détails sur l’un d’eux.`
      : `\n\nVisit Cameroon places close to this image:\n${list}\n\nAsk for an itinerary or more detail on any of them.`;
  } else if (analysis.provider === "local") {
    body += isFr
      ? "\n\nAjoutez HUGGINGFACE_API_KEY dans .env.local pour activer la vision Hugging Face."
      : "\n\nAdd HUGGINGFACE_API_KEY in .env.local to enable Hugging Face vision.";
  } else {
    body += isFr
      ? "\n\nJe n’ai pas trouvé de lieu exact dans le catalogue. Décrivez la ville ou envoyez une autre photo."
      : "\n\nNo exact catalogue match. Tell me the city or try another photo.";
  }

  return body;
}
