/**
 * Cameroon knowledge-base retrieval for Visit Cameroon RAG.
 * Combines curated KB docs with live catalogue facts (regions, culture, tips).
 */

import {
  cameroonKnowledgeBase,
  type KnowledgeDoc,
  type KbCategory,
} from "@/data/cameroon-kb";
import { countryFacts } from "@/data/country";
import { culturalAreas } from "@/data/cultural-areas";
import { regions } from "@/data/regions";
import {
  formalities,
  healthTips,
  hubs,
  moreTips,
} from "@/data/travel-practical";
import { ecoIntro, ecoPillars } from "@/data/eco-sustainable";
import { isStopWord } from "./chat-intent";
import type { Locale } from "./types";

export type KbHit = {
  id: string;
  category: KbCategory | "region" | "culture" | "tip" | "country";
  title: string;
  body: string;
  score: number;
  source: "kb" | "derived";
};

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function tokenize(text: string): string[] {
  return normalize(text)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 2 && !isStopWord(w));
}

function scoreDoc(
  tokens: string[],
  queryNorm: string,
  keywords: string[],
  title: string,
  body: string,
  opts?: { curated?: boolean; category?: string },
): number {
  let score = 0;
  const titleN = normalize(title);
  const bodyN = normalize(body);
  const kw = keywords.map(normalize);
  const category = opts?.category ?? "";

  for (const t of tokens) {
    if (kw.some((k) => k === t || k.includes(t) || t.includes(k))) score += 5;
    if (titleN.includes(t)) score += 4;
    // Cap body matches so long derived texts don't dominate curated articles
    if (bodyN.includes(t)) score += opts?.curated ? 2 : 0.5;
  }

  // Phrase / strong topic boosts
  if (/histoire|history|indépendan|independen|réunif|reunif/.test(queryNorm)) {
    if (category === "history" || kw.includes("histoire") || kw.includes("history"))
      score += 12;
    if (opts?.curated && (category === "history" || category === "overview"))
      score += 6;
  }
  if (/visa|passeport|passport|formalit/.test(queryNorm)) {
    if (
      category === "practical" ||
      category === "tip" ||
      kw.some((k) => /visa|passeport|passport|entrée|entry/.test(k))
    )
      score += 10;
  }
  if (/paludisme|malaria|vaccin|santé|health|fièvre jaune|yellow fever/.test(queryNorm)) {
    if (
      category === "practical" ||
      category === "tip" ||
      kw.some((k) => /santé|health|vaccin|paludisme|malaria/.test(k))
    )
      score += 10;
  }
  if (/président|president|biya|gouvernement|government/.test(queryNorm)) {
    if (kw.some((k) => /président|president|gouvernement|government|biya/.test(k)))
      score += 14;
    else if (category === "overview" || category === "country") score += 3;
  }
  if (/climat|climate|saison|season|météo|weather/.test(queryNorm)) {
    if (
      category === "geography" ||
      kw.some((k) => /climat|climate|saison|season/.test(k))
    )
      score += 8;
  }
  if (/langues?|languages?|pidgin|ewondo|fulfulde|yemba/.test(queryNorm)) {
    if (
      category === "languages" ||
      kw.some((k) => /langue|language|pidgin|ewondo/.test(k))
    )
      score += 12;
  }
  if (/écotour|ecotour|responsable|responsible|durable|sustainable/.test(queryNorm)) {
    if (
      category === "nature" ||
      kw.some((k) => /écolog|ecotour|nature|parc|park/.test(k))
    )
      score += 6;
  }
  if (/culture|sawa|grassfield|fang|beti|sahel/.test(queryNorm)) {
    if (category === "culture") score += 8;
  }
  if (/région|region|régions|regions/.test(queryNorm)) {
    if (category === "regions" || category === "region") score += 8;
  }

  // Prefer curated bilingual KB articles over long derived dumps
  if (opts?.curated) score += 3;

  return score;
}

