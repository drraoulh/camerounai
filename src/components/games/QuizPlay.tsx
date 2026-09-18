"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import clsx from "clsx";
import type { QuizQuestion } from "@/data/games";
import { useLocale } from "@/components/LocaleProvider";

type Props = {
  title: string;
  questions: QuizQuestion[];
  onExit: () => void;
  packId: string;
};

const SCORE_KEY = "vc-games-best";

function saveBest(packId: string, percent: number) {
  try {
    const raw = localStorage.getItem(SCORE_KEY);
    const data = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    data[packId] = Math.max(data[packId] ?? 0, percent);
    localStorage.setItem(SCORE_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export function QuizPlay({ title, questions, onExit, packId }: Props) {
  const { locale } = useLocale();
  const isFr = locale === "fr";
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const total = questions.length;
  const q = questions[index];
  const progress = total ? Math.round(((done ? total : index) / total) * 100) : 0;

  useEffect(() => {
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
  }, [questions]);

  const message = useMemo(() => {
    if (!done || !total) return "";
    const pct = Math.round((score / total) * 100);
    if (pct >= 80) {
      return isFr
        ? "Excellent — vous tenez déjà de belles clés culturelles."
        : "Excellent — you already hold some real cultural keys.";
    }
    if (pct >= 50) {
      return isFr
        ? "Beau parcours. Rejouez pour ancrer encore mieux."
        : "A solid run. Play again to lock it in.";
    }
    return isFr
      ? "C’est un début. Relancez la partie, les mots reviendront."
      : "A start. Play again — the words will come back.";
  }, [done, score, total, isFr]);

  if (!q && !done) {
    return (
      <p className="text-sm text-[var(--muted)]">
        {isFr ? "Aucune question pour ce jeu." : "No questions for this game."}
      </p>
    );
  }

  const choose = (id: string) => {
    if (picked) return;
    setPicked(id);
    if (id === q.correctId) setScore((s) => s + 1);
  };

  const next = () => {
    if (index + 1 >= total) {
      saveBest(packId, Math.round((score / total) * 100));
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  };

  if (done) {
    const percent = total ? Math.round((score / total) * 100) : 0;
    return (
      <section className="rounded-2xl border border-[var(--line)] bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cm-green)]">
          {isFr ? "Partie terminée" : "Game over"}
        </p>
        <h2 className="section-title mt-2 text-3xl">{title}</h2>
        <p className="mt-4 font-[family-name:var(--font-display)] text-5xl text-[var(--cm-green)]">
          {score}
          <span className="text-2xl text-[var(--muted)]">/{total}</span>
        </p>
        <p className="mt-1 text-sm font-semibold text-[var(--ink)]">{percent}%</p>
        <p className="mt-4 max-w-lg text-[var(--muted)] leading-relaxed">{message}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-pill btn-pill--green"
            onClick={() => {
              setIndex(0);
              setPicked(null);
              setScore(0);
              setDone(false);
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
            {isFr ? "Changer de jeu" : "Change game"}
          </button>
        </div>
      </section>
    );
  }

  const isCorrect = picked === q.correctId;

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cm-green)]">
            {title}
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {isFr ? "Question" : "Question"} {index + 1} / {total}
          </p>
        </div>
        <p className="text-sm font-semibold">
          {isFr ? "Score" : "Score"} {score}
        </p>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[var(--bg-soft)]">
        <div
          className="h-full rounded-full bg-[var(--cm-green)] transition-all duration-300"
          style={{ width: `${Math.max(progress, ((index + (picked ? 1 : 0)) / total) * 100)}%` }}
        />
      </div>

      <h2 className="section-title mt-6 text-2xl sm:text-3xl">
        {isFr ? q.promptFr : q.promptEn}
      </h2>
      {q.highlight && (
        <p className="mt-4 rounded-xl bg-[var(--accent-soft)] px-4 py-3 font-[family-name:var(--font-display)] text-2xl text-[var(--cm-green)] sm:text-3xl">
          {q.highlight}
        </p>
      )}

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
                  "flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3.5 text-left text-sm font-semibold transition sm:text-base",
                  !picked && "border-[var(--line)] hover:border-[var(--cm-green)] hover:bg-[var(--accent-soft)]",
                  showCorrect && "border-[var(--cm-green)] bg-[var(--accent-soft)] text-[var(--cm-green)]",
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
          <p className="text-sm font-semibold text-[var(--ink)]">
            {isCorrect
              ? isFr
                ? "Bravo !"
                : "Well done!"
              : isFr
                ? "Pas tout à fait"
                : "Not quite"}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
            {isFr ? q.explainFr : q.explainEn}
          </p>
          <button type="button" className="btn-pill btn-pill--green mt-4" onClick={next}>
            {index + 1 >= total
              ? isFr
                ? "Voir le score"
                : "See score"
              : isFr
                ? "Question suivante"
                : "Next question"}
          </button>
        </div>
      )}
    </section>
  );
}
