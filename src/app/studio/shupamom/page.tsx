"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Circle, Download, Square, Volume2 } from "lucide-react";
import { PageHero, PageShell } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";
import {
  SHUPAMOM_TAKES,
  type ShupamomTake,
  type VoiceSpeed,
} from "@/data/shupamom-voicebank";
import { speakCulturalPhrase, stopSpeaking } from "@/lib/speak";

function filename(take: ShupamomTake, speed: VoiceSpeed, ext: string) {
  return `${take.id}-${speed}.${ext}`;
}

export default function ShupamomStudioPage() {
  const { locale } = useLocale();
  const isFr = locale === "fr";
  const [session, setSession] = useState<1 | 2>(1);
  const [speed, setSpeed] = useState<VoiceSpeed>("normal");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [recordingId, setRecordingId] = useState<string | null>(null);
  const [blobs, setBlobs] = useState<Record<string, Blob>>({});
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const takes = useMemo(
    () => SHUPAMOM_TAKES.filter((t) => t.session === session),
    [session],
  );
  const done = takes.filter((t) => blobs[`${t.id}-${speed}`]).length;

  const startRec = async (take: ShupamomTake) => {
    stopSpeaking();
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : "audio/webm";
    const rec = new MediaRecorder(stream, { mimeType: mime });
    chunksRef.current = [];
    rec.ondataavailable = (e) => {
      if (e.data.size) chunksRef.current.push(e.data);
    };
    rec.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
      setBlobs((prev) => ({ ...prev, [`${take.id}-${speed}`]: blob }));
      setRecordingId(null);
      mediaRef.current = null;
    };
    mediaRef.current = rec;
    setRecordingId(take.id);
    rec.start();
  };

  const stopRec = () => {
    if (mediaRef.current && mediaRef.current.state !== "inactive") {
      mediaRef.current.stop();
    }
  };

  const download = (take: ShupamomTake) => {
    const blob = blobs[`${take.id}-${speed}`];
    if (!blob) return;
    const ext = blob.type.includes("webm") ? "webm" : "wav";
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename(take, speed, ext);
    a.click();
    URL.revokeObjectURL(url);
  };

  const playLocal = (take: ShupamomTake) => {
    const blob = blobs[`${take.id}-${speed}`];
    if (!blob) return;
    stopSpeaking();
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => URL.revokeObjectURL(url);
    void audio.play();
  };

  return (
    <PageShell>
      <PageHero
        title={isFr ? "Studio Shüpamom" : "Shüpamom studio"}
        subtitle={
          isFr
            ? "Enregistrez le locuteur. Déposez les fichiers dans public/audio/shupamom/ — les missions les joueront à la place du TTS."
            : "Record the speaker. Drop files into public/audio/shupamom/ — missions will play them instead of TTS."
        }
      />

      <ol className="rounded-2xl border border-[var(--line)] bg-white p-5 text-sm leading-relaxed text-[var(--ink)]">
        <li>
          {isFr
            ? "1. Pièce calme, téléphone à 20 cm, une prise à la fois."
            : "1. Quiet room, phone 20 cm away, one take at a time."}
        </li>
        <li className="mt-1">
          {isFr
            ? "2. Session 1 = livret du jeu (obligatoire). Session 2 = tons extra pour un futur modèle."
            : "2. Session 1 = game booklet (required). Session 2 = extra tones for a later model."}
        </li>
        <li className="mt-1">
          {isFr
            ? "3. Chaque phrase : Normal, puis Lentement. L’apostrophe est une coupe de gorge."
            : "3. Each phrase: Normal, then Slowly. The apostrophe is a glottal cut."}
        </li>
        <li className="mt-1">
          {isFr
            ? "4. Téléchargez, convertissez si besoin : ffmpeg -i fichier.webm -ar 48000 -ac 1 public/audio/shupamom/nom.wav"
            : "4. Download, convert if needed: ffmpeg -i file.webm -ar 48000 -ac 1 public/audio/shupamom/name.wav"}
        </li>
      </ol>

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
          {isFr ? "Session 2 · tons extra" : "Session 2 · extra tones"}
        </button>
        <button
          type="button"
          className={speed === "normal" ? "btn-pill btn-pill--green" : "btn-pill"}
          onClick={() => setSpeed("normal")}
        >
          {isFr ? "Vitesse normale" : "Normal speed"}
        </button>
        <button
          type="button"
          className={speed === "slow" ? "btn-pill btn-pill--green" : "btn-pill"}
          onClick={() => setSpeed("slow")}
        >
          {isFr ? "Lentement" : "Slowly"}
        </button>
      </div>

      <p className="mt-4 text-sm text-[var(--muted)]">
        {done}/{takes.length} · {speed}
      </p>

      <ul className="mt-4 grid gap-3">
        {takes.map((take) => {
          const key = `${take.id}-${speed}`;
          const has = Boolean(blobs[key]);
          const rec = recordingId === take.id;
          return (
            <li
              key={take.id}
              className="rounded-2xl border border-[var(--line)] bg-white p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--cm-green)]">
                {take.id}-{speed}.wav ·{" "}
                {take.register === "palace"
                  ? isFr
                    ? "palais"
                    : "palace"
                  : isFr
                    ? "rue / marché"
                    : "street / market"}
              </p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--cm-green)]">
                {take.phrase}
              </p>
              <p className="text-sm italic text-[var(--muted)]">
                [{take.pronunciation}] · {isFr ? take.meaningFr : take.meaningEn}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ink)]">
                {isFr ? take.noteFr : take.noteEn}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {rec ? (
                  <button
                    type="button"
                    className="btn-pill btn-pill--green"
                    onClick={stopRec}
                  >
                    <Square className="h-4 w-4" />
                    {isFr ? "Stop" : "Stop"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-pill btn-pill--green"
                    onClick={() => void startRec(take)}
                  >
                    <Circle className="h-4 w-4 fill-current" />
                    {isFr ? "Enregistrer" : "Record"}
                  </button>
                )}
                {has && (
                  <>
                    <button
                      type="button"
                      className="rounded-full border border-[var(--line)] px-4 py-2.5 text-sm font-semibold"
                      onClick={() => playLocal(take)}
                    >
                      <Volume2 className="h-4 w-4" />
                      {isFr ? "Écouter la prise" : "Play take"}
                    </button>
                    <button
                      type="button"
                      className="rounded-full border border-[var(--line)] px-4 py-2.5 text-sm font-semibold"
                      onClick={() => download(take)}
                    >
                      <Download className="h-4 w-4" />
                      {filename(take, speed, "webm")}
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="rounded-full border border-[var(--line)] px-4 py-2.5 text-sm font-semibold"
                  onClick={() => {
                    setActiveId(take.id);
                    speakCulturalPhrase({
                      langId: "shupamom",
                      phrase: take.phrase,
                      pronunciation: take.pronunciation,
                      slow: speed === "slow",
                      stepId:
                        take.id === "me-shaashe-palace"
                          ? "si-1"
                          : take.id === "me-shaashe-street"
                            ? "sp-1"
                            : undefined,
                    });
                  }}
                >
                  {isFr
                    ? activeId === take.id
                      ? "TTS (secours)"
                      : "Comparer TTS"
                    : activeId === take.id
                      ? "TTS (fallback)"
                      : "Compare TTS"}
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-8 text-sm">
        <Link href="/games/langue" className="font-semibold text-[var(--cm-green)] hover:underline">
          {isFr ? "← Missions Shüpamom" : "← Shüpamom missions"}
        </Link>
      </p>
    </PageShell>
  );
}
