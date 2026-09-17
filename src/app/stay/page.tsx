"use client";

import Link from "next/link";
import { PageHero, PageShell } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";
import { hotels } from "@/data/hotels";

export default function StayPage() {
  const { locale, strings } = useLocale();
  const isFr = locale === "fr";

  const cities = [...new Set(hotels.map((h) => h.city))].sort((a, b) =>
    a.localeCompare(b, "fr"),
  );

  return (
    <PageShell>
      <PageHero title={strings.stay.title} subtitle={strings.stay.subtitle} />

      <p className="mb-8 text-sm text-[var(--muted)]">
        {isFr
          ? `${hotels.length} hébergements · ${cities.length} villes (sources Ayila’a)`
          : `${hotels.length} stays · ${cities.length} cities (Ayila’a sources)`}
      </p>

      <div className="mb-8 flex flex-wrap gap-2">
        {cities.map((city) => (
          <span
            key={city}
            className="rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs font-semibold text-[var(--ink)]"
          >
            {city}
          </span>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {hotels.map((h) => (
          <article
            key={h.id}
            className="overflow-hidden rounded-[1.25rem] border border-[var(--line)] bg-white shadow-sm"
          >
            <a
              href={h.ayilaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="media-card aspect-[16/10] block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={h.image}
                alt={isFr ? h.name : h.nameEn}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </a>
            <div className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--cm-green)]">
                {h.city}
                {h.neighbourhood ? ` · ${h.neighbourhood}` : ""}
              </p>
              <a href={h.ayilaUrl} target="_blank" rel="noopener noreferrer">
                <h2 className="mt-1 font-[family-name:var(--font-display)] text-xl hover:underline">
                  {isFr ? h.name : h.nameEn}
                </h2>
              </a>
              <p className="mt-2 line-clamp-3 text-sm text-[var(--muted)]">
                {isFr ? h.descriptionFr : h.descriptionEn}
              </p>
              {h.priceFromXaf != null && h.priceFromXaf > 0 && (
                <p className="mt-3 text-xs font-medium text-[var(--ink)]">
                  {isFr ? "À partir de" : "From"}{" "}
                  {h.priceFromXaf.toLocaleString("fr-FR")} XAF
                  <span className="font-normal text-[var(--muted)]">
                    {" "}
                    / {isFr ? "pers." : "person"}
                  </span>
                </p>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/trip" className="btn-pill btn-pill--green">
          {strings.nav.plan}
        </Link>
        <Link
          href="/near-me"
          className="rounded-full border border-[var(--line)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--ink)] hover:border-[var(--cm-green)] hover:text-[var(--cm-green)]"
        >
          {strings.nav.nearMe}
        </Link>
      </div>
    </PageShell>
  );
}
