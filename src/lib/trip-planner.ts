import { destinations as localDestinations } from "@/data/destinations";
import { hotels, type Hotel } from "@/data/hotels";
import { restaurants, type Restaurant } from "@/data/restaurants";
import { getLocalizedDestination } from "./localize-place";
import type {
  DayPlan,
  Destination,
  DestinationCategory,
  Locale,
  TripActivityKind,
  TripPlan,
  TripRequest,
} from "./types";

const NATURE_CATS = new Set<DestinationCategory>([
  "parc",
  "reserve",
  "plage",
  "cascade",
  "montagne",
]);
const CULTURE_CATS = new Set<DestinationCategory>([
  "patrimoine",
  "musee",
  "monument",
  "artisanat",
  "festival",
]);

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();
}

function cityMatches(city: string, destination: string) {
  const c = normalize(city);
  const q = normalize(destination);
  if (!q) return false;
  return c.includes(q) || q.includes(c) || c.startsWith(q.slice(0, 4));
}

function matchCity(destination: string, catalog: Destination[]) {
  const q = normalize(destination);
  const direct = catalog.filter(
    (d) =>
      cityMatches(d.city, q) ||
      cityMatches(d.cityEn, q) ||
      normalize(d.region).includes(q) ||
      normalize(d.regionEn).includes(q) ||
      normalize(d.name).includes(q) ||
      normalize(d.nameEn).includes(q),
  );
  if (direct.length >= 3) return direct;

  // Expand thin city pools with same cultural region (e.g. Yaoundé → Centre)
  const zones = new Set(direct.map((d) => d.culturalZone));
  if (zones.size === 0 && /yaound/.test(q)) zones.add("Fang-Beti");
  if (zones.size === 0 && /douala|kribi|limbe|limb/.test(q)) zones.add("Sawa");
  if (zones.size === 0 && /bafoussam|foumban|bamenda|dschang/.test(q))
    zones.add("Grassfields");
  if (zones.size === 0 && /maroua|garoua|waza|ngaound/.test(q))
    zones.add("Sudano-Sahelian");

  const expanded = catalog.filter(
    (d) =>
      direct.some((x) => x.id === d.id) ||
      zones.has(d.culturalZone) ||
      (direct[0] && normalize(d.region) === normalize(direct[0].region)),
  );
  return expanded.length ? expanded : direct;
}

function mealUnitCost(
  priceFromXaf: number | null,
  economy: boolean,
  budgetFcfa: number,
  people: number,
) {
  const base = priceFromXaf ?? (economy ? 2500 : 4000);
  // Cap per-person meal so family plans stay realistic
  const perPersonCap = Math.max(
    2000,
    Math.min(economy ? 3500 : 6000, Math.floor(budgetFcfa / (people * 6))),
  );
  return Math.min(base, perPersonCap);
}

function lodgingCost(
  priceFromXaf: number | null,
  people: number,
  economy: boolean,
  budgetFcfa: number,
  days: number,
) {
  const room = priceFromXaf ?? (economy ? 15000 : 22000);
  const rooms = Math.max(1, Math.ceil(people / 2));
  let cost = room * rooms;
  // Soft ceiling: lodging should not eat more than ~40% of remaining daily share
  const dailyShare = budgetFcfa / Math.max(1, days);
  const lodgingCap = Math.max(12000, dailyShare * 0.45);
  if (cost > lodgingCap) cost = lodgingCap;
  if (economy) cost *= 0.9;
  return Math.round(cost / 500) * 500;
}

function matchHotels(destination: string, list: Hotel[] = hotels) {
  const hits = list.filter((h) => cityMatches(h.city, destination));
  return hits.length ? hits : list.filter((h) => cityMatches(h.city, "yaound"));
}

function matchRestaurants(destination: string, list: Restaurant[] = restaurants) {
  const hits = list.filter((r) => cityMatches(r.city, destination));
  return hits.length
    ? hits
    : list.filter((r) => cityMatches(r.city, "yaound") || cityMatches(r.city, "douala"));
}

