import { retrieveContext } from "./rag";
import { decodeHtmlEntities } from "./text";
import { getLocalizedDestination } from "./localize-place";
import type { Destination, Locale } from "./types";

function shortDesc(text: string, max = 160) {
  const clean = decodeHtmlEntities(text).replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const last = Math.max(cut.lastIndexOf(". "), cut.lastIndexOf(" "));
  return `${(last > 60 ? cut.slice(0, last) : cut).trim()}…`;
}

function buildSystemPrompt(locale: Locale, contextBlock: string) {
  const isFr = locale === "fr";
  return isFr
    ? `Tu es Visit Cameroon, guide touristique officiel du Cameroun (MINTOUL).
Ton chaleureux et clair. Réponds en français.
Utilise UNIQUEMENT les faits du contexte. N’invente pas de lieux.
Ne mentionne pas Supabase, RAG ni des IDs. Pas de markdown lourd.
1–2 phrases d’intro, suggestions concrètes, une relance utile.
Coûts = estimations. Max ~220 mots.

CONTEXTE :
${contextBlock}`
    : `You are Visit Cameroon, Cameroon’s official tourism guide (MINTOUL).
Warm, clear tone. Reply in English.
Use ONLY the context facts. Do not invent places.
Never mention Supabase, RAG, or IDs. No heavy markdown.
1–2 intro sentences, concrete suggestions, one useful follow-up.
Costs are estimates. Max ~220 words.

CONTEXT:
${contextBlock}`;
}

function formatContext(locale: Locale, catalog?: Destination[]) {
  return (query: string) => {
    const { destinations, culture, expressions } = retrieveContext(
      query,
      8,
      catalog,
    );
    const destLines = destinations.map((d) => {
      const loc = getLocalizedDestination(d, locale);
      const desc = shortDesc(loc.description);
      return `- ${loc.name} | ${loc.city}, ${loc.region} | ${d.culturalZone} | ~${d.estimatedCostFcfa} FCFA | ${desc}`;
    });
    const isFr = locale === "fr";
    const cultureLine = culture
      ? `\nCultural area: ${isFr ? culture.nameFr : culture.nameEn} — ${isFr ? culture.summaryFr : culture.summaryEn}`
      : "";
    const exprLines =
      expressions.length > 0
        ? `\nPhrases:\n${expressions
            .map(
              (e) =>
                `- ${e.phrase} (${e.language}): ${isFr ? e.translationFr : e.translationEn} [${e.pronunciation}]`,
            )
            .join("\n")}`
        : "";
    return `${destLines.join("\n")}${cultureLine}${exprLines}`;
  };
}

export async function enhanceWithLlm(
  query: string,
  locale: Locale,
  fallbackAnswer: string,
  catalog?: Destination[],
): Promise<{ answer: string; provider: "local" | "openai" | "huggingface" }> {
  const contextBlock =
    formatContext(locale, catalog)(query) || "(aucune destination trouvée)";
  const system = buildSystemPrompt(locale, contextBlock);

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          temperature: 0.55,
          max_tokens: 550,
          messages: [
            { role: "system", content: system },
            { role: "user", content: query },
          ],
        }),
      });
      if (res.ok) {
        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) {
          return {
            answer: content.replace(/\*\*/g, "").trim(),
            provider: "openai",
          };
        }
      }
    } catch {
      // fall through
    }
  }

  const hfKey = process.env.HUGGINGFACE_API_KEY;
  if (hfKey) {
    try {
      const model =
        process.env.HUGGINGFACE_MODEL || "HuggingFaceH4/zephyr-7b-beta";
      const res = await fetch(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${hfKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: `${system}\n\nVisiteur: ${query}\nGuide:`,
            parameters: {
              max_new_tokens: 420,
              temperature: 0.5,
              return_full_text: false,
            },
          }),
        },
      );
      if (res.ok) {
        const data = (await res.json()) as
          | { generated_text?: string }[]
          | { generated_text?: string };
        const text = Array.isArray(data)
          ? data[0]?.generated_text
          : data.generated_text;
        if (text?.trim()) {
          return {
            answer: text.replace(/\*\*/g, "").trim(),
            provider: "huggingface",
          };
        }
      }
    } catch {
      // fall through
    }
  }

  return { answer: fallbackAnswer, provider: "local" };
}
