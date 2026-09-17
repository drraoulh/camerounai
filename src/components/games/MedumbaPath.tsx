"use client";

import { Dumbbell, Headphones, Lock, Star, Trophy, X, Zap } from "lucide-react";
import clsx from "clsx";
import { MEDUMBA_PATH, type MedumbaPathNode, type PathKind } from "@/data/medumba-path";
import { MBOUDA_PATH } from "@/data/mbouda-path";
import { XP_CORRECT } from "@/lib/game-progress";
import type { LanguageTrackId } from "@/lib/types";
import { LessonFrame } from "./LessonFrame";
import { PathMascot } from "./MedumbaMascots";
import { useGameProgress } from "./GameProgressProvider";
import { useLocale } from "@/components/LocaleProvider";

type Lesson = MedumbaPathNode["lesson"];

type Props = {
  onClose: () => void;
  onStart: (lesson: Exclude<Lesson, "chest">) => void;
  langId?: LanguageTrackId;
};

const PATH_PACK: Partial<
  Record<
    LanguageTrackId,
    {
      nodes: MedumbaPathNode[];
      write: string;
      practice: string;
      chest: string;
      survival: string;
      chapterFr: string;
      chapterEn: string;
    }
  >
> = {
  medumba: {
    nodes: MEDUMBA_PATH,
    write: "medumba-write",
    practice: "medumba-write-practice",
    chest: "medumba-chest-1",
    survival: "medumba-survival",
    chapterFr: "Saluts de Bangangté : apprends les premiers mots",
    chapterEn: "Bangangté greetings: learn the first words",
  },
  mbouda: {
    nodes: MBOUDA_PATH,
    write: "mbouda-write",
    practice: "mbouda-write-practice",
    chest: "mbouda-chest-1",
    survival: "mbouda-survival",
    chapterFr: "La journée à Mbouda : manger, partir, demander",
    chapterEn: "A day in Mbouda: eating, leaving, asking",
  },
};

const KIND_ICON: Record<PathKind, typeof Star> = {
  star: Star,
  dumbbell: Dumbbell,
  chest: Trophy,
  headphones: Headphones,
};

export function MedumbaPath({ onClose, onStart, langId = "medumba" }: Props) {
  const { locale } = useLocale();
  const { progress, reward } = useGameProgress();
  const isFr = locale === "fr";
  const pack = PATH_PACK[langId] ?? PATH_PACK.medumba!;
  const nodes = pack.nodes;

  const doneWrite = progress.missions.includes(pack.write);
  const donePractice = progress.missions.includes(pack.practice);
  const doneChest = progress.missions.includes(pack.chest);
  const doneSurvival = progress.missions.includes(pack.survival);

  const statusOf = (node: MedumbaPathNode): "locked" | "done" | "current" => {
    if (node.id === "star-locked") return "locked";
    if (node.lesson === "translate") return doneWrite ? "done" : "current";
    if (node.lesson === "practice") {
      if (!doneWrite) return "locked";
      return donePractice ? "done" : "current";
    }
    if (node.lesson === "chest") {
      if (!doneWrite) return "locked";
      return doneChest ? "done" : "current";
    }
    if (!doneWrite) return "locked";
    return doneSurvival ? "done" : "current";
  };

  const currentId =
    nodes.find((n) => statusOf(n) === "current")?.id ??
    nodes.find((n) => n.id !== "star-locked")?.id;

  const open = (node: MedumbaPathNode) => {
    const st = statusOf(node);
    if (st === "locked") return;
    if (node.lesson === "chest") {
      if (!doneChest) {
        reward({ xp: XP_CORRECT, missionId: pack.chest });
      }
      return;
    }
    onStart(node.lesson);
  };

  return (
    <LessonFrame>
      <header className="flex items-center justify-between gap-2 px-4 pb-2 pt-4 text-sm font-extrabold">
        <span className="rounded-lg bg-[#1b2a32] px-2 py-1">🇨🇲</span>
        <span className="flex items-center gap-1 text-orange-400">
          🔥 {progress.missions.length}
        </span>
        <span className="flex items-center gap-1 text-sky-400">
          <Zap className="h-4 w-4 fill-current" /> {progress.xp}
        </span>
        <span className="flex items-center gap-1 text-pink-400">❤ 5</span>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 text-slate-400"
          aria-label={isFr ? "Fermer" : "Close"}
        >
          <X className="h-6 w-6" />
        </button>
      </header>

      <div className="mx-4 rounded-2xl bg-[#49c0f8] px-4 py-3 text-[#0b3b52]">
        <p className="text-[11px] font-extrabold uppercase tracking-widest">
          {isFr ? "Chapitre 1, unité 1" : "Chapter 1, unit 1"}
        </p>
        <p className="mt-1 text-lg font-extrabold leading-snug">
          {isFr ? pack.chapterFr : pack.chapterEn}
        </p>
      </div>

      <div className="relative flex-1 overflow-y-auto px-3 pb-10 pt-8">
        <div className="absolute left-1/2 top-10 bottom-10 w-1 -translate-x-1/2 rounded-full bg-[#1b2a32]" />
        <ol className="relative space-y-10">
          {nodes.map((node) => {
            const st = statusOf(node);
            const look =
              node.id === currentId ? "current" : st === "current" ? "open" : st;
            const Icon = KIND_ICON[node.kind];
            const current = node.id === currentId;
            return (
              <li
                key={node.id}
                className="flex justify-center"
                style={
                  current || !node.offset
                    ? undefined
                    : { transform: `translateX(${node.offset}px)` }
                }
              >
                <div className="flex items-center gap-2">
                  <div className="relative">
                    {current && (
                      <div className="absolute -top-10 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-xl bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-[#131f24] shadow">
                        {isFr ? "Commencer" : "Start"}
                      </div>
                    )}
                    <button
                      type="button"
                      disabled={look === "locked"}
                      onClick={() => open(node)}
                      className={clsx(
                        "flex h-[70px] w-[70px] items-center justify-center rounded-full border-b-8 text-white disabled:opacity-100",
                        (look === "current" || look === "open" || look === "done") &&
                          "border-[#46a302] bg-[#58cc02]",
                        look === "current" &&
                          "shadow-[0_0_0_6px_rgba(88,204,2,0.25)]",
                        look === "locked" && "border-[#2b3940] bg-[#37464f] text-slate-400",
                      )}
                      aria-label={isFr ? node.titleFr : node.titleEn}
                    >
                      {look === "locked" ? (
                        <Lock className="h-7 w-7" />
                      ) : (
                        <Icon className="h-8 w-8" fill="currentColor" />
                      )}
                    </button>
                  </div>
                  {current && (
                    <div className="pointer-events-none -my-4">
                      <PathMascot />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </LessonFrame>
  );
}
