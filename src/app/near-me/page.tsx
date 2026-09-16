"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, MapPin, Star } from "lucide-react";
import { cityCoords, nearbyPlaces } from "@/lib/geo";
import { PageHero, PageShell } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";
import { usePlaces } from "@/components/PlacesProvider";
import type { Destination } from "@/lib/types";
import type { GoogleNearbyPlace, NearbyKind } from "@/lib/google-nearby";

type Located = Destination & { distanceKm?: number };

export default function NearMePage() {
  const { locale, strings } = useLocale();
  const { places } = usePlaces();
  const isFr = locale === "fr";
  const [city, setCity] = useState("Yaoundé");
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [googlePlaces, setGooglePlaces] = useState<GoogleNearbyPlace[]>([]);
  const [googleStatus, setGoogleStatus] = useState<
    "idle" | "loading" | "ok" | "missing_key" | "error"
  >("idle");
  const [googleError, setGoogleError] = useState<string | null>(null);

  const center = useMemo(() => {
    if (gps) return gps;
    const key = city.trim().toLowerCase();
    return cityCoords[key] ?? null;
  }, [city, gps]);

  const list = useMemo((): Located[] => {
    if (gps) {
      return nearbyPlaces(places, gps.lat, gps.lng, 100);
    }
    const key = city.trim().toLowerCase();
    const coords = cityCoords[key];
    if (coords) {
      return nearbyPlaces(places, coords.lat, coords.lng, 90);
    }
    const q = key.normalize("NFD").replace(/\p{M}/gu, "");
    return places.filter((d) => {
      const blob = `${d.city} ${d.cityEn} ${d.region} ${d.regionEn} ${d.name} ${d.nameEn}`
        .toLowerCase()
        .normalize("NFD")
        .replace(/\p{M}/gu, "");
      return blob.includes(q);
    });
  }, [city, gps, places]);

  const restaurants = list.filter((d) => d.category === "restauration");
  const stays = list.filter((d) => d.category === "hebergement");
  const activities = list.filter(
    (d) => !["restauration", "hebergement"].includes(d.category),
  );

  const fetchGoogle = useCallback(
    async (lat: number, lng: number) => {
      setGoogleStatus("loading");
      setGoogleError(null);
      try {
        const res = await fetch("/api/nearby", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lat,
            lng,
            radiusM: 4500,
            locale,
            kinds: ["restaurant", "lodging", "attraction"] as NearbyKind[],
          }),
        });
        const data = (await res.json()) as {
          configured?: boolean;
          places?: GoogleNearbyPlace[];
          message?: string;
          error?: string;
        };
        if (data.configured === false) {
          setGooglePlaces([]);
          setGoogleStatus("missing_key");
          setGoogleError(data.message ?? null);
          return;
        }
        if (!res.ok) {
          setGooglePlaces([]);
          setGoogleStatus("error");
          setGoogleError(data.error ?? `HTTP ${res.status}`);
          return;
        }
        setGooglePlaces(data.places ?? []);
        setGoogleStatus("ok");
      } catch {
        setGooglePlaces([]);
        setGoogleStatus("error");
        setGoogleError(
          isFr ? "Échec de l’appel Nearby." : "Nearby request failed.",
        );
      }
    },
    [isFr, locale],
  );

  useEffect(() => {
    if (!center) {
      setGooglePlaces([]);
      setGoogleStatus("idle");
      return;
    }
    void fetchGoogle(center.lat, center.lng);
  }, [center, fetchGoogle]);

  function useGps() {
    if (!navigator.geolocation) {
      setGpsError(
        isFr
          ? "Géolocalisation non supportée par ce navigateur."
          : "Geolocation is not supported by this browser.",
      );
      return;
    }
    setLocating(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setGpsError(
          isFr
            ? "Impossible d'obtenir la position. Essayez une ville."
            : "Could not get location. Try a city name.",
        );
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }

  function renderVcSection(title: string, items: Located[]) {
    return (
      <section key={title}>
        <h2 className="mb-2 font-[family-name:var(--font-display)] text-xl">
          {title}
        </h2>
        {items.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            {isFr
              ? "Aucun résultat Visit Cameroon pour ce filtre."
              : "No Visit Cameroon results for this filter."}
          </p>
        ) : (
          <ul className="space-y-2">
            {items.slice(0, 10).map((d) => (
              <li
                key={d.id}
                className="rounded-[1rem] border border-[var(--line)] bg-white p-3 text-sm"
              >
                <Link
                  href={`/destinations/${d.id}`}
                  className="font-medium hover:underline"
                >
                  {isFr ? d.name : d.nameEn}
                </Link>
                <span className="text-[var(--cm-green)]">
                  {" "}
                  · {isFr ? d.city : d.cityEn || d.city}
                </span>
                <span className="block text-xs text-[var(--muted)]">
                  ~{d.estimatedCostFcfa.toLocaleString("fr-FR")} FCFA
                  {d.distanceKm !== undefined
                    ? ` · ${d.distanceKm.toFixed(1)} km`
                    : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  function renderGoogleSection(title: string, kind: NearbyKind) {
    const items = googlePlaces.filter((p) => p.kind === kind);
    return (
      <section key={`g-${kind}`}>
        <h2 className="mb-2 font-[family-name:var(--font-display)] text-xl">
          {title}
        </h2>
        {googleStatus === "loading" ? (
          <p className="animate-pulse text-sm text-[var(--muted)]">
            {isFr ? "Recherche Google Nearby…" : "Searching Google Nearby…"}
          </p>
        ) : items.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">
            {isFr ? "Aucun résultat Google proche." : "No nearby Google results."}
          </p>
        ) : (
          <ul className="space-y-2">
            {items.map((p) => (
              <li
                key={p.id}
                className="rounded-[1rem] border border-[var(--line)] bg-white p-3 text-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <a
                      href={p.mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold hover:underline"
                    >
                      {p.name}
                    </a>
                    {p.address && (
                      <p className="mt-1 flex items-start gap-1 text-xs text-[var(--muted)]">
                        <MapPin className="mt-0.5 h-3 w-3 shrink-0" />
                        <span>{p.address}</span>
                      </p>
                    )}
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                      {p.rating != null && (
                        <span className="inline-flex items-center gap-1">
                          <Star className="h-3 w-3 text-[var(--cm-yellow)]" />
                          {p.rating.toFixed(1)}
                          {p.userRatingCount != null
                            ? ` (${p.userRatingCount})`
                            : ""}
                        </span>
                      )}
                      {p.distanceKm != null && (
                        <span>{p.distanceKm.toFixed(1)} km</span>
                      )}
                    </p>
                  </div>
                  <a
                    href={p.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-full border border-[var(--line)] p-2 text-[var(--cm-green)] hover:bg-[var(--accent-soft)]"
                    aria-label="Google Maps"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  return (
    <PageShell>
      <PageHero title={strings.nearMe.title} subtitle={strings.nearMe.hint} />
      <form
        className="mb-6 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setGps(null);
        }}
      >
        <input
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setGps(null);
          }}
          placeholder={strings.nearMe.city}
          className="min-w-[12rem] flex-1 rounded-full border border-[var(--line)] px-4 py-2"
        />
        <button
          type="submit"
          className="rounded-full bg-[var(--ink)] px-4 py-2 text-sm font-semibold text-white"
        >
          {strings.nearMe.search}
        </button>
        <button
          type="button"
          onClick={useGps}
          disabled={locating}
          className="rounded-full border border-[var(--line)] px-4 py-2 text-sm disabled:opacity-50"
        >
          {locating
            ? isFr
              ? "Localisation…"
              : "Locating…"
            : isFr
              ? "Ma position"
              : "My location"}
        </button>
      </form>
      {gpsError && <p className="mb-4 text-xs text-amber-800">{gpsError}</p>}

      {googleStatus === "missing_key" && (
        <p className="mb-6 rounded-[1rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {isFr
            ? "Google Nearby désactivé : ajoutez GOOGLE_PLACES_API_KEY dans .env.local (Places API New), puis redémarrez le serveur."
            : "Google Nearby off: add GOOGLE_PLACES_API_KEY in .env.local (Places API New), then restart the server."}
        </p>
      )}
      {googleStatus === "error" && googleError && (
        <p className="mb-6 rounded-[1rem] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {googleError}
        </p>
      )}
      {googleStatus === "ok" && (
        <p className="mb-4 text-xs text-[var(--muted)]">
          {isFr
            ? `${googlePlaces.length} lieux Google Nearby · Powered by Google`
            : `${googlePlaces.length} Google Nearby places · Powered by Google`}
        </p>
      )}

      <div className="mb-10 space-y-6">
        <h2 className="section-title text-2xl">
          {isFr ? "Visit Cameroon (catalogue)" : "Visit Cameroon (catalog)"}
        </h2>
        {renderVcSection(isFr ? "Restaurants" : "Restaurants", restaurants)}
        {renderVcSection(isFr ? "Hébergements (réf.)" : "Lodging (ref.)", stays)}
        {renderVcSection(
          isFr ? "Activités & sites" : "Activities & sites",
          activities,
        )}
      </div>

      <div className="space-y-6">
        <h2 className="section-title text-2xl">
          {isFr ? "Google Nearby" : "Google Nearby"}
        </h2>
        {!center ? (
          <p className="text-sm text-[var(--muted)]">
            {isFr
              ? "Choisissez une ville connue (Douala, Yaoundé, Kribi…) ou activez le GPS."
              : "Pick a known city (Douala, Yaoundé, Kribi…) or enable GPS."}
          </p>
        ) : (
          <>
            {renderGoogleSection(
              isFr ? "Restaurants (Google)" : "Restaurants (Google)",
              "restaurant",
            )}
            {renderGoogleSection(
              isFr ? "Hôtels (Google)" : "Hotels (Google)",
              "lodging",
            )}
            {renderGoogleSection(
              isFr ? "Attractions (Google)" : "Attractions (Google)",
              "attraction",
            )}
          </>
        )}
      </div>
    </PageShell>
  );
}
