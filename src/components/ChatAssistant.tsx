"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mic, MicOff, Send, Sparkles, Volume2 } from "lucide-react";
import clsx from "clsx";
import { useLocale } from "./LocaleProvider";
import type { ChatMessage } from "@/lib/types";

const JURY_DEMO_FR =
  "Bonjour, je viens au Cameroun pour trois jours. Je suis avec ma famille à Yaoundé. Nous avons un budget de 150 000 FCFA et nous aimons la culture et la nature.";
const JURY_DEMO_EN =
  "Hello, I am coming to Cameroon for three days. I am with my family in Yaoundé. We have a budget of 150,000 FCFA and we like culture and nature.";

const PROMPTS_FR = [
  "Famille 4 pers, 3 jours Yaoundé, 150000 FCFA, culture et nature",
  "Couple à Kribi 2 jours, plage, hôtel confort, budget 200000",
  "Solo économique Douala 2 jours, restos et culture",
  "Histoire du Cameroun",
];
const PROMPTS_EN = [
  "Family of 4, 3 days Yaoundé, 150000 FCFA, culture and nature",
  "Couple in Kribi 2 days, beach, comfort hotel, budget 200000",
  "Solo budget Douala 2 days, food and culture",
  "Cameroon history",
];

function speak(text: string, locale: string) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(
    text
      .replace(/\*\*/g, "")
      .replace(/_{1,2}/g, "")
      .replace(/[📍💰]/g, "")
      .replace(/\s+/g, " ")
      .trim(),
  );
  u.lang = locale === "fr" ? "fr-FR" : "en-US";
  u.rate = 0.95;
  window.speechSynthesis.speak(u);
}

function MessageBody({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1.5 text-sm leading-relaxed">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1.5" />;
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i}>
            {parts.map((part, j) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={j} className="font-semibold">
                  {part.slice(2, -2)}
                </strong>
              ) : (
                <span key={j}>{part}</span>
              ),
            )}
          </p>
        );
      })}
    </div>
  );
}

type Props = {
  /** full = page assistant · widget = panneau flottant */
  variant?: "full" | "widget";
  className?: string;
  onClose?: () => void;
};

