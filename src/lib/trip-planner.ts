import { destinations as localDestinations } from "@/data/destinations";
import { getLocalizedDestination } from "./localize-place";
import type { DayPlan, Destination, TripPlan, TripRequest } from "./types";

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function matchCity(destination: string, catalog: Destination[]) {
  const q = normalize(destination);
  return catalog.filter(
    (d) =>
      normalize(d.city).includes(q) ||
      normalize(d.cityEn).includes(q) ||
      normalize(d.region).includes(q) ||
      normalize(d.regionEn).includes(q) ||
      normalize(d.name).includes(q) ||
      normalize(d.nameEn).includes(q),
  );
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
  if (interests.some((i) => /culture|patrimoine|heritage/i.test(i))) s += 2;
  if (interests.some((i) => /nature|parc|mont|forêt|forest/i.test(i))) {
    if (["parc", "reserve", "cascade", "montagne"].includes(dest.category)) s += 4;
  }
  return s;
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
  if (pool.length === 0) pool = catalog.slice(0, 6);

  const interests = req.interests.length ? req.interests : ["culture", "nature"];

  pool = [...pool]
    .map((d) => ({ d, s: interestScore(d, interests) }))
    .sort((a, b) => b.s - a.s || a.d.estimatedCostFcfa - b.d.estimatedCostFcfa)
    .map((x) => x.d);

  const perPersonMeal = 3500;
  const transportPerDay = 5000;
  const lodgingPerNight = req.people <= 2 ? 18000 : 22000;

  const days: DayPlan[] = [];
  let total = 0;
  const placeIds: string[] = [];
  let idx = 0;

  for (let day = 1; day <= req.days; day++) {
    const dest = pool[idx % pool.length];
    idx++;
    placeIds.push(dest.id);

    let activityCost = dest.estimatedCostFcfa;
    const meals = perPersonMeal * req.people * 2;
    const transport = transportPerDay;
    const lodging = day < req.days ? lodgingPerNight : 0;

    let dayTotal = activityCost + meals + transport + lodging;

    if (total + dayTotal > req.budgetFcfa && day > 1) {
      activityCost = Math.min(activityCost, 5000);
      dayTotal = activityCost + meals + transport + lodging;
    }

    total += dayTotal;

    const loc = getLocalizedDestination(dest, locale);
    days.push({
      day,
      title: isFr ? `Jour ${day} : ${loc.name}` : `Day ${day} : ${loc.name}`,
      activities: [
        {
          name: loc.name,
          time: "09:00 – 15:00",
          transport: isFr
            ? `Trajet local (~${transport.toLocaleString("fr-FR")} FCFA)`
            : `Local transport (~${transport.toLocaleString("fr-FR")} FCFA)`,
          meal: isFr
            ? `Repas (~${meals.toLocaleString("fr-FR")} FCFA)`
            : `Meals (~${meals.toLocaleString("fr-FR")} FCFA)`,
          costFcfa: activityCost,
          notes: loc.description.slice(0, 120) + "…",
        },
      ],
      estimatedCostFcfa: dayTotal,
    });
  }

  const withinBudget = total <= req.budgetFcfa;

  if (!withinBudget) {
    return scaleToBudget(req.budgetFcfa, pool, req, isFr);
  }

  const summary = isFr
    ? `Programme ${req.days} jour(s) pour ${req.people} personne(s) à ${req.destination} : centres d'intérêt : ${interests.join(", ")}.`
    : `${req.days}-day plan for ${req.people} people in ${req.destination} : interests: ${interests.join(", ")}.`;

  return {
    summary,
    days,
    totalEstimatedFcfa: total,
    withinBudget,
    budgetNote: isFr
      ? "Itinéraire dans votre budget (estimation)."
      : "Itinerary within your budget (estimate).",
    placeIds: [...new Set(placeIds)],
  };
}

function scaleToBudget(
  budget: number,
  pool: Destination[],
  req: TripRequest,
  isFr: boolean,
): TripPlan {
  const cheap = [...pool].sort((a, b) => a.estimatedCostFcfa - b.estimatedCostFcfa);
  let reduced = generateTripPlanInner(cheap, { ...req, budgetFcfa: budget }, isFr);

  if (reduced.totalEstimatedFcfa > budget && req.days > 2) {
    reduced = generateTripPlanInner(
      cheap,
      { ...req, budgetFcfa: budget, days: Math.max(2, req.days - 1) },
      isFr,
    );
  }

  if (reduced.totalEstimatedFcfa > budget) {
    const minimal = generateTripPlanInner(
      cheap.slice(0, 2),
      { ...req, budgetFcfa: budget, days: 1 },
      isFr,
    );
    minimal.budgetNote = isFr
      ? `Budget recalculé : version économique (~${minimal.totalEstimatedFcfa.toLocaleString("fr-FR")} FCFA estimés).`
      : `Budget recalculated: economy version (~${minimal.totalEstimatedFcfa.toLocaleString("fr-FR")} FCFA estimated).`;
    minimal.withinBudget = minimal.totalEstimatedFcfa <= budget;
    return minimal;
  }

  reduced.budgetNote = isFr
    ? `Itinéraire ajusté pour respecter environ ${budget.toLocaleString("fr-FR")} FCFA.`
    : `Itinerary adjusted to fit about ${budget.toLocaleString("fr-FR")} FCFA.`;
  reduced.withinBudget = reduced.totalEstimatedFcfa <= budget;
  return reduced;
}

function generateTripPlanInner(
  pool: Destination[],
  req: TripRequest,
  isFr: boolean,
): TripPlan {
  if (pool.length === 0) {
    return {
      summary: isFr ? "Aucun lieu trouvé" : "No places found",
      days: [],
      totalEstimatedFcfa: 0,
      withinBudget: true,
      budgetNote: "",
      placeIds: [],
    };
  }

  const perPersonMeal = 3000;
  const transportPerDay = 4000;
  const lodgingPerNight = 15000;
  const days: DayPlan[] = [];
  let total = 0;
  const placeIds: string[] = [];

  for (let day = 1; day <= req.days; day++) {
    const dest = pool[(day - 1) % pool.length];
    placeIds.push(dest.id);
    const meals = perPersonMeal * req.people * 2;
    const transport = transportPerDay;
    const lodging = day < req.days ? lodgingPerNight : 0;
    const activityCost = dest.estimatedCostFcfa;
    const dayTotal = activityCost + meals + transport + lodging;
    total += dayTotal;
    const loc = getLocalizedDestination(dest, isFr ? "fr" : "en");
    days.push({
      day,
      title: isFr ? `Jour ${day} : ${loc.name}` : `Day ${day} : ${loc.name}`,
      activities: [
        {
          name: loc.name,
          time: "09:00 – 14:00",
          costFcfa: activityCost,
          meal: `${meals} FCFA`,
          transport: `${transport} FCFA`,
        },
      ],
      estimatedCostFcfa: dayTotal,
    });
  }

  return {
    summary: isFr ? "Itinéraire économique" : "Economy itinerary",
    days,
    totalEstimatedFcfa: total,
    withinBudget: total <= req.budgetFcfa,
    budgetNote: "",
    placeIds: [...new Set(placeIds)],
  };
}

export function recalculateBudget(
  _plan: TripPlan,
  newBudget: number,
  req: TripRequest,
  catalog?: Destination[],
): TripPlan {
  return generateTripPlan({ ...req, budgetFcfa: newBudget }, catalog);
}
