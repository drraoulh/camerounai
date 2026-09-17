import { NextResponse } from "next/server";
import { cameroonKnowledgeBase } from "@/data/cameroon-kb";
import { retrieveKnowledge } from "@/lib/knowledge-base";
import type { Locale } from "@/lib/types";

/** Browse or search the Cameroon knowledge base (RAG source). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const locale: Locale = searchParams.get("locale") === "en" ? "en" : "fr";
  const limit = Math.min(Number(searchParams.get("limit") || 8) || 8, 20);

  if (q) {
    const hits = retrieveKnowledge(q, locale, limit);
    return NextResponse.json({
      query: q,
      locale,
      count: hits.length,
      results: hits.map((h) => ({
        id: h.id,
        category: h.category,
        title: h.title,
        excerpt: h.body.slice(0, 280),
        score: h.score,
        source: h.source,
      })),
    });
  }

  return NextResponse.json({
    locale,
    count: cameroonKnowledgeBase.length,
    documents: cameroonKnowledgeBase.map((d) => ({
      id: d.id,
      category: d.category,
      title: locale === "fr" ? d.titleFr : d.titleEn,
      keywords: d.keywords.slice(0, 12),
    })),
  });
}
