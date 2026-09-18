"use client";

import { useEffect, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import clsx from "clsx";
import type { MatchPair } from "@/data/games";
import { shuffle } from "@/data/games";
import { useLocale } from "@/components/LocaleProvider";

type Card = {
  key: string;
  pairId: string;
  text: string;
  kind: "face" | "match";
};

type Props = {
  title: string;
  pairs: MatchPair[];
  onExit: () => void;
};

function buildCards(pairs: MatchPair[], isFr: boolean): Card[] {
  const chosen = shuffle(pairs).slice(0, Math.min(4, pairs.length));
  const cards: Card[] = chosen.flatMap((p) => [
    {
      key: `${p.id}-face`,
      pairId: p.id,
      text: isFr ? p.faceFr : p.faceEn,
      kind: "face",
    },
    {
      key: `${p.id}-match`,
      pairId: p.id,
      text: isFr ? p.matchFr : p.matchEn,
      kind: "match",
    },
  ]);
  return shuffle(cards);
}

export function MatchPlay({ title, pairs, onExit }: Props) {
  const { locale } = useLocale();
  const isFr = locale === "fr";
  const [cards, setCards] = useState<Card[]>([]);
  const [open, setOpen] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [lock, setLock] = useState(false);

  const reset = () => {
    setCards(buildCards(pairs, isFr));
    setOpen([]);
    setMatched([]);
    setMoves(0);
    setLock(false);
  };

  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairs, isFr]);

  const done = matched.length > 0 && matched.length === cards.length / 2;

  const pairCount = useMemo(() => cards.length / 2, [cards.length]);

  const flip = (key: string) => {
    const card = cards.find((c) => c.key === key);
    if (!card || lock || open.includes(key) || matched.includes(card.pairId)) {
      return;
    }

    const nextOpen = [...open, key];
    setOpen(nextOpen);

    if (nextOpen.length < 2) return;

    setMoves((m) => m + 1);
    const [aKey, bKey] = nextOpen;
    const a = cards.find((c) => c.key === aKey);
    const b = cards.find((c) => c.key === bKey);
    if (!a || !b) return;

    if (a.pairId === b.pairId && a.kind !== b.kind) {
      setMatched((m) => [...m, a.pairId]);
      setOpen([]);
      return;
    }

    setLock(true);
    window.setTimeout(() => {
      setOpen([]);
      setLock(false);
    }, 850);
  };

  return (
    <section className="rounded-2xl border border-[var(--line)] bg-white p-5 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--cm-green)]">
            {isFr ? "Mémoire" : "Memory"}
          </p>
          <h2 className="section-title mt-1 text-2xl sm:text-3xl">{title}</h2>
        </div>
        <p className="text-sm font-semibold text-[var(--muted)]">
          {isFr ? "Coups" : "Moves"} {moves} · {matched.length}/{pairCount || 0}
        </p>
      </div>
      <p className="mt-2 text-sm text-[var(--muted)]">
        {isFr
          ? "Retournez deux cartes : associez l’expression et sa traduction."
          : "Flip two cards: match each expression with its meaning."}
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card) => {
          const isOpen = open.includes(card.key) || matched.includes(card.pairId);
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => flip(card.key)}
              className={clsx(
                "flex min-h-[110px] items-center justify-center rounded-xl border px-3 py-4 text-center text-sm font-semibold transition sm:min-h-[130px]",
                isOpen
                  ? matched.includes(card.pairId)
                    ? "border-[var(--cm-green)] bg-[var(--accent-soft)] text-[var(--cm-green)]"
                    : "border-[var(--cm-yellow)] bg-[#fff8d9] text-[var(--ink)]"
                  : "border-[var(--line)] bg-[var(--cm-green-deep)] text-white hover:brightness-110",
              )}
            >
              {isOpen ? card.text : "?"}
            </button>
          );
        })}
      </div>

      {done && (
        <div className="mt-6 rounded-xl border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-4">
          <p className="font-semibold">
            {isFr
              ? `Toutes les paires sont trouvées en ${moves} coups.`
              : `All pairs found in ${moves} moves.`}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" className="btn-pill btn-pill--green" onClick={reset}>
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
        </div>
      )}
    </section>
  );
}
