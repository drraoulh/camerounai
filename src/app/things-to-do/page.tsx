"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageHero, PageShell } from "@/components/PageShell";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useLocale } from "@/components/LocaleProvider";
import { usePlaces } from "@/components/PlacesProvider";
import { thingFilters } from "@/data/regions";
import type { Destination } from "@/lib/types";
import { hasLivePhoto } from "@/lib/text";

function filterList(list: Destination[], filter: string) {
  if (filter === "all") return list;
  if (filter === "nature")
    return list.filter((d) =>
      ["parc", "reserve", "cascade", "montagne"].includes(d.category),
    );
  if (filter === "culture")
    return list.filter((d) =>
      ["patrimoine", "musee", "monument", "artisanat", "festival"].includes(
        d.category,
      ),
    );
  if (filter === "plage") return list.filter((d) => d.category === "plage");
  if (filter === "famille")
    return list.filter((d) =>
      ["musee", "activite", "plage", "parc", "monument"].includes(d.category),
    );
  if (filter === "gastro")
    return list.filter((d) =>
      ["restauration", "gastronomie"].includes(d.category),
    );
  if (filter === "eco") return list.filter((d) => d.ecoTags.length > 0);
  return list;
}

export default function ThingsToDoPage() {
  const { locale, strings } = useLocale();
  const { places, source, ready } = usePlaces();
  const isFr = locale === "fr";
  const [filter, setFilter] = useState("all");
  const list = useMemo(() => {
    const filtered = filterList(places, filter);
    return [...filtered].sort(
      (a, b) => Number(hasLivePhoto(b.image)) - Number(hasLivePhoto(a.image)),
    );
  }, [places, filter]);

  return (
    <PageShell>
      <PageHero
        kicker={isFr ? "Découvrir" : "Discover"}
        title={strings.things.title}
        subtitle={strings.things.subtitle}
      />
      <p className="mb-4 text-xs text-[var(--muted)]">
        {!ready
          ? "…"
          : source === "supabase"
            ? isFr
              ? `${list.length} / ${places.length} lieux · données live Supabase`
              : `${list.length} / ${places.length} places · live Supabase data`
            : isFr
              ? "Données locales (fallback)"
              : "Local data (fallback)"}
      </p>
      <div className="mb-8 flex gap-2 overflow-x-auto pb-1">
        {thingFilters.map((f) => (
          <button
            key={f.id}
            type="button"
            className="chip shrink-0"
            data-active={filter === f.id}
            onClick={() => setFilter(f.id)}
          >
            {isFr ? f.labelFr : f.labelEn}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((d) => (
          <div key={d.id} id={d.id} className="relative">
            <Link
              href={`/destinations/${d.id}`}
              className="media-card aspect-[4/5] block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={d.image}
                alt={isFr ? d.name : d.nameEn}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              <div className="media-card__shade" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--cm-yellow)]">
                  {d.city} · {d.culturalZone}
                </p>
                <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl">
                  {isFr ? d.name : d.nameEn}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm text-white/80">
                  {isFr ? d.descriptionFr : d.descriptionEn}
                </p>
                {d.estimatedCostFcfa > 0 && (
                  <p className="mt-3 text-xs font-medium text-white/75">
                    ~{d.estimatedCostFcfa.toLocaleString("fr-FR")} FCFA
                    {d.bestPeriod ? ` · ${d.bestPeriod}` : ""}
                  </p>
                )}
              </div>
            </Link>
            <div className="absolute right-3 top-3 z-10">
              <FavoriteButton id={d.id} light />
            </div>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
