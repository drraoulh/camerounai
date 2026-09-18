import {
  localCoachCard,
  trackFromLanguage,
  type CoachCard,
} from "@/lib/cultural-voice";
import type { LanguageTrackId, Locale } from "@/lib/types";

const cache = new Map<string, CoachCard>();

function key(
  locale: Locale,
  langId: LanguageTrackId,
  phrase: string,
  pronunciation: string,
) {
  return `${locale}|${langId}|${phrase}|${pronunciation}`;
}

export async function fetchMissionCoach(opts: {
  locale: Locale;
  langId?: LanguageTrackId;
  areaId?: string;
  language: string;
  phrase: string;
  pronunciation: string;
  setting: string;
  when: string;
  signal?: AbortSignal;
}): Promise<CoachCard> {
  const langId = opts.langId ?? trackFromLanguage(opts.language);
  const cacheKey = key(
    opts.locale,
    langId,
    opts.phrase,
    opts.pronunciation,
  );
  const hit = cache.get(cacheKey);
  if (hit) return hit;

  const fallback = localCoachCard(
    langId,
    opts.locale,
    opts.pronunciation,
    opts.phrase,
    opts.when,
  );

  try {
    const res = await fetch("/api/games/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locale: opts.locale,
        langId,
        language: opts.language,
        phrase: opts.phrase,
        pronunciation: opts.pronunciation,
        setting: opts.setting,
        when: opts.when,
      }),
      signal: opts.signal ?? AbortSignal.timeout(10000),
    });
    if (!res.ok) return fallback;
    const data = (await res.json()) as CoachCard;
    if (!data?.tip) return fallback;
    const card: CoachCard = {
      syllables: data.syllables || fallback.syllables,
      tone: data.tone || fallback.tone,
      tip: data.tip,
      when: data.when || fallback.when,
      source: data.source === "ai" ? "ai" : "local",
    };
    cache.set(cacheKey, card);
    return card;
  } catch {
    return fallback;
  }
}

export async function fetchCultureCoach(opts: {
  locale: Locale;
  region: string;
  prompt: string;
  when: string;
  signal?: AbortSignal;
}): Promise<{ tip: string; source: "ai" | "local" }> {
  const cacheKey = `culture|${opts.locale}|${opts.region}|${opts.prompt}`;
  const hit = cache.get(cacheKey);
  if (hit?.tip) return { tip: hit.tip, source: hit.source };

  try {
    const res = await fetch("/api/games/coach", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "culture",
        locale: opts.locale,
        region: opts.region,
        prompt: opts.prompt,
        when: opts.when,
      }),
      signal: opts.signal ?? AbortSignal.timeout(10000),
    });
    if (!res.ok) return { tip: opts.when, source: "local" };
    const data = (await res.json()) as { tip?: string; source?: "ai" | "local" };
    const card: CoachCard = {
      syllables: "",
      tone: "",
      tip: (data.tip || opts.when).trim(),
      source: data.source === "ai" ? "ai" : "local",
    };
    cache.set(cacheKey, card);
    return { tip: card.tip, source: card.source };
  } catch {
    return { tip: opts.when, source: "local" };
  }
}
