/** Full voice catalogue: browser SpeechSynthesis (reliable) + optional HF TTS. */

import {
  medumbaFileCandidates,
  medumbaTakeFor,
} from "@/data/medumba-voicebank";
import {
  mboudaFileCandidates,
  mboudaTakeFor,
} from "@/data/mbouda-voicebank";
import {
  shupamomFileCandidates,
  shupamomTakeFor,
} from "@/data/shupamom-voicebank";
import {
  languageVoice,
  phoneticForSpeech,
  trackFromLanguage,
  type CulturalVoice,
} from "./cultural-voice";
import {
  HF_VOICES,
  defaultCameroonVoiceId,
  type HfVoiceOption,
} from "./hf-voices";
import type { CulturalZone, LanguageTrackId } from "./types";

export type { HfVoiceOption };
export { HF_VOICES, defaultCameroonVoiceId };

export type SpeakListeners = {
  onStart?: () => void;
  onEnd?: () => void;
};

export type BrowserVoiceOption = {
  id: string;
  source: "browser";
  name: string;
  lang: string;
  voiceURI: string;
  localService: boolean;
  group: "africa" | "fr" | "en" | "other";
};

export type VoiceOption = BrowserVoiceOption | HfVoiceOption;

const STORAGE_KEY = "vc-voice-id";

let voicesCache: SpeechSynthesisVoice[] = [];
let currentUtterance: SpeechSynthesisUtterance | null = null;
let currentAudio: HTMLAudioElement | null = null;

function loadVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  voicesCache = window.speechSynthesis.getVoices();
  return voicesCache;
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => loadVoices();
}

function groupForLang(lang: string): BrowserVoiceOption["group"] {
  const l = lang.toLowerCase();
  if (
    /^(en-(ng|za|ke|gh|tz|cm|ug)|fr-(sn|ci|cm|ml|bf|cd)|af|sw|ha|yo|ig|ln)/.test(
      l,
    )
  ) {
    return "africa";
  }
  if (l.startsWith("fr")) return "fr";
  if (l.startsWith("en")) return "en";
  return "other";
}

export function listBrowserVoices(): BrowserVoiceOption[] {
  const voices = loadVoices();
  return voices
    .map((v) => ({
      id: `browser:${v.voiceURI}`,
      source: "browser" as const,
      name: `${v.name} (${v.lang})`,
      lang: v.lang,
      voiceURI: v.voiceURI,
      localService: v.localService,
      group: groupForLang(v.lang),
    }))
    .sort((a, b) => {
      const order = { africa: 0, fr: 1, en: 2, other: 3 };
      const d = order[a.group] - order[b.group];
      if (d !== 0) return d;
      return a.name.localeCompare(b.name);
    });
}

export function listAllVoices(): VoiceOption[] {
  return [...HF_VOICES, ...listBrowserVoices()];
}

function pickBrowserVoice(
  preferredLang: string,
  preferLangs?: string[],
): SpeechSynthesisVoice | undefined {
  const voices = loadVoices();
  if (!voices.length) return undefined;
  const ranked = [...(preferLangs ?? []), preferredLang];
  for (const want of ranked) {
    const exact = voices.find(
      (v) => v.lang.toLowerCase() === want.toLowerCase(),
    );
    if (exact) return exact;
    const prefix = voices.find((v) =>
      v.lang.toLowerCase().startsWith(want.slice(0, 2).toLowerCase()),
    );
    if (prefix && want.length <= 3) return prefix;
  }
  const want = preferredLang.toLowerCase();
  const cm = voices.find(
    (v) =>
      /cm|cameroon|cameroun|senegal|nigeria|ghana|ivory|cote/i.test(
        `${v.name} ${v.lang}`,
      ) ||
      v.lang.toLowerCase() === "fr-cm" ||
      v.lang.toLowerCase() === "en-cm",
  );
  if (cm) return cm;
  const exact = voices.find((v) => v.lang.toLowerCase() === want);
  if (exact) return exact;
  const prefix = voices.find((v) =>
    v.lang.toLowerCase().startsWith(want.slice(0, 2)),
  );
  if (prefix) return prefix;
  return voices[0];
}

export function getStoredVoiceId(locale: "fr" | "en" = "fr"): string {
  if (typeof window === "undefined") return defaultCameroonVoiceId(locale);
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v) {
      // HF MMS is no longer served by Inference Providers — force browser default
      if (v.startsWith("hf:") || v === "african") {
        const next = defaultCameroonVoiceId(locale);
        localStorage.setItem(STORAGE_KEY, next);
        return next;
      }
      return v;
    }
  } catch {
    /* ignore */
  }
  const browser = listBrowserVoices();
  const cm = browser.find(
    (v) =>
      /cm|cameroon|cameroun/i.test(`${v.name} ${v.lang}`) ||
      v.lang.toLowerCase() === "fr-cm" ||
      v.lang.toLowerCase() === "en-cm",
  );
  if (cm) return cm.id;
  return defaultCameroonVoiceId(locale);
}

