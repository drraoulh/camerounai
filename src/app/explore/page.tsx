"use client";

import Link from "next/link";
import { PageHero, PageShell } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";
import { usePlaces } from "@/components/PlacesProvider";
import { culturalAreas } from "@/data/cultural-areas";
import { placeMatchesRegion, regions } from "@/data/regions";

export default function ExplorePage() {
  const { locale, strings } = useLocale();
  const { places } = usePlaces();
  const isFr = locale === "fr";

  return (
    <PageShell>
      <PageHero
        kicker={isFr ? "Territoires" : "Territories"}
        title={strings.explore.title}
        subtitle={strings.explore.subtitle}
      />

      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="section-kicker">{isFr ? "Carte du pays" : "Country map"}</p>
          <h2 className="section-title mt-2 text-2xl sm:text-3xl">
            {isFr ? "Les 10 régions" : "The 10 regions"}
          </h2>
        </div>
        <Link
          href="/culture"
          className="text-sm font-semibold text-[var(--cm-green)] underline-offset-4 hover:underline"
        >
          {isFr ? "Aires culturelles →" : "Cultural areas →"}
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {regions.map((r) => {
          const count = places.filter((d) => placeMatchesRegion(d, r)).length;
          return (
            <Link
              key={r.id}
              href={r.href}
              className="media-card aspect-[3/4]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.image}
                alt={isFr ? r.nameFr : r.nameEn}
                referrerPolicy="no-referrer"
              />
              <div className="media-card__shade" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--cm-yellow)]">
                  {r.culturalZone}
                </p>
                <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl">
                  {isFr ? r.nameFr : r.nameEn}
                </h2>
                <p className="mt-1 line-clamp-2 text-xs text-white/80">
                  {isFr ? r.taglineFr : r.taglineEn}
                </p>
                {count > 0 && (
                  <p className="mt-2 text-[11px] text-white/65">
                    {count} {isFr ? "lieux" : "places"}
                  </p>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <section className="mt-16">
        <p className="section-kicker">{isFr ? "Identités" : "Identities"}</p>
        <div className="cm-stripe mt-3 mb-4" />
        <h2 className="section-title mb-6 text-2xl sm:text-3xl">
          {isFr ? "Aires culturelles" : "Cultural areas"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {culturalAreas.map((area) => (
            <Link
              key={area.id}
              href={area.href}
              className="media-card aspect-[16/11]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={area.image}
                alt={isFr ? area.nameFr : area.nameEn}
                referrerPolicy="no-referrer"
              />
              <div className="media-card__shade" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                <h3 className="font-[family-name:var(--font-display)] text-xl">
                  {isFr ? area.nameFr : area.nameEn}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-white/80">
                  {isFr ? area.summaryFr : area.summaryEn}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/map" className="btn-pill btn-pill--green">
          {strings.nav.map}
        </Link>
        <Link
          href="/things-to-do"
          className="btn-pill border border-[var(--line)] bg-white text-[var(--ink)]"
        >
          {strings.nav.things}
        </Link>
        <Link
          href="/culture"
          className="btn-pill border border-[var(--line)] bg-white text-[var(--ink)]"
        >
          {strings.nav.culture}
        </Link>
      </div>
    </PageShell>
  );
}
