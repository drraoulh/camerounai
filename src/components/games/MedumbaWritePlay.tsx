"use client";

import { useEffect, useMemo, useState } from "react";
import { Volume2, X, Zap } from "lucide-react";
import clsx from "clsx";
import { MEDUMBA_WRITE_PROMPTS, foldAnswer } from "@/data/medumba-write";
import { MBOUDA_WRITE_PROMPTS } from "@/data/mbouda-write";
import { XP_CORRECT, XP_MISSION_BONUS } from "@/lib/game-progress";
import type { LanguageTrackId } from "@/lib/types";
import {
  prefetchCulturalAudio,
  speakCulturalPhrase,
  stopSpeaking,
} from "@/lib/speak";
import { playCorrectSound, playWrongSound } from "@/lib/game-sounds";
import { LessonFrame } from "./LessonFrame";
import { SpeakerMascot } from "./MedumbaMascots";
import { useGameProgress } from "./GameProgressProvider";
import { useLocale } from "@/components/LocaleProvider";

type Chip = { key: string; word: string };

type Props = {
  onExit: () => void;
  practice?: boolean;
  langId?: LanguageTrackId;
};

const WRITE_PACK: Partial<
  Record<LanguageTrackId, { prompts: typeof MEDUMBA_WRITE_PROMPTS; write: string; practice: string }>
> = {
  medumba: {
    prompts: MEDUMBA_WRITE_PROMPTS,
    write: "medumba-write",
    practice: "medumba-write-practice",
  },
  mbouda: {
    prompts: MBOUDA_WRITE_PROMPTS,
    write: "mbouda-write",
    practice: "mbouda-write-practice",
  },
};

function shuffle<T>(list: T[]) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function bankFor(tiles: string[], distractors: string[]): Chip[] {
  return shuffle(
    [...tiles, ...distractors].map((word, i) => ({ key: `${i}-${word}`, word })),
  );
}

