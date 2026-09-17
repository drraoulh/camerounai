import { NextResponse } from "next/server";
import { fetchDestinations } from "@/lib/tourism-db";
import {
  analyzeTourismImage,
  formatVisionAnswer,
  matchPlacesFromVision,
} from "@/lib/vision";
import type { Locale } from "@/lib/types";

export const runtime = "nodejs";

const MAX_BYTES = 4.5 * 1024 * 1024;

function toDataUrl(buf: ArrayBuffer, mime: string) {
  const b64 = Buffer.from(buf).toString("base64");
  return `data:${mime};base64,${b64}`;
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let imageDataUrl = "";
    let locale: Locale = "fr";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("image");
      const loc = form.get("locale");
      if (loc === "en" || loc === "fr") locale = loc;
      if (!(file instanceof File)) {
        return NextResponse.json({ error: "image required" }, { status: 400 });
      }
      if (file.size > MAX_BYTES) {
        return NextResponse.json(
          { error: "image too large (max ~4.5MB)" },
          { status: 400 },
        );
      }
      const mime = file.type || "image/jpeg";
      if (!mime.startsWith("image/")) {
        return NextResponse.json({ error: "file must be an image" }, { status: 400 });
      }
      imageDataUrl = toDataUrl(await file.arrayBuffer(), mime);
    } else {
      const body = (await req.json()) as {
        imageDataUrl?: string;
        locale?: Locale;
      };
      if (body.locale === "en" || body.locale === "fr") locale = body.locale;
      imageDataUrl = body.imageDataUrl?.trim() ?? "";
      if (!imageDataUrl.startsWith("data:image/")) {
        return NextResponse.json(
          { error: "imageDataUrl (data:image/...) required" },
          { status: 400 },
        );
      }
      // rough size check
      if (imageDataUrl.length > MAX_BYTES * 1.4) {
        return NextResponse.json(
          { error: "image too large (max ~4.5MB)" },
          { status: 400 },
        );
      }
    }

    const catalog = await fetchDestinations();
    const analysis = await analyzeTourismImage(imageDataUrl, locale);
    const matches = matchPlacesFromVision(analysis, catalog, 5);
    const answer = formatVisionAnswer(analysis, matches, locale);

    return NextResponse.json({
      answer,
      analysis,
      matches: matches.map((m) => ({
        id: m.place.id,
        name: m.place.name,
        nameEn: m.place.nameEn,
        city: m.place.city,
        score: m.score,
        image: m.place.image,
      })),
      computerVision: true,
    });
  } catch (e) {
    console.error("[vision]", e);
    return NextResponse.json(
      { error: "vision analysis failed" },
      { status: 500 },
    );
  }
}
