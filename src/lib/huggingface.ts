/**
 * Multi-model Hugging Face stack for Visit Cameroon.
 * Chat + Vision + TTS + Cameroon MT (flagship-ai/cameroon-int8).
 */

import { expressions } from "@/data/expressions";
import {
  getCameroonLang,
  pairFrToLocal,
  pairLocalToFr,
} from "@/data/cameroon-languages";
import {
  YEMBA_VERIFIED_FR,
  YEMBA_VERIFIED_LOCAL,
} from "@/data/yemba-verified";

const HF_CHAT_URL = "https://router.huggingface.co/v1/chat/completions";
/** Legacy host is DNS-dead; Inference Providers route through the router. */
const HF_INFERENCE =
  "https://router.huggingface.co/hf-inference/models";

/** Models known to work on router.huggingface.co (Zephyr is no longer listed). */
const HF_CHAT_FALLBACKS = [
  "meta-llama/Llama-3.1-8B-Instruct",
  "google/gemma-3-4b-it",
  "Qwen/Qwen3-4B-Instruct-2507",
] as const;

export const HF_MODELS = {
  chat: () =>
    process.env.HUGGINGFACE_MODEL?.trim() || HF_CHAT_FALLBACKS[0],
  vision: () =>
    process.env.HUGGINGFACE_VISION_MODEL?.trim() ||
    "Salesforce/blip-image-captioning-base",
  /** Bundle: https://huggingface.co/flagship-ai/cameroon-int8 */
  cameroonMt: () =>
    process.env.CAMEROON_MT_REPO?.trim() || "flagship-ai/cameroon-int8",
  /** Optional local CTranslate2 service for full ~60 languages */
  cameroonMtService: () =>
    process.env.CAMEROON_MT_URL?.trim() || "http://127.0.0.1:8091",
} as const;

function hfKey() {
  return process.env.HUGGINGFACE_API_KEY?.trim() || "";
}

export function hasHuggingFace(): boolean {
  return Boolean(hfKey());
}

export function hfChatModel() {
  return HF_MODELS.chat();
}

export function hfVisionModel() {
  return HF_MODELS.vision();
}

