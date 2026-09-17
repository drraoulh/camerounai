"use client";

import Link from "next/link";
import { culturalAreas } from "@/data/cultural-areas";
import { regions } from "@/data/regions";
import { PageHero, PageShell } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";
import { usePlaces } from "@/components/PlacesProvider";

export default function CulturePage() {
  const { locale, strings } = useLocale();
  const { places } = usePlaces();
  const isFr = locale === "fr";

  return (
    <PageShell>
      <PageHero
        title={strings.culture.title}
        subtitle={
          isFr
            ? "Quatre grandes aires culturelles du Cameroun : images et récits dédiés."
            : "Cameroon’s four major cultural areas: dedicated photos and stories."
        }
      />
      <div className="space-y-10">
        {culturalAreas.map((area) => {
          const sites = places
            .filter(
              (d) => d.culturalZone === area.id && d.category !== "restauration",
            )
            .slice(0, 8);
          const linkedRegions = regions.filter((r) =>
            area.regionIds.includes(r.id),
          );
          const highlights = isFr ? area.highlightsFr : area.highlightsEn;

          return (
            <article
              key={area.id}
              id={area.slug}
              className="scroll-mt-28 overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-white shadow-sm lg:grid lg:grid-cols-2"
            >
              {/* Image apart */}
              <div className="relative min-h-[280px] lg:min-h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={area.image}
                  alt={isFr ? area.nameFr : area.nameEn}
                  className="absolute inset-0 h-full w-full object-cover"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 lg:hidden">
                  <h2 className="font-[family-name:var(--font-display)] text-3xl text-white">
                    {isFr ? area.nameFr : area.nameEn}
                  </h2>
                </div>
              </div>

              {/* Description apart */}
              <div className="flex flex-col justify-center p-6 sm:p-8">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--cm-green)]">
                  {isFr ? "Aire culturelle" : "Cultural area"}
                </p>
                <h2 className="mt-2 hidden font-[family-name:var(--font-display)] text-3xl lg:block">
                  {isFr ? area.nameFr : area.nameEn}
                </h2>
                <p className="mt-4 text-[var(--muted)] leading-relaxed">
                  {isFr ? area.descriptionFr : area.descriptionEn}
                </p>

                <ul className="mt-5 space-y-2 text-sm text-[var(--ink)]">
                  {highlights.map((h) => (
                    <li key={h} className="flex gap-2">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--cm-red)]" />
                      {h}
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex flex-wrap gap-2">
                  {linkedRegions.map((r) => (
                    <Link
                      key={r.id}
                      href={r.href}
                      className="rounded-full border border-[var(--line)] bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--cm-green)]"
                    >
                      {isFr ? r.nameFr : r.nameEn}
                    </Link>
                  ))}
                </div>

                <p className="mt-4 text-xs text-[var(--cm-red)]">
                  {area.themes.join(" · ")}
                  {sites.length
                    ? ` · ${sites.length}+ ${isFr ? "lieux liés" : "linked places"}`
                    : ""}
                </p>

                {sites.length > 0 && (
                  <ul className="mt-3 space-y-1 text-sm">
                    {sites.map((s) => (
                      <li key={s.id}>
                        <Link
                          href={`/destinations/${s.id}`}
                          className="hover:underline"
                        >
                          • {isFr ? s.name : s.nameEn}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="mt-6 flex flex-wrap gap-4">
                  <Link
                    href={`/assistant?q=${encodeURIComponent(
                      isFr
                        ? `Parcours culturel ${area.nameFr}`
                        : `${area.nameEn} cultural route`,
                    )}`}
                    className="btn-pill btn-pill--green"
                  >
                    {strings.culture.explore}
                  </Link>
                  <Link
                    href="/games/culture"
                    className="text-sm font-semibold text-[var(--cm-green)] underline-offset-4 hover:underline"
                  >
                    {isFr ? "Jouer : culture" : "Play: culture"}
                  </Link>
                  <Link
                    href="/things-to-do"
                    className="text-sm font-semibold text-[var(--cm-green)] underline-offset-4 hover:underline"
                  >
                    {strings.nav.things} →
                  </Link>
                </div>

                <p className="mt-6 text-[10px] text-[var(--muted)]">
                  {area.imageCredit}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </PageShell>
  );
}
