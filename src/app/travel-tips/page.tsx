"use client";

import Link from "next/link";
import { Plane, TrainFront, Bus, ShieldCheck, HeartPulse } from "lucide-react";
import { PageHero, PageShell } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";
import {
  formalities,
  healthTips,
  hubs,
  moreTips,
} from "@/data/travel-practical";

export default function TravelTipsPage() {
  const { locale, strings } = useLocale();
  const isFr = locale === "fr";

  const airports = hubs.filter((h) => h.kind === "airport");
  const rails = hubs.filter((h) => h.kind === "rail");
  const buses = hubs.filter((h) => h.kind === "bus");

  return (
    <PageShell>
      <PageHero title={strings.tips.title} subtitle={strings.tips.subtitle} />

      <p className="mb-8 max-w-3xl rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-xs leading-relaxed text-amber-950/80 sm:text-sm">
        {isFr
          ? "Informations indicatives pour préparer votre voyage. Vérifiez toujours visa, vaccins et horaires auprès des ambassades, compagnies aériennes et autorités sanitaires."
          : "Indicative information to prepare your trip. Always verify visas, vaccines and schedules with embassies, airlines and health authorities."}
      </p>

      {/* Formalities */}
      <section className="mb-14">
        <div className="mb-5 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-[var(--cm-green)]" />
          <h2 className="section-title text-2xl sm:text-3xl">
            {isFr ? "Formalités avant d’arriver" : "Formalities before arrival"}
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {formalities.map((t) => (
            <article
              key={t.id}
              className="rounded-2xl border border-[var(--line)] bg-white p-5"
            >
              <h3 className="font-[family-name:var(--font-display)] text-xl">
                {isFr ? t.titleFr : t.titleEn}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                {isFr ? t.bodyFr : t.bodyEn}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Health */}
      <section className="mb-14">
        <div className="mb-5 flex items-center gap-2">
          <HeartPulse className="h-5 w-5 text-[var(--cm-red)]" />
          <h2 className="section-title text-2xl sm:text-3xl">
            {isFr ? "Santé & prévention" : "Health & prevention"}
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {healthTips.map((t) => (
            <article
              key={t.id}
              className="rounded-2xl border border-[var(--line)] bg-white p-5"
            >
              <h3 className="font-[family-name:var(--font-display)] text-xl">
                {isFr ? t.titleFr : t.titleEn}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                {isFr ? t.bodyFr : t.bodyEn}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Airports */}
      <section className="mb-14">
        <div className="mb-5 flex items-center gap-2">
          <Plane className="h-5 w-5 text-[var(--cm-green)]" />
          <h2 className="section-title text-2xl sm:text-3xl">
            {isFr ? "Aéroports" : "Airports"}
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {airports.map((h) => (
            <article
              key={h.id}
              className="rounded-2xl border border-[var(--line)] bg-white p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-[family-name:var(--font-display)] text-lg sm:text-xl">
                  {isFr ? h.nameFr : h.nameEn}
                </h3>
                {h.code && (
                  <span className="rounded-full bg-[var(--accent-soft)] px-2.5 py-0.5 text-xs font-bold text-[var(--cm-green)]">
                    {h.code}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                {h.city}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                {isFr ? h.noteFr : h.noteEn}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Rail + bus */}
      <section className="mb-14">
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <TrainFront className="h-5 w-5 text-[var(--ink)]" />
          <Bus className="h-5 w-5 text-[var(--ink)]" />
          <h2 className="section-title text-2xl sm:text-3xl">
            {isFr ? "Gares ferroviaires & routières" : "Rail & bus stations"}
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[...rails, ...buses].map((h) => (
            <article
              key={h.id}
              className="rounded-2xl border border-[var(--line)] bg-white p-5"
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--cm-green)]">
                {h.kind === "rail"
                  ? isFr
                    ? "Train"
                    : "Rail"
                  : isFr
                    ? "Bus"
                    : "Bus"}
              </p>
              <h3 className="mt-1 font-[family-name:var(--font-display)] text-lg sm:text-xl">
                {isFr ? h.nameFr : h.nameEn}
              </h3>
              <p className="mt-1 text-xs text-[var(--muted)]">{h.city}</p>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                {isFr ? h.noteFr : h.noteEn}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* More */}
      <section>
        <h2 className="section-title mb-5 text-2xl sm:text-3xl">
          {isFr ? "Autres essentiels" : "Other essentials"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {moreTips.map((t) => (
            <article
              key={t.id}
              className="rounded-2xl border border-[var(--line)] bg-white p-5"
            >
              <h3 className="font-[family-name:var(--font-display)] text-xl">
                {isFr ? t.titleFr : t.titleEn}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                {isFr ? t.bodyFr : t.bodyEn}
              </p>
            </article>
          ))}
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/about"
          className="rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          {isFr ? "Histoire du pays" : "Country history"}
        </Link>
        <Link
          href="/trip"
          className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-semibold"
        >
          {strings.nav.plan}
        </Link>
        <Link
          href="/learn"
          className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-semibold"
        >
          {strings.nav.learn}
        </Link>
        <Link
          href="/assistant"
          className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-semibold"
        >
          {strings.nav.assistant}
        </Link>
      </div>
    </PageShell>
  );
}