function cleanText(text: string) {
  return text
    .replace(/\*\*/g, "")
    .replace(/_{1,2}/g, "")
    .replace(/Supabase|RAG|base de données|database IDs?/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function chatModelCandidates(): string[] {
  const primary = hfChatModel();
  const rest = HF_CHAT_FALLBACKS.filter((m) => m !== primary);
  // Skip known-dead defaults that still linger in .env.local
  if (/zephyr-7b-beta/i.test(primary)) {
    return [...HF_CHAT_FALLBACKS];
  }
  return [primary, ...rest];
}

async function hfChatOnce(
  model: string,
  opts: {
    system: string;
    user: string;
    maxTokens?: number;
    temperature?: number;
  },
): Promise<string | null> {
  const key = hfKey();
  if (!key) return null;
  const maxTokens = opts.maxTokens ?? 600;
  const temperature = opts.temperature ?? 0.5;

  try {
    const res = await fetch(HF_CHAT_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature,
        max_tokens: maxTokens,
        messages: [
          { role: "system", content: opts.system },
          { role: "user", content: opts.user },
        ],
      }),
      signal: AbortSignal.timeout(45000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: {
        message?: { content?: string | null; reasoning?: string | null };
      }[];
    };
    const msg = data.choices?.[0]?.message;
    const content = (msg?.content || "").trim();
    if (content) return cleanText(content);
  } catch {
    /* try next */
  }
  return null;
}

export async function hfChatCompletion(opts: {
  system: string;
  user: string;
  maxTokens?: number;
  temperature?: number;
}): Promise<string | null> {
  if (!hfKey()) return null;
  for (const model of chatModelCandidates()) {
    const text = await hfChatOnce(model, opts);
    if (text) return text;
  }
  return null;
}

export async function hfCaptionImage(
  imageDataUrl: string,
): Promise<string | null> {
  const key = hfKey();
  if (!key) return null;
  const model = hfVisionModel();
  const base64 = imageDataUrl.replace(/^data:image\/\w+;base64,/, "");
  const bytes = Buffer.from(base64, "base64");

  try {
    const res = await fetch(`${HF_INFERENCE}/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/octet-stream",
      },
      body: bytes,
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as
      | { generated_text?: string }[]
      | { generated_text?: string };
    let caption = "";
    if (Array.isArray(data)) caption = data[0]?.generated_text ?? "";
    else if (data && typeof data === "object" && "generated_text" in data) {
      caption = data.generated_text ?? "";
    }
    return caption.trim() || null;
  } catch {
    return null;
  }
}

export type MtResult = {
  text: string;
  provider:
    | "cache"
    | "verified"
    | "phrasebook"
    | "cameroon-int8-service"
    | "flagship-marian"
    | "llm-pivot"
    | "none";
  pair: string;
  model: string;
};

const EXPRESSION_LANG_TO_SLUG: Record<string, string> = {
  yemba: "yemba",
  ewondo: "ewondo",
  duala: "bakweri",
  fulfulde: "fufulde",
  medumba: "medumba",
  "cameroon pidgin": "english",
};

function softNorm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFC")
    .replace(/[!?.,…]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Accent-folded key for FR lookups typed without diacritics. */
function softNormFold(s: string) {
  return softNorm(s)
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/['ʼ‘’`]/g, "'");
}

/** Native-speaker overrides (never trust int8/cache over these). */
function translateViaVerified(
  text: string,
  slug: string,
  direction: "fr-to-local" | "local-to-fr",
): string | null {
  if (slug !== "yemba") return null;
  const key = softNorm(text);
  const folded = softNormFold(text);
  if (direction === "fr-to-local") {
    return (
      YEMBA_VERIFIED_FR[key] ??
      YEMBA_VERIFIED_FR[folded] ??
      null
    );
  }
  return (
    YEMBA_VERIFIED_LOCAL[key] ??
    YEMBA_VERIFIED_LOCAL[folded] ??
    YEMBA_VERIFIED_LOCAL[softNorm(key)] ??
    null
  );
}

function normalizePhrase(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s'?]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function expressionsForSlug(slug: string) {
  return expressions.filter(
    (e) => EXPRESSION_LANG_TO_SLUG[e.language.toLowerCase()] === slug,
  );
}

function scorePhraseMatch(needle: string, candidate: string): number {
  if (!candidate) return 0;
  if (needle === candidate) return 100;
  if (needle.startsWith(candidate) || candidate.startsWith(needle)) return 80;
  if (needle.includes(candidate) || candidate.includes(needle)) return 60;
  return 0;
}

/** Offline tourist phrasebook — works without HF or the Python MT service. */
function translateViaPhrasebook(
  text: string,
  slug: string,
  direction: "fr-to-local" | "local-to-fr",
): string | null {
  // Multi-clause before normalize (normalize strips commas)
  if (direction === "fr-to-local") {
    const parts = text
      .split(/[,;.]+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length > 1) {
      const glued = parts.map((p) =>
        translateViaPhrasebook(p, slug, direction),
      );
      if (glued.every(Boolean)) return glued.join(", ");
    }
  }

  const needle = normalizePhrase(text);
  if (!needle) return null;

  let best: { score: number; out: string } | null = null;
  for (const e of expressionsForSlug(slug)) {
    const fr = normalizePhrase(e.translationFr);
    const en = normalizePhrase(e.translationEn);
    const local = normalizePhrase(e.phrase);
    if (direction === "fr-to-local") {
      const score = Math.max(
        scorePhraseMatch(needle, fr),
        scorePhraseMatch(needle, en),
      );
      if (score > 0 && (!best || score > best.score)) {
        best = { score, out: e.phrase };
      }
    } else {
      const score = scorePhraseMatch(needle, local);
      if (score > 0 && (!best || score > best.score)) {
        best = { score, out: e.translationFr };
      }
    }
  }

  return best && best.score >= 60 ? best.out : null;
}

async function translateViaLocalService(
  text: string,
  pair: string,
  timeoutMs = 25000,
): Promise<{ text: string; model?: string; via?: string } | null> {
  const base = HF_MODELS.cameroonMtService();
  if (!base) return null;
  const url = base.replace(/\/$/, "");

  try {
    const res = await fetch(`${url}/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, pair }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      translation?: string;
      text?: string;
      model?: string;
      via?: string;
    };
    const out = (data.translation || data.text || "").trim();
    if (!out) return null;
    return { text: out, model: data.model, via: data.via };
  } catch {
    return null;
  }
}

/** Fire-and-forget warm so the next request is fast. */
function warmPairInBackground(pair: string) {
  const base = HF_MODELS.cameroonMtService();
  if (!base) return;
  const url = base.replace(/\/$/, "");
  void fetch(`${url}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: "Bonjour", pair }),
  }).catch(() => undefined);
}

const mtCache = new Map<string, string>();

function mtCacheKey(
  text: string,
  slug: string,
  direction: "fr-to-local" | "local-to-fr",
) {
  return `${direction}|${slug}|${text.toLowerCase().trim()}`;
}

