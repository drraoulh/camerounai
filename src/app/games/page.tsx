"use client";

import Link from "next/link";
import { ArrowRight, Landmark, Languages } from "lucide-react";
import { PageHero, PageShell } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";
import { experienceMedia } from "@/data/home-media";
import { events } from "@/data/events";
import { ProgressHud } from "@/components/games/ProgressHud";
import { useGameProgress } from "@/components/games/GameProgressProvider";
import { ACHIEVEMENTS, RANKS, rankForXp } from "@/lib/game-progress";

export default function GamesHubPage() {
  const { locale, strings } = useLocale();
  const { progress } = useGameProgress();
  const isFr = locale === "fr";
  const ngondo = events.find((e) => e.id === "ngondo")?.image ?? experienceMedia.culture;
  const rank = rankForXp(progress.xp);

  return (
    <PageShell>
      <PageHero title={strings.games.title} subtitle={strings.games.subtitle} />
      <ProgressHud />

      <p className="mb-6 max-w-2xl text-sm text-[var(--muted)]">
        {strings.games.choose}
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <Link
          href="/games/langue"
          className="group overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-white shadow-sm"
        >
          <div className="relative min-h-[240px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={experienceMedia.culture}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[var(--cm-green)]">
              <Languages className="h-3.5 w-3.5" />
              {isFr ? "Mission Locale" : "Local Mission"}
            </span>
          </div>
          <div className="p-6 sm:p-8">
            <h2 className="section-title text-3xl">{strings.games.language}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              {strings.games.languageBody}
            </p>
            <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--cm-green)]">
              {strings.games.playLangue}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </p>
          </div>
        </Link>

        <Link
          href="/games/culture"
          className="group overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-white shadow-sm"
        >
          <div className="relative min-h-[240px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ngondo}
              alt=""
              className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[var(--cm-red)]">
              <Landmark className="h-3.5 w-3.5" />
              {progress.regions.length}/10
            </span>
          </div>
          <div className="p-6 sm:p-8">
            <h2 className="section-title text-3xl">{strings.games.culture}</h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              {strings.games.cultureBody}
            </p>
            <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--cm-green)]">
              {strings.games.playCulture}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </p>
          </div>
        </Link>
      </div>

      <h2 className="section-title mt-12 text-2xl">
        {isFr ? "Les 5 rangs" : "The 5 ranks"}
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {isFr
          ? "La même progression pour un visiteur et pour un Camerounais."
          : "The same path for a visitor and for a Cameroonian."}
      </p>
      <ol className="mt-4 space-y-3">
        {RANKS.map((r) => {
          const active = rank.id === r.id;
          const done = progress.xp >= r.xp;
          return (
            <li
              key={r.id}
              className="flex gap-4 rounded-2xl border px-4 py-4"
              style={{
                borderColor: active ? "var(--cm-green)" : "var(--line)",
                background: active ? "var(--accent-soft)" : "#fff",
              }}
            >
              <span className="text-2xl" aria-hidden>
                {r.emoji}
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
                  {isFr ? "Niveau" : "Level"} {r.id}
                  {done ? " · ✓" : ""}
                  {active ? (isFr ? " · vous êtes ici" : " · you are here") : ""}
                </p>
                <p className="font-[family-name:var(--font-display)] text-xl">
                  {isFr ? r.titleFr : r.titleEn}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  {isFr ? r.blurbFr : r.blurbEn} · {r.xp} XP
                </p>
              </div>
            </li>
          );
        })}
      </ol>

      <h2 className="section-title mt-12 text-2xl">
        {isFr ? "Trophées" : "Trophies"}
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {ACHIEVEMENTS.map((a) => {
          const on = progress.achievements.includes(a.id);
          return (
            <li
              key={a.id}
              className="rounded-2xl border border-[var(--line)] p-4"
              style={{ opacity: on ? 1 : 0.55 }}
            >
              <p className="text-lg">
                {a.emoji} {isFr ? a.titleFr : a.titleEn}
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {isFr ? a.bodyFr : a.bodyEn}
              </p>
            </li>
          );
        })}
      </ul>

      <p className="mt-8 text-xs text-[var(--muted)]">
        {isFr
          ? "Niveau pédagogique : initiation de séjour. Prononciations et graphies peuvent varier selon les villages. L’audio utilise la synthèse vocale du navigateur."
          : "Educational level: stay introduction. Pronunciation and spelling can vary by village. Audio uses the browser’s speech synthesis."}
      </p>
    </PageShell>
  );
}
