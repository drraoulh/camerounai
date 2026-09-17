import type { Locale } from "./types";

export type WebHit = {
  title: string;
  snippet: string;
  url: string;
  source: "wikipedia" | "serper" | "tavily" | "duckduckgo";
};

function decodeSnippet(s: string) {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function isCameroonRelevant(hit: WebHit, query: string): boolean {
  const blob = `${hit.title} ${hit.snippet} ${hit.url}`.toLowerCase();
  const q = query.toLowerCase();
  if (
    /cameroun|cameroon|yaound|douala|kribi|mintoul|afrique centrale|central africa/.test(
      blob,
    )
  ) {
    return true;
  }
  if (/olympique de marseille|swahili|dholuo|transfermarkt/.test(blob)) {
    return false;
  }
  if (/cameroun|cameroon/.test(q)) return true;
  const tokens = q.split(/\s+/).filter((w) => w.length > 3);
  return tokens.some((t) => blob.includes(t));
}

function withCameroonFocus(query: string, locale: Locale) {
  const q = query.trim();
  const lower = q.toLowerCase();
  if (
    lower.includes("cameroun") ||
    lower.includes("cameroon") ||
    lower.includes("yaoundé") ||
    lower.includes("yaounde") ||
    lower.includes("douala")
  ) {
    return q;
  }
  return locale === "fr" ? `${q} Cameroun` : `${q} Cameroon`;
}

async function searchWikipedia(
  query: string,
  locale: Locale,
  limit = 3,
): Promise<WebHit[]> {
  const lang = locale === "fr" ? "fr" : "en";
  const q = withCameroonFocus(query, locale);
  try {
    const url = new URL(`https://${lang}.wikipedia.org/w/api.php`);
    url.searchParams.set("action", "query");
    url.searchParams.set("list", "search");
    url.searchParams.set("srsearch", q);
    url.searchParams.set("srlimit", String(limit));
    url.searchParams.set("format", "json");
    url.searchParams.set("origin", "*");

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      query?: { search?: { title: string; snippet: string; pageid: number }[] };
    };
    const rows = data.query?.search ?? [];
    return rows.map((r) => ({
      title: r.title,
      snippet: decodeSnippet(r.snippet),
      url: `https://${lang}.wikipedia.org/?curid=${r.pageid}`,
      source: "wikipedia" as const,
    }));
  } catch {
    return [];
  }
}

