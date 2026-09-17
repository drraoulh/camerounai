"use client";

import { useEffect, useMemo, useState } from "react";
import { Share2 } from "lucide-react";
import clsx from "clsx";
import { TourismMap } from "./TourismMap";
import { useLocale } from "./LocaleProvider";
import { usePlaces } from "./PlacesProvider";
import type { TripPlan } from "@/lib/types";

const INTEREST_OPTS = [
  { id: "culture", fr: "Culture", en: "Culture" },
  { id: "nature", fr: "Nature", en: "Nature" },
  { id: "plage", fr: "Plage", en: "Beach" },
  { id: "food", fr: "Gastronomie", en: "Food" },
  { id: "eco", fr: "Éco", en: "Eco" },
] as const;

const PARTY_OPTS = [
  { id: "solo", fr: "Solo", en: "Solo", people: 1 },
  { id: "couple", fr: "Couple", en: "Couple", people: 2 },
  { id: "family", fr: "Famille", en: "Family", people: 4 },
  { id: "friends", fr: "Amis", en: "Friends", people: 4 },
  { id: "group", fr: "Groupe", en: "Group", people: 6 },
] as const;

const HOTEL_OPTS = [
  { id: "auto", fr: "Auto (budget)", en: "Auto (budget)" },
  { id: "economy", fr: "Économique", en: "Economy" },
  { id: "standard", fr: "Standard", en: "Standard" },
  { id: "comfort", fr: "Confort", en: "Comfort" },
  { id: "premium", fr: "Premium", en: "Premium" },
] as const;

