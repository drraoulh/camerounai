/** Full voice catalogue: browser SpeechSynthesis (reliable) + optional HF TTS. */

import {
  HF_VOICES,
  defaultCameroonVoiceId,
  type HfVoiceOption,
} from "./hf-voices";

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
): SpeechSynthesisVoice | undefined {
  const voices = loadVoices();
  if (!voices.length) return undefined;
  const want = preferredLang.toLowerCase();
  const cm = voices.find(
    (v) =>
      /cm|cameroon|cameroun/i.test(`${v.name} ${v.lang}`) ||
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

async function speakWithHf(
  text: string,
  model: string,
  lang: string,
  rate: number,
  listeners?: SpeakListeners,
): Promise<boolean> {
  stopSpeaking();
  listeners?.onStart?.();
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, model }),
    });
    if (!res.ok) {
      listeners?.onEnd?.();
      return false;
    }
    const blob = await res.blob();
    if (!blob.size || (blob.type && blob.type.includes("json"))) {
      listeners?.onEnd?.();
      return false;
    }
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    currentAudio = audio;
    audio.onended = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      listeners?.onEnd?.();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      listeners?.onEnd?.();
    };
    await audio.play();
    return true;
  } catch {
    listeners?.onEnd?.();
    return false;
  }
}

function speakWithBrowser(
  text: string,
  lang: string,
  voiceURI: string | null,
  rate: number,
  listeners?: SpeakListeners,
) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    listeners?.onEnd?.();
    return;
  }

  const run = () => {
    stopSpeaking();
    // Chrome often leaves synthesis in a stuck paused state
    try {
      window.speechSynthesis.resume();
    } catch {
      /* ignore */
    }

    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    u.pitch = 1;
    const voices = loadVoices();
    const voice = voiceURI
      ? voices.find((v) => v.voiceURI === voiceURI)
      : pickBrowserVoice(lang);
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

  // Voices may load asynchronously (esp. Chrome/Edge)
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
