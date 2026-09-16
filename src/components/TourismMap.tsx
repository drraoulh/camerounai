"use client";

import { useEffect, useRef } from "react";
import type { Destination, Locale } from "@/lib/types";
import { getLocalizedDestination } from "@/lib/localize-place";
import "maplibre-gl/dist/maplibre-gl.css";

type Props = {
  places: Destination[];
  highlightIds?: string[];
  className?: string;
  locale?: Locale;
};

export function TourismMap({
  places,
  highlightIds = [],
  className,
  locale = "fr",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("maplibre-gl").Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || places.length === 0) return;

    let cancelled = false;

    void import("maplibre-gl").then((maplibregl) => {
      if (cancelled || !containerRef.current) return;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const ml = maplibregl as typeof import("maplibre-gl");

      const centerLng =
        places.reduce((s, p) => s + p.lng, 0) / places.length;
      const centerLat =
        places.reduce((s, p) => s + p.lat, 0) / places.length;

      const map = new ml.Map({
        container: containerRef.current,
        style: {
          version: 8,
          sources: {
            osm: {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "© OpenStreetMap",
            },
          },
          layers: [{ id: "osm", type: "raster", source: "osm" }],
        },
        center: [centerLng, centerLat],
        zoom: places.length === 1 ? 10 : 5.5,
      });

      mapRef.current = map;

      places.forEach((p) => {
        const loc = getLocalizedDestination(p, locale);
        const el = document.createElement("div");
        el.className = "rounded-full border-2 border-white shadow-md";
        el.style.width = highlightIds.includes(p.id) ? "14px" : "10px";
        el.style.height = highlightIds.includes(p.id) ? "14px" : "10px";
        el.style.background = highlightIds.includes(p.id) ? "#d97706" : "#059669";

        new ml.Marker({ element: el })
          .setLngLat([p.lng, p.lat])
          .setPopup(
            new ml.Popup({ offset: 12 }).setHTML(
              `<strong>${escapeHtml(loc.name)}</strong><br/>${escapeHtml(loc.city)} · ~${p.estimatedCostFcfa.toLocaleString()} FCFA`,
            ),
          )
          .addTo(map);
      });
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [places, highlightIds, locale]);

  return (
    <div
      ref={containerRef}
      className={className ?? "h-[420px] w-full rounded-2xl border border-emerald-200 overflow-hidden"}
    />
  );
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
