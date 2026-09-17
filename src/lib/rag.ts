import { destinations as localDestinations } from "@/data/destinations";
import { culturalAreas } from "@/data/cultural-areas";
import { expressions } from "@/data/expressions";
import { generateTripPlan } from "./trip-planner";
import { decodeHtmlEntities } from "./text";
import { getLocalizedDestination } from "./localize-place";
import { answerStayPhrase } from "./say-phrase";
import type { Destination, Locale, TripPlan } from "./types";

function shortDesc(text: string, max = 140) {
  const clean = decodeHtmlEntities(text).replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const last = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(", "), cut.lastIndexOf(" "));
  return `${(last > 60 ? cut.slice(0, last) : cut).trim()}…`;
}

function formatCost(n: number, locale: Locale) {
  return `${n.toLocaleString(locale === "fr" ? "fr-FR" : "en-US")} FCFA`;
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 2);
}

function scoreDestination(dest: Destination, tokens: string[]) {
  const blob = [
    dest.name,
    dest.nameEn,
    dest.city,
    dest.cityEn,
    dest.region,
    dest.regionEn,
    dest.culturalZone,
    dest.category,
    dest.descriptionFr,
    dest.descriptionEn,
    ...dest.activities,
    ...dest.ecoTags,
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;
  for (const t of tokens) {
    if (blob.includes(t)) score += 2;
    if (dest.city.toLowerCase().includes(t) || dest.cityEn.toLowerCase().includes(t))
      score += 3;
    if (dest.culturalZone.toLowerCase().includes(t)) score += 2;
  }
  return score;
}

function searchInCatalog(catalog: Destination[], query: string) {
  const q = query.toLowerCase();
  return catalog.filter((d) =>
    [
      d.name,
      d.nameEn,
      d.city,
      d.region,
      d.culturalZone,
      d.category,
      d.descriptionFr,
      d.descriptionEn,
      ...d.activities,
      ...d.ecoTags,
    ]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
}

export function retrieveContext(
  query: string,
  limit = 6,
  catalog: Destination[] = localDestinations,
) {
  const tokens = tokenize(query);
  const q = query.toLowerCase();

  let hits = searchInCatalog(catalog, query);
  if (hits.length === 0 && tokens.length > 0) {
    hits = [...catalog]
      .map((d) => ({ d, s: scoreDestination(d, tokens) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.d);
  }

  if (q.includes("sawa")) {
    hits = [...hits, ...catalog.filter((d) => d.culturalZone === "Sawa")];
  }
  if (q.includes("grassfield") || q.includes("bamoun") || q.includes("bamileke")) {
    hits = [...hits, ...catalog.filter((d) => d.culturalZone === "Grassfields")];
  }
  if (q.includes("fang") || q.includes("beti") || q.includes("yaound")) {
    hits = [...hits, ...catalog.filter((d) => d.culturalZone === "Fang-Beti")];
  }
  if (q.includes("sahel") || q.includes("waza") || q.includes("maroua") || q.includes("ngaound")) {
    hits = [...hits, ...catalog.filter((d) => d.culturalZone === "Sudano-Sahelian")];
  }
  if (q.includes("eco") || q.includes("responsable") || q.includes("responsible")) {
    hits = [...hits, ...catalog.filter((d) => d.ecoTags.length > 0)];
  }

  const seen = new Set<string>();
  let unique: Destination[] = [];
  for (const d of hits) {
    if (!seen.has(d.id)) {
      seen.add(d.id);
      unique.push(d);
    }
  }

  // If the visitor named a city, prefer places in/near that city
  const cityHints = [
    "yaoundé",
    "yaounde",
    "douala",
    "kribi",
    "limbé",
    "limbe",
    "foumban",
    "bafoussam",
    "maroua",
    "buea",
    "garoua",
    "bamenda",
    "ebolowa",
    "ngaoundéré",
    "ngaoundere",
  ];
  const namedCity = cityHints.find((c) => q.includes(c));
  if (namedCity) {
    const cityNorm = namedCity.replace(/é/g, "e");
    const inCity = unique.filter((d) =>
      d.city
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{M}/gu, "")
        .includes(cityNorm),
    );
    if (inCity.length > 0) {
      // Stay on-topic: don't pad with unrelated cities
      unique = inCity;
    }
  }

  unique = unique.slice(0, limit);

  const culture =
    culturalAreas.find(
      (c) => q.includes(c.id.toLowerCase()) || q.includes(c.nameFr.toLowerCase()),
    ) ?? null;

  const learn =
    q.includes("expression") ||
    q.includes("dit-on") ||
    q.includes("dit on") ||
    q.includes("how do you say") ||
    q.includes("how to say") ||
    q.includes("learn") ||
    q.includes("ewondo") ||
    q.includes("langue") ||
    q.includes("phrase");

  return {
    destinations: unique,
    culture,
    learn,
    expressions: learn ? expressions.slice(0, 5) : [],
  };
}

const DAY_WORDS: Record<string, number> = {
  un: 1,
  une: 1,
  deux: 2,
  trois: 3,
  quatre: 4,
  cinq: 5,
  six: 6,
  sept: 7,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  seven: 7,
};

function parseDays(q: string): number | null {
  const digit = q.match(/(\d+)\s*jours?/i) || q.match(/(\d+)\s*days?/i);
  if (digit) return Number(digit[1]);
  const word = q.match(
    /\b(un|une|deux|trois|quatre|cinq|six|sept|one|two|three|four|five|six|seven)\s+(jours?|days?)\b/i,
  );
  if (word) return DAY_WORDS[word[1].toLowerCase()] ?? null;
  return null;
}

function parsePeople(q: string): number {
  if (/famille|family|enfants|kids/.test(q)) return 4;
  const m = q.match(/(\d+)\s*(personnes?|people|pers)\b/i);
  if (m) return Number(m[1]);
  if (/couple|\bdeux\b/.test(q)) return 2;
  return 2;
}

/** Parse free-text travel requests (jury demo scenario). */
export function parseTripIntent(query: string) {
  const q = query.toLowerCase();
  const budgetMatch = q.match(/(\d[\d\s.,]{2,})\s*(fcfa|cfa|francs?)?/i);
  const days = parseDays(q);

  const cities = [
    "yaoundé",
    "yaounde",
    "douala",
    "kribi",
    "limbé",
    "limbe",
    "foumban",
    "bafoussam",
    "maroua",
    "buea",
    "waza",
  ];
  const city = cities.find((c) => q.includes(c)) ?? null;

  const wantsTrip =
    Boolean(budgetMatch && (days !== null || city)) ||
    /itin[eé]raire|trip|voyage|séjour|sejour|programme|planif/i.test(q) ||
    (Boolean(budgetMatch) &&
      /visiter|discover|découvrir|decouvrir|aimer|like|culture|nature/i.test(q));

  if (!wantsTrip) return null;

  const interests: string[] = [];
  if (/culture|patrimoine|heritage|mus[eé]e/i.test(q)) interests.push("culture");
  if (/nature|parc|for[eê]t|forest|eco/i.test(q)) interests.push("nature");
  if (/plage|beach|\bocean\b|\bla mer\b|\ben mer\b/i.test(q)) interests.push("plage");
  if (/sawa/i.test(q)) interests.push("sawa", "culture");
  if (/famille|family/i.test(q)) interests.push("famille");
  if (interests.length === 0) interests.push("culture", "nature");

  const destination =
    city === "yaounde" || city === "yaoundé"
      ? "Yaoundé"
      : city
        ? city.charAt(0).toUpperCase() + city.slice(1)
        : "Yaoundé";

  return {
    destination,
    days: days ?? 3,
    budgetFcfa: budgetMatch
      ? parseInt(budgetMatch[1].replace(/[\s.,]/g, ""), 10)
      : 150000,
    people: parsePeople(q),
    interests,
  };
}

function formatTripAnswer(plan: TripPlan, locale: Locale): string {
  const isFr = locale === "fr";
  const days = plan.days
    .map((d) => {
      const acts = d.activities
        .map((a) => `  • ${a.time} — ${a.name}`)
        .join("\n");
      return `${d.title} (~${formatCost(d.estimatedCostFcfa, locale)})\n${acts}`;
    })
    .join("\n\n");

  if (isFr) {
    return [
      plan.summary,
      "",
      days,
      "",
      `Budget estimé : ${formatCost(plan.totalEstimatedFcfa, locale)}.`,
      plan.budgetNote,
      "",
      "Astuce : ouvrez « Planifier » pour voir ces lieux sur la carte. Les montants sont indicatifs (entrée / activités, hors transport long trajet).",
    ].join("\n");
  }

  return [
    plan.summary,
    "",
    days,
    "",
    `Estimated budget: ${formatCost(plan.totalEstimatedFcfa, locale)}.`,
    plan.budgetNote,
    "",
    "Tip: open Plan your trip to see these places on the map. Amounts are indicative (entries/activities; long-distance transport not included).",
  ].join("\n");
}

export function buildRagAnswer(
  query: string,
  locale: Locale,
  catalog: Destination[] = localDestinations,
): {
  answer: string;
  sourceIds: string[];
  tripPlan?: TripPlan;
  phrase?: boolean;
  speak?: { langId: string; phrase: string; pronunciation: string; stepId?: string };
} {
  const stay = answerStayPhrase(query, locale);
  if (stay) {
    return {
      answer: stay.answer,
      sourceIds: [],
      phrase: true,
      speak: stay.speak,
    };
  }

  const { destinations: ctx, culture, learn, expressions: exprs } = retrieveContext(
    query,
    6,
    catalog,
  );
  const isFr = locale === "fr";

  if (learn && exprs.length > 0) {
    const lines = exprs.map((e) => {
      const meaning = isFr ? e.translationFr : e.translationEn;
      const tip = isFr ? e.contextFr : e.contextEn;
      if (isFr) {
        return `• ${e.phrase} (${e.language}) — ${meaning}\n  Prononciation : ${e.pronunciation}${tip ? `\n  Quand l’utiliser : ${tip}` : ""}`;
      }
      return `• ${e.phrase} (${e.language}) — ${meaning}\n  Pronunciation: ${e.pronunciation}${tip ? `\n  When to use: ${tip}` : ""}`;
    });
    return {
      answer: isFr
        ? `Avec plaisir. Voici quelques expressions utiles sur place :\n\n${lines.join("\n\n")}\n\nElles sont là pour vous aider à échanger ; les usages locaux peuvent un peu varier.`
        : `Happy to help. Here are a few useful phrases on the ground:\n\n${lines.join("\n\n")}\n\nThese are practical guides; local usage can vary slightly.`,
      sourceIds: [],
    };
  }

  const tripIntent = parseTripIntent(query);
  if (tripIntent) {
    const plan = generateTripPlan({ ...tripIntent, locale }, catalog);
    return {
      answer: formatTripAnswer(plan, locale),
      sourceIds: plan.placeIds,
      tripPlan: plan,
    };
  }

  if (culture && ctx.length === 0) {
    return {
      answer: isFr
        ? `L’aire culturelle ${culture.nameFr} : ${culture.summaryFr}\n\nÀ explorer notamment : ${culture.themes.join(", ")}.\n\nDites-moi combien de jours vous avez, ou une ville de départ, et je vous propose un parcours concret.`
        : `The ${culture.nameEn} cultural area: ${culture.summaryEn}\n\nWorth exploring: ${culture.themes.join(", ")}.\n\nTell me how many days you have, or a starting city, and I’ll suggest a concrete route.`,
      sourceIds: [],
    };
  }

  if (ctx.length === 0) {
    return {
      answer: isFr
        ? "Je n’ai pas assez d’éléments précis pour cette question. Reformulez avec une ville (Yaoundé, Douala, Kribi, Foumban, Limbé…) ou une aire culturelle (Sawa, Grassfields, Fang-Beti, Sudano-Sahelian), et je vous guide."
        : "I don’t have enough specifics for that yet. Try a city (Yaoundé, Douala, Kribi, Foumban, Limbé…) or a cultural area (Sawa, Grassfields, Fang-Beti, Sudano-Sahelian), and I’ll guide you.",
      sourceIds: [],
    };
  }

  const budgetMatch = query.match(/(\d[\d\s.]{2,})\s*(fcfa|cfa|francs?)?/i);
  const budget = budgetMatch
    ? parseInt(budgetMatch[1].replace(/[\s.,]/g, ""), 10)
    : null;

  const topPlaces = ctx.slice(0, 4);

  const list = topPlaces
    .map((d, i) => {
      const loc = getLocalizedDestination(d, locale);
      const desc = shortDesc(loc.description);
      const cost =
        d.estimatedCostFcfa > 0
          ? isFr
            ? ` · environ ${formatCost(d.estimatedCostFcfa, locale)}`
            : ` · about ${formatCost(d.estimatedCostFcfa, locale)}`
          : "";
      return `${i + 1}. ${loc.name} (${loc.city}${cost})\n   ${desc}`;
    })
    .join("\n\n");

  let budgetNote = "";
  if (budget && topPlaces[0]) {
    const dayCost = Math.max(topPlaces[0].estimatedCostFcfa + 15000, 25000);
    const days = Math.max(1, Math.floor(budget / dayCost));
    const focusCity = getLocalizedDestination(topPlaces[0], locale).city;
    budgetNote = isFr
      ? `\n\nAvec environ ${formatCost(budget, locale)}, comptez plutôt ${days} jour(s) autour de ${focusCity} pour les visites (hors long trajet et hébergement).`
      : `\n\nWith about ${formatCost(budget, locale)}, plan around ${days} day(s) near ${focusCity} for visits (excluding long travel and lodging).`;
  }

  const cityFocus = topPlaces[0]
    ? getLocalizedDestination(topPlaces[0], locale).city
    : undefined;
  const zoneFocus = topPlaces[0]?.culturalZone;

  const intro = isFr
    ? culture
      ? `Voici ce que je vous recommande côté ${culture.nameFr}${cityFocus ? `, autour de ${cityFocus}` : ""} :`
      : cityFocus
        ? `Voici des idées solides à ${cityFocus}${zoneFocus ? ` (${zoneFocus})` : ""} :`
        : "Voici des idées adaptées à votre demande :"
    : culture
      ? `Here’s what I’d recommend in the ${culture.nameEn} area${cityFocus ? `, around ${cityFocus}` : ""}:`
      : cityFocus
        ? `Here are strong picks in ${cityFocus}${zoneFocus ? ` (${zoneFocus})` : ""}:`
        : "Here are ideas that match your request:";

  const outro = isFr
    ? "\n\nVous voulez un mini-itinéraire jour par jour ? Indiquez durée, budget et centres d’intérêt (culture, nature, plage…)."
    : "\n\nWant a day-by-day mini itinerary? Tell me duration, budget and interests (culture, nature, beach…).";

  return {
    answer: `${intro}\n\n${list}${budgetNote}${outro}`,
    sourceIds: topPlaces.map((d) => d.id),
  };
}

/** Raw facts for LLM rewriting (not the user-facing answer). */
export function buildFactsForLlm(
  query: string,
  locale: Locale,
  catalog: Destination[] = localDestinations,
) {
  const { destinations, culture, learn, expressions: exprs } = retrieveContext(
    query,
    6,
    catalog,
  );
  const isFr = locale === "fr";
  const lines = destinations.map((d) => {
    const loc = getLocalizedDestination(d, locale);
    const desc = shortDesc(loc.description, 180);
    return `- ${loc.name} | ${loc.city}, ${loc.region} | ${d.culturalZone} | ~${d.estimatedCostFcfa} FCFA | ${desc}`;
  });
  const cultureLine = culture
    ? `\nCultural area: ${isFr ? culture.nameFr : culture.nameEn} — ${isFr ? culture.summaryFr : culture.summaryEn}`
    : "";
  const exprLines =
    learn && exprs.length
      ? `\nPhrases:\n${exprs
          .map(
            (e) =>
              `- ${e.phrase} (${e.language}): ${isFr ? e.translationFr : e.translationEn} [${e.pronunciation}]`,
          )
          .join("\n")}`
      : "";
  return {
    facts: `${lines.join("\n")}${cultureLine}${exprLines}`.trim() || "(no matches)",
    sourceIds: destinations.map((d) => d.id),
  };
}

/** @deprecated Prefer buildFactsForLlm for enrichment; kept for compatibility. */
export function buildContextForLlm(
  query: string,
  locale: Locale,
  catalog: Destination[] = localDestinations,
) {
  const { answer, sourceIds } = buildRagAnswer(query, locale, catalog);
  return { ragAnswer: answer, sourceIds };
}
