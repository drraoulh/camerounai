"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { MegaSection } from "@/data/mega-nav";
import type { Locale } from "@/lib/types";
import clsx from "clsx";

type Props = {
  section: MegaSection;
  locale: Locale;
  onNavigate?: () => void;
  compact?: boolean;
};

export function MegaMenuPanel({
  section,
  locale,
  onNavigate,
  compact = false,
}: Props) {
  const isFr = locale === "fr";
  const { feature } = section;

  return (
    <div className={clsx("mega-panel", compact && "mega-panel--compact")}>
      <div className="mb-3 hidden md:block">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--cm-green)]">
          {isFr ? section.labelFr : section.labelEn}
        </p>
        <div className="cm-stripe mt-2" />
      </div>

      <div className="mega-panel__grid">
        <ul className="mega-panel__links">
          {section.links.map((link) => (
            <li key={link.href + link.labelEn}>
              <Link
                href={link.href}
                className="mega-link"
                onClick={onNavigate}
              >
                <span className="mega-link__title">
                  {isFr ? link.labelFr : link.labelEn}
                </span>
                <span className="mega-link__tag">
                  {isFr ? link.tagFr : link.tagEn}
                </span>
              </Link>
            </li>
          ))}
          <li className="mega-panel__all">
            <Link
              href={section.href}
              className="mega-all"
              onClick={onNavigate}
            >
              {isFr ? "Tout voir" : "View all"}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </li>
        </ul>

        <Link
          href={feature.href}
          className="mega-feature"
          onClick={onNavigate}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={feature.image}
            alt=""
            className="mega-feature__img"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <div className="mega-feature__body">
            <p className="mega-feature__kicker">
              {isFr ? "À la une" : "Featured"}
            </p>
            <h3 className="mega-feature__title">
              {isFr ? feature.titleFr : feature.titleEn}
            </h3>
            <p className="mega-feature__text">
              {isFr ? feature.bodyFr : feature.bodyEn}
            </p>
            <span className="mega-feature__cta">
              {isFr ? feature.ctaFr : feature.ctaEn}
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
