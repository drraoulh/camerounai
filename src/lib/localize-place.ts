import type { Destination, Locale } from "@/lib/types";

/** Locale-resolved place fields for UI, map popups, RAG and trip plans. */
export type LocalizedDestination = {
  name: string;
  description: string;
  culturalInfo: string;
  city: string;
  region: string;
};

export function getLocalizedDestination(
  d: Destination,
  locale: Locale,
): LocalizedDestination {
  const isFr = locale === "fr";
  return {
    name: isFr ? d.name : d.nameEn || d.name,
    description: isFr
      ? d.descriptionFr
      : d.descriptionEn || d.descriptionFr,
    culturalInfo: isFr
      ? d.culturalInfoFr
      : d.culturalInfoEn || d.culturalInfoFr,
    city: isFr ? d.city : d.cityEn || d.city,
    region: isFr ? d.region : d.regionEn || d.region,
  };
}
