import { NextResponse } from "next/server";
import { HF_TTS_MODELS } from "@/lib/hf-voices";

export const runtime = "nodejs";

const HF_INFERENCE = "https://router.huggingface.co/hf-inference/models";

export async function POST(req: Request) {
  const key = process.env.HUGGINGFACE_API_KEY?.trim();
  if (!key) {
    return NextResponse.json(
      { error: "HUGGINGFACE_API_KEY missing" },
      { status: 503 },
    );
  }

  const body = (await req.json()) as { text?: string; model?: string };
  const text = body.text?.trim() ?? "";
  const model = body.model?.trim() ?? "facebook/mms-tts-fra";

  if (!text) {
    return NextResponse.json({ error: "text required" }, { status: 400 });
  }
  if (!HF_TTS_MODELS.has(model)) {
    return NextResponse.json({ error: "model not allowed" }, { status: 400 });
  }

  const clipped = text.slice(0, 500);

  try {
    const res = await fetch(`${HF_INFERENCE}/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: clipped,
        options: { wait_for_model: true },
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return NextResponse.json(
        {
          error: "hf tts unavailable",
          detail: errText.slice(0, 300),
          hint: "MMS TTS is not on Inference Providers; the app falls back to browser voices.",
        },
        { status: 502 },
      );
    }

    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const errText = await res.text().catch(() => "");
      return NextResponse.json(
        { error: "hf tts unavailable", detail: errText.slice(0, 300) },
        { status: 502 },
      );
    }

    const buf = await res.arrayBuffer();
    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type": contentType || "audio/flac",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("[tts]", e);
    return NextResponse.json({ error: "tts error" }, { status: 500 });
  }
}
