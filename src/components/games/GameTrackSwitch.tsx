"use client";

import Link from "next/link";
import clsx from "clsx";
import { useLocale } from "@/components/LocaleProvider";

export function GameTrackSwitch({ active }: { active: "langue" | "culture" }) {
  const { locale } = useLocale();
  const isFr = locale === "fr";

  return (
    <div className="seg-tabs mb-8">
      <Link
        href="/games/langue"
        className="inline-flex"
        data-active={active === "langue"}
      >
        <span
          className={clsx(
            "rounded-full px-4 py-2 text-sm font-semibold",
            active === "langue"
              ? "bg-[var(--cm-green)] text-white"
              : "text-[var(--muted)]",
          )}
        >
          {isFr ? "Langues maternelles" : "Mother tongues"}
        </span>
      </Link>
      <Link
        href="/games/culture"
        className="inline-flex"
        data-active={active === "culture"}
      >
        <span
          className={clsx(
            "rounded-full px-4 py-2 text-sm font-semibold",
            active === "culture"
              ? "bg-[var(--cm-green)] text-white"
              : "text-[var(--muted)]",
          )}
        >
          {isFr ? "Culture camerounaise" : "Cameroonian culture"}
        </span>
      </Link>
    </div>
  );
}
