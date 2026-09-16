/** Hugging Face TTS — Cameroon-first catalogue. */

export type HfVoiceOption = {
  id: string;
  source: "hf";
  name: string;
  nameEn: string;
  lang: string;
  model: string;
  group: "cameroon" | "africa" | "fr" | "en";
  /** Highlight as the Visit Cameroon default voice */
  cameroonDefault?: boolean;
};

/**
 * Ready MMS checkpoints closest to Cameroon:
 * - Pidgin (pcm) ≈ Cameroon Pidgin English
 * - Fulah (ful) ≈ Fulfulde du Nord / Extrême-Nord
 * - Hausa spoken in the Far North sphere
 * - French/English for the official bilingual guide
 */
export const HF_VOICES: HfVoiceOption[] = [
  {
    id: "hf:cameroon-pidgin",
    source: "hf",
    name: "Cameroun · Pidgin",
    nameEn: "Cameroon · Pidgin",
    lang: "pcm",
    model: "facebook/mms-tts-pcm",
    group: "cameroon",
    cameroonDefault: true,
  },
  {
    id: "hf:cameroon-fulfulde",
    source: "hf",
    name: "Cameroun · Fulfulde",
    nameEn: "Cameroon · Fulfulde",
    lang: "ful",
    model: "facebook/mms-tts-ful",
    group: "cameroon",
  },
  {
    id: "hf:cameroon-fr",
    source: "hf",
    name: "Cameroun · Français (guide)",
    nameEn: "Cameroon · French (guide)",
    lang: "fr",
    model: "facebook/mms-tts-fra",
    group: "cameroon",
  },
  {
    id: "hf:cameroon-en",
    source: "hf",
    name: "Cameroun · English (guide)",
    nameEn: "Cameroon · English (guide)",
    lang: "en",
    model: "facebook/mms-tts-eng",
    group: "cameroon",
  },
  {
    id: "hf:facebook/mms-tts-hau",
    source: "hf",
    name: "Cameroun · Haoussa (Extrême-Nord)",
    nameEn: "Cameroon · Hausa (Far North)",
    lang: "ha",
    model: "facebook/mms-tts-hau",
    group: "cameroon",
  },
  {
    id: "hf:facebook/mms-tts-swa",
    source: "hf",
    name: "HF · Swahili",
    nameEn: "HF · Swahili",
    lang: "sw",
    model: "facebook/mms-tts-swa",
    group: "africa",
  },
  {
    id: "hf:facebook/mms-tts-yor",
    source: "hf",
    name: "HF · Yoruba",
    nameEn: "HF · Yoruba",
    lang: "yo",
    model: "facebook/mms-tts-yor",
    group: "africa",
  },
  {
    id: "hf:facebook/mms-tts-ibo",
    source: "hf",
    name: "HF · Igbo",
    nameEn: "HF · Igbo",
    lang: "ig",
    model: "facebook/mms-tts-ibo",
    group: "africa",
  },
  {
    id: "hf:facebook/mms-tts-lin",
    source: "hf",
    name: "HF · Lingala",
    nameEn: "HF · Lingala",
    lang: "ln",
    model: "facebook/mms-tts-lin",
    group: "africa",
  },
];

export const HF_TTS_MODELS = new Set(HF_VOICES.map((v) => v.model));

/** Default Cameroon voice id for a UI locale (browser — HF MMS TTS is offline on Inference Providers). */
export function defaultCameroonVoiceId(locale: "fr" | "en" = "fr"): string {
  return locale === "en" ? "browser:auto-en" : "browser:auto-fr";
}
