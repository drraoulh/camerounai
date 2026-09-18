"use client";

import Link from "next/link";
import { PageHero, PageShell } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";
import { countryFacts } from "@/data/country";

export default function AboutCountryPage() {
  const { locale, strings } = useLocale();
  const isFr = locale === "fr";
  const history = isFr ? countryFacts.historyFr : countryFacts.historyEn;
  const symbols = isFr ? countryFacts.symbolsFr : countryFacts.symbolsEn;

  return (
    <PageShell>
      <PageHero
        title={isFr ? "Le Cameroun" : "Cameroon"}
        subtitle={
          isFr
            ? "Histoire, institutions et repères pour comprendre le pays avant d’y voyager."
            : "History, institutions and key facts to understand the country before you travel."
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cm-green)]">
            {isFr ? "Histoire" : "History"}
          </p>
          <h2 className="section-title mt-2 text-2xl sm:text-3xl">
            {isFr ? countryFacts.nameFr : countryFacts.nameEn}
          </h2>
          <p className="mt-3 text-sm text-[var(--muted)]">
            {isFr ? countryFacts.independence.fr : countryFacts.independence.en}
          </p>
          <ol className="mt-8 space-y-6">
            {history.map((h, i) => (
              <li key={h.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-sm font-bold text-[var(--cm-green)]">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-[family-name:var(--font-display)] text-xl">
                    {h.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                    {h.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cm-red)]">
              {isFr ? "Institutions" : "Institutions"}
            </p>
            <h2 className="section-title mt-2 text-2xl">
              {countryFacts.president.name}
            </h2>
            <p className="mt-1 text-sm font-medium text-[var(--ink)]">
              {isFr
                ? countryFacts.president.titleFr
                : countryFacts.president.titleEn}{" "}
              · {isFr ? "depuis" : "since"} {countryFacts.president.since}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              {isFr
                ? countryFacts.president.noteFr
                : countryFacts.president.noteEn}
            </p>
            <p className="mt-4 text-sm text-[var(--muted)]">
              {isFr ? countryFacts.governmentFr : countryFacts.governmentEn}
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
              {isFr ? "Repères" : "At a glance"}
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-[var(--line)] pb-2">
                <dt className="text-[var(--muted)]">{isFr ? "Capitale" : "Capital"}</dt>
                <dd className="font-medium text-right">
                  {isFr ? countryFacts.capitalFr : countryFacts.capitalEn}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-[var(--line)] pb-2">
                <dt className="text-[var(--muted)]">
                  {isFr ? "Hub économique" : "Economic hub"}
                </dt>
                <dd className="font-medium text-right">
                  {isFr ? countryFacts.economicHubFr : countryFacts.economicHubEn}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-[var(--line)] pb-2">
                <dt className="text-[var(--muted)]">{isFr ? "Monnaie" : "Currency"}</dt>
                <dd className="font-medium text-right">{countryFacts.currency}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-[var(--line)] pb-2">
                <dt className="text-[var(--muted)]">
                  {isFr ? "Langues officielles" : "Official languages"}
                </dt>
                <dd className="font-medium text-right">
                  {(isFr
                    ? countryFacts.officialLanguagesFr
                    : countryFacts.officialLanguagesEn
                  ).join(" · ")}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-[var(--line)] pb-2">
                <dt className="text-[var(--muted)]">{isFr ? "Régions" : "Regions"}</dt>
                <dd className="font-medium text-right">{countryFacts.regionsCount}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-[var(--muted)]">{isFr ? "Devise" : "Motto"}</dt>
                <dd className="font-medium text-right">{symbols.motto}</dd>
              </div>
            </dl>
            <p className="mt-4 text-xs text-[var(--muted)]">
              {isFr ? "Drapeau : " : "Flag: "}
              {symbols.flag}
            </p>
          </div>
        </aside>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/travel-tips"
          className="rounded-full bg-[var(--cm-green)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          {isFr ? "Formalités & santé" : "Formalities & health"}
        </Link>
        <Link
          href="/explore"
          className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-semibold"
        >
          {strings.nav.explore}
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
