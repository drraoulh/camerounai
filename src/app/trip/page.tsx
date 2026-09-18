"use client";

import { TripPlannerForm } from "@/components/TripPlannerForm";
import { PageHero, PageShell } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";

export default function TripPage() {
  const { strings } = useLocale();
  return (
    <PageShell>
      <PageHero title={strings.trip.title} subtitle={strings.hero.ctaTrip} />
      <TripPlannerForm />
    </PageShell>
  );
}
