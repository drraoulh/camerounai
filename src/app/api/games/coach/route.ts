import { NextResponse } from "next/server";
import { hfChatCompletion, hasHuggingFace } from "@/lib/huggingface";
import {
  languageVoice,
  localCoachCard,
  trackFromLanguage,
  type CoachCard,
} from "@/lib/cultural-voice";
import type { LanguageTrackId, Locale } from "@/lib/types";

export const runtime = "nodejs";

function extractJson(text: string): Partial<CoachCard> | null {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  try {
    return JSON.parse(m[0]) as Partial<CoachCard>;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let body: {
    kind?: "voice" | "culture";
    locale?: Locale;
    langId?: string;
    areaId?: string;
    language?: string;
    phrase?: string;
    pronunciation?: string;
    setting?: string;
    when?: string;
    region?: string;
    prompt?: string;
  } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    body = {};
  }

  const locale: Locale = body.locale === "en" ? "en" : "fr";

  if (body.kind === "culture") {
    const when = (body.when ?? "").trim().slice(0, 320);
    const prompt = (body.prompt ?? "").trim().slice(0, 240);
    const region = (body.region ?? "").trim().slice(0, 80);
    const fallbackTip = when;
    if (!prompt || !hasHuggingFace()) {
      return NextResponse.json({ tip: fallbackTip, source: "local" as const });
    }
    const system =
      locale === "fr"
        ? `Tu es un guide culturel camerounais. 2 phrases max, concrètes, pour un visiteur. Pas de markdown. Pas d'invention de lieux.`
        : `You are a Cameroonian cultural guide. 2 sentences max, concrete, for a visitor. No markdown. Do not invent places.`;
    const user =
      locale === "fr"
        ? `Région : ${region}\nQuestion : ${prompt}\nFait : ${when}\nAjoute un détail de terrain utile (ton, geste, saison ou étiquette).`
        : `Region: ${region}\nQuestion: ${prompt}\nFact: ${when}\nAdd one useful on-the-ground detail (tone, gesture, season or etiquette).`;
    const raw = await hfChatCompletion({
      system,
      user,
      maxTokens: 140,
      temperature: 0.3,
      timeoutMs: 8000,
      maxAttempts: 1,
    });
    return NextResponse.json({
      tip: (raw || fallbackTip).slice(0, 360),
      source: raw ? "ai" : "local",
    });
  }

  const TRACKS: LanguageTrackId[] = [
    "duala",
    "yemba",
    "shupamom",
    "medumba",
    "mbouda",
    "ewondo",
    "fulfulde",
  ];
  const langId: LanguageTrackId = TRACKS.includes(body.langId as LanguageTrackId)
    ? (body.langId as LanguageTrackId)
    : trackFromLanguage(body.language ?? "");
  const phrase = (body.phrase ?? "").trim().slice(0, 120);
  const pronunciation = (body.pronunciation ?? "").trim().slice(0, 160);
  const language = (body.language ?? languageVoice(langId).language).slice(0, 40);
  const setting = (body.setting ?? "").trim().slice(0, 280);
  const when = (body.when ?? "").trim().slice(0, 280);

  const fallback = localCoachCard(langId, locale, pronunciation, phrase, when);
  const voice = languageVoice(langId);

  if (!phrase || !hasHuggingFace()) {
    return NextResponse.json(fallback);
  }

  const system =
    locale === "fr"
      ? `Tu es un coach vocal camerounais pour visiteurs. Tu enseignes le TON et la prononciation d'UNE langue (pas d'une aire entière).
Réponds UNIQUEMENT en JSON compact :
{"syllables":"syllabes séparées par ·","tone":"1 phrase sur le ton de CETTE langue","tip":"2 phrases max : comment dire CETTE expression, erreurs à éviter"}
Règles : réaliste. Shüpamom n'est pas le yemba. Medumba n'est pas le yemba ni le shüpamom. Apostrophe = coupe glottale. Pas de markdown. Ne invente pas d'histoire.`
      : `You are a Cameroonian voice coach for visitors. You teach TONE and pronunciation of ONE language (not a whole area).
Reply ONLY with compact JSON:
{"syllables":"syllables split by ·","tone":"1 sentence on THIS language's speaking tone","tip":"2 sentences max: how to say THIS phrase, mistakes to avoid"}
Rules: realistic. Shüpamom is not Yemba. Medumba is neither Yemba nor Shüpamom. Apostrophe = glottal cut. No markdown. Do not invent a story.`;

  const user =
    locale === "fr"
      ? `Langue : ${language} (${langId})
Ton : ${voice.toneFr}
Expression : ${phrase}
Guide : ${pronunciation || phrase}
Situation : ${setting || "échange de séjour"}
Usage : ${when || fallback.tip}`
      : `Language: ${language} (${langId})
Tone: ${voice.toneEn}
Phrase: ${phrase}
Guide: ${pronunciation || phrase}
Situation: ${setting || "stay exchange"}
Usage: ${when || fallback.tip}`;

  const raw = await hfChatCompletion({
    system,
    user,
    maxTokens: 180,
    temperature: 0.25,
    timeoutMs: 8000,
    maxAttempts: 1,
  });

  if (!raw) {
    return NextResponse.json(fallback);
  }

  const parsed = extractJson(raw);
  const card: CoachCard = {
    syllables: (parsed?.syllables || fallback.syllables).toString().slice(0, 80),
    tone: (parsed?.tone || fallback.tone).toString().slice(0, 280),
    tip: (parsed?.tip || fallback.tip).toString().slice(0, 360),
    when: fallback.when,
    source: "ai",
  };

  return NextResponse.json(card);
}