export function setStoredVoiceId(id: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
}

export function findVoiceOption(id: string): VoiceOption | null {
  if (id === "browser:auto-fr" || id === "browser:auto-en") {
    const lang = id.endsWith("en") ? "en-US" : "fr-FR";
    const voice = pickBrowserVoice(lang);
    if (!voice) {
      return {
        id,
        source: "browser",
        name: lang.startsWith("fr") ? "Navigateur · Français" : "Browser · English",
        lang,
        voiceURI: "",
        localService: true,
        group: lang.startsWith("fr") ? "fr" : "en",
      };
    }
    return {
      id,
      source: "browser",
      name: `${voice.name} (${voice.lang})`,
      lang: voice.lang,
      voiceURI: voice.voiceURI,
      localService: voice.localService,
      group: groupForLang(voice.lang),
    };
  }
  if (id.startsWith("hf:")) {
    return HF_VOICES.find((v) => v.id === id) ?? null;
  }
  return listBrowserVoices().find((v) => v.id === id) ?? null;
}

function cleanSpeakText(text: string) {
  return text
    .replace(/\*\*/g, "")
    .replace(/_{1,2}/g, "")
    .replace(/[📍💰📷]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function stopSpeaking() {
  if (typeof window === "undefined") return;
  if (window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
    } catch {
      /* ignore */
    }
  }
  currentUtterance = null;
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }
}

export function isSpeaking() {
  if (typeof window === "undefined") return false;
  const synth =
    window.speechSynthesis?.speaking || window.speechSynthesis?.pending;
  const audio = currentAudio && !currentAudio.paused;
  return Boolean(synth || audio);
}

const audioCache = new Map<string, string>();
const nativeProbe = new Map<string, boolean>();

async function firstExistingUrl(urls: string[]): Promise<string | null> {
  for (const url of urls) {
    const hit = nativeProbe.get(url);
    if (hit === true) return url;
    if (hit === false) continue;
    try {
      const res = await fetch(url, { method: "HEAD", cache: "force-cache" });
      const ok =
        res.ok && !(res.headers.get("content-type") || "").includes("text/html");
      nativeProbe.set(url, ok);
      if (ok) return url;
    } catch {
      nativeProbe.set(url, false);
    }
  }
  return null;
}

function playFirstAvailable(
  urls: string[],
  playbackRate: number,
  listeners?: SpeakListeners,
): Promise<boolean> {
  return new Promise((resolve) => {
    let index = 0;
    const attempt = () => {
      if (index >= urls.length) {
        listeners?.onEnd?.();
        resolve(false);
        return;
      }
      const url = urls[index++];
      stopSpeaking();
      const audio = new Audio();
      audio.preload = "auto";
      audio.setAttribute("playsinline", "true");
      audio.src = url;
      audio.playbackRate = Math.min(1.15, Math.max(0.55, playbackRate));
      currentAudio = audio;
      const fail = () => {
        if (currentAudio === audio) currentAudio = null;
        attempt();
      };
      audio.onended = () => {
        currentAudio = null;
        listeners?.onEnd?.();
        resolve(true);
      };
      audio.onerror = fail;
      listeners?.onStart?.();
      void audio.play().catch(fail);
    };
    attempt();
  });
}

function nativeTakeIds(
  langId: LanguageTrackId,
  opts: { phrase: string; stepId?: string },
): string[] {
  if (langId === "shupamom") {
    if (opts.stepId === "sp-3") return ["hmhm", "mbey"];
    const take = shupamomTakeFor(opts);
    return take ? [take.id] : [];
  }
  if (langId === "medumba") {
    const take = medumbaTakeFor(opts);
    return take ? [take.id] : [];
  }
  if (langId === "mbouda") {
    const take = mboudaTakeFor(opts);
    return take ? [take.id] : [];
  }
  return [];
}

function nativeFileCandidates(
  langId: LanguageTrackId,
  takeId: string,
  speed: "normal" | "slow",
) {
  if (langId === "medumba") return medumbaFileCandidates(takeId, speed);
  if (langId === "mbouda") return mboudaFileCandidates(takeId, speed);
  if (langId === "shupamom") return shupamomFileCandidates(takeId, speed);
  return [];
}

