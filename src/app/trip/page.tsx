"use client";

import Link from "next/link";
import { TripPlannerForm } from "@/components/TripPlannerForm";
import { PageShell } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";

export default function TripPage() {
  const { locale, strings } = useLocale();
  const isFr = locale === "fr";

  return (
    <PageShell>
      <section className="assistant-hero mb-10 overflow-hidden rounded-[1.75rem]">
        <div className="assistant-hero__inner">
          <p className="hero-kicker text-white/70">
            {isFr ? "Planificateur" : "Trip planner"}
          </p>
          <h1 className="section-title mt-3 max-w-2xl text-4xl text-white sm:text-5xl md:text-6xl">
            {strings.trip.title}
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/80 sm:text-lg">
            {isFr
              ? "Budget, profil voyageur et envies : un itinéraire avec hôtels, restos, nature et culture."
              : "Budget, traveller profile and interests: an itinerary with hotels, restaurants, nature and culture."}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/assistant" className="btn-pill btn-pill--light">
              {strings.nav.assistant}
            </Link>
            <Link href="/map" className="btn-pill btn-pill--ghost-light">
              {strings.nav.map}
            </Link>
          </div>
        </div>
      </section>
      <TripPlannerForm />
    </PageShell>
  );
}