export function TripPlannerForm() {
  const { locale, strings } = useLocale();
  const { places } = usePlaces();
  const isFr = locale === "fr";
  const [destination, setDestination] = useState("Yaoundé");
  const [days, setDays] = useState(3);
  const [budgetFcfa, setBudgetFcfa] = useState(150000);
  const [people, setPeople] = useState(4);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "culture",
    "nature",
    "food",
  ]);
  const [travelType, setTravelType] = useState("family");
  const [hotelTier, setHotelTier] = useState("auto");
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("cameroon-ai-trip");
      if (!raw) return;
      const saved = JSON.parse(raw) as { plan?: TripPlan; destination?: string };
      if (saved.plan) {
        setPlan(saved.plan);
        if (saved.destination) setDestination(saved.destination);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const interestsPayload = useMemo(() => {
    const base = [...selectedInterests];
    if (travelType === "family" && !base.includes("famille")) base.push("famille");
    return base;
  }, [selectedInterests, travelType]);

  function toggleInterest(id: string) {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function generate(overrideBudget?: number) {
    setLoading(true);
    setShareNote(null);
    try {
      const res = await fetch("/api/trip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination,
          days,
          budgetFcfa: overrideBudget ?? budgetFcfa,
          people,
          interests: interestsPayload,
          travelType,
          hotelTier: hotelTier === "auto" ? undefined : hotelTier,
          locale,
        }),
      });
      const data = (await res.json()) as { plan: TripPlan };
      setPlan(data.plan);
      if (overrideBudget !== undefined) setBudgetFcfa(overrideBudget);
      try {
        sessionStorage.setItem(
          "cameroon-ai-trip",
          JSON.stringify({ plan: data.plan, destination }),
        );
      } catch {
        /* ignore */
      }
    } finally {
      setLoading(false);
    }
  }

  async function sharePlan() {
    if (!plan) return;
    const text = [
      plan.summary,
      ...(plan.recommendations ?? []),
      ...plan.days.map(
        (d) =>
          `${d.title} (~${d.estimatedCostFcfa.toLocaleString("fr-FR")} FCFA)`,
      ),
      `${strings.trip.total}: ${plan.totalEstimatedFcfa.toLocaleString("fr-FR")} FCFA`,
    ].join("\n");

    try {
      if (navigator.share) {
        await navigator.share({ title: "Visit Cameroon itinerary", text });
      } else {
        await navigator.clipboard.writeText(text);
        setShareNote(isFr ? "Itinéraire copié." : "Itinerary copied.");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        setShareNote(isFr ? "Itinéraire copié." : "Itinerary copied.");
      } catch {
        setShareNote(isFr ? "Partage indisponible." : "Share unavailable.");
      }
    }
  }

  const mapPlaces = plan
    ? places.filter((d) => plan.placeIds.includes(d.id))
    : places
        .filter((d) =>
          d.city
            .toLowerCase()
            .normalize("NFD")
            .replace(/\p{M}/gu, "")
            .includes(
              destination
                .toLowerCase()
                .normalize("NFD")
                .replace(/\p{M}/gu, ""),
            ),
        )
        .slice(0, 8);

  const field =
    "mt-1 w-full rounded-full border border-[var(--line)] bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]/20";
  const chip =
    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors";

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form
        className="space-y-4 border border-[var(--line)] bg-white p-6"
        onSubmit={(e) => {
          e.preventDefault();
          void generate();
        }}
      >
        <label className="block text-sm">
          <span className="text-[var(--muted)]">{strings.trip.destination}</span>
          <input
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className={field}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="text-[var(--muted)]">{strings.trip.days}</span>
            <input
              type="number"
              min={1}
              max={14}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className={field}
            />
          </label>
          <label className="block text-sm">
            <span className="text-[var(--muted)]">{strings.trip.people}</span>
            <input
              type="number"
              min={1}
              value={people}
              onChange={(e) => setPeople(Number(e.target.value))}
              className={field}
            />
          </label>
        </div>
        <label className="block text-sm">
          <span className="text-[var(--muted)]">{strings.trip.budget}</span>
          <input
            type="number"
            min={10000}
            step={5000}
            value={budgetFcfa}
            onChange={(e) => setBudgetFcfa(Number(e.target.value))}
            className={field}
          />
        </label>

        <div>
          <p className="text-sm text-[var(--muted)]">
            {isFr ? "Qui voyage ?" : "Who’s travelling?"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PARTY_OPTS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={clsx(
                  chip,
                  travelType === p.id
                    ? "border-[var(--cm-green)] bg-[var(--accent-soft)] text-[var(--cm-green)]"
                    : "border-[var(--line)] text-[var(--muted)]",
                )}
                onClick={() => {
                  setTravelType(p.id);
                  setPeople(p.people);
                }}
              >
                {isFr ? p.fr : p.en}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-[var(--muted)]">{strings.trip.interests}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {INTEREST_OPTS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={clsx(
                  chip,
                  selectedInterests.includes(opt.id)
                    ? "border-[var(--cm-green)] bg-[var(--accent-soft)] text-[var(--cm-green)]"
                    : "border-[var(--line)] text-[var(--muted)]",
                )}
                onClick={() => toggleInterest(opt.id)}
              >
                {isFr ? opt.fr : opt.en}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-[var(--muted)]">
            {isFr ? "Type d’hôtel" : "Hotel type"}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {HOTEL_OPTS.map((h) => (
              <button
                key={h.id}
                type="button"
                className={clsx(
                  chip,
                  hotelTier === h.id
                    ? "border-[var(--cm-green)] bg-[var(--accent-soft)] text-[var(--cm-green)]"
                    : "border-[var(--line)] text-[var(--muted)]",
                )}
                onClick={() => setHotelTier(h.id)}
              >
                {isFr ? h.fr : h.en}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || selectedInterests.length === 0}
          className="w-full rounded-full bg-[var(--ink)] py-3 text-sm font-semibold text-white disabled:opacity-50"
        >
          {strings.trip.generate}
        </button>
        {plan && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void generate(100000)}
              className="flex-1 rounded-full border border-[var(--sand)] py-2 text-sm text-amber-900"
            >
              {strings.trip.adjustBudget} → 100 000
            </button>
            <button
              type="button"
              onClick={() => void sharePlan()}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[var(--line)] px-4 py-2 text-sm"
            >
              <Share2 className="h-4 w-4" />
              {isFr ? "Partager" : "Share"}
            </button>
          </div>
        )}
        {shareNote && <p className="text-xs text-[var(--accent)]">{shareNote}</p>}
      </form>

      <div className="space-y-4">
        {plan ? (
          <div className="border border-[var(--line)] bg-white p-6">
            <p className="text-sm text-[var(--muted)]">{plan.summary}</p>
            {plan.preferences && (
              <p className="mt-2 text-xs text-[var(--cm-green)]">
                {isFr ? "Hôtel" : "Hotel"}: {plan.preferences.hotelTier} ·{" "}
                {plan.preferences.roomsNeeded}{" "}
                {isFr ? "chambre(s)" : "room(s)"} ·{" "}
                {plan.preferences.partyStyle} ·{" "}
                {plan.preferences.interests.join(", ")}
              </p>
            )}
            <p className="mt-2 text-lg font-semibold">
              {strings.trip.total}:{" "}
              {plan.totalEstimatedFcfa.toLocaleString("fr-FR")} FCFA
            </p>
            <p className="text-sm text-amber-900/80">{plan.budgetNote}</p>

            {plan.recommendations && plan.recommendations.length > 0 && (
              <div className="mt-4 border border-[var(--line)] bg-[var(--accent-soft)]/40 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--cm-green)]">
                  {isFr ? "Recommandations" : "Recommendations"}
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-[var(--ink)]">
                  {plan.recommendations.map((r) => (
                    <li key={r}>• {r}</li>
                  ))}
                </ul>
              </div>
            )}

            <ul className="mt-4 space-y-3">
              {plan.days.map((d) => (
                <li key={d.day} className="border border-[var(--line)] p-3 text-sm">
                  <p className="font-medium">{d.title}</p>
                  {d.activities.map((a, i) => {
                    const kind =
                      a.kind === "nature"
                        ? "Nature"
                        : a.kind === "culture"
                          ? "Culture"
                          : a.kind === "restaurant"
                            ? "Restaurant"
                            : a.kind === "hotel"
                              ? isFr
                                ? "Hôtel"
                                : "Stay"
                              : a.kind === "visit"
                                ? isFr
                                  ? "Visite"
                                  : "Visit"
                                : null;
                    return (
                      <p key={i} className="mt-1.5 text-[var(--muted)]">
                        <span className="font-medium text-[var(--ink)]">
                          {a.time}
                        </span>
                        {kind ? (
                          <span className="mx-1 text-[var(--cm-green)]">
                            · {kind}
                          </span>
                        ) : null}
                        : {a.name} (~{a.costFcfa.toLocaleString("fr-FR")} FCFA)
                        {a.notes ? (
                          <span className="mt-0.5 block text-xs leading-snug opacity-80">
                            {a.notes}
                          </span>
                        ) : null}
                      </p>
                    );
                  })}
                  <p className="mt-2 text-xs text-[var(--accent)]">
                    {isFr ? "Jour" : "Day"}:{" "}
                    {d.estimatedCostFcfa.toLocaleString("fr-FR")} FCFA
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            {isFr
              ? "Choisissez profil, intérêts et budget : l’itinéraire adapte hôtels, restos et visites."
              : "Pick profile, interests and budget — the itinerary adapts hotels, restaurants and visits."}
          </p>
        )}
        <TourismMap
          places={mapPlaces.length ? mapPlaces : places.slice(0, 6)}
          highlightIds={plan?.placeIds}
          locale={locale}
        />
      </div>
    </div>
  );
}