async function speakNativeTakes(
  langId: LanguageTrackId,
  opts: {
    phrase: string;
    stepId?: string;
    slow?: boolean;
    listeners?: SpeakListeners;
  },
): Promise<boolean> {
  const ids = nativeTakeIds(langId, {
    phrase: opts.phrase,
    stepId: opts.stepId,
  });
  if (!ids.length) return false;

  const speed = opts.slow ? "slow" : "normal";
  for (let i = 0; i < ids.length; i++) {
    const last = i === ids.length - 1;
    const urls = [
      ...nativeFileCandidates(langId, ids[i], speed),
      ...(opts.slow ? nativeFileCandidates(langId, ids[i], "normal") : []),
    ];
    const ok = await playFirstAvailable(
      urls,
      opts.slow && speed === "slow" ? 0.72 : 1,
      last ? { onStart: opts.listeners?.onStart, onEnd: opts.listeners?.onEnd } : { onStart: opts.listeners?.onStart },
    );
    if (!ok) {
      if (!last) opts.listeners?.onEnd?.();
      return i > 0;
    }
  }
  return true;
}

export function nativeAudioSrc(opts: {
  langId: LanguageTrackId;
  phrase: string;
  stepId?: string;
}): string | null {
  const ids = nativeTakeIds(opts.langId, {
    phrase: opts.phrase,
    stepId: opts.stepId,
  });
  if (!ids[0]) return null;
  return nativeFileCandidates(opts.langId, ids[0], "normal")[0] ?? null;
}

function cacheKey(model: string, text: string) {
  return `${model}::${text}`;
}

async function fetchHfAudio(model: string, text: string): Promise<string | null> {
  const key = cacheKey(model, text);
  const cached = audioCache.get(key);
  if (cached) return cached;
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, model }),
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.size || (blob.type && blob.type.includes("json"))) return null;
    const url = URL.createObjectURL(blob);
    audioCache.set(key, url);
    return url;
  } catch {
    return null;
  }
}

async function speakWithHf(
  text: string,
  model: string,
  lang: string,
  rate: number,
  listeners?: SpeakListeners,
): Promise<boolean> {
  try {
    const url = await fetchHfAudio(model, text);
    if (!url) return false;
    stopSpeaking();
    const audio = new Audio(url);
    audio.playbackRate = Math.min(1.15, Math.max(0.55, rate));
    currentAudio = audio;
    listeners?.onStart?.();
    audio.onended = () => {
      currentAudio = null;
      listeners?.onEnd?.();
    };
    audio.onerror = () => {
      currentAudio = null;
      listeners?.onEnd?.();
    };
    await audio.play();
    return true;
  } catch {
    return false;
  }
}

function speakWithBrowser(
  text: string,
  lang: string,
  voiceURI: string | null,
  rate: number,
  listeners?: SpeakListeners,
  pitch = 1,
  preferLangs?: string[],
) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    listeners?.onEnd?.();
    return;
  }

  const run = () => {
    stopSpeaking();
    try {
      window.speechSynthesis.resume();
    } catch {
      /* ignore */
    }

    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    u.pitch = pitch;
    const voices = loadVoices();
    const voice = voiceURI
      ? voices.find((v) => v.voiceURI === voiceURI)
      : pickBrowserVoice(lang, preferLangs);
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    }
    u.onstart = () => listeners?.onStart?.();
    u.onend = () => {
      currentUtterance = null;
      listeners?.onEnd?.();
    };
    u.onerror = () => {
      currentUtterance = null;
      listeners?.onEnd?.();
    };
    currentUtterance = u;
    window.speechSynthesis.speak(u);
  };

  if (!loadVoices().length) {
    const once = () => {
      window.speechSynthesis.removeEventListener("voiceschanged", once);
      run();
    };
    window.speechSynthesis.addEventListener("voiceschanged", once);
    window.setTimeout(run, 300);
    return;
  }

  window.setTimeout(run, 20);
}

export type SpeakTuning = {
  lang?: string;
  rate?: number;
  pitch?: number;
  voiceId?: string;
  preferLangs?: string[];
  listeners?: SpeakListeners;
};

export function speakTuned(text: string, tuning: SpeakTuning = {}) {
  const cleaned = cleanSpeakText(text);
  if (!cleaned) return;
  const lang = tuning.lang ?? "fr-FR";
  const rate = tuning.rate ?? 0.95;
  const pitch = tuning.pitch ?? 1;
  const listeners = tuning.listeners;
  const id =
    tuning.voiceId ?? getStoredVoiceId(lang.startsWith("en") ? "en" : "fr");
  const option = findVoiceOption(id);

  if (option?.source === "hf") {
    void (async () => {
      const ok = await speakWithHf(
        cleaned,
        option.model,
        option.lang || lang,
        rate,
        listeners,
      );
      if (!ok) {
        speakWithBrowser(
          cleaned,
          lang,
          null,
          rate,
          listeners,
          pitch,
          tuning.preferLangs,
        );
      }
    })();
    return;
  }

  if (option?.source === "browser") {
    speakWithBrowser(
      cleaned,
      option.lang || lang,
      option.voiceURI || null,
      rate,
      listeners,
      pitch,
      tuning.preferLangs,
    );
    return;
  }

  speakWithBrowser(
    cleaned,
    lang,
    null,
    rate,
    listeners,
    pitch,
    tuning.preferLangs,
  );
}