async function translateViaMarianHub(
  text: string,
  modelId: string,
): Promise<string | null> {
  const key = hfKey();
  if (!key) return null;
  try {
    const res = await fetch(`${HF_INFERENCE}/${modelId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
        options: { wait_for_model: false },
      }),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as
      | { translation_text?: string }[]
      | { translation_text?: string }
      | { generated_text?: string }[];
    if (Array.isArray(data)) {
      const row = data[0] as {
        translation_text?: string;
        generated_text?: string;
      };
      return (row.translation_text || row.generated_text || "").trim() || null;
    }
    if (data && typeof data === "object" && "translation_text" in data) {
      return (data.translation_text || "").trim() || null;
    }
    return null;
  } catch {
    return null;
  }
}

function stripTranslationNoise(raw: string) {
  return (
    raw
      .replace(/^["'«»]+|["'«»]+$/g, "")
      .replace(/^(traduction\s*:\s*|translation\s*:\s*)/i, "")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)[0]
      ?.trim() || raw.trim()
  );
}

function looksLikeGarbageMt(s: string) {
  if (s.length < 2) return true;
  // Repeated character spam from weak LLM MT
  if (/(.)\1{8,}/u.test(s)) return true;
  if (/^ŋ+$/i.test(s)) return true;
  return false;
}

async function translateViaLlmPivot(
  text: string,
  targetName: string,
  direction: "fr-to-local" | "local-to-fr",
): Promise<string | null> {
  const system =
    direction === "fr-to-local"
      ? `Tu es un traducteur expert des langues camerounaises. Traduis vers « ${targetName} » (Alphabet Général des Langues Camerounaises si pertinent). Réponds UNIQUEMENT avec la traduction, une seule ligne, sans guillemets ni explication.`
      : `Tu traduis depuis la langue camerounaise « ${targetName} » vers le français. Réponds UNIQUEMENT avec la traduction française, une seule ligne.`;

  const models = chatModelCandidates().filter((m) => !/zephyr/i.test(m));
  const key = hfKey();
  if (!key) return null;

  for (const model of models.slice(0, 2)) {
    try {
      const res = await fetch(HF_CHAT_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          temperature: 0.1,
          max_tokens: 80,
          messages: [
            { role: "system", content: system },
            { role: "user", content: text },
          ],
        }),
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) continue;
      const data = (await res.json()) as {
        choices?: { message?: { content?: string | null } }[];
      };
      const content = (data.choices?.[0]?.message?.content || "").trim();
      if (!content) continue;
      const cleaned = stripTranslationNoise(cleanText(content));
      if (
        !cleaned ||
        looksLikeGarbageMt(cleaned) ||
        /je (ne )?(peux|sais) pas|i (can't|cannot)|as an ai|désolé|sorry/i.test(
          cleaned,
        )
      ) {
        continue;
      }
      return cleaned;
    } catch {
      /* try next model */
    }
  }
  return null;
}

/**
 * Translate (Hugging Face stack):
 * 0) verified native (Yemba…) · 1) cache · 2) phrasebook · 3) cameroon-int8 + LLM · 4) Marian
 */
export async function translateCameroon(opts: {
  text: string;
  slug: string;
  direction: "fr-to-local" | "local-to-fr";
}): Promise<MtResult> {
  const text = opts.text.trim();
  const lang = getCameroonLang(opts.slug);
  const pair =
    opts.direction === "fr-to-local"
      ? pairFrToLocal(opts.slug)
      : pairLocalToFr(opts.slug);

  if (!text) {
    return {
      text: "",
      provider: "none",
      pair,
      model: HF_MODELS.cameroonMt(),
    };
  }

  // Speaker-verified overrides beat cache + int8 (e.g. Bonjour → mŋə́ tsà'tsɛ̀)
  const verified = translateViaVerified(text, opts.slug, opts.direction);
  if (verified) {
    const cacheKey = mtCacheKey(text, opts.slug, opts.direction);
    mtCache.set(cacheKey, verified);
    return {
      text: verified,
      provider: "verified",
      pair,
      model: "native-speaker",
    };
  }

  const cacheKey = mtCacheKey(text, opts.slug, opts.direction);
  const cached = mtCache.get(cacheKey);
  if (cached) {
    return {
      text: cached,
      provider: "cache",
      pair,
      model: "memory",
    };
  }

  const viaBook = translateViaPhrasebook(text, opts.slug, opts.direction);
  if (viaBook) {
    mtCache.set(cacheKey, viaBook);
    return {
      text: viaBook,
      provider: "phrasebook",
      pair,
      model: "visit-cameroon-phrasebook",
    };
  }

  // Parallel: cameroon-int8 + LLM. Prefer Hugging Face int8 service.
  const [viaService, viaLlm] = await Promise.all([
    translateViaLocalService(text, pair, 28000),
    translateViaLlmPivot(text, lang?.nameFr || opts.slug, opts.direction),
  ]);

  if (viaService?.text) {
    mtCache.set(cacheKey, viaService.text);
    return {
      text: viaService.text,
      provider: "cameroon-int8-service",
      pair,
      model: viaService.model || HF_MODELS.cameroonMt(),
    };
  }

  // Service missed (cold/down) — keep warming for next time
  warmPairInBackground(pair);

  if (viaLlm) {
    mtCache.set(cacheKey, viaLlm);
    return {
      text: viaLlm,
      provider: "llm-pivot",
      pair,
      model: chatModelCandidates()[0] || hfChatModel(),
    };
  }

  const hubModel =
    opts.direction === "fr-to-local"
      ? lang?.hubFrToLocal
      : lang?.hubLocalToFr;
  if (hubModel) {
    const viaMarian = await translateViaMarianHub(text, hubModel);
    if (viaMarian) {
      mtCache.set(cacheKey, viaMarian);
      return {
        text: viaMarian,
        provider: "flagship-marian",
        pair,
        model: hubModel,
      };
    }
  }

  return {
    text: "",
    provider: "none",
    pair,
    model: HF_MODELS.cameroonMt(),
  };
}

export function hfProviderLabel() {
  return "Hugging Face";
}
