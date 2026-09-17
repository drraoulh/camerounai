"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import { FavoriteButton } from "@/components/FavoriteButton";
import { usePlaces } from "@/components/PlacesProvider";
import { culturalAreas } from "@/data/cultural-areas";
import { events } from "@/data/events";
import { ecoHighlights, experienceMedia } from "@/data/home-media";
import { placeMatchesRegion, regions, thingFilters } from "@/data/regions";
import type { Destination } from "@/lib/types";
import { hasLivePhoto } from "@/lib/text";

function filterDestinations(list: Destination[], filter: string): Destination[] {
  if (filter === "all") {
    return list.filter((d) => d.category !== "restauration");
  }
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

function pickFeatured(list: Destination[], filter: string) {
  const pool = filterDestinations(list, filter);
  return [...pool]
    .sort((a, b) => Number(hasLivePhoto(b.image)) - Number(hasLivePhoto(a.image)))
    .slice(0, 6);
}

const EXPERIENCES = [
  {
    id: "famille",
    labelFr: "En famille",
    labelEn: "Family-friendly",
    image: experienceMedia.famille,
  },
  {
    id: "culture",
    labelFr: "Culture & patrimoine",
    labelEn: "History & heritage",
    image: experienceMedia.culture,
  },
  {
    id: "nature",
    labelFr: "Nature & aventure",
    labelEn: "Nature & adventure",
    image: experienceMedia.nature,
  },
  {
    id: "plage",
    labelFr: "Côte & plages",
    labelEn: "Coast & beaches",
    image: experienceMedia.plage,
  },
  {
    id: "gastro",
    labelFr: "Saveurs locales",
    labelEn: "Local flavours",
    image: experienceMedia.gastro,
  },
  {
    id: "eco",
    labelFr: "Écotourisme",
    labelEn: "Ecotourism",
    image: experienceMedia.eco,
  },
] as const;

export default function Home() {
  const { locale, strings } = useLocale();
  const { places } = usePlaces();
  const isFr = locale === "fr";
  const [filter, setFilter] = useState<string>("all");
  const [destMode, setDestMode] = useState<"regions" | "culture">("regions");
  const [picked, setPicked] = useState<string[]>(["nature", "culture"]);

  const cards = useMemo(() => pickFeatured(places, filter), [places, filter]);

  // Stable Wikimedia hero (Ayila S3 URLs often break in CSS backgrounds)
  const heroImage = experienceMedia.nature;

  const toggleExp = (id: string) => {
    setPicked((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const curateHref = `/assistant?q=${encodeURIComponent(
    isFr
      ? `Je veux un séjour Cameroun : ${picked
          .map((id) => EXPERIENCES.find((e) => e.id === id)?.labelFr)
          .filter(Boolean)
          .join(", ")}`
      : `I want a Cameroon trip focused on: ${picked
          .map((id) => EXPERIENCES.find((e) => e.id === id)?.labelEn)
          .filter(Boolean)
          .join(", ")}`,
  )}`;

  return (
    <div className="pb-8">
      {/* Full-bleed cinematic hero — brand first */}
      <section className="hero-bleed full-bleed">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImage}
          alt=""
          className="hero-bleed__media"
          fetchPriority="high"
          referrerPolicy="no-referrer"
        />
        <div className="hero-bleed__shade" aria-hidden />
        <div className="hero-bleed__content">
          <p className="hero-kicker fade-up">
            {isFr ? "Guide officiel du tourisme" : "Official tourism guide"}
          </p>
          <h1 className="hero-brand fade-up-delay">
            Visit <span>Cameroon</span>
          </h1>
          <p className="hero-lead fade-up-delay-2">{strings.hero.subtitle}</p>
          <div className="fade-up-delay-2 mt-8 flex flex-wrap gap-3">
            <Link href="/trip" className="btn-pill btn-pill--light">
              {strings.hero.ctaTrip}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/assistant" className="btn-pill btn-pill--ghost">
              {strings.nav.assistant}
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-24 px-4 py-16 sm:px-6">
        {/* Experience curator */}
        <section>
          <p className="section-kicker">
            {isFr ? "Composer" : "Compose"}
          </p>
          <div className="cm-stripe mt-3 mb-4" />
          <h2 className="section-title text-3xl sm:text-4xl md:text-5xl">
            {strings.home.experienceTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-[var(--muted)]">
            {strings.home.curateBody}
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {EXPERIENCES.map((exp) => {
              const on = picked.includes(exp.id);
              return (
                <button
                  key={exp.id}
                  type="button"
                  className="experience-tile text-left"
                  data-on={on}
                  onClick={() => toggleExp(exp.id)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={exp.image}
                    alt={isFr ? exp.labelFr : exp.labelEn}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                  <span className="experience-tile__check">
                    {on ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                  </span>
                  <span className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <span className="font-[family-name:var(--font-display)] text-xl font-semibold sm:text-2xl">
                      {isFr ? exp.labelFr : exp.labelEn}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <Link href={curateHref} className="btn-pill btn-pill--green mt-8">
            {strings.home.curateCta}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        {/* Must do */}
        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="section-kicker">
                {isFr ? "À vivre" : "Must do"}
              </p>
              <div className="cm-stripe mt-3 mb-3" />
              <h2 className="section-title text-3xl sm:text-4xl md:text-5xl">
                {strings.home.mustDo}
              </h2>
            </div>
            <Link
              href="/things-to-do"
              className="text-sm font-semibold text-[var(--cm-green)] underline-offset-4 hover:underline"
            >
              {strings.home.viewAll}
            </Link>
          </div>
          <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
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
            {cards.map((d) => (
              <div key={d.id} className="relative">
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
                    <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl">
                      {isFr ? d.name : d.nameEn}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-sm text-white/80">
                      {isFr ? d.descriptionFr : d.descriptionEn}
                    </p>
                  </div>
                </Link>
                <div className="absolute right-3 top-3 z-10">
                  <FavoriteButton id={d.id} light />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Events */}
        <section>
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <div className="cm-stripe mb-3" />
              <h2 className="section-title text-3xl sm:text-4xl">
                {strings.home.happening}
              </h2>
            </div>
            <Link
              href="/events"
              className="text-sm font-semibold text-[var(--cm-green)] underline-offset-4 hover:underline"
            >
              {strings.home.viewAll}
            </Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-12">
            {events.map((ev, i) => (
              <Link
                key={ev.id}
                href="/events"
                className={
                  i === 0
                    ? "media-card col-span-full min-h-[320px] lg:col-span-7"
                    : "media-card col-span-full min-h-[200px] lg:col-span-5"
                }
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ev.image}
                  alt={isFr ? ev.titleFr : ev.titleEn}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="media-card__shade" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-xs font-semibold uppercase tracking-widest text-[var(--cm-yellow)]">
                    {isFr ? ev.dateLabelFr : ev.dateLabelEn} · {ev.city}
                  </p>
                  <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl sm:text-2xl">
                    {isFr ? ev.titleFr : ev.titleEn}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-white/80">
                    {isFr ? ev.summaryFr : ev.summaryEn}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Regions / culture */}
        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="cm-stripe mb-3" />
              <h2 className="section-title text-3xl sm:text-4xl">
                {strings.home.neighbourhoods}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="seg-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  data-active={destMode === "regions"}
                  aria-selected={destMode === "regions"}
                  onClick={() => setDestMode("regions")}
                >
                  {strings.home.regionsTab}
                </button>
                <button
                  type="button"
                  role="tab"
                  data-active={destMode === "culture"}
                  aria-selected={destMode === "culture"}
                  onClick={() => setDestMode("culture")}
                >
                  {strings.home.cultureTab}
                </button>
              </div>
              <Link
                href={destMode === "culture" ? "/culture" : "/explore"}
                className="text-sm font-semibold text-[var(--cm-green)] underline-offset-4 hover:underline"
              >
                {strings.home.viewAll}
              </Link>
            </div>
          </div>

          {destMode === "regions" ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {regions.map((r) => {
                const count = places.filter((d) =>
                  placeMatchesRegion(d, r),
                ).length;
                return (
                  <Link
                    key={r.id}
                    href={r.href}
                    className="media-card region-card aspect-[4/5]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.image}
                      alt={isFr ? r.nameFr : r.nameEn}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="media-card__shade" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--cm-yellow)]">
                        {r.culturalZone}
                      </p>
                      <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl sm:text-2xl">
                        {isFr ? r.nameFr : r.nameEn}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-white/80 sm:text-sm">
                        {isFr ? r.taglineFr : r.taglineEn}
                      </p>
                      {count > 0 && (
                        <p className="mt-2 text-[11px] font-medium text-white/70">
                          {count} {isFr ? "lieux" : "places"}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {culturalAreas.map((area) => {
                const sites = places.filter(
                  (d) =>
                    d.culturalZone === area.id && d.category !== "restauration",
                );
                return (
                  <Link
                    key={area.id}
                    href={area.href}
                    className="media-card aspect-[4/5]"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={area.image}
                      alt={isFr ? area.nameFr : area.nameEn}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="media-card__shade" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--cm-yellow)]">
                        {isFr ? "Aire culturelle" : "Cultural area"}
                      </p>
                      <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl">
                        {isFr ? area.nameFr : area.nameEn}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm text-white/80">
                        {isFr ? area.summaryFr : area.summaryEn}
                      </p>
                      <p className="mt-3 text-[11px] font-medium text-white/70">
                        {sites.length} {isFr ? "lieux" : "places"} ·{" "}
                        {area.regionIds.length}{" "}
                        {isFr ? "régions" : "regions"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* Ecotourism with real indicative prices */}
        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="cm-stripe mb-3" />
              <h2 className="section-title text-3xl sm:text-4xl">
                {isFr
                  ? "Écotourisme & gestion durable"
                  : "Ecotourism & sustainable management"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
                {isFr
                  ? "Parcs, nature et bons gestes : tarifs indicatifs, guide local, zéro trace. Confirmez toujours sur place."
                  : "Parks, nature and good practices: indicative fees, local guides, leave no trace. Always confirm on site."}
              </p>
            </div>
            <Link
              href="/eco"
              className="text-sm font-semibold text-[var(--cm-green)] underline-offset-4 hover:underline"
            >
              {strings.home.viewAll}
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ecoHighlights.map((eco) => (
              <Link
                key={eco.id}
                href={eco.href}
                className="media-card aspect-[4/5]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={eco.image}
                  alt={isFr ? eco.nameFr : eco.nameEn}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
                <div className="media-card__shade" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--cm-yellow)]">
                    {isFr ? eco.cityFr : eco.cityEn}
                  </p>
                  <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl sm:text-2xl">
                    {isFr ? eco.nameFr : eco.nameEn}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-white/80">
                    {isFr ? eco.summaryFr : eco.summaryEn}
                  </p>
                  <p className="mt-3 text-xs font-semibold text-white">
                    {isFr ? eco.priceFr : eco.priceEn}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Curate CTA band */}
        <section className="cta-band relative isolate">
          <div
            className="pointer-events-none absolute inset-0 opacity-25"
            aria-hidden
            style={{
              backgroundImage: `url(${experienceMedia.plage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="relative z-10 max-w-2xl p-8 sm:p-12 lg:p-14">
            <p className="hero-kicker text-white/70">
              {isFr ? "Assistant IA" : "AI guide"}
            </p>
            <h2 className="section-title mt-3 text-3xl sm:text-4xl md:text-5xl">
              {strings.home.curate}
            </h2>
            <p className="mt-4 max-w-md text-white/78">
              {strings.home.curateBody}
            </p>
            <Link href="/assistant" className="btn-pill btn-pill--light mt-8">
              {strings.nav.assistant}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