export function ChatAssistant({
  variant = "full",
  className,
  onClose,
}: Props) {
  const { locale, strings } = useLocale();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [hasTrip, setHasTrip] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const bootstrapped = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const prompts = locale === "fr" ? PROMPTS_FR : PROMPTS_EN;
  const isWidget = variant === "widget";
  const isFr = locale === "fr";

  const send = useCallback(
    async (text: string, speakReply = false) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;
      setMessages((m) => [...m, { role: "user", content: trimmed }]);
      setInput("");
      setLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, locale }),
        });
        const data = (await res.json()) as {
          answer: string;
          tripPlan?: { placeIds?: string[] } | null;
        };
        setMessages((m) => [...m, { role: "assistant", content: data.answer }]);
        if (data.tripPlan) {
          setHasTrip(true);
          try {
            sessionStorage.setItem(
              "cameroon-ai-trip",
              JSON.stringify({
                plan: data.tripPlan,
                destination: "Yaoundé",
                fromAssistant: true,
              }),
            );
          } catch {
            /* ignore */
          }
        }
        if (speakReply) speak(data.answer, locale);
      } catch {
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: isFr
              ? "Désolé, une erreur est survenue. Réessayez."
              : "Sorry, something went wrong. Please try again.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [locale, loading, isFr],
  );

  useEffect(() => {
    if (isWidget || bootstrapped.current) return;
    const q = searchParams.get("q");
    if (q?.trim()) {
      bootstrapped.current = true;
      void send(q.trim(), false);
    }
  }, [searchParams, send, isWidget]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert(
        isFr
          ? "Reconnaissance vocale non supportée."
          : "Speech recognition not supported.",
      );
      return;
    }
    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      setListening(false);
      return;
    }
    const rec = new SR();
    rec.lang = isFr ? "fr-FR" : "en-US";
    rec.interimResults = false;
    rec.onresult = (ev) => {
      const transcript = ev.results[0][0].transcript;
      setInput(transcript);
      void send(transcript, true);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  const runJuryDemo = () => {
    void send(isFr ? JURY_DEMO_FR : JURY_DEMO_EN, true);
  };

  return (
    <div
      className={clsx(
        "chat-shell flex flex-col bg-white",
        isWidget ? "chat-shell--widget" : "chat-shell--full",
        className,
      )}
    >
      <div className="chat-shell__toolbar">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {!isWidget && (
            <button
              type="button"
              onClick={runJuryDemo}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-soft)] px-3 py-1.5 text-xs font-semibold text-[var(--cm-green-deep)] ring-1 ring-[var(--cm-green)]/20 hover:bg-[var(--cm-green)]/10 disabled:opacity-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {isFr ? "Démo jury (voix)" : "Jury demo (voice)"}
            </button>
          )}
          {hasTrip && (
            <Link
              href="/trip"
              onClick={onClose}
              className="rounded-full bg-[var(--cm-green)] px-3 py-1.5 text-xs font-semibold text-white"
            >
              {isFr ? "Voir l’itinéraire →" : "View itinerary →"}
            </Link>
          )}
        </div>
        {isWidget && (
          <p className="truncate text-xs font-semibold text-[var(--muted)]">
            {strings.assistant.title}
          </p>
        )}
      </div>

      <div className="chat-shell__messages">
        {messages.length === 0 && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--muted)]">
              {isFr
                ? "Posez une question sur le Cameroun : lieux, budget, culture, langues…"
                : "Ask anything about Cameroon: places, budget, culture, languages…"}
            </p>
            <div className="flex flex-wrap gap-2">
              {prompts.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => void send(p, false)}
                  className="chip text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={
              msg.role === "user"
                ? "ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-[var(--ink)] px-4 py-2.5 text-sm text-white"
                : "mr-auto max-w-[90%] rounded-2xl rounded-bl-md bg-[var(--accent-soft)] px-4 py-2.5 text-[var(--ink)]"
            }
          >
            {msg.role === "assistant" ? (
              <MessageBody content={msg.content} />
            ) : (
              msg.content
            )}
            {msg.role === "assistant" && (
              <button
                type="button"
                className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-[var(--muted)] hover:text-[var(--ink)]"
                onClick={() => speak(msg.content, locale)}
              >
                <Volume2 className="h-3 w-3" />
                {isFr ? "Écouter" : "Listen"}
              </button>
            )}
          </div>
        ))}
        {loading && (
          <p className="animate-pulse text-sm text-[var(--cm-green)]">
            {isFr ? "Je prépare une réponse…" : "Preparing a reply…"}
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <p className="px-3 pb-1 text-[10px] text-amber-800/70 sm:px-4">
        {strings.assistant.estimateNote}
      </p>

      <form
        className="chat-shell__form"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input, false);
        }}
      >
        <button
          type="button"
          onClick={toggleVoice}
          className={clsx(
            "rounded-full p-2.5",
            listening
              ? "bg-red-100 text-red-700"
              : "bg-[var(--accent-soft)] text-[var(--cm-green)]",
          )}
          title={
            listening
              ? strings.assistant.voiceStop
              : strings.assistant.voiceStart
          }
        >
          {listening ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={strings.assistant.placeholder}
          className="min-w-0 flex-1 rounded-full border border-[var(--line)] bg-[var(--bg-soft)] px-4 py-2.5 text-sm outline-none focus:border-[var(--cm-green)] focus:ring-2 focus:ring-[var(--cm-green)]/15"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="inline-flex items-center gap-1 rounded-full bg-[var(--cm-green)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          aria-label={strings.assistant.send}
        >
          <Send className="h-4 w-4" />
          {!isWidget && (
            <span className="hidden sm:inline">{strings.assistant.send}</span>
          )}
        </button>
      </form>
      {listening && (
        <p className="pb-2 text-center text-xs text-red-600">
          {strings.assistant.listening}
        </p>
      )}
    </div>
  );
}
