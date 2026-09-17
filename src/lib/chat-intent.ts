import type { Locale } from "./types";

const GREETING_RE =
  /^(bonjour|bonsoir|salut|hello|hi|hey|coucou|bonne\s+journ[ée]e|good\s+(morning|afternoon|evening)|howdy)\b/i;

const SMALL_TALK_RE =
  /^(bonjour|bonsoir|salut|hello|hi|hey|coucou)?[\s,!.]*((comment\s+(allez[-\s]?vous|vas[-\s]?tu|ça\s+va)|ça\s+va|ca\s+va|how\s+are\s+you|how'?s\s+it\s+going|what'?s\s+up)[\s?!.]*)+$/i;

const STOP_WORDS = new Set([
  "bonjour",
  "bonsoir",
  "salut",
  "hello",
  "hi",
  "hey",
  "comment",
  "allez",
  "vous",
  "vas",
  "tu",
  "oui",
  "non",
  "merci",
  "please",
  "thanks",
  "the",
  "and",
  "for",
  "une",
  "des",
  "les",
  "dans",
  "avec",
  "pour",
  "sur",
  "pas",
  "que",
  "qui",
  "quoi",
  "est",
  "are",
  "you",
  "how",
  "what",
  "when",
  "where",
  "why",
  "can",
  "could",
  "would",
  "want",
  "veux",
  "voudrais",
  "aimerais",
  "besoin",
]);

/** Pure greeting / “how are you” — no tourism dump, no web search. */
export function isGreetingOrSmallTalk(message: string): boolean {
  const t = message.trim().replace(/\s+/g, " ");
  if (t.length < 2) return true;
  if (t.length > 80) return false;
  if (SMALL_TALK_RE.test(t)) return true;
  if (GREETING_RE.test(t) && t.split(/\s+/).length <= 4) return true;
  // "bonjour comment allez-vous" etc.
  const lower = t.toLowerCase();
  if (
    /^(bonjour|bonsoir|salut|hello|hi)\b/.test(lower) &&
    /comment\s+(allez|vas)|ça\s+va|how\s+are\s+you/.test(lower) &&
    !/(cameroun|cameroon|visiter|voyage|kribi|douala|yaound|budget|jour)/.test(
      lower,
    )
  ) {
    return true;
  }
  return false;
}

export function greetingReply(locale: Locale): string {
  return locale === "fr"
    ? "Bonjour ! Je vais très bien, merci. Je suis Visit Cameroon, votre guide pour découvrir le pays.\n\nVous pouvez me demander par exemple : que faire à Yaoundé, un week-end à Kribi, les formalités d’entrée, l’histoire du Cameroun, ou quelques expressions en ewondo.\n\nQue puis-je faire pour vous ?"
    : "Hello! I’m doing well, thank you. I’m Visit Cameroon, your guide to discovering the country.\n\nYou can ask me for example: what to do in Yaoundé, a weekend in Kribi, entry formalities, Cameroon’s history, or a few Ewondo phrases.\n\nHow can I help you?";
}

export function isStopWord(token: string): boolean {
  return STOP_WORDS.has(token.toLowerCase());
}

/** Content tokens only — ignore greetings / filler that pollute RAG. */
export function contentTokens(query: string): string[] {
  return query
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 2 && !isStopWord(w));
}
