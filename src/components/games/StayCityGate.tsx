"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Send, Volume2 } from "lucide-react";
import clsx from "clsx";
import type { StayCity } from "@/data/stay-cities";
import type { StayExchange } from "@/lib/say-phrase";
import { coachOpening, coachTurn } from "@/lib/say-phrase";
import { speakCulturalPhrase, speakText, stopSpeaking, nativeAudioSrc } from "@/lib/speak";
import { useLocale } from "@/components/LocaleProvider";
import { PathMascot } from "@/components/games/MedumbaMascots";

type Props = {
  onStart: (city: StayCity) => void;
  onSkip: () => void;
};

type Line = {
  role: "guide" | "user";
  text: string;
  exchange?: StayExchange;
};

export function StayCityGate({ onStart, onSkip }: Props) {
  const { locale } = useLocale();
  const isFr = locale === "fr";
  const opening = coachOpening(locale);
  const [city, setCity] = useState<StayCity | null>(null);
  const [lines, setLines] = useState<Line[]>([
    { role: "guide", text: opening.text },
  ]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>(opening.suggestions);
  const [listening, setListening] = useState(false);
  const [typing, setTyping] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const spokenOpen = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);
  const recRef = useRef<SpeechRecognition | null>(null);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (spokenOpen.current) return;
    spokenOpen.current = true;
    speakText(opening.text, isFr ? "fr-FR" : "en-US", 0.95);
  }, [opening.text, isFr]);

  useEffect(() => {
    if (lines.length < 2 && !typing) return;
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [lines, typing]);

  useEffect(
    () => () => {
      stopSpeaking();
      recRef.current?.stop();
    },
    [],
  );

  const playExchange = (ex: StayExchange) => {
    stopSpeaking();
    speakCulturalPhrase({
      langId: ex.langId,
      phrase: ex.listenOnly ? ex.meaningFr : ex.phrase,
      pronunciation: ex.pronunciation,
      stepId: ex.stepId,
      listeners: {
        onStart: () => setSpeakingId(ex.stepId ?? ex.phrase),
        onEnd: () => setSpeakingId(null),
      },
    });
  };

  const respond = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    setInput("");
    setListening(false);
    recRef.current?.stop();
    setLines((m) => [...m, { role: "user", text: trimmed }]);
    const turn = coachTurn(trimmed, city, locale);
    setCity(turn.city);
    if (turn.exchange) playExchange(turn.exchange);
    setTyping(true);
    window.setTimeout(() => {
      setTyping(false);
      setSuggestions(turn.suggestions);
      setLines((m) => [
        ...m,
        { role: "guide", text: turn.text, exchange: turn.exchange },
      ]);
      if (!turn.exchange) {
        speakText(turn.text, isFr ? "fr-FR" : "en-US", 0.95);
      }
      if (turn.play && turn.city) {
        window.setTimeout(() => onStart(turn.city!), 900);
      }
    }, 280);
  };

  const toggleMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      respond(
        isFr
          ? "Je ne peux pas écouter ici. Écrivez-moi la ville."
          : "I can’t listen here. Type the city.",
      );
      return;
    }
    if (listening && recRef.current) {
      recRef.current.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = isFr ? "fr-FR" : "en-US";
    rec.interimResults = false;
    rec.onresult = (ev) => {
      const said = ev.results[0][0].transcript;
      respond(said);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    rec.start();
    setListening(true);
  };

  return (
    <section
      ref={rootRef}
      className="overflow-hidden rounded-[1.75rem] border border-[var(--line)] bg-white shadow-sm"
    >
      <header className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3 sm:px-5">
        <PathMascot className="h-12 w-11 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--cm-green)]">
            {isFr ? "Guide de séjour" : "Stay guide"}
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-xl leading-tight">
            {isFr ? "Parlez-moi, je vous réponds" : "Talk to me, I’ll answer"}
          </h2>
        </div>
        {city ? (
          <p className="shrink-0 rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--cm-green)]">
            {isFr ? city.nameFr : city.nameEn} · {city.language}
          </p>
        ) : (
          <span className="hidden text-xs text-[var(--muted)] sm:inline">
            {isFr ? "Écrivez ou parlez" : "Type or speak"}
          </span>
        )}
      </header>

      <div className="flex max-h-[min(48vh,380px)] min-h-[8rem] flex-col justify-end gap-3 overflow-y-auto bg-[var(--bg-soft)] px-3 py-4 sm:px-5">
        {lines.map((line, i) =>
          line.role === "user" ? (
            <div key={i} className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[var(--ink)] px-4 py-3 text-sm leading-relaxed text-white">
              {line.text}
            </div>
          ) : (
            <div key={i} className="flex max-w-[95%] items-end gap-2">
              <PathMascot className="mb-1 h-9 w-8 shrink-0" />
              <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm leading-relaxed text-[var(--ink)] shadow-sm">
                {line.text.split("\n").map((p, j) =>
                  p ? (
                    <p key={j} className={j ? "mt-2" : undefined}>
                      {p}
                    </p>
                  ) : (
                    <span key={j} className="block h-2" />
                  ),
                )}
                {line.exchange ? (
                  <div className="mt-3 rounded-xl bg-[var(--accent-soft)] px-3 py-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--cm-green)]">
                      {isFr ? line.exchange.meaningFr : line.exchange.meaningEn}
                      {" · "}
                      {line.exchange.language}
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-display)] text-2xl leading-tight">
                      {line.exchange.listenOnly
                        ? isFr
                          ? "Écoutez le locuteur"
                          : "Listen to the speaker"
                        : line.exchange.phrase}
                    </p>
                    {line.exchange.listenOnly ? null : (
                      <p className="mt-0.5 text-xs text-[var(--muted)]">
                        {line.exchange.pronunciation}
                      </p>
                    )}
                    <audio
                      className="mt-2 w-full"
                      src={
                        nativeAudioSrc({
                          langId: line.exchange.langId,
                          phrase: line.exchange.listenOnly
                            ? line.exchange.meaningFr
                            : line.exchange.phrase,
                          stepId: line.exchange.stepId,
                        }) ?? undefined
                      }
                      controls
                      playsInline
                      preload="auto"
                    />
                    <button
                      type="button"
                      onClick={() => playExchange(line.exchange!)}
                      className="mt-2 inline-flex items-center gap-2 rounded-full bg-[var(--cm-green)] px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      <Volume2
                        className={clsx(
                          "h-3.5 w-3.5",
                          speakingId ===
                            (line.exchange.stepId ?? line.exchange.phrase) &&
                            "animate-pulse",
                        )}
                      />
                      {isFr ? "Écouter" : "Listen"}
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          ),
        )}
        {typing ? (
          <div className="flex items-end gap-2">
            <PathMascot className="mb-1 h-9 w-8 shrink-0" />
            <div
              className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm"
              aria-label={isFr ? "Le guide écrit…" : "Guide is typing…"}
            >
              <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--cm-green)] [animation-delay:-0.2s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--cm-green)] [animation-delay:-0.1s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--cm-green)]" />
            </div>
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      {listening ? (
        <p className="bg-red-50 px-4 py-2 text-center text-xs font-semibold text-red-700">
          {isFr ? "Je vous écoute… parlez maintenant." : "I’m listening… speak now."}
        </p>
      ) : null}

      {!typing && suggestions.length > 0 ? (
        <div className="flex flex-wrap gap-2 border-t border-[var(--line)] px-4 py-3">
          <p className="w-full text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
            {city
              ? isFr
                ? "Répondez, ou tapez un autre mot"
                : "Reply, or type another word"
              : isFr
                ? "Ou tapez / dites votre ville"
                : "Or type / say your city"}
          </p>
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => respond(s)}
              className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-xs font-semibold hover:border-[var(--cm-green)] hover:bg-[var(--accent-soft)]"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}

      <form
        className="flex items-center gap-2 border-t border-[var(--line)] px-3 py-3"
        onSubmit={(e) => {
          e.preventDefault();
          respond(input);
        }}
      >
        <button
          type="button"
          onClick={toggleMic}
          className={clsx(
            "shrink-0 rounded-full p-3",
            listening
              ? "bg-red-100 text-red-700 ring-2 ring-red-300"
              : "bg-[var(--accent-soft)] text-[var(--cm-green)]",
          )}
          aria-label={isFr ? "Parler au guide" : "Speak to the guide"}
        >
          {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={typing}
          placeholder={
            city
              ? isFr
                ? "Écrivez-moi : merci, au revoir, commencer…"
                : "Write to me: thank you, goodbye, start…"
              : isFr
                ? "Écrivez-moi : je suis à Douala…"
                : "Write to me: I’m in Douala…"
          }
          className="min-w-0 flex-1 rounded-full border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-2.5 text-sm outline-none focus:border-[var(--cm-green)] disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!input.trim() || typing}
          className="inline-flex items-center gap-1 rounded-full bg-[var(--cm-green)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
          {isFr ? "Envoyer" : "Send"}
        </button>
      </form>

      <p className="px-5 pb-4 text-xs text-[var(--muted)]">
        <button
          type="button"
          onClick={onSkip}
          className="font-semibold text-[var(--cm-green)] hover:underline"
        >
          {isFr ? "Passer et choisir une langue →" : "Skip and pick a language →"}
        </button>
      </p>
    </section>
  );
}
