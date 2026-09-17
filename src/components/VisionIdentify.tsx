"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Camera, ImagePlus, Loader2, Sparkles } from "lucide-react";
import { useLocale } from "./LocaleProvider";

type VisionMatch = {
  id: string;
  name: string;
  nameEn: string;
  city: string;
  score: number;
  image: string;
};

type VisionResult = {
  answer: string;
  analysis?: {
    category: string;
    confidence: number;
    provider: string;
    captionFr: string;
    captionEn: string;
    landmarks: string[];
    regionsGuess: string[];
  };
  matches?: VisionMatch[];
};

/** Compress / resize on client to keep uploads light. */
async function fileToDataUrl(file: File, maxSide = 1280): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}

export function VisionIdentify({
  compact = false,
  onResult,
}: {
  compact?: boolean;
  onResult?: (answer: string) => void;
}) {
  const { locale, strings } = useLocale();
  const isFr = locale === "fr";
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VisionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (file: File) => {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      setPreview(dataUrl);
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: dataUrl, locale }),
      });
      const data = (await res.json()) as VisionResult & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "vision failed");
      }
      setResult(data);
      if (data.answer) onResult?.(data.answer);
    } catch {
      setError(
        isFr
          ? "Impossible d’analyser l’image. Réessayez avec une photo plus légère."
          : "Could not analyse the image. Try a smaller photo.",
      );
    } finally {
      setLoading(false);
    }
  };

  const onPick = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    void run(file);
  };

  return (
    <div
      className={
        compact
          ? "rounded-2xl border border-[var(--line)] bg-white p-3"
          : "rounded-2xl border border-[var(--line)] bg-white p-4 sm:p-6"
      }
    >
      {!compact && (
        <>
          <div className="mb-1 flex items-center gap-2 text-[var(--cm-green)]">
            <Camera className="h-5 w-5" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em]">
              {strings.vision.badge}
            </p>
          </div>
          <h2 className="section-title text-2xl sm:text-3xl">{strings.vision.title}</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">{strings.vision.subtitle}</p>
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => onPick(e.target.files?.[0])}
      />

      <div
        className={`mt-4 flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[var(--line)] bg-[var(--bg-soft)] px-4 py-8 text-center ${
          loading ? "opacity-70" : "cursor-pointer hover:border-[var(--cm-green)]"
        }`}
        onClick={() => !loading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onPick(e.dataTransfer.files?.[0]);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="preview"
            className="max-h-48 rounded-lg object-contain"
          />
        ) : (
          <ImagePlus className="h-10 w-10 text-[var(--cm-green)]" />
        )}
        <p className="text-sm font-medium text-[var(--ink)]">
          {loading
            ? strings.vision.analyzing
            : preview
              ? strings.vision.again
              : strings.vision.drop}
        </p>
        {loading && <Loader2 className="h-5 w-5 animate-spin text-[var(--cm-green)]" />}
      </div>

      {error && (
        <p className="mt-3 text-sm text-[var(--cm-red)]">{error}</p>
      )}

      {result && (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl bg-[var(--accent-soft)] px-4 py-3 text-sm leading-relaxed text-[var(--ink)] whitespace-pre-wrap">
            {result.answer}
          </div>
          {result.analysis && (
            <p className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              <Sparkles className="h-3 w-3" />
              CV · {result.analysis.provider} · {result.analysis.category} ·{" "}
              {Math.round(result.analysis.confidence * 100)}%
            </p>
          )}
          {result.matches && result.matches.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2">
              {result.matches.map((m) => (
                <Link
                  key={m.id}
                  href={`/destinations/${m.id}`}
                  className="overflow-hidden rounded-xl border border-[var(--line)] hover:border-[var(--cm-green)]"
                >
                  <div className="media-card aspect-[16/9]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.image}
                      alt={isFr ? m.name : m.nameEn}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
                      {m.city}
                    </p>
                    <p className="font-[family-name:var(--font-display)] text-lg">
                      {isFr ? m.name : m.nameEn}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
