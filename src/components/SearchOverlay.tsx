"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { events } from "@/data/events";
import { regions } from "@/data/regions";
import { useLocale } from "./LocaleProvider";
import { usePlaces } from "./PlacesProvider";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SearchOverlay({ open, onClose }: Props) {
  const { locale } = useLocale();
  const { places } = usePlaces();
  const isFr = locale === "fr";
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) setQ("");
  }, [open]);

  const pages = useMemo(
    () => [
      {
        href: "/games",
        titleFr: "Jeux d’apprentissage",
        titleEn: "Learning games",
        keys: "jeux games langue culture yemba shupamom shüpamom medumba bangangte ewondo duala fulfulde quiz",
      },
      {
        href: "/games/langue",
        titleFr: "Jeux — langues maternelles",
        titleEn: "Games — mother tongues",
        keys: "langue language ewondo duala fulfulde yemba shupamom shüpamom medumba bangangte ecrire francais foumban",
      },
      {
        href: "/games/culture",
        titleFr: "Jeux — culture camerounaise",
        titleEn: "Games — Cameroonian culture",
        keys: "culture ngondo bikutsi sawa grassfields",
      },
      {
        href: "/learn",
        titleFr: "Learn Cameroon",
        titleEn: "Learn Cameroon",
        keys: "apprendre expressions phrases",
      },
    ],
    [],
  );

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (query.length < 2)
      return { places: [], events: [], regions: [], pages: [] };
    return {
      places: places
        .filter((d) =>
          [
              d.name,
              d.nameEn,
              d.city,
              d.cityEn,
              d.region,
              d.regionEn,
              d.culturalZone,
              d.category,
              d.descriptionFr,
              d.descriptionEn,
            ]
            .join(" ")
            .toLowerCase()
            .includes(query),
        )
        .slice(0, 8),
      events: events
        .filter((e) =>
          [e.titleFr, e.titleEn, e.city, e.summaryFr, e.summaryEn]
            .join(" ")
            .toLowerCase()
            .includes(query),
        )
        .slice(0, 4),
      regions: regions
        .filter((r) =>
          [r.nameFr, r.nameEn, r.taglineFr, r.taglineEn]
            .join(" ")
            .toLowerCase()
            .includes(query),
        )
        .slice(0, 4),
      pages: pages
        .filter((p) =>
          [p.titleFr, p.titleEn, p.keys].join(" ").toLowerCase().includes(query),
        )
        .slice(0, 4),
    };
  }, [q, places, pages]);

  if (!open) return null;

  const hasResults =
    results.places.length +
      results.events.length +
      results.regions.length +
      results.pages.length >
    0;

  return (
    <div className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-sm" onClick={onClose}>
      <div
        className="mx-auto mt-16 w-full max-w-2xl px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden border border-white/10 bg-[var(--bg)] shadow-2xl">
          <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3">
            <Search className="h-5 w-5 text-[var(--muted)]" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={
                isFr
                  ? "Rechercher une destination, un événement…"
                  : "Search a destination, event…"
              }
              className="flex-1 bg-transparent text-base outline-none placeholder:text-[var(--muted)]"
            />
            <button type="button" onClick={onClose} aria-label="Close">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto p-4">
            {q.trim().length < 2 ? (
              <p className="text-sm text-[var(--muted)]">
                {isFr
                  ? "Tapez au moins 2 caractères (ex. Kribi, Waza, Foumban)."
                  : "Type at least 2 characters (e.g. Kribi, Waza, Foumban)."}
              </p>
            ) : !hasResults ? (
              <p className="text-sm text-[var(--muted)]">
                {isFr ? "Aucun résultat." : "No results."}
              </p>
            ) : (
              <div className="space-y-5">
                {results.pages.length > 0 && (
                  <section>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                      {isFr ? "Pages" : "Pages"}
                    </p>
                    <ul className="space-y-1">
                      {results.pages.map((p) => (
                        <li key={p.href}>
                          <Link
                            href={p.href}
                            onClick={onClose}
                            className="block px-2 py-2 hover:bg-black/5"
                          >
                            {isFr ? p.titleFr : p.titleEn}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {results.places.length > 0 && (
                  <section>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                      Destinations
                    </p>
                    <ul className="space-y-1">
                      {results.places.map((d) => (
                        <li key={d.id}>
                          <Link
                            href={`/destinations/${d.id}`}
                            onClick={onClose}
                            className="block px-2 py-2 hover:bg-black/5"
                          >
                            <span className="font-medium">
                              {isFr ? d.name : d.nameEn}
                            </span>
                            <span className="text-sm text-[var(--muted)]"> · {d.city}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {results.regions.length > 0 && (
                  <section>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                      {isFr ? "Régions" : "Regions"}
                    </p>
                    <ul className="space-y-1">
                      {results.regions.map((r) => (
                        <li key={r.id}>
                          <Link
                            href={r.href}
                            onClick={onClose}
                            className="block px-2 py-2 hover:bg-black/5"
                          >
                            {isFr ? r.nameFr : r.nameEn}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {results.events.length > 0 && (
                  <section>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                      {isFr ? "Événements" : "Events"}
                    </p>
                    <ul className="space-y-1">
                      {results.events.map((ev) => (
                        <li key={ev.id}>
                          <Link
                            href="/events"
                            onClick={onClose}
                            className="block px-2 py-2 hover:bg-black/5"
                          >
                            {isFr ? ev.titleFr : ev.titleEn}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