function interestScore(dest: Destination, interests: string[]) {
  const blob = [
    dest.category,
    ...dest.activities,
    ...dest.ecoTags,
    dest.culturalZone,
    dest.descriptionFr,
    dest.descriptionEn,
  ]
    .join(" ")
    .toLowerCase();
  let s = 0;
  for (const i of interests) {
    const t = i.trim().toLowerCase();
    if (t && blob.includes(t)) s += 3;
  }
  if (interests.some((i) => /eco|respons/i.test(i)) && dest.ecoTags.length) s += 5;
  if (interests.some((i) => /culture|patrimoine|heritage/i.test(i))) {
    if (CULTURE_CATS.has(dest.category)) s += 5;
    else s += 2;
  }
  if (interests.some((i) => /nature|parc|mont|forêt|forest|plage|beach|cascade/i.test(i))) {
    if (NATURE_CATS.has(dest.category)) s += 5;
  }
  if (interests.some((i) => /plage|beach|mer|ocean/i.test(i)) && dest.category === "plage") {
    s += 4;
  }
  if (interests.some((i) => /gastro|food|cuisine|manger|eat|restaurant/i.test(i))) {
    if (dest.category === "gastronomie" || dest.category === "restauration") s += 4;
  }
  return s;
}

function kindForDestination(dest: Destination): TripActivityKind {
  if (NATURE_CATS.has(dest.category)) return "nature";
  if (CULTURE_CATS.has(dest.category)) return "culture";
  if (dest.category === "restauration" || dest.category === "gastronomie") return "restaurant";
  if (dest.category === "hebergement") return "hotel";
  return "visit";
}

