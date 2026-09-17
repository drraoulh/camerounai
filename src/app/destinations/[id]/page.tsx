"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageShell } from "@/components/PageShell";
import { FavoriteButton } from "@/components/FavoriteButton";
import { TourismMap } from "@/components/TourismMap";
import { useLocale } from "@/components/LocaleProvider";
import type { Destination } from "@/lib/types";
import { getLocalizedDestination } from "@/lib/localize-place";

export default function DestinationDetailPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const { locale, strings } = useLocale();
  const isFr = locale === "fr";
  const [dest, setDest] = useState<Destination | null>(null);
  const [related, setRelated] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/places/${encodeURIComponent(id)}`);
        if (!res.ok) {
          if (!cancelled) setDest(null);
          return;
        }
        const body = (await res.json()) as {
          place: Destination;
          related: Destination[];
        };
        if (!cancelled) {
          setDest(body.place);
          setRelated(body.related ?? []);
        }
      } catch {
        if (!cancelled) setDest(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <PageShell>
        <p className="text-[var(--muted)]">…</p>
      </PageShell>
    );
  }

  if (!dest) {
    return (
      <PageShell>
        <p>{isFr ? "Destination introuvable." : "Destination not found."}</p>
        <Link href="/things-to-do" className="mt-4 inline-block underline">
          {strings.nav.things}
        </Link>
      </PageShell>
    );
  }

  const loc = getLocalizedDestination(dest, locale);

  return (
    <div>
      <div className="media-card full-bleed h-[48vh] min-h-[280px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={dest.image}
          alt={loc.name}
          referrerPolicy="no-referrer"
        />
        <div className="media-card__shade" />
        <div className="absolute inset-x-0 bottom-0 mx-auto flex max-w-7xl items-end justify-between gap-4 px-4 pb-8 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--sand)]">
              {loc.city} · {dest.culturalZone}
            </p>
            <h1 className="section-title mt-2 text-4xl text-white sm:text-5xl">
              {loc.name}
            </h1>
          </div>
          <FavoriteButton id={dest.id} light />
        </div>
      </div>

      <PageShell className="pt-10">
        <div className="grid gap-10 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <p className="text-lg leading-relaxed text-[var(--muted)]">
              {loc.description}
            </p>
            {loc.culturalInfo && (
              <p className="text-sm leading-relaxed">
                {loc.culturalInfo}
              </p>
            )}
          </div>
          <aside className="h-fit space-y-4 border border-[var(--line)] bg-white p-5">
            <p className="text-sm">
              <span className="text-[var(--muted)]">
                {isFr ? "Coût estimé" : "Estimated cost"}
              </span>
              <br />
              <span className="text-xl font-semibold">
                ~{dest.estimatedCostFcfa.toLocaleString("fr-FR")} FCFA
              </span>
            </p>
            <p className="text-sm">
              <span className="text-[var(--muted)]">
                {isFr ? "Durée conseillée" : "Recommended duration"}
              </span>
              <br />
              {dest.recommendedDurationHours} h
            </p>
            <p className="text-sm">
              <span className="text-[var(--muted)]">
                {isFr ? "Meilleure période" : "Best period"}
              </span>
              <br />
              {dest.bestPeriod || (isFr ? "n/d" : "n/a")}
            </p>
            <p className="text-xs text-[var(--muted)]">
              {isFr ? "Source" : "Source"}: {dest.source}
            </p>
            <Link
              href={`/assistant?q=${encodeURIComponent(loc.name)}`}
              className="block rounded-full bg-[var(--ink)] px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              {strings.nav.assistant}
            </Link>
            <Link
              href="/trip"
              className="block rounded-full border border-[var(--line)] px-4 py-2.5 text-center text-sm font-semibold"
            >
              {strings.nav.plan}
            </Link>
          </aside>
        </div>

        <div className="mt-10">
          <h2 className="section-title mb-4 text-2xl">{strings.map.title}</h2>
          <TourismMap places={[dest]} locale={locale} />
        </div>

        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="section-title mb-4 text-2xl">
              {isFr ? "À proximité / similaire" : "Nearby / similar"}
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {related.map((d) => (
                <Link
                  key={d.id}
                  href={`/destinations/${d.id}`}
                  className="media-card aspect-[4/3]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={d.image}
                    alt={isFr ? d.name : d.nameEn}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="media-card__shade" />
                  <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                    <p className="font-[family-name:var(--font-display)] text-lg">
                      {isFr ? d.name : d.nameEn}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </PageShell>
    </div>
  );
}
