"use client";

import { useEffect, useState } from "react";
import { Check, RotateCcw, Sparkles, X } from "lucide-react";
import clsx from "clsx";
import type { RegionMission } from "@/data/culture-mastery";
import { XP_CORRECT, XP_MISSION_BONUS } from "@/lib/game-progress";
import { fetchCultureCoach } from "@/lib/game-coach";
import { useGameProgress } from "./GameProgressProvider";
import { useLocale } from "@/components/LocaleProvider";

type Props = {
  title: string;
  areaId?: string;
  regionId?: string;
  mission: RegionMission;
  onExit: () => void;
};

export function RegionPlay({ title, areaId, regionId, mission, onExit }: Props) {
  const { locale } = useLocale();
  const { reward, progress } = useGameProgress();
  const isFr = locale === "fr";
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [done, setDone] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);
  const [insight, setInsight] = useState<{ tip: string; source: "ai" | "local" } | null>(
    null,
  );

  const q = mission.questions[index];
  const total = mission.questions.length;

  useEffect(() => {
    setIndex(0);
    setPicked(null);
    setCorrectCount(0);
    setXpGained(0);
    setDone(false);
    setBanner(null);
    setInsight(null);
  }, [mission.regionId]);

  useEffect(() => {
    if (!picked || !q) {
      setInsight(null);
      return;
    }
    const ac = new AbortController();
    void fetchCultureCoach({
      locale,
      region: title,
      prompt: isFr ? q.promptFr : q.promptEn,
      when: isFr ? q.whenFr : q.whenEn,
      signal: ac.signal,
    }).then((card) => {
      if (!ac.signal.aborted) setInsight(card);
    });
    return () => ac.abort();
  }, [picked, q, locale, isFr, title]);

  const choose = (id: string) => {
    if (!q || picked) return;
    setPicked(id);
    if (id !== q.correctId) return;
    const already =
      (regionId && progress.regions.includes(regionId)) ||
      (areaId && progress.areas.includes(areaId));
    const result = reward({ xp: already ? 0 : XP_CORRECT });
    setCorrectCount((n) => n + 1);
    setXpGained((x) => x + (already ? 0 : XP_CORRECT));
    if (result.rankedUp) {
      setBanner(
        isFr
          ? `Nouveau rang : ${result.rankedUp.emoji} ${result.rankedUp.titleFr}`
          : `New rank: ${result.rankedUp.emoji} ${result.rankedUp.titleEn}`,
      );
    }
  };

  const next = () => {
    if (index + 1 < total) {
      setIndex((i) => i + 1);
      setPicked(null);
      return;
    }
    const firstClear = regionId
      ? !progress.regions.includes(regionId)
      : areaId
        ? !progress.areas.includes(areaId)
        : true;
    const bonus = reward({
      xp: firstClear ? XP_MISSION_BONUS : 0,
      regionId,
      areaId,
    });
    setXpGained((x) => x + (firstClear ? XP_MISSION_BONUS : 0));
    if (bonus.newAchievements.length) {
      const a = bonus.newAchievements[0];
      setBanner(
        isFr ? `🏆 ${a.titleFr}` : `🏆 ${a.titleEn}`,
      );
    } else if (bonus.rankedUp) {
      setBanner(
        isFr
          ? `Nouveau rang : ${bonus.rankedUp.emoji} ${bonus.rankedUp.titleFr}`
          : `New rank: ${bonus.rankedUp.emoji} ${bonus.rankedUp.titleEn}`,
      );
    }
    setDone(true);
  };

  if (done) {
    return (
      <section className="rounded-2xl border border-[var(--line)] bg-white p-6 sm:p-8">
        {banner && (
          <p className="mb-4 rounded-xl bg-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--cm-green)]">
            {banner}
          </p>
        )}
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cm-green)]">
          {isFr ? "Territoire culturel" : "Cultural territory"}
        </p>
        <h2 className="section-title mt-2 text-3xl">{title}</h2>
        <p className="mt-4 text-sm text-[var(--muted)]">
          {correctCount}/{total} · +{xpGained} XP
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-pill btn-pill--green"
            onClick={() => {
              setIndex(0);
              setPicked(null);
              setCorrectCount(0);
              setXpGained(0);
              setDone(false);
              setBanner(null);
              setInsight(null);
            }}
          >
            <RotateCcw className="h-4 w-4" />
            {isFr ? "Rejouer" : "Play again"}
          </button>
          <button
            type="button"
            className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-semibold"
            onClick={onExit}
          >
            {isFr ? "Autre région" : "Another region"}
          </button>
        </div>
      </section>
    );
  }

  if (!q) return null;
  const isCorrect = picked === q.correctId;

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cm-green)]">
        {title}
      </p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {isFr ? "Question" : "Question"} {index + 1}/{total}
      </p>
      <h2 className="section-title mt-4 text-2xl sm:text-3xl">
        {isFr ? q.promptFr : q.promptEn}
      </h2>
      <ul className="mt-6 grid gap-3">
        {q.options.map((opt) => {
          const selected = picked === opt.id;
          const showCorrect = Boolean(picked) && opt.id === q.correctId;
          const showWrong = selected && opt.id !== q.correctId;
          return (
            <li key={opt.id}>
              <button
                type="button"
                disabled={Boolean(picked)}
                onClick={() => choose(opt.id)}
                className={clsx(
                  "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-semibold transition",
                  !picked &&
                    "border-[var(--line)] hover:border-[var(--cm-green)] hover:bg-[var(--accent-soft)]",
                  showCorrect &&
                    "border-[var(--cm-green)] bg-[var(--accent-soft)] text-[var(--cm-green)]",
                  showWrong && "border-[var(--cm-red)] bg-[#fdecee] text-[var(--cm-red)]",
                  picked && !showCorrect && !showWrong && "border-[var(--line)] opacity-60",
                )}
              >
                <span>{isFr ? opt.labelFr : opt.labelEn}</span>
                {showCorrect && <Check className="h-5 w-5 shrink-0" />}
                {showWrong && <X className="h-5 w-5 shrink-0" />}
              </button>
            </li>
          );
        })}
      </ul>
      {picked && (
        <div className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-4">
          <p className="font-semibold">
            {isCorrect
              ? isFr
                ? `✅ Bonne réponse  ·  ⭐ +${XP_CORRECT} XP`
                : `✅ Correct  ·  ⭐ +${XP_CORRECT} XP`
              : isFr
                ? "Pas tout à fait"
                : "Not quite"}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            {isFr ? q.whenFr : q.whenEn}
          </p>
          {insight?.source === "ai" && (
            <p className="mt-3 flex gap-2 text-sm leading-relaxed text-[var(--ink)]">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--cm-green)]" />
              <span>{insight.tip}</span>
            </p>
          )}
          <button type="button" className="btn-pill btn-pill--green mt-4" onClick={next}>
            {index + 1 >= total
              ? isFr
                ? "Valider le territoire"
                : "Unlock this territory"
              : isFr
                ? "Question suivante"
                : "Next question"}
          </button>
        </div>
      )}
    </section>
  );
}