function shortNote(text: string, max = 110) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trim()}…`;
}

function pickRoundRobin<T>(list: T[], used: Set<number>, fallbackIndex: number): T | null {
  if (list.length === 0) return null;
  for (let i = 0; i < list.length; i++) {
    const idx = (fallbackIndex + i) % list.length;
    if (!used.has(idx)) {
      used.add(idx);
      return list[idx];
    }
  }
  return list[fallbackIndex % list.length];
}

function sortByBudget<T extends { priceFromXaf: number | null }>(list: T[], budgetFcfa: number) {
  return [...list].sort((a, b) => {
    const pa = a.priceFromXaf ?? 15000;
    const pb = b.priceFromXaf ?? 15000;
    const softCap = Math.max(8000, Math.floor(budgetFcfa / 8));
    const aOk = pa <= softCap ? 0 : 1;
    const bOk = pb <= softCap ? 0 : 1;
    return aOk - bOk || pa - pb;
  });
}

function splitVisitPool(pool: Destination[], interests: string[]) {
  const wantsNature = interests.some((i) =>
    /nature|parc|mont|forêt|forest|plage|beach|cascade|eco/i.test(i),
  );
  const wantsCulture = interests.some((i) =>
    /culture|patrimoine|heritage|mus[eé]e|artisan/i.test(i),
  );

  const visitWorthy = pool.filter(
    (d) => d.category !== "hebergement" && d.category !== "restauration",
  );
  const base = visitWorthy.length ? visitWorthy : pool;

  let nature = base.filter((d) => NATURE_CATS.has(d.category));
  let culture = base.filter((d) => CULTURE_CATS.has(d.category));
  const other = base.filter(
    (d) => !NATURE_CATS.has(d.category) && !CULTURE_CATS.has(d.category),
  );

  if (nature.length === 0) nature = other.length ? other : base;
  if (culture.length === 0) culture = other.length ? other : base;

  if (wantsNature && !wantsCulture) {
    return { morningPool: nature, afternoonPool: culture.length ? culture : other.length ? other : base };
  }
  if (wantsCulture && !wantsNature) {
    return { morningPool: culture, afternoonPool: nature.length ? nature : other.length ? other : base };
  }
  return {
    morningPool: culture.length ? culture : base,
    afternoonPool: nature.length ? nature : base,
  };
}

/** Pick visit slots so consecutive days rotate even with a tiny catalogue. */
function pickVisit(
  pool: Destination[],
  dayIndex: number,
  slot: "morning" | "afternoon",
  avoidId?: string,
): Destination | null {
  if (pool.length === 0) return null;
  const offset = slot === "morning" ? 0 : Math.ceil(pool.length / 2);
  let idx = (dayIndex + offset) % pool.length;
  let pick = pool[idx];
  if (avoidId && pool.length > 1 && pick.id === avoidId) {
    pick = pool[(idx + 1) % pool.length];
  }
  return pick;
}

function buildRichDays(
  pool: Destination[],
  req: TripRequest,
  isFr: boolean,
  economy = false,
): TripPlan {
  const locale: Locale = isFr ? "fr" : "en";
  const interests = req.interests.length ? req.interests : ["culture", "nature", "food"];
  const { morningPool, afternoonPool } = splitVisitPool(pool, interests);

  const hotelPool = sortByBudget(matchHotels(req.destination), req.budgetFcfa);
  const restoPool = sortByBudget(matchRestaurants(req.destination), req.budgetFcfa);

  const usedLunch = new Set<number>();
  const usedDinner = new Set<number>();
  const usedHotel = new Set<number>();

  const days: DayPlan[] = [];
  const placeIds: string[] = [];
  const stayIds: string[] = [];
  const eatIds: string[] = [];
  let total = 0;

  const transportPerDay = economy ? 3500 : 5000;
  const mealPeopleFactor = Math.max(1, req.people);
  // Unified visit rotation across culture + nature for variety
  const visitPool = [
    ...new Map(
      [...morningPool, ...afternoonPool, ...pool].map((d) => [d.id, d]),
    ).values(),
  ].filter((d) => d.category !== "hebergement" && d.category !== "restauration");

  for (let day = 1; day <= req.days; day++) {
    const activities: DayPlan["activities"] = [];
    let dayCost = 0;
    const dayIndex = day - 1;

    // Morning visit — rotate full visit pool when a single category is too thin
    const morningSource =
      morningPool.length >= 2 ? morningPool : visitPool.length ? visitPool : morningPool;
    const afternoonSource =
      afternoonPool.length >= 2
        ? afternoonPool
        : visitPool.length
          ? visitPool
          : afternoonPool;

    const morning = pickVisit(morningSource, dayIndex, "morning");
    if (morning) {
      const loc = getLocalizedDestination(morning, locale);
      const cost = economy
        ? Math.min(morning.estimatedCostFcfa, 5000)
        : morning.estimatedCostFcfa;
      placeIds.push(morning.id);
      activities.push({
        name: loc.name,
        time: "09:00 – 12:00",
        kind: kindForDestination(morning),
        costFcfa: cost,
        notes: shortNote(loc.description),
        placeId: morning.id,
        transport: isFr
          ? `Trajet local (~${transportPerDay.toLocaleString("fr-FR")} FCFA)`
          : `Local transport (~${transportPerDay.toLocaleString("en-US")} FCFA)`,
      });
      dayCost += cost + transportPerDay;
    }

    // Lunch restaurant
    const lunch = pickRoundRobin(restoPool, usedLunch, dayIndex);
    if (lunch) {
      const unit = mealUnitCost(
        lunch.priceFromXaf,
        economy,
        req.budgetFcfa,
        mealPeopleFactor,
      );
      const cost = unit * mealPeopleFactor;
      eatIds.push(lunch.id);
      activities.push({
        name: isFr
          ? `Déjeuner · ${lunch.name}${lunch.neighbourhood ? ` (${lunch.neighbourhood})` : ""}`
          : `Lunch · ${lunch.nameEn || lunch.name}${lunch.neighbourhood ? ` (${lunch.neighbourhood})` : ""}`,
        time: "12:30 – 14:00",
        kind: "restaurant",
        costFcfa: cost,
        meal: isFr
          ? `Repas pour ${req.people} (~${cost.toLocaleString("fr-FR")} FCFA)`
          : `Meal for ${req.people} (~${cost.toLocaleString("en-US")} FCFA)`,
        notes: shortNote(isFr ? lunch.descriptionFr : lunch.descriptionEn),
      });
      dayCost += cost;
    }

    // Afternoon visit — rotate & avoid duplicating morning when possible
    const afternoon = pickVisit(
      afternoonSource,
      dayIndex,
      "afternoon",
      morning?.id,
    );
    if (afternoon) {
      const loc = getLocalizedDestination(afternoon, locale);
      const cost = economy
        ? Math.min(afternoon.estimatedCostFcfa, 4000)
        : afternoon.estimatedCostFcfa;
      placeIds.push(afternoon.id);
      activities.push({
        name: loc.name,
        time: "15:00 – 18:00",
        kind: kindForDestination(afternoon),
        costFcfa: cost,
        notes: shortNote(loc.description),
        placeId: afternoon.id,
      });
      dayCost += cost;
    }

    // Dinner restaurant
    const dinner = pickRoundRobin(restoPool, usedDinner, dayIndex + 3);
    if (dinner) {
      const unit = mealUnitCost(
        dinner.priceFromXaf,
        economy,
        req.budgetFcfa,
        mealPeopleFactor,
      );
      const cost = unit * mealPeopleFactor;
      eatIds.push(dinner.id);
      activities.push({
        name: isFr
          ? `Dîner · ${dinner.name}${dinner.neighbourhood ? ` (${dinner.neighbourhood})` : ""}`
          : `Dinner · ${dinner.nameEn || dinner.name}${dinner.neighbourhood ? ` (${dinner.neighbourhood})` : ""}`,
        time: "19:00 – 21:00",
        kind: "restaurant",
        costFcfa: cost,
        meal: isFr
          ? `Dîner pour ${req.people} (~${cost.toLocaleString("fr-FR")} FCFA)`
          : `Dinner for ${req.people} (~${cost.toLocaleString("en-US")} FCFA)`,
        notes: shortNote(isFr ? dinner.descriptionFr : dinner.descriptionEn),
      });
      dayCost += cost;
    }

    // Lodging for every night except after last day (unless single-day overnight)
    if (day < req.days || req.days === 1) {
      const hotel = pickRoundRobin(hotelPool, usedHotel, dayIndex);
      if (hotel) {
        const rounded = lodgingCost(
          hotel.priceFromXaf,
          req.people,
          economy,
          req.budgetFcfa,
          req.days,
        );
        stayIds.push(hotel.id);
        activities.push({
          name: isFr
            ? `Nuit · ${hotel.name}${hotel.neighbourhood ? ` (${hotel.neighbourhood})` : ""}`
            : `Stay · ${hotel.nameEn || hotel.name}${hotel.neighbourhood ? ` (${hotel.neighbourhood})` : ""}`,
          time: isFr ? "Soirée / nuit" : "Evening / night",
          kind: "hotel",
          costFcfa: rounded,
          notes: shortNote(isFr ? hotel.descriptionFr : hotel.descriptionEn, 100),
        });
        dayCost += rounded;
      }
    }

    const focusName = morning
      ? getLocalizedDestination(morning, locale).name
      : req.destination;

    days.push({
      day,
      title: isFr ? `Jour ${day} : ${focusName}` : `Day ${day} : ${focusName}`,
      activities,
      estimatedCostFcfa: dayCost,
    });
    total += dayCost;
  }

  const interestLabel = interests.join(", ");
  const summary = isFr
    ? `Programme ${req.days} jour(s) pour ${req.people} personne(s) à ${req.destination} — nature, culture, restaurants et hébergement (${interestLabel}).`
    : `${req.days}-day plan for ${req.people} people in ${req.destination} — nature, culture, restaurants and lodging (${interestLabel}).`;

  return {
    summary,
    days,
    totalEstimatedFcfa: total,
    withinBudget: total <= req.budgetFcfa,
    budgetNote: isFr
      ? "Estimation : visites + repas (restaurants) + nuits (hôtels). Transport interurbain non inclus."
      : "Estimate: visits + meals (restaurants) + nights (hotels). Intercity transport not included.",
    placeIds: [...new Set(placeIds)],
    stayIds: [...new Set(stayIds)],
    eatIds: [...new Set(eatIds)],
  };
}

export function generateTripPlan(
  req: TripRequest,
  catalog: Destination[] = localDestinations,
): TripPlan {
  const locale = req.locale ?? "fr";
  const isFr = locale === "fr";
  let pool = matchCity(req.destination, catalog);
  if (pool.length === 0) {
    pool = catalog.filter((d) => normalize(d.city).includes("yaound"));
  }
  if (pool.length === 0) pool = catalog.slice(0, 8);

  const interests = req.interests.length
    ? req.interests
    : ["culture", "nature", "food"];

  pool = [...pool]
    .map((d) => ({ d, s: interestScore(d, interests) }))
    .sort((a, b) => b.s - a.s || a.d.estimatedCostFcfa - b.d.estimatedCostFcfa)
    .map((x) => x.d);

  // Prefer a mix: ensure nature + culture present when available in city/region
  const mixed = [
    ...pool.filter((d) => CULTURE_CATS.has(d.category)),
    ...pool.filter((d) => NATURE_CATS.has(d.category)),
    ...pool,
  ];
  const seen = new Set<string>();
  pool = mixed.filter((d) => {
    if (seen.has(d.id)) return false;
    seen.add(d.id);
    return true;
  });

  const plan = buildRichDays(pool, { ...req, interests }, isFr, false);

  if (plan.totalEstimatedFcfa <= req.budgetFcfa) {
    plan.budgetNote = isFr
      ? "Itinéraire dans votre budget (visites, restaurants, hôtels — estimation)."
      : "Itinerary within your budget (visits, restaurants, hotels — estimate).";
    plan.withinBudget = true;
    return plan;
  }

  return scaleToBudget(req.budgetFcfa, pool, { ...req, interests }, isFr);
}

function scaleToBudget(
  budget: number,
  pool: Destination[],
  req: TripRequest,
  isFr: boolean,
): TripPlan {
  const cheap = [...pool].sort((a, b) => a.estimatedCostFcfa - b.estimatedCostFcfa);
  let reduced = buildRichDays(cheap, { ...req, budgetFcfa: budget }, isFr, true);

  if (reduced.totalEstimatedFcfa > budget && req.days > 2) {
    reduced = buildRichDays(
      cheap,
      { ...req, budgetFcfa: budget, days: Math.max(2, req.days - 1) },
      isFr,
      true,
    );
  }

  if (reduced.totalEstimatedFcfa > budget) {
    const minimal = buildRichDays(
      cheap.slice(0, Math.min(4, cheap.length)),
      { ...req, budgetFcfa: budget, days: 1 },
      isFr,
      true,
    );
    minimal.budgetNote = isFr
      ? `Budget recalculé : version économique avec resto + nuit (~${minimal.totalEstimatedFcfa.toLocaleString("fr-FR")} FCFA).`
      : `Budget recalculated: economy version with restaurant + stay (~${minimal.totalEstimatedFcfa.toLocaleString("en-US")} FCFA).`;
    minimal.withinBudget = minimal.totalEstimatedFcfa <= budget;
    return minimal;
  }

  reduced.budgetNote = isFr
    ? `Itinéraire ajusté (resto + hôtel inclus) pour environ ${budget.toLocaleString("fr-FR")} FCFA.`
    : `Itinerary adjusted (restaurant + hotel included) to about ${budget.toLocaleString("en-US")} FCFA.`;
  reduced.withinBudget = reduced.totalEstimatedFcfa <= budget;
  return reduced;
}

export function recalculateBudget(
  _plan: TripPlan,
  newBudget: number,
  req: TripRequest,
  catalog?: Destination[],
): TripPlan {
  return generateTripPlan({ ...req, budgetFcfa: newBudget }, catalog);
}
