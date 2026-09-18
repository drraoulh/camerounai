"use client";

import Link from "next/link";
import { expressions } from "@/data/expressions";
import { PageHero, PageShell } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";

export default function LearnPage() {
  const { locale, strings } = useLocale();
  const isFr = locale === "fr";

  return (
    <PageShell>
      <PageHero title={strings.learn.title} subtitle={strings.learn.subtitle} />
      <div className="mb-8 rounded-2xl border border-[var(--line)] bg-[var(--accent-soft)] p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--cm-green)]">
            {strings.nav.games}
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-xl">
            {isFr
              ? "Entraînez-vous avec les jeux"
              : "Practise with the games"}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {isFr
              ? "Choisissez langues maternelles ou culture camerounaise, puis lancez un quiz ou une mémoire."
              : "Choose mother tongues or Cameroonian culture, then start a quiz or a memory game."}
          </p>
        </div>
        <Link href="/games" className="btn-pill btn-pill--green mt-4 shrink-0 sm:mt-0">
          {isFr ? "Ouvrir les jeux" : "Open games"}
        </Link>
      </div>
      <p className="mb-6 text-xs text-amber-800/80">
        {isFr
          ? "Niveau pédagogique : confiance variable pour les langues locales."
          : "Educational level : confidence may vary for local languages."}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {expressions.map((e) => (
          <article key={e.id} className="border border-[var(--line)] bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">
              {e.language}
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-3xl">{e.phrase}</p>
            <p className="text-[var(--ink)]">{isFr ? e.translationFr : e.translationEn}</p>
            <p className="mt-1 text-sm italic text-[var(--muted)]">[{e.pronunciation}]</p>
            <p className="mt-3 text-sm text-[var(--muted)]">
              {isFr ? e.contextFr : e.contextEn}
            </p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