function derivedDocuments(locale: Locale): Omit<KbHit, "score">[] {
  const isFr = locale === "fr";
  const docs: Omit<KbHit, "score">[] = [];

  docs.push({
    id: "country-core",
    category: "country",
    title: isFr ? countryFacts.nameFr : countryFacts.nameEn,
    body: [
      isFr ? countryFacts.independence.fr : countryFacts.independence.en,
      isFr ? countryFacts.governmentFr : countryFacts.governmentEn,
      `${isFr ? "Capitale" : "Capital"}: ${isFr ? countryFacts.capitalFr : countryFacts.capitalEn}`,
      `${isFr ? "Hub économique" : "Economic hub"}: ${isFr ? countryFacts.economicHubFr : countryFacts.economicHubEn}`,
      `${isFr ? "Monnaie" : "Currency"}: ${countryFacts.currency}`,
      isFr ? countryFacts.populationNoteFr : countryFacts.populationNoteEn,
      `${countryFacts.president.name} — ${isFr ? countryFacts.president.titleFr : countryFacts.president.titleEn} (${countryFacts.president.since})`,
    ].join(" "),
    source: "derived",
  });

  for (const h of isFr ? countryFacts.historyFr : countryFacts.historyEn) {
    docs.push({
      id: `history-${normalize(h.title).replace(/\s+/g, "-")}`,
      category: "history",
      title: h.title,
      body: h.body,
      source: "derived",
    });
  }

  for (const r of regions) {
    docs.push({
      id: `region-${r.id}`,
      category: "region",
      title: isFr ? r.nameFr : r.nameEn,
      body: [
        isFr ? r.taglineFr : r.taglineEn,
        isFr ? r.storyFr : r.storyEn,
        (isFr ? r.toVisitFr : r.toVisitEn).join("; "),
      ].join(" "),
      source: "derived",
    });
  }

  for (const c of culturalAreas) {
    docs.push({
      id: `culture-${c.slug}`,
      category: "culture",
      title: isFr ? c.nameFr : c.nameEn,
      body: [
        isFr ? c.summaryFr : c.summaryEn,
        isFr ? c.descriptionFr : c.descriptionEn,
        (isFr ? c.highlightsFr : c.highlightsEn).join("; "),
      ].join(" "),
      source: "derived",
    });
  }

  for (const tip of [...formalities, ...healthTips, ...moreTips]) {
    docs.push({
      id: `tip-${tip.id}`,
      category: "tip",
      title: isFr ? tip.titleFr : tip.titleEn,
      body: isFr ? tip.bodyFr : tip.bodyEn,
      source: "derived",
    });
  }

  for (const hub of hubs) {
    docs.push({
      id: `hub-${hub.id}`,
      category: "practical",
      title: isFr ? hub.nameFr : hub.nameEn,
      body: `${hub.city}${hub.code ? ` (${hub.code})` : ""}. ${isFr ? hub.noteFr : hub.noteEn}`,
      source: "derived",
    });
  }

  docs.push({
    id: "eco-intro",
    category: "nature",
    title: isFr ? "Écotourisme" : "Ecotourism",
    body: `${isFr ? ecoIntro.whatFr : ecoIntro.whatEn} ${isFr ? ecoIntro.manageFr : ecoIntro.manageEn}`,
    source: "derived",
  });
  for (const p of ecoPillars) {
    docs.push({
      id: `eco-${p.id}`,
      category: "nature",
      title: isFr ? p.titleFr : p.titleEn,
      body: isFr ? p.bodyFr : p.bodyEn,
      source: "derived",
    });
  }

  return docs;
}

function keywordsForDerived(doc: Omit<KbHit, "score">): string[] {
  // Title + id only — avoid long body dumps drowning curated KB articles
  return tokenize(`${doc.id} ${doc.title}`).slice(0, 16);
}

