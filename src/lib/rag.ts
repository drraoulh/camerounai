import { destinations as localDestinations } from "@/data/destinations";
import { culturalAreas } from "@/data/cultural-areas";
import { expressions } from "@/data/expressions";
import { generateTripPlan } from "./trip-planner";
import { decodeHtmlEntities } from "./text";
import { getLocalizedDestination } from "./localize-place";
import {
  formatKnowledgeAnswer,
  formatKnowledgeFacts,
  isKnowledgeQuestion,
  retrieveKnowledge,
  type KbHit,
} from "./knowledge-base";
import { contentTokens } from "./chat-intent";
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
  return contentTokens(text);
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
    q.includes("apprend") ||
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
  if (/solo|seul(e)?\b|alone/.test(q)) return 1;
  if (/couple|\bdeux\b/.test(q)) return 2;
  if (/amis|friends/.test(q)) return 4;
  if (/groupe|group/.test(q)) return 6;
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
    /\b(itin[eé]raire|trip|voyage|séjour|sejour|programme|planif\w*|plans?)\b/i.test(
      q,
    ) ||
    (Boolean(budgetMatch) &&
      /visiter|discover|découvrir|decouvrir|aimer|like|culture|nature/i.test(q)) ||
    (days !== null &&
      Boolean(city) &&
      /nature|culture|resto|restaurant|h[oô]tel|plage|beach|famille|family/i.test(
        q,
      ));

  if (!wantsTrip) return null;

  const interests: string[] = [];
  if (/culture|patrimoine|heritage|mus[eé]e/i.test(q)) interests.push("culture");
  if (/nature|parc|for[eê]t|forest|eco|montagne|cascade/i.test(q))
    interests.push("nature");
  if (/plage|beach|\bocean\b|\bla mer\b|\ben mer\b/i.test(q)) interests.push("plage");
  if (/gastro|cuisine|food|manger|eat|restaurant|ndol|resto/i.test(q))
    interests.push("food", "restaurant");
  if (/h[oô]tel|h[eé]berg|sleep|nuit|lodging|stay|dormir/i.test(q))
    interests.push("hotel");
  if (/sawa/i.test(q)) interests.push("sawa", "culture");
  if (/famille|family|enfant|kids/i.test(q)) interests.push("famille");
  if (/eco|respons|durable/i.test(q)) interests.push("eco");

  // Keep traveler choices — only add food default for lodging/meals coverage
  if (interests.length === 0) interests.push("culture", "nature", "food");
  else if (!interests.includes("food") && !interests.includes("restaurant"))
    interests.push("food");

  let travelType: string | undefined;
  if (/famille|family|enfant|kids/i.test(q)) travelType = "family";
  else if (/couple|romantique/i.test(q)) travelType = "couple";
  else if (/solo|seul(e)?\b|alone/i.test(q)) travelType = "solo";
  else if (/amis|friends/i.test(q)) travelType = "friends";
  else if (/groupe|group/i.test(q)) travelType = "group";

  let hotelTier: string | undefined;
  if (/econom|pas cher|cheap|backpack/i.test(q)) hotelTier = "economy";
  else if (/luxe|premium|5\s*\*|haut de gamme/i.test(q)) hotelTier = "premium";
  else if (/confort|comfort|4\s*\*/i.test(q)) hotelTier = "comfort";
  else if (/standard|milieu/i.test(q)) hotelTier = "standard";

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
    travelType,
    hotelTier,
  };
}

