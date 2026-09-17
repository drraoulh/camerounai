"use client";

import { useMemo, useState } from "react";
import { TourismMap } from "@/components/TourismMap";
import { PageHero, PageShell } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";
import { usePlaces } from "@/components/PlacesProvider";
import Link from "next/link";

export default function MapPage() {
  const { strings, locale } = useLocale();
  const { places, source, ready } = usePlaces();
  const isFr = locale === "fr";
  const [zone, setZone] = useState<string>("all");
  const [kind, setKind] = useState<string>("all");

  const filtered = useMemo(() => {
    let list = places;
    if (zone !== "all") list = list.filter((d) => d.culturalZone === zone);
    if (kind === "sites")
      list = list.filter((d) => d.category !== "restauration");
    if (kind === "eat")
      list = list.filter((d) =>
        ["restauration", "gastronomie"].includes(d.category),
      );
    return list;
  }, [zone, kind, places]);

  const listPreview = filtered.slice(0, 36);

  return (
    <PageShell>
      <PageHero title={strings.map.title} subtitle={strings.explore.subtitle} />
      <p className="mb-3 text-xs text-[var(--muted)]">
        {!ready
          ? "…"
          : source === "supabase"
            ? isFr
              ? `${filtered.length} / ${places.length} lieux affichés`
              : `${filtered.length} / ${places.length} places shown`
            : isFr
              ? "Données locales"
              : "Local data"}
      </p>
      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={zone}
          onChange={(e) => setZone(e.target.value)}
          className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm"
        >
          <option value="all">{strings.map.filterAll}</option>
          <option value="Grassfields">Grassfields</option>
          <option value="Sawa">Sawa</option>
          <option value="Fang-Beti">Fang-Beti</option>
          <option value="Sudano-Sahelian">Sudano-Sahelian</option>
        </select>
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm"
        >
          <option value="all">{isFr ? "Tous types" : "All types"}</option>
          <option value="sites">{isFr ? "Sites" : "Sites"}</option>
          <option value="eat">{isFr ? "Restauration" : "Food"}</option>
        </select>
      </div>
      <TourismMap
        places={filtered}
        locale={locale}
        className="h-[560px] w-full overflow-hidden border border-[var(--line)]"
      />
      <ul className="mt-6 grid gap-2 sm:grid-cols-2">
        {listPreview.map((d) => (
          <li key={d.id} className="border border-[var(--line)] bg-white p-3 text-sm">
            <Link href={`/destinations/${d.id}`} className="font-medium hover:underline">
              {isFr ? d.name : d.nameEn}
            </Link>
            <p className="text-[var(--muted)]">
              {isFr ? d.city : d.cityEn || d.city} · {d.category} · {d.culturalZone}
            </p>
          </li>
        ))}
      </ul>
      {filtered.length > listPreview.length && (
        <Link
          href="/things-to-do"
          className="mt-4 inline-block text-sm font-semibold underline-offset-4 hover:underline"
        >
          {isFr
            ? `Voir les ${filtered.length} lieux`
            : `See all ${filtered.length} places`}
        </Link>
      )}
    </PageShell>
  );
}
