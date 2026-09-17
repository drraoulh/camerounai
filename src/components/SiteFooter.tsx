"use client";

import Link from "next/link";
import { useLocale } from "./LocaleProvider";

export function SiteFooter() {
  const { locale, strings } = useLocale();
  const isFr = locale === "fr";

  return (
    <footer className="full-bleed mt-16 border-t border-[var(--line)] bg-[var(--bg-soft)]">
      <div className="h-1 w-full bg-gradient-to-r from-[var(--cm-green)] via-[var(--cm-red)] to-[var(--cm-yellow)]" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <p className="brand-wordmark text-2xl text-[var(--ink)]">
            Visit <span className="text-[var(--cm-green)]">Cameroon</span>
          </p>
          <p className="mt-3 text-sm text-[var(--muted)]">{strings.tagline}</p>
          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-[var(--cm-green)]">
            MINTOUL
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            {isFr ? "Découvrir" : "Discover"}
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--ink)]">
            <li>
              <Link href="/things-to-do" className="hover:text-[var(--cm-green)]">
                {strings.nav.things}
              </Link>
            </li>
            <li>
              <Link href="/explore" className="hover:text-[var(--cm-green)]">
                {strings.nav.explore}
              </Link>
            </li>
            <li>
              <Link href="/events" className="hover:text-[var(--cm-green)]">
                {strings.nav.events}
              </Link>
            </li>
            <li>
              <Link href="/eat" className="hover:text-[var(--cm-green)]">
                {strings.nav.eat}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            {isFr ? "Planifier" : "Plan"}
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--ink)]">
            <li>
              <Link href="/trip" className="hover:text-[var(--cm-green)]">
                {strings.nav.plan}
              </Link>
            </li>
            <li>
              <Link href="/stay" className="hover:text-[var(--cm-green)]">
                {strings.nav.stay}
              </Link>
            </li>
            <li>
              <Link href="/assistant" className="hover:text-[var(--cm-green)]">
                {strings.nav.assistant}
              </Link>
            </li>
            <li>
              <Link href="/favorites" className="hover:text-[var(--cm-green)]">
                Top Picks
              </Link>
            </li>
            <li>
              <Link href="/map" className="hover:text-[var(--cm-green)]">
                {strings.nav.map}
              </Link>
            </li>
            <li>
              <Link href="/travel-tips" className="hover:text-[var(--cm-green)]">
                {strings.nav.tips}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            {isFr ? "Plus" : "More"}
          </p>
          <ul className="mt-3 space-y-2 text-sm text-[var(--ink)]">
            <li>
              <Link href="/culture" className="hover:text-[var(--cm-green)]">
                {strings.nav.culture}
              </Link>
            </li>
            <li>
              <Link href="/eco" className="hover:text-[var(--cm-green)]">
                {strings.nav.eco}
              </Link>
            </li>
            <li>
              <Link href="/learn" className="hover:text-[var(--cm-green)]">
                {strings.nav.learn}
              </Link>
            </li>
            <li>
              <Link href="/games" className="hover:text-[var(--cm-green)]">
                {strings.nav.games}
              </Link>
            </li>
            <li>
              <Link href="/near-me" className="hover:text-[var(--cm-green)]">
                {strings.nav.nearMe}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[var(--line)] px-4 py-4 text-center text-xs text-[var(--muted)]">
        {strings.footer}
      </div>
    </footer>
  );
}