async function searchDuckDuckGo(query: string, locale: Locale): Promise<WebHit[]> {
  const q = withCameroonFocus(query, locale);
  try {
    const url = new URL("https://api.duckduckgo.com/");
    url.searchParams.set("q", q);
    url.searchParams.set("format", "json");
    url.searchParams.set("no_redirect", "1");
    url.searchParams.set("no_html", "1");
    url.searchParams.set("skip_disambig", "1");

    const res = await fetch(url.toString(), {
      headers: { "User-Agent": "VisitCameroonBot/1.0" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      AbstractText?: string;
      AbstractURL?: string;
      Heading?: string;
      RelatedTopics?: { Text?: string; FirstURL?: string }[];
    };
    const hits: WebHit[] = [];
    if (data.AbstractText) {
      hits.push({
        title: data.Heading || "DuckDuckGo",
        snippet: data.AbstractText.slice(0, 400),
        url: data.AbstractURL || "https://duckduckgo.com/",
        source: "duckduckgo",
      });
    }
    for (const t of data.RelatedTopics ?? []) {
      if (!t.Text || !t.FirstURL) continue;
      hits.push({
        title: t.Text.slice(0, 80),
        snippet: t.Text.slice(0, 280),
        url: t.FirstURL,
        source: "duckduckgo",
      });
      if (hits.length >= 4) break;
    }
    return hits;
  } catch {
    return [];
  }
}

async function searchSerper(query: string, locale: Locale): Promise<WebHit[]> {
  const key = process.env.SERPER_API_KEY;
  if (!key) return [];
  const q = withCameroonFocus(query, locale);
  try {
    const res = await fetch("https://google.serper.dev/search", {
      method: "POST",
      headers: {
        "X-API-KEY": key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ q, num: 5, gl: locale === "fr" ? "cm" : "us", hl: locale }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      organic?: { title?: string; snippet?: string; link?: string }[];
      answerBox?: { answer?: string; snippet?: string; title?: string; link?: string };
    };
    const hits: WebHit[] = [];
    if (data.answerBox?.answer || data.answerBox?.snippet) {
      hits.push({
        title: data.answerBox.title || "Answer",
        snippet: data.answerBox.answer || data.answerBox.snippet || "",
        url: data.answerBox.link || "",
        source: "serper",
      });
    }
    for (const r of data.organic ?? []) {
      if (!r.title || !r.link) continue;
      hits.push({
        title: r.title,
        snippet: (r.snippet || "").slice(0, 320),
        url: r.link,
        source: "serper",
      });
    }
    return hits.slice(0, 6);
  } catch {
    return [];
  }
}

async function searchTavily(query: string, locale: Locale): Promise<WebHit[]> {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return [];
  const q = withCameroonFocus(query, locale);
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: key,
        query: q,
        search_depth: "basic",
        max_results: 5,
        include_answer: true,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      answer?: string;
      results?: { title?: string; content?: string; url?: string }[];
    };
    const hits: WebHit[] = [];
    if (data.answer) {
      hits.push({
        title: "Tavily summary",
        snippet: data.answer.slice(0, 400),
        url: "",
        source: "tavily",
      });
    }
    for (const r of data.results ?? []) {
      if (!r.title) continue;
      hits.push({
        title: r.title,
        snippet: (r.content || "").slice(0, 320),
        url: r.url || "",
        source: "tavily",
      });
    }
    return hits.slice(0, 6);
  } catch {
    return [];
  }
}

/** Multi-source web research focused on Cameroon. */
export async function researchCameroonWeb(
  query: string,
  locale: Locale,
): Promise<{ hits: WebHit[]; text: string; usedWeb: boolean }> {
  const [serper, tavily, wiki, ddg] = await Promise.all([
    searchSerper(query, locale),
    searchTavily(query, locale),
    searchWikipedia(query, locale),
    searchDuckDuckGo(query, locale),
  ]);

  const hits = [...serper, ...tavily, ...wiki, ...ddg]
    .map((h) => ({ ...h, snippet: decodeSnippet(h.snippet) }))
    .filter((h) => h.snippet?.trim())
    .filter((h) => isCameroonRelevant(h, query))
    .slice(0, 8);

  if (hits.length === 0) {
    return { hits: [], text: "", usedWeb: false };
  }

  const text = hits
    .map(
      (h, i) =>
        `${i + 1}. [${h.source}] ${h.title}\n   ${h.snippet}${h.url ? `\n   ${h.url}` : ""}`,
    )
    .join("\n\n");

  return { hits, text, usedWeb: true };
}

export function shouldSearchWeb(query: string, localFactsThin: boolean): boolean {
  const q = query.toLowerCase().trim();

  // Never web-search greetings / small talk
  if (
    /^(bonjour|bonsoir|salut|hello|hi|hey)\b/.test(q) &&
    q.length < 60 &&
    !/(cameroun|cameroon|visiter|voyage|kribi|visa|histoire)/.test(q)
  ) {
    return false;
  }
  if (
    /comment\s+(allez|vas)|ça\s+va\??$|how\s+are\s+you/i.test(q) &&
    !/(cameroun|cameroon|visiter|aller à|aller a)/.test(q)
  ) {
    return false;
  }

  // Factual / research intents (not the French word "comment" alone in greetings)
  if (
    /\b(qui est|c'est quoi|qu'est-ce|population|économie|economie|politique|actualité|climat|météo|meteo|football|histoire du|président|president|visa|aéroport|aeroport|indépendan|capital)\b/.test(
      q,
    )
  ) {
    return true;
  }
  if (/\b(where|what is|who is|population|economy|history of|president|visa|airport)\b/.test(q)) {
    return true;
  }
  if (/cameroun|cameroon/.test(q) && localFactsThin) return true;
  // Thin local answer on a real tourism question
  if (
    localFactsThin &&
    /\b(visiter|voyage|région|region|kribi|douala|yaound|limbé|limbe|parc|plage|chefferie)\b/.test(
      q,
    )
  ) {
    return true;
  }
  return false;
}
