"use client";

import { PageHero, PageShell } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";
import { events } from "@/data/events";

export default function EventsPage() {
  const { locale, strings } = useLocale();
  const isFr = locale === "fr";

  return (
    <PageShell>
      <PageHero title={strings.events.title} subtitle={strings.events.subtitle} />
      <div className="grid gap-6">
        {events.map((ev, i) => (
          <article
            key={ev.id}
            className={`grid overflow-hidden rounded-[1.35rem] border border-[var(--line)] bg-white shadow-sm md:grid-cols-2 ${
              i % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
            }`}
          >
            <div className="media-card min-h-[240px] rounded-none">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={ev.image}
                alt={isFr ? ev.titleFr : ev.titleEn}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex flex-col justify-center p-6 sm:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--cm-green)]">
                {isFr ? ev.dateLabelFr : ev.dateLabelEn} · {ev.city}
              </p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl">
                {isFr ? ev.titleFr : ev.titleEn}
              </h2>
              <p className="mt-3 text-[var(--muted)]">
                {isFr ? ev.summaryFr : ev.summaryEn}
              </p>
              {ev.sourceLabel && (
                <p className="mt-4 text-[10px] text-[var(--muted)]">
                  Photo : {ev.sourceLabel}
                </p>
              )}
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
