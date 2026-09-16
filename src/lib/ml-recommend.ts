import type { Destination, Locale } from "./types";

export type MlFeatures = {
  ecoScore: number;
  cultureScore: number;
  budgetFit: number;
  familyScore: number;
  natureScore: number;
  total: number;
};

/**
 * Heuristic scoring layer — first step toward predictive ML.
 * Same feature vector can later feed a trained model (logistic / gradient boosting).
 */
export function scoreDestinationMl(
  place: Destination,
  interests: string[],
  budgetFcfa?: number,
): MlFeatures {
  const blob = [
    place.category,
    place.culturalZone,
    ...place.activities,
    ...place.ecoTags,
    place.descriptionFr,
  ]
    .join(" ")
    .toLowerCase();

  const has = (words: string[]) =>
    words.some((w) => interests.some((i) => i.includes(w)) || blob.includes(w));

  const ecoScore = place.ecoTags.length > 0 || has(["eco", "responsable", "parc"]) ? 1 : 0;
  const cultureScore = has([
    "culture",
    "patrimoine",
    "musee",
    "musée",
    "chefferie",
    "artisanat",
  ])
    ? 1
    : 0;
  const natureScore = has(["nature", "parc", "plage", "cascade", "montagne", "reserve"])
    ? 1
    : 0;
  const familyScore = has(["famille", "family", "enfants", "kids", "musee", "plage"])
    ? 1
    : 0;

  let budgetFit = 0.5;
  if (budgetFcfa && budgetFcfa > 0) {
    const cost = place.estimatedCostFcfa || 10000;
    budgetFit = cost <= budgetFcfa / 3 ? 1 : cost <= budgetFcfa ? 0.6 : 0.2;
  }

  const total =
    ecoScore * 0.2 +
    cultureScore * 0.25 +
    natureScore * 0.25 +
    familyScore * 0.15 +
    budgetFit * 0.15;

  return { ecoScore, cultureScore, budgetFit, familyScore, natureScore, total };
}

export function rankWithMl(
  catalog: Destination[],
  interests: string[],
  budgetFcfa?: number,
  limit = 6,
  locale: Locale = "fr",
) {
  void locale;
  return [...catalog]
    .map((place) => ({
      place,
      score: scoreDestinationMl(place, interests, budgetFcfa),
    }))
    .sort((a, b) => b.score.total - a.score.total)
    .slice(0, limit);
}

export function formatMlHint(
  ranked: ReturnType<typeof rankWithMl>,
  locale: Locale,
): string {
  if (ranked.length === 0) return "";
  const isFr = locale === "fr";
  const lines = ranked.slice(0, 4).map((r, i) => {
    const name = isFr ? r.place.name : r.place.nameEn;
    return `${i + 1}. ${name} (${r.place.city}) — score ${r.score.total.toFixed(2)}`;
  });
  return isFr
    ? `Classement ML (heuristique, prêt pour modèle entraîné) :\n${lines.join("\n")}`
    : `ML ranking (heuristic, ready for a trained model):\n${lines.join("\n")}`;
}
