"use client";

import { useState } from "react";
import Link from "next/link";
import { Volume2 } from "lucide-react";
import { PageHero, PageShell } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";
import { MBOUDA_TAKES } from "@/data/mbouda-voicebank";
import { speakCulturalPhrase, stopSpeaking } from "@/lib/speak";

export default function MboudaPhoneSheetPage() {
  const { locale } = useLocale();
  const isFr = locale === "fr";
  const [playing, setPlaying] = useState<string | null>(null);

  return (
    <PageShell>
      <PageHero
        title={isFr ? "Fiche téléphone · Mbouda" : "Phone sheet · Mbouda"}
        subtitle={
          isFr
            ? "Enregistrements dans public/audio/Mbouda/. Le jeu les joue à la place du TTS. On n’invente pas l’orthographe ngiemboon."
            : "Recordings in public/audio/Mbouda/. The game plays them instead of TTS. We do not invent Ngiemboon spelling."
        }
      />

      <p className="text-sm">
        <Link
          href="/games/langue"
          className="font-semibold text-[var(--cm-green)] hover:underline"
        >
          {isFr ? "← Retour aux jeux langue" : "← Back to language games"}
        </Link>
      </p>

      <div className="mt-6 space-y-3">
        {MBOUDA_TAKES.map((take, i) => (
          <article
            key={take.id}
            className="rounded-2xl border border-[var(--line)] bg-white p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--cm-green)]">
              {i + 1}. {take.id}-normal.mp4
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl">
              {isFr ? take.meaningFr : take.meaningEn}
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              {isFr ? take.noteFr : take.noteEn}
            </p>
            <button
              type="button"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--cm-green)]"
              onClick={() => {
                stopSpeaking();
                speakCulturalPhrase({
                  langId: "mbouda",
                  phrase: take.meaningFr,
                  pronunciation: take.pronunciation,
                  stepId: take.id,
                  listeners: {
                    onStart: () => setPlaying(take.id),
                    onEnd: () => setPlaying(null),
                  },
                });
              }}
            >
              <Volume2
                className={`h-4 w-4 ${playing === take.id ? "animate-pulse" : ""}`}
              />
              {isFr ? "Écouter l’enregistrement" : "Listen to the recording"}
            </button>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
