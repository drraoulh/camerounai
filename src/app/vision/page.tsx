"use client";

import Link from "next/link";
import { PageHero, PageShell } from "@/components/PageShell";
import { VisionIdentify } from "@/components/VisionIdentify";
import { useLocale } from "@/components/LocaleProvider";

export default function VisionPage() {
  const { locale, strings } = useLocale();
  const isFr = locale === "fr";

  return (
    <PageShell className="max-w-3xl">
      <PageHero title={strings.vision.title} subtitle={strings.vision.subtitle} />
      <VisionIdentify />
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/assistant"
          className="rounded-full bg-[var(--cm-green)] px-5 py-2.5 text-sm font-semibold text-white"
        >
          {strings.nav.assistant}
        </Link>
        <Link
          href="/explore"
          className="rounded-full border border-[var(--line)] px-5 py-2.5 text-sm font-semibold"
        >
          {strings.nav.explore}
        </Link>
        <p className="w-full text-xs text-[var(--muted)]">
          {isFr
            ? "Techno : vision Hugging Face (BLIP + chat) + matching catalogue. Critère « Vision par ordinateur »."
            : "Stack: Hugging Face vision (BLIP + chat) + catalogue matching. Fits “Computer vision”."}
        </p>
      </div>
    </PageShell>
  );
}
