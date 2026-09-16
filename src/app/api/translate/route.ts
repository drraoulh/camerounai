import { NextResponse } from "next/server";
import { translateCameroon } from "@/lib/huggingface";
import { getCameroonLang, CAMEROON_LANGS } from "@/data/cameroon-languages";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    repo: "flagship-ai/cameroon-int8",
    languages: CAMEROON_LANGS,
    note: "French-pivot MT for ~60 Cameroonian languages via flagship-ai/cameroon-int8 (CTranslate2 int8). Set CAMEROON_MT_URL (npm run mt:cameroon).",
  });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    text?: string;
    slug?: string;
    direction?: "fr-to-local" | "local-to-fr";
  };

  const text = body.text?.trim() ?? "";
  const slug = body.slug?.trim() ?? "ewondo";
  const direction = body.direction === "local-to-fr" ? "local-to-fr" : "fr-to-local";

  if (!text) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }
  if (!getCameroonLang(slug) && slug.length < 2) {
    return NextResponse.json({ error: "unknown language" }, { status: 400 });
  }

  const result = await translateCameroon({ text, slug, direction });
  if (!result.text) {
    return NextResponse.json(
      {
        error: "translation failed",
        hint:
          "Lancez le service MT : npm run mt:cameroon (port 8091). Les phrases touristiques (Bonjour, Merci…) marchent sans service.",
        pair: result.pair,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    translation: result.text,
    provider: result.provider,
    pair: result.pair,
    model: result.model,
    slug,
    direction,
  });
}
