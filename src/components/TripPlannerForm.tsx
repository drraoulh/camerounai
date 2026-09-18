"use client";

import { useEffect, useState } from "react";
import { Share2 } from "lucide-react";
import { TourismMap } from "./TourismMap";
import { useLocale } from "./LocaleProvider";
import { usePlaces } from "./PlacesProvider";
import type { TripPlan } from "@/lib/types";

export function TripPlannerForm() {
  const { locale, strings } = useLocale();
  const { places } = usePlaces();
  const [destination, setDestination] = useState("Yaoundé");
  const [days, setDays] = useState(3);
  const [budgetFcfa, setBudgetFcfa] = useState(150000);
  const [people, setPeople] = useState(4);
  const [interests, setInterests] = useState("culture, nature");
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
          interests: interests.split(/[,;]+/).map((s) => s.trim()),
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
        setShareNote(
          locale === "fr" ? "Itinéraire copié." : "Itinerary copied.",
        );
      }
    } catch {
      try {
        await navigator.clipboard.writeText(text);
        setShareNote(
          locale === "fr" ? "Itinéraire copié." : "Itinerary copied.",
        );
      } catch {
        setShareNote(locale === "fr" ? "Partage indisponible." : "Share unavailable.");
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
        <label className="block text-sm">
          <span className="text-[var(--muted)]">{strings.trip.interests}</span>
          <input
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            className={field}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
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
              {locale === "fr" ? "Partager" : "Share"}
            </button>
          </div>
        )}
        {shareNote && <p className="text-xs text-[var(--accent)]">{shareNote}</p>}
      </form>

      <div className="space-y-4">
        {plan ? (
          <div className="border border-[var(--line)] bg-white p-6">
            <p className="text-sm text-[var(--muted)]">{plan.summary}</p>
            <p className="mt-2 text-lg font-semibold">
              {strings.trip.total}: {plan.totalEstimatedFcfa.toLocaleString("fr-FR")} FCFA
            </p>
            <p className="text-sm text-amber-900/80">{plan.budgetNote}</p>
            <ul className="mt-4 space-y-3">
              {plan.days.map((d) => (
                <li key={d.day} className="border border-[var(--line)] p-3 text-sm">
                  <p className="font-medium">{d.title}</p>
                  {d.activities.map((a, i) => (
                    <p key={i} className="mt-1 text-[var(--muted)]">
                      {a.time} : {a.name} (~{a.costFcfa.toLocaleString("fr-FR")} FCFA)
                    </p>
                  ))}
                  <p className="mt-1 text-xs text-[var(--accent)]">
                    Jour: {d.estimatedCostFcfa.toLocaleString("fr-FR")} FCFA
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            {locale === "fr"
              ? "Exemple jury : famille à Yaoundé, 3 jours, 150 000 FCFA, culture et nature."
              : "Jury example: family in Yaoundé, 3 days, 150,000 FCFA, culture and nature."}
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
