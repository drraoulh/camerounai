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
  const { places, source, ready } = usePlaces();
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
    <div className="pb-4">
      {/* Visit Dubai-style inset rounded hero */}
      <section className="hero-shell full-bleed">
        <div className="hero-frame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt="Visit Cameroon"
            className="hero-frame__media absolute inset-0 h-full w-full object-cover"
            fetchPriority="high"
            referrerPolicy="no-referrer"
          />
          <div className="hero-frame__shade" />
          <div className="relative z-10 w-full max-w-3xl px-6 pb-10 pt-24 sm:px-10 sm:pb-14 md:px-14">
            <p className="fade-up text-xs font-semibold uppercase tracking-[0.28em] text-[var(--cm-yellow)]">
              Visit Cameroon
              {ready && source === "supabase" ? ` · ${places.length} lieux` : ""}
            </p>
            <h1 className="fade-up-delay brand-wordmark mt-3 text-4xl text-white sm:text-5xl md:text-6xl">
              {strings.hero.title}
            </h1>
            <p className="fade-up-delay-2 mt-4 max-w-xl text-base text-white/90 sm:text-lg">
              {strings.hero.subtitle}
            </p>
            <div className="fade-up-delay-2 mt-8 flex flex-wrap gap-3">
              <Link href="/things-to-do" className="btn-pill btn-pill--light">
                {strings.hero.ctaAssistant}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/trip" className="btn-pill btn-pill--ghost">
                {strings.hero.ctaTrip}
              </Link>
              <Link href="/assistant" className="btn-pill btn-pill--ghost">
                {strings.nav.assistant}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-20 px-4 py-14 sm:px-6">
        {/* Experience curator — Visit Dubai pattern */}
        <section>
          <div className="cm-stripe mb-4" />
          <h2 className="section-title text-3xl sm:text-4xl">
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
                    <span className="text-base font-semibold">
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
              <div className="cm-stripe mb-3" />
              <h2 className="section-title text-3xl sm:text-4xl">
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
                    className="group overflow-hidden rounded-[1.35rem] border border-[var(--line)] bg-white shadow-sm"
                  >
                    <div className="media-card aspect-[16/10] rounded-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={area.image}
                        alt={isFr ? area.nameFr : area.nameEn}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="p-5">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--cm-green)]">
                        {isFr ? "Aire culturelle" : "Cultural area"}
                      </p>
                      <h3 className="mt-1 font-[family-name:var(--font-display)] text-2xl group-hover:underline">
                        {isFr ? area.nameFr : area.nameEn}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm text-[var(--muted)]">
                        {isFr ? area.summaryFr : area.summaryEn}
                      </p>
                      <p className="mt-3 text-[11px] font-medium text-[var(--cm-red)]">
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
                className="group overflow-hidden rounded-[1.25rem] border border-[var(--line)] bg-white shadow-sm"
              >
                <div className="media-card aspect-[16/10] rounded-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={eco.image}
                    alt={isFr ? eco.nameFr : eco.nameEn}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--cm-green)]">
                    {isFr ? eco.cityFr : eco.cityEn}
                  </p>
                  <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl group-hover:underline">
                    {isFr ? eco.nameFr : eco.nameEn}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
                    {isFr ? eco.summaryFr : eco.summaryEn}
                  </p>
                  <p className="mt-3 text-xs font-semibold text-[var(--ink)]">
                    {isFr ? eco.priceFr : eco.priceEn}
                  </p>
                  <p className="mt-1 text-[10px] text-[var(--muted)]">
                    {isFr ? eco.sourceNoteFr : eco.sourceNoteEn}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Curate CTA band */}
        <section className="overflow-hidden rounded-[2rem] bg-[var(--cm-green-deep)] text-white">
          <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="section-title text-3xl sm:text-4xl">
                {strings.home.curate}
              </h2>
              <p className="mt-4 max-w-md text-white/75">
                {strings.home.curateBody}
              </p>
              <Link
                href="/assistant"
                className="btn-pill btn-pill--light mt-8"
              >
                {strings.nav.assistant}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div
              className="relative min-h-[240px] overflow-hidden rounded-[1.35rem]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={experienceMedia.plage}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