export function speakText(
  text: string,
  lang = "fr-FR",
  rate = 0.95,
  listeners?: SpeakListeners,
  voiceId?: string,
) {
  const cleaned = cleanSpeakText(text);
  if (!cleaned) return;

  const id = voiceId ?? getStoredVoiceId(lang.startsWith("en") ? "en" : "fr");
  const option = findVoiceOption(id);

  if (option?.source === "hf") {
    void (async () => {
      const ok = await speakWithHf(
        cleaned,
        option.model,
        option.lang || lang,
        rate,
        listeners,
      );
      if (!ok) {
        // HF MMS no longer available → browser fallback
        speakWithBrowser(cleaned, lang, null, rate, listeners);
      }
    })();
    return;
  }

  if (option?.source === "browser") {
    speakWithBrowser(
      cleaned,
      option.lang || lang,
      option.voiceURI || null,
      rate,
      listeners,
    );
    return;
  }

  speakWithBrowser(cleaned, lang, null, rate, listeners);
}

export function speakCulturalPhrase(opts: {
  langId?: LanguageTrackId;
  areaId?: CulturalZone;
  language?: string;
  phrase: string;
  pronunciation: string;
  slow?: boolean;
  stepId?: string;
  listeners?: SpeakListeners;
}) {
  const langId =
    opts.langId ??
    (opts.language ? trackFromLanguage(opts.language) : undefined) ??
    "duala";
  const voice = languageVoice(langId);
  const spoken = phoneticForSpeech(opts.pronunciation, opts.phrase);

  if (langId === "shupamom" || langId === "medumba" || langId === "mbouda") {
    void (async () => {
      const ok = await speakNativeTakes(langId, {
        phrase: opts.phrase,
        stepId: opts.stepId,
        slow: opts.slow,
        listeners: opts.listeners,
      });
      if (ok) return;
      speakTuned(spoken, {
        lang: voice.preferLangs[0] ?? "fr-CM",
        rate: opts.slow ? voice.slowRate : voice.rate,
        pitch: voice.pitch,
        voiceId: voice.hfId,
        preferLangs: voice.preferLangs,
        listeners: opts.listeners,
      });
    })();
    return;
  }

  speakTuned(spoken, {
    lang: voice.preferLangs[0] ?? "fr-CM",
    rate: opts.slow ? voice.slowRate : voice.rate,
    pitch: voice.pitch,
    voiceId: voice.hfId,
    preferLangs: voice.preferLangs,
    listeners: opts.listeners,
  });
}

export function prefetchCulturalAudio(
  langId: LanguageTrackId,
  phrase: string,
  pronunciation: string,
  stepId?: string,
) {
  if (langId === "shupamom" || langId === "medumba" || langId === "mbouda") {
    for (const id of nativeTakeIds(langId, { phrase, stepId })) {
      void firstExistingUrl(nativeFileCandidates(langId, id, "normal"));
    }
    return;
  }
  const voice: CulturalVoice = languageVoice(langId);
  if (!voice.hfModel) return;
  const spoken = phoneticForSpeech(pronunciation, phrase);
  void fetchHfAudio(voice.hfModel, spoken);
}

export function speakPhrase(opts: {
  phrase: string;
  pronunciation: string;
  locale: "fr" | "en";
  mode: "phrase" | "pronunciation" | "meaning";
  meaning: string;
}) {
  const lang = opts.locale === "fr" ? "fr-FR" : "en-US";
  if (opts.mode === "meaning") {
    speakText(opts.meaning, lang, 0.95);
    return;
  }
  // Prefer the local phrase itself; phonetic guide as backup text
  const text =
    opts.mode === "phrase"
      ? opts.phrase
      : opts.pronunciation || opts.phrase;
  speakText(text, lang, 0.85);
}

export function whenVoicesReady(): Promise<BrowserVoiceOption[]> {
  return new Promise((resolve) => {
    const list = listBrowserVoices();
    if (list.length > 0) {
      resolve(list);
      return;
    }
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve([]);
      return;
    }
    const done = () => resolve(listBrowserVoices());
    window.speechSynthesis.addEventListener("voiceschanged", done, {
      once: true,
    });
    window.setTimeout(done, 800);
  });
}
