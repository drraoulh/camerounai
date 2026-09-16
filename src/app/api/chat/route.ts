import { NextResponse } from "next/server";
import { buildRagAnswer, buildFactsForLlm } from "@/lib/rag";
import { fetchDestinations } from "@/lib/tourism-db";
import type { Locale } from "@/lib/types";

function systemPrompt(locale: Locale) {
  return locale === "fr"
    ? `Tu es Visit Cameroon, le guide touristique officiel du Cameroun (MINTOUL).
Ton : chaleureux, clair, professionnel — comme un conseiller voyage, pas un robot ni une fiche technique.
Règles :
- Réponds en français.
- Utilise UNIQUEMENT les faits fournis (lieux, villes, coûts, zones culturelles).
- Ne cite jamais « Supabase », « RAG », « base de données » ni des IDs techniques.
- Structure : 1–2 phrases d’intro, puis 3–4 suggestions concrètes, puis une question de relance utile.
- Descriptions courtes (1 phrase par lieu). Coûts = estimations.
- Pas d’em dash (—). Pas de markdown lourd (**). Texte naturel, lisible à voix haute.
- Si les faits sont insuffisants, dis-le brièvement et propose une reformulation (ville ou aire culturelle).`
    : `You are Visit Cameroon, the official tourism guide for Cameroon (MINTOUL).
Tone: warm, clear, professional — like a travel advisor, not a robot or a database dump.
Rules:
- Reply in English.
- Use ONLY the provided facts (places, cities, costs, cultural areas).
- Never mention “Supabase”, “RAG”, “database”, or technical IDs.
- Structure: 1–2 intro sentences, then 3–4 concrete suggestions, then a useful follow-up question.
- Keep place blurbs to one sentence. Costs are estimates.
- No em dashes. No heavy markdown (**). Natural text, easy to read aloud.
- If facts are thin, say so briefly and ask for a city or cultural area.`;
}

function cleanModelAnswer(text: string) {
  return text
    .replace(/\*\*/g, "")
    .replace(/_{1,2}/g, "")
    .replace(/Supabase|RAG|base de données|database IDs?/gi, "")
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
        temperature: 0.55,
        max_tokens: 550,
        messages: [
          { role: "system", content: systemPrompt(locale) },
          {
            role: "user",
            content:
              locale === "fr"
                ? `Faits touristiques (source Visit Cameroon) :\n${facts}\n\nBrouillon local (à améliorer, ne pas copier tel quel) :\n${draftAnswer}\n\nQuestion du visiteur :\n${message}\n\nRédige la réponse finale au visiteur.`
                : `Tourism facts (Visit Cameroon source):\n${facts}\n\nLocal draft (improve it, do not copy verbatim):\n${draftAnswer}\n\nVisitor question:\n${message}\n\nWrite the final reply to the visitor.`,
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
): Promise<string | null> {
  const key = process.env.HUGGINGFACE_API_KEY;
  if (!key) return null;

  const model =
    process.env.HUGGINGFACE_MODEL ?? "HuggingFaceH4/zephyr-7b-beta";
  const prompt = `${systemPrompt(locale)}

Facts:
${facts}

Draft:
${draftAnswer}

Visitor:
${message}

Guide:`;

  try {
    const res = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 420,
            temperature: 0.5,
            return_full_text: false,
          },
        }),
      },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as
      | { generated_text?: string }[]
      | { generated_text?: string }
      | { error?: string };

    let text: string | undefined;
    if (Array.isArray(data)) text = data[0]?.generated_text;
    else if (data && typeof data === "object" && "generated_text" in data) {
      text = data.generated_text;
    }
    return text?.trim() ? cleanModelAnswer(text) : null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const body = (await req.json()) as { message?: string; locale?: Locale };
  const message = body.message?.trim() ?? "";
  const locale = body.locale === "en" ? "en" : "fr";

  if (!message) {
    return NextResponse.json({ error: "message required" }, { status: 400 });
  }

  const catalog = await fetchDestinations();
  const { answer, sourceIds, tripPlan } = buildRagAnswer(
    message,
    locale,
    catalog,
  );
  const { facts } = buildFactsForLlm(message, locale, catalog);

  // Keep structured trip plans as-is (already polished locally)
  const enriched = tripPlan
    ? null
    : ((await enrichWithOpenAI(message, locale, facts, answer)) ??
      (await enrichWithHuggingFace(message, locale, facts, answer)));

  return NextResponse.json({
    answer: enriched ?? answer,
    sourceIds,
    tripPlan: tripPlan ?? null,
    enriched: Boolean(enriched),
  });
}
