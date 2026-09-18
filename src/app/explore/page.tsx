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
      <PageHero title={strings.explore.title} subtitle={strings.explore.subtitle} />

      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="section-title text-2xl">
          {isFr ? "Les 10 régions" : "The 10 regions"}
        </h2>
        <Link href="/culture" className="text-sm font-semibold text-[var(--cm-green)] hover:underline">
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
              className="media-card aspect-[3/4] rounded-3xl"
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

      <section className="mt-14">
        <h2 className="section-title mb-4 text-2xl">
          {isFr ? "Aires culturelles" : "Cultural areas"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {culturalAreas.map((area) => (
            <Link
              key={area.id}
              href={area.href}
              className="media-card aspect-[16/11] rounded-3xl"
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

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/map"
          className="rounded-full bg-[var(--cm-green)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          {strings.nav.map}
        </Link>
        <Link
          href="/things-to-do"
          className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-semibold"
        >
          {strings.nav.things}
        </Link>
        <Link
          href="/culture"
          className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-semibold"
        >
          {strings.nav.culture}
        </Link>
      </div>
    </PageShell>
  );
}