/** Retrieve top knowledge hits for a visitor question. */
export function retrieveKnowledge(
  query: string,
  locale: Locale,
  limit = 5,
): KbHit[] {
  const tokens = tokenize(query);
  const queryNorm = normalize(query);
  if (tokens.length === 0 && queryNorm.length < 3) return [];

  const hits: KbHit[] = [];

  for (const doc of cameroonKnowledgeBase) {
    const title = locale === "fr" ? doc.titleFr : doc.titleEn;
    const body = locale === "fr" ? doc.bodyFr : doc.bodyEn;
    const score = scoreDoc(tokens, queryNorm, doc.keywords, title, body, {
      curated: true,
      category: doc.category,
    });
    if (score > 0) {
      hits.push({
        id: doc.id,
        category: doc.category,
        title,
        body,
        score,
        source: "kb",
      });
    }
  }

  for (const doc of derivedDocuments(locale)) {
    const score = scoreDoc(
      tokens,
      queryNorm,
      keywordsForDerived(doc),
      doc.title,
      doc.body,
      { curated: false, category: doc.category },
    );
    if (score > 0) {
      hits.push({ ...doc, score });
    }
  }

  hits.sort((a, b) => b.score - a.score);

  // Deduplicate near-identical titles, keep highest score
  const seen = new Set<string>();
  const unique: KbHit[] = [];
  for (const h of hits) {
    const key = normalize(h.title).slice(0, 48);
    if (seen.has(key) || seen.has(h.id)) continue;
    seen.add(key);
    seen.add(h.id);
    unique.push(h);
    if (unique.length >= limit) break;
  }

  return unique;
}

/** True when the question is better answered from country knowledge than place listings. */
export function isKnowledgeQuestion(query: string): boolean {
  const q = normalize(query);
  return (
    /\b(histoire|history|indépendan|independen|président|president|biya|gouvernement|government|population|économie|economy|climat|climate|saison|season|visa|passeport|passport|vaccin|paludisme|malaria|monnaie|currency|fcfa|langues?|languages?|étiquette|etiquette|ngondo|festival|régions?|regions?|qu.est.ce|what is|c.est quoi|symbol|devise|motto|hymne|anthem|formalit|santé|health|écotour|ecotour|responsable|responsible|parle[- ]t[- ]on|spoken)\b/.test(
      q,
    ) ||
    (/\b(culture|culturel|cultural|aire culturelle|sawa|grassfields?|fang[- ]?beti|sudano)\b/.test(
      q,
    ) &&
      !/\b(visiter|visit|itin[eé]raire|trip|jours?|days?|budget)\b/.test(q)) ||
    (/cameroun|cameroon/.test(q) &&
      /\b(pays|country|présentation|about|connaître|connaitre|know|comprendre|understand)\b/.test(
        q,
      ))
  );
}

export function formatKnowledgeFacts(hits: KbHit[], locale: Locale): string {
  if (hits.length === 0) return "";
  const label = locale === "fr" ? "Base de connaissances Cameroun" : "Cameroon knowledge base";
  const lines = hits.map(
    (h, i) =>
      `${i + 1}. [${h.category}] ${h.title}\n   ${h.body.slice(0, 520)}${h.body.length > 520 ? "…" : ""}`,
  );
  return `${label}:\n${lines.join("\n\n")}`;
}

export function formatKnowledgeAnswer(hits: KbHit[], locale: Locale): string {
  if (hits.length === 0) {
    return locale === "fr"
      ? "Je n’ai pas encore assez d’éléments dans la base Cameroun pour cette question. Précisez un thème (histoire, visa, régions, culture, santé…) ou une ville."
      : "I don’t yet have enough in the Cameroon knowledge base for that. Name a theme (history, visa, regions, culture, health…) or a city.";
  }

  const primary = hits[0];
  const extras = hits.slice(1, 3);
  const isFr = locale === "fr";

  const extraBlock =
    extras.length > 0
      ? `\n\n${extras
          .map((h) => `• ${h.title} : ${h.body.slice(0, 220)}${h.body.length > 220 ? "…" : ""}`)
          .join("\n\n")}`
      : "";

  const outro = isFr
    ? "\n\nSouhaitez-vous un itinéraire, une ville précise, ou d’autres formalités pratiques ?"
    : "\n\nWould you like an itinerary, a specific city, or more practical formalities?";

  return `${primary.body}${extraBlock}${outro}`;
}

export function listKnowledgeCategories(): KbCategory[] {
  return [...new Set(cameroonKnowledgeBase.map((d) => d.category))];
}

export function getKnowledgeDoc(id: string): KnowledgeDoc | undefined {
  return cameroonKnowledgeBase.find((d) => d.id === id);
}
