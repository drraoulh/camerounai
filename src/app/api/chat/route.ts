import { NextResponse } from "next/server";
import { buildRagAnswer, buildFactsForLlm } from "@/lib/rag";
import { fetchDestinations } from "@/lib/tourism-db";
import {
  greetingReply,
  isGreetingOrSmallTalk,
} from "@/lib/chat-intent";
import { researchCameroonWeb, shouldSearchWeb } from "@/lib/web-search";
import { hfChatCompletion } from "@/lib/huggingface";
import type { Locale } from "@/lib/types";

function systemPrompt(locale: Locale, mode?: string) {
  const modeHint =
    mode === "knowledge"
      ? locale === "fr"
        ? "Priorité : faits pays / culture / formalités de la base de connaissances. Pas de liste de lieux inventés."
        : "Priority: country / culture / formalities from the knowledge base. Do not invent place listings."
      : mode === "places"
        ? locale === "fr"
          ? "Priorité : suggestions de lieux concrets issus des faits."
          : "Priority: concrete place suggestions from the facts."
        : "";

  return locale === "fr"
    ? `Tu es Visit Cameroon, le guide touristique officiel du Cameroun (MINTOUL).
Mission : Discover Cameroon · Understand Cameroon · Experience Cameroon.
Ton : chaleureux, clair, confiant — conseiller voyage bilingue, jamais robot ni fiche technique.
${modeHint}
Règles :
- Réponds en français, naturellement (lisible à voix haute).
- Ancre-toi UNIQUEMENT sur les faits fournis (base Cameroun, lieux, web si présent).
- N’invente pas de lieux, prix, horaires, visas ou chiffres absents des faits.
- Si les faits manquent, dis-le brièvement et propose une reformulation utile.
- Structure : 1–2 phrases d’accroche, puis l’essentiel (puces ou phrases courtes), puis UNE question de relance.
- Coûts = estimations. Visa / santé : rappelle de vérifier auprès des sources officielles.
- Ne cite jamais « Supabase », « RAG », « base de données », « LLM » ni des IDs techniques.
- Pas d’em dash (—). Pas de markdown lourd (**). Pas d’emojis.
- 120–220 mots sauf si l’utilisateur demande un détail long.`
    : `You are Visit Cameroon, Cameroon’s official tourism guide (MINTOUL).
Mission: Discover Cameroon · Understand Cameroon · Experience Cameroon.
Tone: warm, clear, confident — bilingual travel advisor, never a robot or data dump.
${modeHint}
Rules:
- Reply in English, naturally (easy to read aloud).
- Ground yourself ONLY in the provided facts (Cameroon knowledge base, places, web if present).
- Do not invent places, prices, schedules, visas or figures missing from the facts.
- If facts are thin, say so briefly and suggest a useful rephrase.
- Structure: 1–2 opening sentences, then the essentials (short bullets or sentences), then ONE follow-up question.
- Costs are estimates. For visas / health: remind travellers to verify official sources.
- Never mention “Supabase”, “RAG”, “database”, “LLM”, or technical IDs.
- No em dashes. No heavy markdown (**). No emojis.
- Keep to 120–220 words unless the visitor asks for more detail.`;
}

function cleanModelAnswer(text: string) {
  return text
    .replace(/\*\*/g, "")
    .replace(/_{1,2}/g, "")
    .replace(/Supabase|RAG|base de données|database IDs?|LLM/gi, "")
    .replace(/\s*Sources?\s*:\s*[^\n]+/gi, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function enrichWithOpenAI(
  message: string,
  locale: Locale,
  facts: string,
  draftAnswer: string,
  mode?: string,
): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.45,
        max_tokens: 600,
        messages: [
          { role: "system", content: systemPrompt(locale, mode) },
          {
            role: "user",
            content:
              locale === "fr"
                ? `Faits Visit Cameroon (base de connaissances + catalogue) :\n${facts}\n\nBrouillon local (améliore le ton et la clarté, ne copie pas tel quel, n’ajoute aucun fait) :\n${draftAnswer}\n\nQuestion du visiteur :\n${message}\n\nRédige la réponse finale au visiteur.`
                : `Visit Cameroon facts (knowledge base + catalogue):\n${facts}\n\nLocal draft (improve tone and clarity, do not copy verbatim, add no new facts):\n${draftAnswer}\n\nVisitor question:\n${message}\n\nWrite the final reply to the visitor.`,
          },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    return content ? cleanModelAnswer(content) : null;
  } catch {
    return null;
  }
}

async function enrichWithHuggingFace(
  message: string,
  locale: Locale,
  facts: string,
  draftAnswer: string,
  mode?: string,
): Promise<string | null> {
  const text = await hfChatCompletion({
    system: systemPrompt(locale, mode),
    user:
      locale === "fr"
        ? `Faits :\n${facts}\n\nBrouillon :\n${draftAnswer}\n\nQuestion :\n${message}\n\nRéponse finale :`
        : `Facts:\n${facts}\n\nDraft:\n${draftAnswer}\n\nQuestion:\n${message}\n\nFinal reply:`,
    maxTokens: 520,
    temperature: 0.45,
  });
  return text ? cleanModelAnswer(text) : null;
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    message?: string;
    locale?: Locale;
    history?: { role?: string; content?: string }[];
  };
  const message = body.message?.trim() ?? "";
  const locale = body.locale === "en" ? "en" : "fr";

  if (!message) {
    return NextResponse.json({ error: "message required" }, { status: 400 });
  }

  // Greetings: warm welcome, no place dump
  if (isGreetingOrSmallTalk(message)) {
    return NextResponse.json({
      answer: greetingReply(locale),
      sourceIds: [],
      tripPlan: null,
      enriched: false,
      mode: "greeting",
      knowledgeIds: [],
    });
  }

  const catalog = await fetchDestinations();
  const { answer, sourceIds, tripPlan, mode, knowledgeHits } = buildRagAnswer(
    message,
    locale,
    catalog,
  );
  const { facts, localFactsThin } = buildFactsForLlm(message, locale, catalog);

  let factsWithWeb = facts;
  let usedWeb = false;
  if (
    !tripPlan &&
    shouldSearchWeb(message, localFactsThin || mode === "fallback")
  ) {
    const web = await researchCameroonWeb(message, locale);
    if (web.usedWeb && web.text) {
      usedWeb = true;
      factsWithWeb = `${facts}\n\n${locale === "fr" ? "Repères web (à croiser, non officiels)" : "Web notes (cross-check, not official)"}:\n${web.text}`;
    }
  }

  // Keep structured trip plans as-is (already polished locally)
  const enriched = tripPlan
    ? null
    : ((await enrichWithOpenAI(
        message,
        locale,
        factsWithWeb,
        answer,
        mode,
      )) ??
      (await enrichWithHuggingFace(
        message,
        locale,
        factsWithWeb,
        answer,
        mode,
      )));

  return NextResponse.json({
    answer: enriched ?? answer,
    sourceIds,
    tripPlan: tripPlan ?? null,
    enriched: Boolean(enriched),
    mode: mode ?? "places",
    usedWeb,
    knowledgeIds: (knowledgeHits ?? []).map((h) => h.id),
  });
}
