"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import { PageShell } from "@/components/PageShell";
import { TourismMap } from "@/components/TourismMap";
import { useLocale } from "@/components/LocaleProvider";
import { usePlaces } from "@/components/PlacesProvider";
import { placeMatchesRegion, regions } from "@/data/regions";
import { hasLivePhoto } from "@/lib/text";

export default function ExploreRegionPage() {
  const params = useParams();
  const slug = String(params.slug ?? "");
  const { locale, strings } = useLocale();
  const { places } = usePlaces();
  const isFr = locale === "fr";
  const region = regions.find((r) => r.id === slug || r.slug === slug);

  const filtered = useMemo(() => {
    if (!region) return [];
    return places
      .filter((d) => placeMatchesRegion(d, region))
      .sort((a, b) => Number(hasLivePhoto(b.image)) - Number(hasLivePhoto(a.image)));
  }, [places, region]);

  if (!region && filtered.length === 0) {
    return (
      <PageShell>
        <p>{isFr ? "Région introuvable." : "Region not found."}</p>
        <Link href="/explore" className="mt-4 inline-block underline">
          {strings.nav.explore}
        </Link>
      </PageShell>
    );
  }

  const title = region ? (isFr ? region.nameFr : region.nameEn) : slug;
  const tagline = region ? (isFr ? region.taglineFr : region.taglineEn) : "";
  const heroImg =
    region?.image ||
    filtered.find((d) => hasLivePhoto(d.image) && d.category !== "restauration")
      ?.image ||
    filtered[0]?.image ||
    "https://commons.wikimedia.org/wiki/Special:FilePath/Landscape_of_Mount_Cameroon.jpg?width=2000";

  return (
    <div>
      <div className="media-card full-bleed mb-10 h-[42vh] min-h-[260px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={heroImg} alt={title} referrerPolicy="no-referrer" />
        <div className="media-card__shade" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-4 pb-8 sm:px-6">
          {region && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cm-yellow)]">
              {region.culturalZone}
            </p>
          )}
          <h1 className="section-title text-4xl text-white sm:text-5xl">{title}</h1>
          {tagline && <p className="mt-2 max-w-xl text-white/80">{tagline}</p>}
          <p className="mt-2 text-sm text-white/60">
            {filtered.length} {isFr ? "lieux" : "places"}
          </p>
        </div>
      </div>

      <PageShell className="pt-0">
        {region && (
          <section className="mb-12 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cm-green)]">
                {isFr ? "L’histoire du lieu" : "The story"}
              </p>
              <h2 className="section-title mt-2 text-3xl">
                {isFr ? `Pourquoi aller en ${region.nameFr}` : `Why go to ${region.nameEn}`}
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)]">
                {isFr ? region.storyFr : region.storyEn}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cm-red)]">
                {isFr ? "Choses à visiter" : "Things to visit"}
              </p>
              <ul className="mt-4 space-y-3">
                {(isFr ? region.toVisitFr : region.toVisitEn).map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 border-b border-[var(--line)] pb-3 text-sm last:border-0"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--cm-yellow)]"
                      aria-hidden
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}

        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                {isFr ? "Sur le terrain" : "On the ground"}
              </p>
              <h2 className="section-title mt-1 text-2xl sm:text-3xl">
                {isFr ? "Lieux à découvrir" : "Places to discover"}
              </h2>
            </div>
            <p className="text-sm text-[var(--muted)]">
              {filtered.length} {isFr ? "lieux" : "places"}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((d) => (
              <Link
                key={d.id}
                href={`/destinations/${d.id}`}
                className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white hover:border-[var(--cm-green)]"
              >
                <div className="media-card aspect-[16/10]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={d.image}
                    alt={isFr ? d.name : d.nameEn}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
                    {d.category} · {d.city}
                  </p>
                  <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl">
                    {isFr ? d.name : d.nameEn}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm text-[var(--muted)]">
                    {isFr ? d.descriptionFr : d.descriptionEn}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-[var(--muted)]">
              {isFr
                ? "Aucun lieu publié pour cette région pour le moment."
                : "No published places for this region yet."}
            </p>
          )}
        </section>

        {filtered.length > 0 && (
          <div className="mt-10">
            <h2 className="section-title mb-4 text-2xl">{strings.map.title}</h2>
            <TourismMap places={filtered} locale={locale} />
          </div>
        )}
      </PageShell>
    </div>
  );
}
