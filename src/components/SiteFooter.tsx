"use client";

import Link from "next/link";
import { useLocale } from "./LocaleProvider";

export function SiteFooter() {
  const { locale, strings } = useLocale();
  const isFr = locale === "fr";

  return (
    <footer className="full-bleed mt-20 border-t border-[var(--line)] bg-[var(--cm-green-deep)] text-white">
      <div className="h-1 w-full bg-gradient-to-r from-[var(--cm-green)] via-[var(--laterite)] to-[var(--cm-yellow)]" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
            Visit <span className="text-[var(--cm-yellow)]">Cameroon</span>
          </p>
          <p className="mt-3 text-sm text-white/70">{strings.tagline}</p>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--cm-yellow)]">
            MINTOUL
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
            {isFr ? "Découvrir" : "Discover"}
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/85">
            <li>
              <Link href="/things-to-do" className="hover:text-[var(--cm-yellow)]">
                {strings.nav.things}
              </Link>
            </li>
            <li>
              <Link href="/explore" className="hover:text-[var(--cm-yellow)]">
                {strings.nav.explore}
              </Link>
            </li>
            <li>
              <Link href="/events" className="hover:text-[var(--cm-yellow)]">
                {strings.nav.events}
              </Link>
            </li>
            <li>
              <Link href="/eat" className="hover:text-[var(--cm-yellow)]">
                {strings.nav.eat}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
            {isFr ? "Planifier" : "Plan"}
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/85">
            <li>
              <Link href="/trip" className="hover:text-[var(--cm-yellow)]">
                {strings.nav.plan}
              </Link>
            </li>
            <li>
              <Link href="/stay" className="hover:text-[var(--cm-yellow)]">
                {strings.nav.stay}
              </Link>
            </li>
            <li>
              <Link href="/assistant" className="hover:text-[var(--cm-yellow)]">
                {strings.nav.assistant}
              </Link>
            </li>
            <li>
              <Link href="/map" className="hover:text-[var(--cm-yellow)]">
                {strings.nav.map}
              </Link>
            </li>
            <li>
              <Link href="/travel-tips" className="hover:text-[var(--cm-yellow)]">
                {strings.nav.tips}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/55">
            {isFr ? "Plus" : "More"}
          </p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/85">
            <li>
              <Link href="/culture" className="hover:text-[var(--cm-yellow)]">
                {strings.nav.culture}
              </Link>
            </li>
            <li>
              <Link href="/eco" className="hover:text-[var(--cm-yellow)]">
                {strings.nav.eco}
              </Link>
            </li>
            <li>
              <Link href="/learn" className="hover:text-[var(--cm-yellow)]">
                {strings.nav.learn}
              </Link>
            </li>
            <li>
              <Link href="/near-me" className="hover:text-[var(--cm-yellow)]">
                {strings.nav.nearMe}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/50">
        {strings.footer}
      </div>
    </footer>
  );
}