function formatTripAnswer(plan: TripPlan, locale: Locale): string {
  const isFr = locale === "fr";
  const kindLabel = (kind?: string) => {
    if (!kind) return "";
    const map: Record<string, [string, string]> = {
      nature: ["Nature", "Nature"],
      culture: ["Culture", "Culture"],
      visit: ["Visite", "Visit"],
      restaurant: ["Restaurant", "Restaurant"],
      hotel: ["Hébergement", "Stay"],
      transport: ["Transport", "Transport"],
    };
    const pair = map[kind];
    if (!pair) return "";
    return isFr ? pair[0] : pair[1];
  };

  const pref = plan.preferences;
  const prefsLine = pref
    ? isFr
      ? `Préférences : groupe « ${pref.partyStyle} » · hôtel ${pref.hotelTier} (~${pref.nightlyHotelBudgetFcfa.toLocaleString("fr-FR")} FCFA/chambre/nuit, ${pref.roomsNeeded} ch.) · intérêts ${pref.interests.join(", ")}.`
      : `Preferences: « ${pref.partyStyle} » party · ${pref.hotelTier} hotels (~${pref.nightlyHotelBudgetFcfa.toLocaleString("en-US")} FCFA/room/night, ${pref.roomsNeeded} room(s)) · interests ${pref.interests.join(", ")}.`
    : "";

  const days = plan.days
    .map((d) => {
      const acts = d.activities
        .map((a) => {
          const tag = kindLabel(a.kind);
          const prefix = tag ? `[${tag}] ` : "";
          const cost =
            a.costFcfa > 0
              ? ` · ~${formatCost(a.costFcfa, locale)}`
              : "";
          return `  • ${a.time} — ${prefix}${a.name}${cost}`;
        })
        .join("\n");
      return `${d.title} (~${formatCost(d.estimatedCostFcfa, locale)})\n${acts}`;
    })
    .join("\n\n");

  const reco =
    plan.recommendations && plan.recommendations.length
      ? [
          "",
          isFr ? "Recommandations :" : "Recommendations:",
          ...plan.recommendations.map((r) => `• ${r}`),
        ].join("\n")
      : "";

  if (isFr) {
    return [
      plan.summary,
      prefsLine,
      "",
      days,
      "",
      `Budget estimé : ${formatCost(plan.totalEstimatedFcfa, locale)}.`,
      plan.budgetNote,
      reco,
      "",
      "Dites-moi si vous préférez plus de nature, un hôtel plus simple, ou un rythme famille — je réajuste.",
    ]
      .filter(Boolean)
      .join("\n");
  }

  return [
    plan.summary,
    prefsLine,
    "",
    days,
    "",
    `Estimated budget: ${formatCost(plan.totalEstimatedFcfa, locale)}.`,
    plan.budgetNote,
    reco,
    "",
    "Tell me if you want more nature, a simpler hotel, or a family pace — I’ll adjust.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildRagAnswer(
  query: string,
  locale: Locale,
  catalog: Destination[] = localDestinations,
): {
  answer: string;
  sourceIds: string[];
  tripPlan?: TripPlan;
  knowledgeHits?: KbHit[];
  mode?: "greeting" | "learn" | "trip" | "knowledge" | "places" | "fallback";
} {
  const { destinations: ctx, culture, learn, expressions: exprs } = retrieveContext(
    query,
    6,
    catalog,
  );
  const isFr = locale === "fr";
  const kbHits = retrieveKnowledge(query, locale, 5);

  const wantsPhrases =
    learn &&
    exprs.length > 0 &&
    /(expression|phrase|apprend|learn|salutations?|greetings?)/i.test(query);

  if (wantsPhrases) {
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
      knowledgeHits: kbHits,
      mode: "learn",
    };
  }

  // Trip plans first (budget + days) — before country-knowledge routing
  const tripIntent = parseTripIntent(query);
  if (tripIntent) {
    const plan = generateTripPlan(
      {
        destination: tripIntent.destination,
        days: tripIntent.days,
        budgetFcfa: tripIntent.budgetFcfa,
        people: tripIntent.people,
        interests: tripIntent.interests,
        travelType: tripIntent.travelType,
        hotelTier: tripIntent.hotelTier,
        locale,
      },
      catalog,
    );
    return {
      answer: formatTripAnswer(plan, locale),
      sourceIds: plan.placeIds,
      tripPlan: plan,
      knowledgeHits: kbHits,
      mode: "trip",
    };
  }

  // Country / practical / culture knowledge before place dumps
  if (isKnowledgeQuestion(query) && kbHits.length > 0) {
    return {
      answer: formatKnowledgeAnswer(kbHits, locale),
      sourceIds: [],
      knowledgeHits: kbHits,
      mode: "knowledge",
    };
  }

  // Named language + learn intent without explicit "phrase" still offers expressions
  // (skip when the visitor asks a general knowledge question about languages)
  if (learn && exprs.length > 0 && !isKnowledgeQuestion(query)) {
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
      knowledgeHits: kbHits,
      mode: "learn",
    };
  }

  if (culture && ctx.length === 0) {
    return {
      answer: isFr
        ? `L’aire culturelle ${culture.nameFr} : ${culture.summaryFr}\n\nÀ explorer notamment : ${culture.themes.join(", ")}.\n\nDites-moi combien de jours vous avez, ou une ville de départ, et je vous propose un parcours concret.`
        : `The ${culture.nameEn} cultural area: ${culture.summaryEn}\n\nWorth exploring: ${culture.themes.join(", ")}.\n\nTell me how many days you have, or a starting city, and I’ll suggest a concrete route.`,
      sourceIds: [],
      knowledgeHits: kbHits,
      mode: "knowledge",
    };
  }

  if (ctx.length === 0) {
    if (kbHits.length > 0) {
      return {
        answer: formatKnowledgeAnswer(kbHits, locale),
        sourceIds: [],
        knowledgeHits: kbHits,
        mode: "knowledge",
      };
    }
    return {
      answer: isFr
        ? "Je n’ai pas assez d’éléments précis pour cette question. Reformulez avec une ville (Yaoundé, Douala, Kribi, Foumban, Limbé…), une aire culturelle (Sawa, Grassfields, Fang-Beti, Sudano-Sahelian), ou un thème (histoire, visa, climat, gastronomie), et je vous guide."
        : "I don’t have enough specifics for that yet. Try a city (Yaoundé, Douala, Kribi, Foumban, Limbé…), a cultural area (Sawa, Grassfields, Fang-Beti, Sudano-Sahelian), or a theme (history, visa, climate, food), and I’ll guide you.",
      sourceIds: [],
      knowledgeHits: [],
      mode: "fallback",
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

  // Light KB garnish when places answer a tourism ask
  const kbNote =
    kbHits.length > 0 && isKnowledgeQuestion(query)
      ? isFr
        ? `\n\nRepère pays : ${kbHits[0].body.slice(0, 180)}…`
        : `\n\nCountry note: ${kbHits[0].body.slice(0, 180)}…`
      : "";

  return {
    answer: `${intro}\n\n${list}${budgetNote}${kbNote}${outro}`,
    sourceIds: topPlaces.map((d) => d.id),
    knowledgeHits: kbHits,
    mode: "places",
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
  const kbHits = retrieveKnowledge(query, locale, 5);
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
  const kbBlock = formatKnowledgeFacts(kbHits, locale);
  const parts = [kbBlock, lines.join("\n"), cultureLine, exprLines]
    .map((p) => p.trim())
    .filter(Boolean);
  return {
    facts: parts.join("\n\n").trim() || "(no matches)",
    sourceIds: destinations.map((d) => d.id),
    knowledgeHits: kbHits,
    localFactsThin: destinations.length === 0 && kbHits.length < 2,
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
