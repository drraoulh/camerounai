"use client";

import Link from "next/link";
import { RANKS, nextRank, rankForXp } from "@/lib/game-progress";
import { useGameProgress } from "./GameProgressProvider";
import { useLocale } from "@/components/LocaleProvider";

export function ProgressHud() {
  const { locale } = useLocale();
  const { progress } = useGameProgress();
  const isFr = locale === "fr";
  const rank = rankForXp(progress.xp);
  const upcoming = nextRank(progress.xp);
  const floor = rank.xp;
  const ceil = upcoming?.xp ?? rank.xp;
  const span = Math.max(ceil - floor, 1);
  const pct = upcoming ? Math.min(100, Math.round(((progress.xp - floor) / span) * 100)) : 100;

  return (
    <section className="mb-8 rounded-2xl border border-[var(--line)] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cm-green)]">
            {isFr ? "Progression" : "Progress"}
          </p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-2xl">
            {rank.emoji} {isFr ? rank.titleFr : rank.titleEn}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {progress.xp} XP
            {upcoming
              ? ` · ${isFr ? "prochain" : "next"} : ${upcoming.emoji} ${
                  isFr ? upcoming.titleFr : upcoming.titleEn
                } (${upcoming.xp} XP)`
              : isFr
                ? " · rang maximum"
                : " · top rank"}
          </p>
        </div>
        <p className="text-xs text-[var(--muted)]">
          {progress.expressions.length}{" "}
          {isFr ? "expressions" : "phrases"} · {progress.regions.length}/10{" "}
          {isFr ? "régions" : "regions"}
        </p>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--bg-soft)]">
        <div
          className="h-full rounded-full bg-[var(--cm-green)] transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <ol className="mt-4 hidden gap-2 sm:flex">
        {RANKS.map((r) => {
          const on = progress.xp >= r.xp;
          return (
            <li
              key={r.id}
              className="flex-1 text-center text-[10px] font-semibold"
              style={{ color: on ? "var(--cm-green)" : "var(--muted)" }}
            >
              {r.emoji} N{r.id}
            </li>
          );
        })}
      </ol>
      <p className="mt-3 text-[11px] text-[var(--muted)]">
        {isFr
          ? "Voyageurs et Camerounais : la même échelle. +20 XP par bonne réponse."
          : "Travellers and Cameroonians: the same ladder. +20 XP per correct answer."}{" "}
        <Link href="/games" className="font-semibold text-[var(--cm-green)] hover:underline">
          {isFr ? "Voir les rangs" : "See ranks"}
        </Link>
      </p>
    </section>
  );
}
