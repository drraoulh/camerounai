"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Volume2 } from "lucide-react";
import { PageHero, PageShell } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";
import {
  MEDUMBA_TAKES,
  type MedumbaTake,
  type VoiceSpeed,
} from "@/data/medumba-voicebank";
import { speakCulturalPhrase, stopSpeaking } from "@/lib/speak";

function filename(take: MedumbaTake, speed: VoiceSpeed, ext = "m4a") {
  return `${take.id}-${speed}.${ext}`;
}

export default function MedumbaPhoneSheetPage() {
  const { locale } = useLocale();
  const isFr = locale === "fr";
  const [session, setSession] = useState<1 | 2>(1);
  const [speed, setSpeed] = useState<VoiceSpeed>("normal");
  const [copied, setCopied] = useState(false);

  const takes = useMemo(
    () => MEDUMBA_TAKES.filter((t) => t.session === session),
    [session],
  );

  const listText = takes
    .flatMap((t) => [
      `${filename(t, "normal")}  —  ${t.phrase} (${t.meaningFr})`,
      `${filename(t, "slow")}  —  ${t.phrase} · lent`,
    ])
    .join("\n");

  const copyList = async () => {
    try {
      await navigator.clipboard.writeText(listText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <PageShell>
      <PageHero
        title={isFr ? "Fiche téléphone · Medumba" : "Phone sheet · Medumba"}
        subtitle={
          isFr
            ? "Enregistrez sur le téléphone, envoyez les audios sur le PC, déposez-les dans public/audio/medumba/. Les missions les joueront à la place du TTS."
            : "Record on the phone, send the audio to the PC, drop files into public/audio/medumba/. Missions will play them instead of TTS."
        }
      />

      <ol className="rounded-2xl border border-[var(--line)] bg-white p-5 text-sm leading-relaxed text-[var(--ink)]">
        <li>
          {isFr
            ? "1. Dictaphone (pas d’appel, pas de musique). Pièce calme, téléphone à 20 cm, 1 seconde de silence avant et après."
            : "1. Voice memo (no call, no music). Quiet room, phone 20 cm away, 1 second of silence before and after."}
        </li>
        <li className="mt-1">
          {isFr
            ? "2. Une phrase = un fichier. D’abord Normal, puis Lentement. Session 1 = livret du jeu (obligatoire)."
            : "2. One phrase = one file. Normal first, then Slowly. Session 1 = game booklet (required)."}
        </li>
        <li className="mt-1">
          {isFr
            ? "3. Envoyez sur le PC : câble USB, WhatsApp (vous-même), e-mail, ou dossier partagé. Gardez l’ordre de la fiche."
            : "3. Send to the PC: USB cable, WhatsApp (to yourself), email, or a shared folder. Keep the sheet order."}
        </li>
        <li className="mt-1">
          {isFr
            ? "4. Renommez exactement : o-zi-a-normal.m4a (ou .mp3 / .wav / .ogg / .opus). Déposez dans public/audio/medumba/."
            : "4. Rename exactly: o-zi-a-normal.m4a (or .mp3 / .wav / .ogg / .opus). Drop into public/audio/medumba/."}
        </li>
        <li className="mt-1">
          {isFr
            ? "5. Optionnel, conversion : ffmpeg -i fichier.m4a -ar 48000 -ac 1 public/audio/medumba/o-zi-a-normal.wav"
            : "5. Optional convert: ffmpeg -i file.m4a -ar 48000 -ac 1 public/audio/medumba/o-zi-a-normal.wav"}
        </li>
        <li className="mt-1">
          {isFr
            ? "6. Rechargez /games/langue → Medumba → Écouter. Merci / combien / oui / non : le locuteur dicte, on n’invente pas."
            : "6. Reload /games/langue → Medumba → Listen. Thank you / how much / yes / no: the speaker dictates; we do not invent."}
        </li>
      </ol>

      <p className="mt-4 text-sm">
        <Link
          href="/games/langue"
          className="font-semibold text-[var(--cm-green)] hover:underline"
        >
          {isFr ? "← Retour aux jeux langue" : "← Back to language games"}
        </Link>
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          className={session === 1 ? "btn-pill btn-pill--green" : "btn-pill"}
          onClick={() => setSession(1)}
        >
          {isFr ? "Session 1 · livret" : "Session 1 · booklet"}
        </button>
        <button
          type="button"
          className={session === 2 ? "btn-pill btn-pill--green" : "btn-pill"}
          onClick={() => setSession(2)}
        >
          {isFr ? "Session 2 · à dicter" : "Session 2 · dictate"}
        </button>
        <button
          type="button"
          className={speed === "normal" ? "btn-pill btn-pill--green" : "btn-pill"}
          onClick={() => setSpeed("normal")}
        >
          {isFr ? "Normal" : "Normal"}
        </button>
        <button
          type="button"
          className={speed === "slow" ? "btn-pill btn-pill--green" : "btn-pill"}
          onClick={() => setSpeed("slow")}
        >
          {isFr ? "Lentement" : "Slowly"}
        </button>
        <button type="button" className="btn-pill" onClick={() => void copyList()}>
          <Copy className="mr-1 inline h-3.5 w-3.5" />
          {copied
            ? isFr
              ? "Liste copiée"
              : "List copied"
            : isFr
              ? "Copier les noms de fichiers"
              : "Copy filenames"}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {takes.map((take, i) => (
          <article
            key={take.id}
            className="rounded-2xl border border-[var(--line)] bg-white p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--cm-green)]">
              {i + 1}. {filename(take, speed)}
            </p>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl">
              {take.phrase}
            </p>
            <p className="mt-1 text-sm text-[var(--muted)]">
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
                  langId: "medumba",
                  phrase: take.phrase,
                  pronunciation: take.pronunciation,
                  slow: speed === "slow",
                });
              }}
            >
              <Volume2 className="h-4 w-4" />
              {isFr
                ? "Écouter (fichier natif si présent)"
                : "Listen (native file if present)"}
            </button>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
