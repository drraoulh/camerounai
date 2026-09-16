"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Bot, Map, Mic, Sparkles, Languages } from "lucide-react";
import { ChatAssistant } from "@/components/ChatAssistant";
import { PageShell } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";

const FEATURES = [
  {
    icon: Map,
    titleFr: "Itinéraires sur mesure",
    titleEn: "Tailored itineraries",
    bodyFr: "Budget, durée et envies : l’IA propose un parcours réaliste au Cameroun.",
    bodyEn: "Budget, duration and interests: the AI builds a realistic Cameroon route.",
  },
  {
    icon: Mic,
    titleFr: "Parlez à voix haute",
    titleEn: "Speak out loud",
    bodyFr: "Dictez votre question et écoutez la réponse — pratique en déplacement.",
    bodyEn: "Dictate your question and listen to the reply — handy on the go.",
  },
  {
    icon: Languages,
    titleFr: "Culture & langues",
    titleEn: "Culture & languages",
    bodyFr: "Expressions locales, conseils respectueux et repères culturels.",
    bodyEn: "Local phrases, respectful tips and cultural landmarks.",
  },
] as const;

export default function AssistantPage() {
  const { locale, strings } = useLocale();
  const isFr = locale === "fr";

  return (
    <PageShell>
      <section className="assistant-hero mb-8 overflow-hidden rounded-[1.75rem] sm:mb-10">
        <div className="assistant-hero__inner">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--cm-yellow)]">
            <Sparkles className="h-3.5 w-3.5" />
            {isFr ? "Guide conversationnel" : "Conversational guide"}
          </p>
          <h1 className="section-title mt-4 max-w-2xl text-3xl text-white sm:text-4xl md:text-5xl">
            {strings.assistant.title}
          </h1>
          <p className="mt-3 max-w-xl text-base text-white/80 sm:text-lg">
            {isFr
              ? "Demandez un séjour, un budget, un parc ou une expression locale. Le chat flottant reste aussi disponible sur toutes les pages."
              : "Ask for a trip, a budget, a park or a local phrase. The floating chat is also available on every page."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/trip" className="btn-pill btn-pill--light">
              {strings.nav.plan}
            </Link>
            <Link href="/eco" className="btn-pill btn-pill--ghost-light">
              {strings.nav.eco}
            </Link>
          </div>
        </div>
      </section>

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <article
              key={f.titleEn}
              className="rounded-[1.15rem] border border-[var(--line)] bg-white p-4 sm:p-5"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--cm-green)]">
                <Icon className="h-4 w-4" />
              </span>
              <h2 className="mt-3 font-[family-name:var(--font-display)] text-lg">
                {isFr ? f.titleFr : f.titleEn}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
                {isFr ? f.bodyFr : f.bodyEn}
              </p>
            </article>
          );
        })}
      </div>

      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--cm-green-deep)]">
        <Bot className="h-4 w-4" />
        {isFr ? "Discutez ici" : "Chat here"}
      </div>

      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center rounded-[1.25rem] border border-[var(--line)] bg-white text-sm text-[var(--muted)]">
            …
          </div>
        }
      >
        <ChatAssistant variant="full" />
      </Suspense>
    </PageShell>
  );
}
