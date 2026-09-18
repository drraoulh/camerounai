"use client";

import { useEffect, useState } from "react";
import { Check, RotateCcw, Sparkles, Volume2, X } from "lucide-react";
import clsx from "clsx";
import type { LocalMission } from "@/data/missions";
import { XP_CORRECT, XP_MISSION_BONUS } from "@/lib/game-progress";
import { languageVoice, type CoachCard } from "@/lib/cultural-voice";
import { fetchMissionCoach } from "@/lib/game-coach";
import { trackIdOf } from "@/data/missions";
import {
  prefetchCulturalAudio,
  speakCulturalPhrase,
  stopSpeaking,
} from "@/lib/speak";
import { playCorrectSound, playWrongSound } from "@/lib/game-sounds";
import { useGameProgress } from "./GameProgressProvider";
import { useLocale } from "@/components/LocaleProvider";

type Props = {
  mission: LocalMission;
  onExit: () => void;
};

export function MissionPlay({ mission, onExit }: Props) {
  const { locale } = useLocale();
  const { reward, progress } = useGameProgress();
  const isFr = locale === "fr";
  const langId = trackIdOf(mission);
  const voice = languageVoice(langId);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [speaking, setSpeaking] = useState<"off" | "normal" | "slow">("off");
  const [banner, setBanner] = useState<string | null>(null);
  const [coach, setCoach] = useState<CoachCard | null>(null);

  const step = mission.steps[index];
  const total = mission.steps.length;

  useEffect(() => {
    setIndex(0);
    setPicked(null);
    setCorrectCount(0);
    setXpGained(0);
    setUnlocked([]);
    setDone(false);
    setBanner(null);
    setCoach(null);
    stopSpeaking();
  }, [mission.id]);

  useEffect(() => () => stopSpeaking(), []);

  useEffect(() => {
    if (!step) return;
    prefetchCulturalAudio(langId, step.phrase, step.pronunciation, step.id);
    const ac = new AbortController();
    setCoach(null);
    void fetchMissionCoach({
      locale,
      langId,
      areaId: mission.areaId,
      language: mission.language,
      phrase: step.phrase,
      pronunciation: step.pronunciation,
      setting: isFr ? mission.settingFr : mission.settingEn,
      when: isFr ? step.whenFr : step.whenEn,
      signal: ac.signal,
    }).then((card) => {
      if (!ac.signal.aborted) setCoach(card);
    });
    return () => ac.abort();
  }, [
    step?.id,
    mission.areaId,
    mission.language,
    mission.settingEn,
    mission.settingFr,
    locale,
    isFr,
    langId,
  ]);

  const playAudio = (slow: boolean) => {
    if (!step) return;
    speakCulturalPhrase({
      langId,
      phrase: step.phrase,
      pronunciation: step.pronunciation,
      slow,
      stepId: step.id,
      listeners: {
        onStart: () => setSpeaking(slow ? "slow" : "normal"),
        onEnd: () => setSpeaking("off"),
      },
    });
  };

  const choose = (id: string) => {
    if (!step || picked) return;
    setPicked(id);
    const ok = id === step.correctId;
    if (ok) playCorrectSound();
    else playWrongSound();
    if (!ok) return;
    const already = progress.expressions.includes(step.id);
    const result = reward({
      xp: already ? 0 : XP_CORRECT,
      expressionId: step.id,
    });
    setCorrectCount((n) => n + 1);
    setXpGained((x) => x + (already ? 0 : XP_CORRECT));
    setUnlocked((u) => [...u, step.phrase]);
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
      stopSpeaking();
      return;
    }
    const firstClear = !progress.missions.includes(mission.id);
    const bonus = reward({
      xp: firstClear ? XP_MISSION_BONUS : 0,
      missionId: mission.id,
    });
    setXpGained((x) => x + (firstClear ? XP_MISSION_BONUS : 0));
    if (bonus.rankedUp) {
      setBanner(
        isFr
          ? `Nouveau rang : ${bonus.rankedUp.emoji} ${bonus.rankedUp.titleFr}`
          : `New rank: ${bonus.rankedUp.emoji} ${bonus.rankedUp.titleEn}`,
      );
    }
    setDone(true);
  };

  if (!step && !done) return null;

  if (done) {
    return (
      <section className="rounded-2xl border border-[var(--line)] bg-white p-6 sm:p-8">
        {banner && (
          <p className="mb-4 rounded-xl bg-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--cm-green)]">
            {banner}
          </p>
        )}
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cm-green)]">
          {isFr ? mission.codeFr : mission.codeEn}
        </p>
        <h2 className="section-title mt-2 text-3xl">
          {isFr ? "Mission accomplie" : "Mission complete"}
        </h2>
        <p className="mt-4 text-sm text-[var(--muted)]">
          {correctCount}/{total} · +{xpGained} XP
        </p>
        {unlocked.length > 0 && (
          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--cm-green)]">
              {isFr ? "Expressions débloquées" : "Phrases unlocked"}
            </p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {unlocked.map((p) => (
                <li
                  key={p}
                  className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-sm font-semibold text-[var(--cm-green)]"
                >
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-pill btn-pill--green"
            onClick={() => {
              setIndex(0);
              setPicked(null);
              setCorrectCount(0);
              setXpGained(0);
              setUnlocked([]);
              setDone(false);
              setBanner(null);
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
            {isFr ? "Autre mission" : "Another mission"}
          </button>
        </div>
      </section>
    );
  }

  const isCorrect = picked === step.correctId;
  const tone = coach?.tone ?? (isFr ? voice.toneFr : voice.toneEn);

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-8">
      {banner && (
        <p className="mb-4 rounded-xl bg-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--cm-green)]">
          {banner}
        </p>
      )}
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cm-red)]">
        📍 {isFr ? mission.codeFr : mission.codeEn}
      </p>
      <h2 className="section-title mt-2 text-2xl sm:text-3xl">
        {isFr ? mission.titleFr : mission.titleEn}
      </h2>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {isFr ? "Étape" : "Step"} {index + 1}/{total} · {mission.language}
      </p>
      <p className="mt-4 rounded-xl bg-[var(--bg-soft)] px-4 py-3 text-sm leading-relaxed text-[var(--ink)]">
        {isFr ? mission.settingFr : mission.settingEn}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-[var(--cm-green)]">
        {tone}
      </p>

      <div className="mt-6 rounded-2xl border border-[var(--line)] p-4 sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
          {isFr ? step.speakerFr : step.speakerEn}
        </p>
        <p className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--cm-green)]">
          {step.phrase}
        </p>
        <p className="mt-1 text-sm italic text-[var(--muted)]">
          [{coach?.syllables || step.pronunciation}]
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => playAudio(false)}
            className="btn-pill btn-pill--green"
          >
            <Volume2
              className={clsx("h-4 w-4", speaking === "normal" && "animate-pulse")}
            />
            {isFr ? "Écouter (ton de l’aire)" : "Listen (area tone)"}
          </button>
          <button
            type="button"
            onClick={() => playAudio(true)}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-4 py-2.5 text-sm font-semibold"
          >
            <Volume2
              className={clsx("h-4 w-4", speaking === "slow" && "animate-pulse")}
            />
            {isFr ? "Lentement" : "Slowly"}
          </button>
        </div>
      </div>

      <h3 className="section-title mt-6 text-xl sm:text-2xl">
        {isFr ? step.promptFr : step.promptEn}
      </h3>

      <ul className="mt-4 grid gap-3">
        {step.options.map((opt) => {
          const selected = picked === opt.id;
          const showCorrect = Boolean(picked) && opt.id === step.correctId;
          const showWrong = selected && opt.id !== step.correctId;
          return (
            <li key={opt.id}>
              <button
                type="button"
                disabled={Boolean(picked)}
                onClick={() => choose(opt.id)}
                className={clsx(
                  "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-semibold transition sm:text-base",
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
          {isCorrect ? (
            <p className="font-semibold text-[var(--cm-green)]">
              {isFr
                ? `✅ Bonne réponse  ·  ⭐ +${XP_CORRECT} XP  ·  🗣️ Expression débloquée`
                : `✅ Correct  ·  ⭐ +${XP_CORRECT} XP  ·  🗣️ Phrase unlocked`}
            </p>
          ) : (
            <p className="font-semibold text-[var(--cm-red)]">
              {isFr ? "Pas tout à fait — lisez quand l’utiliser." : "Not quite — see when to use it."}
            </p>
          )}
          <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-[var(--cm-green)]">
            {isFr ? "Quand l’utiliser" : "When to use it"}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--ink)]">
            {isFr ? step.whenFr : step.whenEn}
          </p>
          {(isFr ? step.replyFr : step.replyEn) && (
            <p className="mt-2 text-sm font-semibold text-[var(--cm-green)]">
              {isFr ? step.replyFr : step.replyEn}
            </p>
          )}

          <div className="mt-4 rounded-xl border border-[var(--line)] bg-white px-4 py-3">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--cm-green)]">
              <Sparkles className="h-3.5 w-3.5" />
              {isFr ? "Coach vocal" : "Voice coach"}
              {coach?.source === "ai"
                ? isFr
                  ? " · IA"
                  : " · AI"
                : isFr
                  ? " · aire"
                  : " · area"}
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--ink)]">
              {coach?.syllables || step.pronunciation}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
              {coach?.tip ?? (isFr ? voice.coachFr : voice.coachEn)}
            </p>
          </div>

          <button type="button" className="btn-pill btn-pill--green mt-4" onClick={next}>
            {index + 1 >= total
              ? isFr
                ? "Terminer la mission"
                : "Finish mission"
              : isFr
                ? "Situation suivante"
                : "Next situation"}
          </button>
        </div>
      )}
    </section>
  );
}
