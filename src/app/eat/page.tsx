"use client";

import Link from "next/link";
import { PageHero, PageShell } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";
import { usePlaces } from "@/components/PlacesProvider";
import { restaurants as ayilaRestaurants } from "@/data/restaurants";

export default function EatPage() {
  const { locale, strings } = useLocale();
  const { places, ready, source } = usePlaces();
  const isFr = locale === "fr";
  const restaurants = places.filter((d) =>
    ["restauration", "gastronomie"].includes(d.category),
  );
  const restaurantCards =
    restaurants.length > 0
      ? restaurants.map((r) => ({
          id: r.id,
          href: `/destinations/${r.id}`,
          name: r.name,
          nameEn: r.nameEn,
          city: r.city,
          category: r.category,
          descriptionFr: r.descriptionFr,
          descriptionEn: r.descriptionEn,
          image: r.image,
          price: r.estimatedCostFcfa > 0 ? r.estimatedCostFcfa : null,
          external: false,
        }))
      : ayilaRestaurants.map((r) => ({
          id: r.id,
          href: r.ayilaUrl,
          name: r.name,
          nameEn: r.nameEn,
          city: r.city,
          category: r.category,
          descriptionFr: r.descriptionFr,
          descriptionEn: r.descriptionEn,
          image: r.image,
          price: r.priceFromXaf,
          external: true,
        }));

  const highlights = isFr
    ? [
        { t: "Ndolé", d: "Plat signature aux feuilles amères et arachides." },
        { t: "Poulet DG", d: "Poulet sauté aux plantains et légumes." },
        { t: "Poisson braisé", d: "Spécialité côtière de Douala et Kribi." },
        { t: "Eru / Okok", d: "Légumes forestiers du Sud et du Littoral." },
      ]
    : [
        { t: "Ndolé", d: "Signature dish with bitter leaves and peanuts." },
        { t: "Poulet DG", d: "Chicken sautéed with plantains and vegetables." },
        { t: "Grilled fish", d: "Coastal specialty in Douala and Kribi." },
        { t: "Eru / Okok", d: "Forest greens from the South and Littoral." },
      ];

  return (
    <PageShell>
      <PageHero
        kicker={isFr ? "Gastronomie" : "Food"}
        title={strings.eat.title}
        subtitle={strings.eat.subtitle}
      />
      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((h) => (
          <div key={h.t} className="surface-panel p-5">
            <h2 className="font-[family-name:var(--font-display)] text-xl">
              {h.t}
            </h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{h.d}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h2 className="section-title text-2xl">
          {isFr ? "Adresses sélectionnées" : "Selected spots"}
        </h2>
        <p className="text-xs text-[var(--muted)]">
          {!ready
            ? "…"
            : isFr
              ? `${restaurantCards.length} restaurants · ${source}`
              : `${restaurantCards.length} restaurants · ${source}`}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {restaurantCards.map((r) => (
          <article
            key={r.id}
            className="overflow-hidden rounded-[1.25rem] border border-[var(--line)] bg-white shadow-sm"
          >
            <Link
              href={r.href}
              className="media-card aspect-[16/10] block"
              {...(r.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.image}
                alt={isFr ? r.name : r.nameEn}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            </Link>
            <div className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted)]">
                {r.city} · {r.category}
              </p>
              <Link
                href={r.href}
                {...(r.external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl hover:underline">
                  {isFr ? r.name : r.nameEn}
                </h3>
              </Link>
              <p className="mt-2 line-clamp-3 text-sm text-[var(--muted)]">
                {isFr ? r.descriptionFr : r.descriptionEn}
              </p>
              {r.price != null && r.price > 0 && (
                <p className="mt-3 text-xs font-medium text-[var(--accent)]">
                  {isFr ? "À partir de" : "From"}{" "}
                  {r.price.toLocaleString("fr-FR")} XAF
                </p>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/near-me" className="btn-pill btn-pill--green">
          {strings.nav.nearMe}
        </Link>
        <Link
          href="/stay"
          className="btn-pill border border-[var(--line)] bg-white text-[var(--ink)]"
        >
          {strings.nav.stay}
        </Link>
      </div>
    </PageShell>
  );
}
