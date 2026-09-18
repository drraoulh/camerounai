"use client";

import Link from "next/link";
import {
  ArrowRight,
  HandCoins,
  Leaf,
  Recycle,
  Trees,
  Users,
} from "lucide-react";
import { PageHero, PageShell } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";
import { usePlaces } from "@/components/PlacesProvider";
import { TourismMap } from "@/components/TourismMap";
import {
  ecoIntro,
  ecoPillars,
  ecoPlatformCommitments,
  ecoVisitorPractices,
} from "@/data/eco-sustainable";
import { ecoHighlights } from "@/data/home-media";

const pillarIcon = {
  environment: Trees,
  economy: HandCoins,
  social: Users,
} as const;

export default function EcoPage() {
  const { locale, strings } = useLocale();
  const { places } = usePlaces();
  const isFr = locale === "fr";
  const ecoPlaces = places.filter(
    (d) =>
      d.ecoTags.length > 0 ||
      ["parc", "reserve", "cascade", "montagne"].includes(d.category),
  );

  return (
    <PageShell>
      <PageHero title={strings.eco.title} subtitle={strings.eco.subtitle} />

      <p className="mb-10 inline-flex items-center gap-2 rounded-full border border-[var(--cm-green)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--cm-green)]">
        <Leaf className="h-4 w-4" aria-hidden />
        {strings.eco.responsible}
      </p>

      {/* Qu’est-ce que c’est */}
      <section className="mb-12 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[1.25rem] border border-[var(--line)] bg-white p-5 sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cm-green)]">
            {strings.eco.whatTitle}
          </p>
          <h2 className="section-title mt-2 text-2xl">
            {isFr ? "Écotourisme" : "Ecotourism"}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
            {isFr ? ecoIntro.whatFr : ecoIntro.whatEn}
          </p>
        </div>
        <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--cm-green-deep)] p-5 text-white sm:p-7">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
            {strings.eco.whatTitle}
          </p>
          <h2 className="section-title mt-2 text-2xl">
            {isFr ? "Gestion durable" : "Sustainable management"}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            {isFr ? ecoIntro.manageFr : ecoIntro.manageEn}
          </p>
        </div>
      </section>

      {/* Trois piliers */}
      <section className="mb-12">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="cm-stripe mb-3" />
            <h2 className="section-title text-2xl sm:text-3xl">
              {strings.eco.pillarsTitle}
            </h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {ecoPillars.map((p) => {
            const Icon = pillarIcon[p.id];
            return (
              <article
                key={p.id}
                className="rounded-[1.25rem] border border-[var(--line)] bg-white p-5"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--cm-green)]">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-xl">
                  {isFr ? p.titleFr : p.titleEn}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                  {isFr ? p.bodyFr : p.bodyEn}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Gestes voyageur */}
      <section className="mb-12">
        <div className="mb-5">
          <div className="cm-stripe mb-3" />
          <h2 className="section-title text-2xl sm:text-3xl">
            {strings.eco.visitorTitle}
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ecoVisitorPractices.map((item) => (
            <article
              key={item.id}
              className="rounded-[1rem] border border-[var(--line)] bg-white p-4"
            >
              <h3 className="font-semibold text-[var(--ink)]">
                {isFr ? item.titleFr : item.titleEn}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {isFr ? item.bodyFr : item.bodyEn}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Engagement plateforme */}
      <section className="mb-12 overflow-hidden rounded-[1.5rem] border border-[var(--line)] bg-white">
        <div className="grid gap-0 lg:grid-cols-[1fr_1.1fr]">
          <div className="border-b border-[var(--line)] p-5 sm:p-7 lg:border-b-0 lg:border-r">
            <div className="inline-flex items-center gap-2 text-[var(--cm-green)]">
              <Recycle className="h-5 w-5" aria-hidden />
              <p className="text-xs font-semibold uppercase tracking-[0.2em]">
                {strings.eco.platformTitle}
              </p>
            </div>
            <h2 className="section-title mt-3 text-2xl">
              {isFr
                ? "Comment on gère ça ici"
                : "How we handle it here"}
            </h2>
            <p className="mt-3 text-sm text-[var(--muted)]">
              {isFr
                ? "Visit Cameroon oriente vers des expériences nature financées correctement et respectueuses des communautés."
                : "Visit Cameroon steers you toward nature experiences that are properly funded and respectful of communities."}
            </p>
            <Link
              href="/assistant"
              className="btn-pill mt-6 inline-flex"
            >
              {strings.eco.ctaAssistant}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <ul className="divide-y divide-[var(--line)]">
            {ecoPlatformCommitments.map((c) => (
              <li key={c.id} className="p-5 sm:px-7 sm:py-6">
                <h3 className="font-semibold">{isFr ? c.titleFr : c.titleEn}</h3>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {isFr ? c.bodyFr : c.bodyEn}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Parcs tarifs */}
      <section className="mb-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="cm-stripe mb-3" />
            <h2 className="section-title text-2xl sm:text-3xl">
              {strings.eco.parksTitle}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
              {strings.eco.parksBody}
            </p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                <p className="mt-2 text-sm text-[var(--muted)]">
                  {isFr ? eco.summaryFr : eco.summaryEn}
                </p>
                <p className="mt-3 text-sm font-semibold text-[var(--ink)]">
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

      {/* Carte + liste */}
      <section>
        <div className="mb-5">
          <div className="cm-stripe mb-3" />
          <h2 className="section-title text-2xl sm:text-3xl">
            {strings.eco.mapTitle}
          </h2>
        </div>
        <TourismMap places={ecoPlaces} locale={locale} />
        <h3 className="mt-8 mb-4 font-[family-name:var(--font-display)] text-xl">
          {strings.eco.listTitle}{" "}
          <span className="text-[var(--muted)]">({ecoPlaces.length})</span>
        </h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {ecoPlaces.map((d) => (
            <li
              key={d.id}
              className="rounded-[1rem] border border-[var(--line)] bg-white p-4 text-sm"
            >
              <Link
                href={`/destinations/${d.id}`}
                className="font-semibold hover:underline"
              >
                {isFr ? d.name : d.nameEn}
              </Link>
              <p className="mt-1 text-[var(--cm-green)]">
                {d.ecoTags.length ? d.ecoTags.join(" · ") : d.category}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {d.city}
                {d.estimatedCostFcfa > 0
                  ? ` · ~${d.estimatedCostFcfa.toLocaleString("fr-FR")} FCFA`
                  : ""}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </PageShell>
  );
}