export function MedumbaWritePlay({
  onExit,
  practice = false,
  langId = "medumba",
}: Props) {
  const { locale } = useLocale();
  const { reward, progress } = useGameProgress();
  const isFr = locale === "fr";
  const pack = WRITE_PACK[langId] ?? WRITE_PACK.medumba!;
  const prompts = useMemo(
    () => (practice ? shuffle([...pack.prompts]) : pack.prompts),
    [practice, pack.prompts],
  );
  const drillId = practice ? pack.practice : pack.write;
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<Chip[]>([]);
  const [bank, setBank] = useState<Chip[]>([]);
  const [checked, setChecked] = useState<null | boolean>(null);
  const [hearts, setHearts] = useState(5);
  const [correctCount, setCorrectCount] = useState(0);
  const [xpGained, setXpGained] = useState(0);
  const [done, setDone] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const item = prompts[index];
  const total = prompts.length;
  const pct = Math.round(((index + (checked ? 1 : 0)) / total) * 100);

  useEffect(() => () => stopSpeaking(), []);

  useEffect(() => {
    if (!item) return;
    setPicked([]);
    setChecked(null);
    setBank(bankFor(item.answerTiles, item.distractors));
    prefetchCulturalAudio(item.langId, item.phrase, item.pronunciation, item.id);
    const t = window.setTimeout(() => {
      speakCulturalPhrase({
        langId: item.langId,
        phrase: item.phrase || item.french,
        pronunciation: item.pronunciation,
        stepId: item.id,
      });
    }, 280);
    return () => window.clearTimeout(t);
  }, [item]);

  const playAudio = () => {
    if (!item) return;
    speakCulturalPhrase({
      langId: item.langId,
      phrase: item.phrase || item.french,
      pronunciation: item.pronunciation,
      stepId: item.id,
      listeners: {
        onStart: () => setSpeaking(true),
        onEnd: () => setSpeaking(false),
      },
    });
  };

  const applyCheck = (ok: boolean) => {
    if (!item || checked !== null) return;
    setChecked(ok);
    if (ok) {
      stopSpeaking();
      playCorrectSound();
      const exprId = `mdw-${item.id}${practice ? "-p" : ""}`;
      const already = progress.expressions.includes(exprId);
      reward({
        xp: already ? 0 : XP_CORRECT,
        expressionId: exprId,
      });
      setCorrectCount((n) => n + 1);
      setXpGained((x) => x + (already ? 0 : XP_CORRECT));
      return;
    }
    stopSpeaking();
    playWrongSound();
    setHearts((h) => Math.max(0, h - 1));
  };

  const tapBank = (chip: Chip) => {
    if (!item || checked !== null) return;
    const nextPicked = [...picked, chip];
    setPicked(nextPicked);
    const want = item.answerTiles.map((w) => foldAnswer(w));
    const got = nextPicked.map((c) => foldAnswer(c.word));
    const prefixOk = got.every((w, i) => w === want[i]);
    if (!prefixOk) {
      applyCheck(false);
      return;
    }
    if (got.length === want.length) applyCheck(true);
  };

  const next = () => {
    if (index + 1 < total && hearts > 0) {
      setIndex((i) => i + 1);
      return;
    }
    const firstClear = !progress.missions.includes(drillId);
    reward({
      xp: firstClear ? XP_MISSION_BONUS : 0,
      missionId: drillId,
    });
    if (firstClear) setXpGained((x) => x + XP_MISSION_BONUS);
    setDone(true);
  };

  if (done || hearts === 0) {
    return (
      <LessonFrame>
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
          <p className="text-sm font-extrabold uppercase tracking-widest text-[#58cc02]">
            {hearts === 0
              ? isFr
                ? "Plus de vies"
                : "Out of hearts"
              : isFr
                ? "Leçon terminée"
                : "Lesson complete"}
          </p>
          <h2 className="mt-3 text-3xl font-extrabold">
            {correctCount}/{total}
          </h2>
          <p className="mt-2 text-slate-300">+{xpGained} XP</p>
          <button
            type="button"
            className="mt-8 w-full rounded-2xl bg-[#58cc02] py-4 text-lg font-extrabold uppercase tracking-wide text-[#131f24]"
            onClick={onExit}
          >
            {isFr ? "Continuer" : "Continue"}
          </button>
        </div>
      </LessonFrame>
    );
  }

  if (!item) return null;

  return (
    <LessonFrame>
      <header className="flex items-center gap-3 px-4 pt-4">
        <button
          type="button"
          onClick={onExit}
          className="text-slate-400"
          aria-label={isFr ? "Fermer" : "Close"}
        >
          <X className="h-7 w-7" />
        </button>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-[#37464f]">
          <div
            className="h-full rounded-full bg-[#58cc02] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="flex items-center gap-1 text-sm font-extrabold text-pink-400">
          <Zap className="h-4 w-4 fill-current" /> {hearts}
        </span>
      </header>

      <h1 className="px-5 pt-6 text-2xl font-extrabold">
        {isFr ? "Traduis cette phrase" : "Translate this sentence"}
      </h1>

      <div className="mt-4 flex items-end gap-3 px-4">
        <SpeakerMascot />
        <button
          type="button"
          onClick={playAudio}
          className="mb-8 max-w-[220px] rounded-2xl rounded-bl-sm border-2 border-[#37464f] bg-[#1b2a32] px-4 py-3 text-left"
        >
          <span className="flex items-center gap-2 text-lg font-bold">
            <Volume2 className={clsx("h-5 w-5 text-sky-400", speaking && "animate-pulse")} />
            {item.phrase || (isFr ? "Écoute" : "Listen")}
          </span>
        </button>
      </div>

      <div className="mx-5 mt-2 min-h-[88px] border-b-2 border-[#37464f]">
        <ul className="flex min-h-[52px] flex-wrap gap-2 pb-3">
          {picked.map((chip) => (
            <li key={chip.key}>
              <button
                type="button"
                onClick={() => {
                  if (checked !== null) return;
                  setPicked((p) => p.filter((c) => c.key !== chip.key));
                }}
                className="rounded-2xl border-b-4 border-[#2b3940] bg-[#37464f] px-4 py-2 text-lg font-bold"
              >
                {chip.word}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <ul className="mt-8 flex flex-wrap justify-center gap-3 px-4">
        {bank.map((chip) => {
          const used = picked.some((c) => c.key === chip.key);
          return (
            <li key={chip.key}>
              <button
                type="button"
                disabled={used || checked !== null}
                onClick={() => tapBank(chip)}
                className={clsx(
                  "rounded-2xl border-b-4 px-4 py-2 text-lg font-bold",
                  used
                    ? "border-transparent bg-[#1b2a32] text-transparent"
                    : "border-[#2b3940] bg-[#37464f]",
                )}
              >
                {chip.word}
              </button>
            </li>
          );
        })}
      </ul>

        {checked !== null && (
          <div className="mt-auto px-4 pb-6 pt-3">
            <div
              className={clsx(
                "-mx-4 mb-3 px-5 py-4",
                checked ? "bg-[#58cc02]/15 text-[#58cc02]" : "bg-[#ff4b4b]/15 text-[#ff4b4b]",
              )}
            >
              <p className="text-xl font-extrabold">
                {checked
                  ? isFr
                    ? `Correct · +${XP_CORRECT} XP`
                    : `Correct · +${XP_CORRECT} XP`
                  : isFr
                    ? "Pas tout à fait"
                    : "Not quite"}
              </p>
              <p className="mt-1 text-sm font-semibold opacity-90">{item.french}</p>
            </div>
            <button
              type="button"
              onClick={next}
              className={clsx(
                "w-full rounded-2xl py-4 text-lg font-extrabold uppercase tracking-wide",
                checked
                  ? "bg-[#58cc02] text-[#131f24]"
                  : "bg-[#ff4b4b] text-white",
              )}
            >
              {isFr ? "Continuer" : "Continue"}
            </button>
          </div>
        )}
    </LessonFrame>
  );
}
