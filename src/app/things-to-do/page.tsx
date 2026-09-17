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
      <PageHero title={strings.things.title} subtitle={strings.things.subtitle} />
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
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((d) => (
          <article
            id={d.id}
            key={d.id}
            className="relative overflow-hidden rounded-[1.25rem] border border-[var(--line)] bg-white shadow-sm"
          >
            <Link href={`/destinations/${d.id}`} className="media-card aspect-[16/10] block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={d.image}
                alt={isFr ? d.name : d.nameEn}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </Link>
            <div className="absolute right-3 top-3 z-10">
              <FavoriteButton id={d.id} light />
            </div>
            <div className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
                {d.city} · {d.category} · {d.culturalZone}
              </p>
              <Link href={`/destinations/${d.id}`}>
                <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl hover:underline">
                  {isFr ? d.name : d.nameEn}
                </h2>
              </Link>
              <p className="mt-2 line-clamp-3 text-sm text-[var(--muted)]">
                {isFr ? d.descriptionFr : d.descriptionEn}
              </p>
              {d.estimatedCostFcfa > 0 && (
                <p className="mt-3 text-xs font-medium text-[var(--accent)]">
                  ~{d.estimatedCostFcfa.toLocaleString("fr-FR")} FCFA
                  {d.bestPeriod ? ` · ${d.bestPeriod}` : ""}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
