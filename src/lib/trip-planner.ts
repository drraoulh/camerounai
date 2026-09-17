import { destinations as localDestinations } from "@/data/destinations";
import { hotels, type Hotel } from "@/data/hotels";
import { restaurants, type Restaurant } from "@/data/restaurants";
import { getLocalizedDestination } from "./localize-place";
import type {
  DayPlan,
  Destination,
  DestinationCategory,
  HotelTier,
  Locale,
  PartyStyle,
  TripActivityKind,
  TripPlan,
  TripPreferences,
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

const TIER_PRICE: Record<HotelTier, { min: number; max: number; labelFr: string; labelEn: string }> =
  {
    economy: { min: 0, max: 22000, labelFr: "économique", labelEn: "economy" },
    standard: { min: 18000, max: 45000, labelFr: "standard", labelEn: "standard" },
    comfort: { min: 35000, max: 80000, labelFr: "confort", labelEn: "comfort" },
    premium: { min: 70000, max: 500000, labelFr: "premium", labelEn: "premium" },
  };

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

export function inferPartyStyle(
  people: number,
  interests: string[],
  travelType?: string,
): PartyStyle {
  const t = (travelType || "").toLowerCase();
  if (/famille|family/.test(t) || interests.some((i) => /famille|family|enfant|kids/i.test(i)))
    return "family";
  if (/couple|romantique|honeymoon/.test(t) || (people === 2 && /couple/i.test(t)))
    return "couple";
  if (/amis|friends/.test(t)) return "friends";
  if (/groupe|group/.test(t) || people >= 6) return "group";
  if (people === 1 || /solo|seul/.test(t)) return "solo";
  if (people === 2) return "couple";
  if (people >= 3 && people <= 5) return "family";
  return "group";
}

/**
 * Nightly room budget from total trip budget.
 * lodging ≈ 40–50% of trip, split across nights and rooms.
 */
export function inferHotelTier(
  budgetFcfa: number,
  days: number,
  people: number,
  explicit?: string,
): HotelTier {
  if (explicit && /econom|budget|pas cher|cheap/i.test(explicit)) return "economy";
  if (explicit && /premium|luxe|luxury|5\s*\*|haut/.test(explicit)) return "premium";
  if (explicit && /confort|comfort|4\s*\*/.test(explicit)) return "comfort";
  if (explicit && /standard|milieu|mid/.test(explicit)) return "standard";

  const nights = Math.max(1, days - (days > 1 ? 1 : 0) || days);
  const rooms = Math.max(1, Math.ceil(people / 2));
  const lodgingShare = budgetFcfa * 0.42;
  const perRoomNight = lodgingShare / (nights * rooms);

  if (perRoomNight < 20000) return "economy";
  if (perRoomNight < 40000) return "standard";
  if (perRoomNight < 75000) return "comfort";
  return "premium";
}

export function buildPreferences(req: TripRequest): TripPreferences {
  const interests = req.interests.length
    ? req.interests
    : ["culture", "nature", "food"];
  const partyStyle = inferPartyStyle(req.people, interests, req.travelType);
  const hotelTier = inferHotelTier(
    req.budgetFcfa,
    req.days,
    req.people,
    req.hotelTier || req.travelType,
  );
  const nights = Math.max(1, req.days > 1 ? req.days - 1 : 1);
  // Families often take an apartment / family room; couples & friends = classic double rooms
  const roomsNeeded =
    partyStyle === "family"
      ? Math.max(1, Math.ceil(req.people / 4))
      : partyStyle === "group"
        ? Math.max(1, Math.ceil(req.people / 3))
        : Math.max(1, Math.ceil(req.people / 2));
  const nightlyHotelBudgetFcfa = Math.round(
    (req.budgetFcfa * 0.42) / (nights * roomsNeeded),
  );
  return {
    hotelTier,
    partyStyle,
    interests,
    perPersonBudgetFcfa: Math.round(req.budgetFcfa / Math.max(1, req.people)),
    nightlyHotelBudgetFcfa: Math.max(10000, nightlyHotelBudgetFcfa),
    roomsNeeded,
  };
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

/** Rank hotels for the traveler's tier + nightly budget + party. */
function rankHotels(
  list: Hotel[],
  prefs: TripPreferences,
  economy: boolean,
): Hotel[] {
  const tier = economy
    ? "economy"
    : prefs.hotelTier;
  const band = TIER_PRICE[tier];
  const target = Math.min(prefs.nightlyHotelBudgetFcfa, band.max);
  const minOk = Math.max(band.min * 0.4, target * 0.25);

  return [...list]
    .map((h) => {
      const price = h.priceFromXaf ?? target;
      let score = 0;
      if (price >= band.min && price <= band.max) score += 20;
      else if (price <= target * 1.15) score += 10;
      const dist = Math.abs(price - target);
      score += Math.max(0, 15 - dist / 4000);
      if (price < minOk) score -= 4;
      if (price > target * 1.35) score -= 14;
      if (economy && price <= target) score += 10;
      if (economy) score += Math.max(0, 12 - price / 3000); // prefer cheaper
      if (prefs.partyStyle === "family" && /famil|appart|résidence|residence/i.test(h.name + h.descriptionFr))
        score += 6;
      if (prefs.partyStyle === "couple" && /spa|romantique|suite|luxe/i.test(h.descriptionFr))
        score += 4;
      if (prefs.partyStyle === "solo" && price <= target) score += 3;
      return { h, score, price };
    })
    .sort((a, b) =>
      economy ? a.price - b.price || b.score - a.score : b.score - a.score || a.price - b.price,
    )
    .map((x) => x.h);
}

function rankRestaurants(
  list: Restaurant[],
  prefs: TripPreferences,
  economy: boolean,
): Restaurant[] {
  const perPersonMeal =
    prefs.hotelTier === "economy" || economy
      ? 2200
      : prefs.hotelTier === "standard"
        ? 4500
        : prefs.hotelTier === "comfort"
          ? 7000
          : 11000;
  const target = economy ? Math.min(perPersonMeal, 2200) : perPersonMeal;
  const foodFocus = prefs.interests.some((i) =>
    /food|gastro|cuisine|restaurant|manger|eat/i.test(i),
  );

  return [...list]
    .map((r) => {
      const price = r.priceFromXaf ?? target;
      let score = 0;
      const dist = Math.abs(price - target);
      score += Math.max(0, 12 - dist / 800);
      if (price <= target * 1.25) score += 6;
      if (price > target * 1.6) score -= 10;
      if (economy && price <= 3500) score += 8;
      if (economy) score += Math.max(0, 10 - price / 800);
      if (foodFocus) score += 3;
      if (
        prefs.partyStyle === "family" &&
        /famil|grill|poulet|maquis|buffet/i.test(r.name + r.descriptionFr)
      )
        score += 4;
      if (
        prefs.partyStyle === "couple" &&
        /lounge|rooftop|wine|cave|chic|gastronom/i.test(r.name + r.descriptionFr)
      )
        score += 4;
      return { r, score, price };
    })
    .sort((a, b) =>
      economy ? a.price - b.price || b.score - a.score : b.score - a.score || a.price - b.price,
    )
    .map((x) => x.r);
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
    if (CULTURE_CATS.has(dest.category)) s += 8;
    else s += 1;
  }
  if (interests.some((i) => /nature|parc|mont|forêt|forest|cascade/i.test(i))) {
    if (NATURE_CATS.has(dest.category) && dest.category !== "plage") s += 8;
  }
  if (interests.some((i) => /plage|beach|mer|ocean/i.test(i)) && dest.category === "plage") {
    s += 10;
  }
  if (interests.some((i) => /gastro|food|cuisine|manger|eat|restaurant/i.test(i))) {
    if (dest.category === "gastronomie" || dest.category === "restauration") s += 4;
  }
  // Penalize off-interest categories when traveler was specific
  const specific =
    interests.filter((i) =>
      /culture|nature|plage|beach|eco|patrimoine/i.test(i),
    ).length >= 1;
  if (specific) {
    const wantsNature = interests.some((i) => /nature|parc|plage|beach|eco/i.test(i));
    const wantsCulture = interests.some((i) => /culture|patrimoine|heritage|mus/i.test(i));
    if (wantsNature && !wantsCulture && CULTURE_CATS.has(dest.category)) s -= 2;
    if (wantsCulture && !wantsNature && NATURE_CATS.has(dest.category)) s -= 2;
  }
  return s;
}

function kindForDestination(dest: Destination): TripActivityKind {
  if (NATURE_CATS.has(dest.category)) return "nature";
  if (CULTURE_CATS.has(dest.category)) return "culture";
  if (dest.category === "restauration" || dest.category === "gastronomie")
    return "restaurant";
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

function splitVisitPool(pool: Destination[], interests: string[]) {
  const wantsNature = interests.some((i) =>
    /nature|parc|mont|forêt|forest|plage|beach|cascade|eco/i.test(i),
  );
  const wantsCulture = interests.some((i) =>
    /culture|patrimoine|heritage|mus[eé]e|artisan/i.test(i),
  );
  const wantsBeach = interests.some((i) => /plage|beach|mer|ocean/i.test(i));

  const visitWorthy = pool.filter(
    (d) => d.category !== "hebergement" && d.category !== "restauration",
  );
  const base = visitWorthy.length ? visitWorthy : pool;

  let nature = base.filter((d) => NATURE_CATS.has(d.category));
  let culture = base.filter((d) => CULTURE_CATS.has(d.category));
  const beach = base.filter((d) => d.category === "plage");
  const other = base.filter(
    (d) => !NATURE_CATS.has(d.category) && !CULTURE_CATS.has(d.category),
  );

  if (wantsBeach && beach.length) nature = [...beach, ...nature.filter((d) => d.category !== "plage")];
  if (nature.length === 0) nature = other.length ? other : base;
  if (culture.length === 0) culture = other.length ? other : base;

  // Interest-led day shape
  if (wantsBeach || (wantsNature && !wantsCulture)) {
    return {
      morningPool: nature,
      afternoonPool: nature.length > 1 ? nature : culture.length ? culture : other,
    };
  }
  if (wantsCulture && !wantsNature) {
    return {
      morningPool: culture,
      afternoonPool: culture.length > 1 ? culture : nature.length ? nature : other,
    };
  }
  return {
    morningPool: culture.length ? culture : base,
    afternoonPool: nature.length ? nature : base,
  };
}

function pickVisit(
  pool: Destination[],
  dayIndex: number,
  slot: "morning" | "afternoon",
  avoidId?: string,
): Destination | null {
  if (pool.length === 0) return null;
  const offset = slot === "morning" ? 0 : Math.ceil(pool.length / 2);
  const idx = (dayIndex + offset) % pool.length;
  let pick = pool[idx];
  if (avoidId && pool.length > 1 && pick.id === avoidId) {
    pick = pool[(idx + 1) % pool.length];
  }
  return pick;
}

function entryCost(base: number, people: number, partyStyle: PartyStyle) {
  // Catalogue costs are roughly per adult visitor; families get a soft child discount
  if (partyStyle === "family" && people > 2) {
    return Math.round(base * 2 + base * 0.5 * (people - 2));
  }
  if (partyStyle === "group" && people > 4) {
    return Math.round(base * people * 0.85);
  }
  return base * people;
}

function mealUnitCost(
  priceFromXaf: number | null,
  economy: boolean,
  prefs: TripPreferences,
) {
  const tierDefault =
    prefs.hotelTier === "economy"
      ? 2200
      : prefs.hotelTier === "standard"
        ? 4000
        : prefs.hotelTier === "comfort"
          ? 6500
          : 10000;
  const base = priceFromXaf ?? (economy ? Math.min(tierDefault, 3000) : tierDefault);
  const cap =
    prefs.hotelTier === "economy"
      ? economy
        ? 3000
        : 4000
      : prefs.hotelTier === "standard"
        ? 7000
        : prefs.hotelTier === "comfort"
          ? 12000
          : 20000;
  // Family: keep meals affordable so multi-day plans survive
  const familyCap =
    prefs.partyStyle === "family" ? Math.min(cap, economy ? 2800 : 4500) : cap;
  return Math.min(base, familyCap);
}

function lodgingCost(
  priceFromXaf: number | null,
  prefs: TripPreferences,
  economy: boolean,
) {
  const room = priceFromXaf ?? Math.min(prefs.nightlyHotelBudgetFcfa, economy ? 15000 : 22000);
  let cost = room * prefs.roomsNeeded;
  // Harder cap in economy so multi-day family plans fit
  const cap = economy
    ? Math.min(prefs.nightlyHotelBudgetFcfa, 18000) * prefs.roomsNeeded
    : prefs.nightlyHotelBudgetFcfa * prefs.roomsNeeded * 1.15;
  if (cost > cap) cost = cap;
  return Math.round(cost / 500) * 500;
}

function partyLabel(style: PartyStyle, isFr: boolean) {
  const map: Record<PartyStyle, [string, string]> = {
    solo: ["voyageur solo", "solo traveller"],
    couple: ["couple", "couple"],
    family: ["famille", "family"],
    friends: ["groupe d’amis", "friends"],
    group: ["groupe", "group"],
  };
  return isFr ? map[style][0] : map[style][1];
}

function buildRecommendations(
  req: TripRequest,
  prefs: TripPreferences,
  plan: Pick<TripPlan, "stayIds" | "eatIds" | "placeIds" | "withinBudget" | "totalEstimatedFcfa">,
  isFr: boolean,
): string[] {
  const tier = TIER_PRICE[prefs.hotelTier];
  const tips: string[] = [];

  tips.push(
    isFr
      ? `Hôtels ciblés : gamme ${tier.labelFr} (~${prefs.nightlyHotelBudgetFcfa.toLocaleString("fr-FR")} FCFA / chambre / nuit pour ${prefs.roomsNeeded} chambre(s)).`
      : `Hotels targeted: ${tier.labelEn} range (~${prefs.nightlyHotelBudgetFcfa.toLocaleString("en-US")} FCFA / room / night for ${prefs.roomsNeeded} room(s)).`,
  );

  tips.push(
    isFr
      ? `Profil : ${partyLabel(prefs.partyStyle, true)} · ${req.people} personne(s) · centres d’intérêt : ${prefs.interests.join(", ")}.`
      : `Profile: ${partyLabel(prefs.partyStyle, false)} · ${req.people} people · interests: ${prefs.interests.join(", ")}.`,
  );

  if (prefs.partyStyle === "family") {
    tips.push(
      isFr
        ? "Conseil famille : prévoyez des pauses à l’ombre, eau embouteillée, et demandez des chambres communicantes si possible."
        : "Family tip: plan shade breaks, bottled water, and ask for connecting rooms when possible.",
    );
  } else if (prefs.partyStyle === "couple") {
    tips.push(
      isFr
        ? "Conseil couple : gardez une soirée libre pour un dîner plus posé ; évitez les longues routes le dernier jour."
        : "Couple tip: keep one evening free for a quieter dinner; avoid long road transfers on the last day.",
    );
  } else if (prefs.partyStyle === "solo") {
    tips.push(
      isFr
        ? "Conseil solo : privilégiez taxis connus le soir et partagez votre itinéraire avec l’hôtel."
        : "Solo tip: prefer known taxis at night and share your itinerary with the hotel.",
    );
  } else {
    tips.push(
      isFr
        ? "Conseil groupe : réservez restos et activités à l’avance ; un guide local fluidifie les déplacements."
        : "Group tip: book restaurants and activities ahead; a local guide makes transfers smoother.",
    );
  }

  if (prefs.interests.some((i) => /plage|beach/i.test(i))) {
    tips.push(
      isFr
        ? "Plage : crème solaire, hydratation, et vérifiez la marée / sécurité baignade sur place."
        : "Beach: sunscreen, hydration, and check tide / swim safety on site.",
    );
  }
  if (prefs.interests.some((i) => /nature|parc|eco/i.test(i))) {
    tips.push(
      isFr
        ? "Nature : guide local recommandé dans les parcs ; respectez sentiers et consignes eco."
        : "Nature: a local guide is recommended in parks; stick to trails and eco rules.",
    );
  }
  if (prefs.interests.some((i) => /culture|patrimoine/i.test(i))) {
    tips.push(
      isFr
        ? "Culture : demandez l’autorisation avant photos dans les chefferies ou lieux sacrés."
        : "Culture: ask before photographing chiefdoms or sacred places.",
    );
  }

  if (!plan.withinBudget) {
    tips.push(
      isFr
        ? `Budget serré : total estimé ${plan.totalEstimatedFcfa.toLocaleString("fr-FR")} FCFA — on a favorisé la gamme ${tier.labelFr}.`
        : `Tight budget: estimated ${plan.totalEstimatedFcfa.toLocaleString("en-US")} FCFA — we favoured the ${tier.labelEn} range.`,
    );
  } else {
    const remaining = req.budgetFcfa - plan.totalEstimatedFcfa;
    if (remaining > 15000) {
      tips.push(
        isFr
          ? `Marge restante ~${remaining.toLocaleString("fr-FR")} FCFA : idéal pour un souvenir artisanal ou un repas signature.`
          : `About ${remaining.toLocaleString("en-US")} FCFA left: good for a craft souvenir or a signature meal.`,
      );
    }
  }

  return tips.slice(0, 6);
}

function buildRichDays(
  pool: Destination[],
  req: TripRequest,
  prefs: TripPreferences,
  isFr: boolean,
  economy = false,
): TripPlan {
  const locale: Locale = isFr ? "fr" : "en";
  const { morningPool, afternoonPool } = splitVisitPool(pool, prefs.interests);

  const hotelPool = rankHotels(matchHotels(req.destination), prefs, economy);
  const restoPool = rankRestaurants(
    matchRestaurants(req.destination),
    prefs,
    economy,
  );

  const usedLunch = new Set<number>();
  const usedDinner = new Set<number>();
  const usedHotel = new Set<number>();

  const days: DayPlan[] = [];
  const placeIds: string[] = [];
  const stayIds: string[] = [];
  const eatIds: string[] = [];
  let total = 0;

  const transportPerDay =
    economy
      ? prefs.partyStyle === "family" || prefs.partyStyle === "group"
        ? 5000
        : 3000
      : prefs.partyStyle === "group" || prefs.partyStyle === "family"
        ? 8000
        : 5000;
  const mealPeopleFactor = Math.max(1, req.people);

  const visitPool = [
    ...new Map(
      [...morningPool, ...afternoonPool, ...pool].map((d) => [d.id, d]),
    ).values(),
  ].filter((d) => d.category !== "hebergement" && d.category !== "restauration");

  // Food-focused trips: still 2 visits but lighter morning if needed
  const foodHeavy = prefs.interests.filter((i) =>
    /food|gastro|restaurant|cuisine/i.test(i),
  ).length;

  for (let day = 1; day <= req.days; day++) {
    const activities: DayPlan["activities"] = [];
    let dayCost = 0;
    const dayIndex = day - 1;

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
      let cost = entryCost(
        morning.estimatedCostFcfa,
        req.people,
        prefs.partyStyle,
      );
      if (economy) cost = Math.min(cost, 4000 * Math.min(req.people, 3));
      const visitCap =
        prefs.hotelTier === "economy"
          ? 5000 * Math.min(req.people, 3)
          : prefs.hotelTier === "premium"
            ? 25000 * req.people
            : 10000 * req.people;
      cost = Math.min(cost, visitCap);

      placeIds.push(morning.id);
      const familyNote =
        prefs.partyStyle === "family" && isFr
          ? " Adapté famille : rythme souple."
          : prefs.partyStyle === "family"
            ? " Family-friendly pace."
            : "";
      activities.push({
        name: loc.name,
        time: "09:00 – 12:00",
        kind: kindForDestination(morning),
        costFcfa: Math.round(cost),
        notes: shortNote(loc.description) + familyNote,
        placeId: morning.id,
        transport: isFr
          ? `Trajet local (~${transportPerDay.toLocaleString("fr-FR")} FCFA)`
          : `Local transport (~${transportPerDay.toLocaleString("en-US")} FCFA)`,
      });
      dayCost += Math.round(cost) + transportPerDay;
    }

    const lunch = pickRoundRobin(restoPool, usedLunch, dayIndex);
    if (lunch) {
      const unit = mealUnitCost(lunch.priceFromXaf, economy, prefs);
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

    // Optional lighter afternoon on food-heavy + family days
    const skipAfternoon =
      foodHeavy >= 2 && prefs.partyStyle === "family" && day === req.days;
    const afternoon = skipAfternoon
      ? null
      : pickVisit(afternoonSource, dayIndex, "afternoon", morning?.id);
    if (afternoon) {
      const loc = getLocalizedDestination(afternoon, locale);
      let cost = entryCost(
        afternoon.estimatedCostFcfa,
        req.people,
        prefs.partyStyle,
      );
      if (economy) cost = Math.min(cost, 3500 * Math.min(req.people, 3));
      placeIds.push(afternoon.id);
      activities.push({
        name: loc.name,
        time: prefs.partyStyle === "family" ? "15:30 – 18:00" : "15:00 – 18:00",
        kind: kindForDestination(afternoon),
        costFcfa: Math.round(cost),
        notes: shortNote(loc.description),
        placeId: afternoon.id,
      });
      dayCost += Math.round(cost);
    }

    const dinner = pickRoundRobin(restoPool, usedDinner, dayIndex + 3);
    if (dinner) {
      let unit = mealUnitCost(dinner.priceFromXaf, economy, prefs);
      if (economy) unit = Math.min(unit, 2200);
      const bump =
        !economy &&
        prefs.partyStyle === "couple" &&
        prefs.hotelTier !== "economy"
          ? 1.15
          : 1;
      const cost = Math.round(unit * mealPeopleFactor * bump);
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

    if (day < req.days || req.days === 1) {
      const hotel = pickRoundRobin(hotelPool, usedHotel, dayIndex);
      if (hotel) {
        const rounded = lodgingCost(hotel.priceFromXaf, prefs, economy);
        stayIds.push(hotel.id);
        const tierFr = TIER_PRICE[prefs.hotelTier].labelFr;
        const tierEn = TIER_PRICE[prefs.hotelTier].labelEn;
        activities.push({
          name: isFr
            ? `Nuit · ${hotel.name}${hotel.neighbourhood ? ` (${hotel.neighbourhood})` : ""}`
            : `Stay · ${hotel.nameEn || hotel.name}${hotel.neighbourhood ? ` (${hotel.neighbourhood})` : ""}`,
          time: isFr ? "Soirée / nuit" : "Evening / night",
          kind: "hotel",
          costFcfa: rounded,
          notes:
            (isFr
              ? `Gamme ${tierFr} · ${prefs.roomsNeeded} chambre(s) pour ${req.people}. `
              : `${tierEn} tier · ${prefs.roomsNeeded} room(s) for ${req.people}. `) +
            shortNote(isFr ? hotel.descriptionFr : hotel.descriptionEn, 80),
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

  const tier = TIER_PRICE[prefs.hotelTier];
  const summary = isFr
    ? `Programme personnalisé · ${req.days} jour(s) · ${partyLabel(prefs.partyStyle, true)} (${req.people}) à ${req.destination} · hôtels ${tier.labelFr} · intérêts : ${prefs.interests.join(", ")}.`
    : `Personalized plan · ${req.days} day(s) · ${partyLabel(prefs.partyStyle, false)} (${req.people}) in ${req.destination} · ${tier.labelEn} hotels · interests: ${prefs.interests.join(", ")}.`;

  const draft: TripPlan = {
    summary,
    days,
    totalEstimatedFcfa: total,
    withinBudget: total <= req.budgetFcfa,
    budgetNote: "",
    placeIds: [...new Set(placeIds)],
    stayIds: [...new Set(stayIds)],
    eatIds: [...new Set(eatIds)],
    preferences: prefs,
  };
  draft.recommendations = buildRecommendations(req, prefs, draft, isFr);
  draft.budgetNote = isFr
    ? `Adapté à vos préférences (${tier.labelFr}, ${partyLabel(prefs.partyStyle, true)}). Visites + restos + nuits — estimation.`
    : `Matched to your preferences (${tier.labelEn}, ${partyLabel(prefs.partyStyle, false)}). Visits + restaurants + nights — estimate.`;
  return draft;
}

export function generateTripPlan(
  req: TripRequest,
  catalog: Destination[] = localDestinations,
): TripPlan {
  const locale = req.locale ?? "fr";
  const isFr = locale === "fr";
  const prefs = buildPreferences(req);

  let pool = matchCity(req.destination, catalog);
  if (pool.length === 0) {
    pool = catalog.filter((d) => normalize(d.city).includes("yaound"));
  }
  if (pool.length === 0) pool = catalog.slice(0, 8);

  pool = [...pool]
    .map((d) => ({ d, s: interestScore(d, prefs.interests) }))
    .sort((a, b) => b.s - a.s || a.d.estimatedCostFcfa - b.d.estimatedCostFcfa)
    .map((x) => x.d);

  // Interest-first ordering (not forced culture+nature mix)
  const wantsNature = prefs.interests.some((i) =>
    /nature|parc|plage|beach|eco|mont/i.test(i),
  );
  const wantsCulture = prefs.interests.some((i) =>
    /culture|patrimoine|heritage|mus/i.test(i),
  );
  const mixed = [
    ...(wantsCulture ? pool.filter((d) => CULTURE_CATS.has(d.category)) : []),
    ...(wantsNature ? pool.filter((d) => NATURE_CATS.has(d.category)) : []),
    ...pool,
  ];
  const seen = new Set<string>();
  pool = mixed.filter((d) => {
    if (seen.has(d.id)) return false;
    seen.add(d.id);
    return true;
  });

  const plan = buildRichDays(pool, req, prefs, isFr, false);

  if (plan.totalEstimatedFcfa <= req.budgetFcfa) {
    plan.withinBudget = true;
    return plan;
  }

  return scaleToBudget(req.budgetFcfa, pool, req, prefs, isFr);
}

function scaleToBudget(
  budget: number,
  pool: Destination[],
  req: TripRequest,
  prefs: TripPreferences,
  isFr: boolean,
): TripPlan {
  const tierOrder: HotelTier[] = ["premium", "comfort", "standard", "economy"];
  const start = Math.max(0, tierOrder.indexOf(prefs.hotelTier));

  // 1) Step down hotel tier while keeping requested days
  for (let t = start; t < tierOrder.length; t++) {
    const nextPrefs: TripPreferences = {
      ...prefs,
      hotelTier: tierOrder[t],
      nightlyHotelBudgetFcfa: Math.min(
        prefs.nightlyHotelBudgetFcfa,
        TIER_PRICE[tierOrder[t]].max,
      ),
    };
    const attempt = buildRichDays(
      pool,
      { ...req, budgetFcfa: budget },
      nextPrefs,
      isFr,
      t > start,
    );
    if (attempt.totalEstimatedFcfa <= budget) {
      attempt.withinBudget = true;
      attempt.budgetNote = isFr
        ? `Ajusté à votre budget : hôtels ${TIER_PRICE[tierOrder[t]].labelFr}, restos et visites recalibrés (${req.days} jours gardés).`
        : `Adjusted to your budget: ${TIER_PRICE[tierOrder[t]].labelEn} hotels, meals and visits recalibrated (${req.days} days kept).`;
      return attempt;
    }
  }

  // 2) Economy + cheaper activity pool, still keep days
  const cheap = [...pool].sort((a, b) => a.estimatedCostFcfa - b.estimatedCostFcfa);
  const economyPrefs: TripPreferences = {
    ...prefs,
    hotelTier: "economy",
    nightlyHotelBudgetFcfa: Math.min(prefs.nightlyHotelBudgetFcfa, 18000),
  };
  let reduced = buildRichDays(
    cheap,
    { ...req, budgetFcfa: budget },
    economyPrefs,
    isFr,
    true,
  );
  if (reduced.totalEstimatedFcfa <= budget) {
    reduced.withinBudget = true;
    reduced.budgetNote = isFr
      ? `Version économique sur ${req.days} jour(s) pour ~${budget.toLocaleString("fr-FR")} FCFA.`
      : `Economy version over ${req.days} day(s) for ~${budget.toLocaleString("en-US")} FCFA.`;
    return reduced;
  }

  // 3) Only then shorten the stay
  if (req.days > 2) {
    reduced = buildRichDays(
      cheap,
      { ...req, budgetFcfa: budget, days: Math.max(2, req.days - 1) },
      economyPrefs,
      isFr,
      true,
    );
  }

  reduced.budgetNote = isFr
    ? `Budget serré : ${reduced.days.length} jour(s) en gamme économique pour ~${budget.toLocaleString("fr-FR")} FCFA (préférences conservées autant que possible).`
    : `Tight budget: ${reduced.days.length} day(s) in economy range for ~${budget.toLocaleString("en-US")} FCFA (preferences kept where possible).`;
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
