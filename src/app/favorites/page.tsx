"use client";

import Link from "next/link";
import { PageHero, PageShell } from "@/components/PageShell";
import { FavoriteButton } from "@/components/FavoriteButton";
import { useFavorites } from "@/components/FavoritesProvider";
import { useLocale } from "@/components/LocaleProvider";
import { usePlaces } from "@/components/PlacesProvider";

export default function FavoritesPage() {
  const { locale, strings } = useLocale();
  const isFr = locale === "fr";
  const { ids, ready: favReady } = useFavorites();
  const { places, ready } = usePlaces();
  const favPlaces = places.filter((d) => ids.includes(d.id));

  return (
    <PageShell>
      <PageHero
        title="Top Picks"
        subtitle={
          isFr
            ? "Vos destinations favorites, sauvegardées sur cet appareil."
            : "Your favourite destinations, saved on this device."
        }
      />
      {!ready || !favReady ? (
        <p className="text-sm text-[var(--muted)]">…</p>
      ) : favPlaces.length === 0 ? (
        <div className="border border-[var(--line)] bg-white p-8 text-center">
          <p className="text-[var(--muted)]">
            {isFr
              ? "Aucun favori pour l’instant. Cliquez sur le cœur sur une destination."
              : "No favourites yet. Tap the heart on a destination."}
          </p>
          <Link
            href="/things-to-do"
            className="mt-4 inline-block rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-white"
          >
            {strings.nav.things}
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favPlaces.map((d) => (
            <div key={d.id} className="relative">
              <Link href={`/destinations/${d.id}`} className="media-card aspect-[4/5] block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.image} alt={isFr ? d.name : d.nameEn} />
                <div className="media-card__shade" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <h2 className="font-[family-name:var(--font-display)] text-xl">
                    {isFr ? d.name : d.nameEn}
                  </h2>
                  <p className="text-sm text-white/75">{d.city}</p>
                </div>
              </Link>
              <div className="absolute right-3 top-3">
                <FavoriteButton id={d.id} light />
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
