"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { PageHero, PageShell } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";
import { GameTrackSwitch } from "@/components/games/GameTrackSwitch";
import { ProgressHud } from "@/components/games/ProgressHud";
import { RegionPlay } from "@/components/games/RegionPlay";
import { useGameProgress } from "@/components/games/GameProgressProvider";
import { regions } from "@/data/regions";
import { regionMission } from "@/data/culture-mastery";
import { ACHIEVEMENTS } from "@/lib/game-progress";

export default function CultureGamesPage() {
  const { locale, strings } = useLocale();
  const { progress } = useGameProgress();
  const isFr = locale === "fr";
  const [regionId, setRegionId] = useState<string | null>(null);
  const region = regions.find((r) => r.id === regionId);
  const mission = regionId ? regionMission(regionId) : undefined;
  const trophy = ACHIEVEMENTS.find((a) => a.id === "ten-regions");
  const hasTrophy = progress.achievements.includes("ten-regions");

  return (
    <PageShell>
      <PageHero
        title={strings.games.culture}
        subtitle={strings.games.cultureLead}
      />
      <ProgressHud />
      <GameTrackSwitch active="culture" />

      <div className="mb-8 rounded-2xl border border-[var(--line)] bg-[var(--accent-soft)] p-5 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[var(--cm-green)]">
            <Trophy className="h-3.5 w-3.5" />
            {trophy ? (isFr ? trophy.titleFr : trophy.titleEn) : ""}
          </p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-2xl">
            {progress.regions.length}/10
            {hasTrophy ? (isFr ? " — débloqué" : " — unlocked") : ""}
          </p>
          <p className="mt-1 max-w-xl text-sm text-[var(--muted)]">
            {isFr
              ? "Pour les Camerounais comme pour les visiteurs : une mission par région officielle, à débloquer progressivement."
              : "For Cameroonians and visitors alike: one mission per official region, unlocked step by step."}
          </p>
        </div>
      </div>

      {region && mission ? (
        <RegionPlay
          title={isFr ? region.nameFr : region.nameEn}
          regionId={region.id}
          areaId={region.culturalZone}
          mission={mission}
          onExit={() => setRegionId(null)}
        />
      ) : (
        <>
          <h2 className="section-title text-2xl">
            {isFr
              ? "Les 10 territoires culturels"
              : "The 10 cultural territories"}
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {isFr
              ? "Chaque région est une aire à connaître : lieux, fêtes, usages."
              : "Each region is a territory to know: places, festivals, customs."}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {regions.map((r) => {
              const done = progress.regions.includes(r.id);
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRegionId(r.id)}
                  className="overflow-hidden rounded-2xl border border-[var(--line)] bg-white text-left hover:border-[var(--cm-green)]"
                >
                  <div className="relative h-28">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                    {done && (
                      <span className="absolute right-3 top-3 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-[var(--cm-green)]">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--cm-green)]">
                      {r.culturalZone}
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-display)] text-xl">
                      {isFr ? r.nameFr : r.nameEn}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">
                      {isFr ? r.taglineFr : r.taglineEn}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      <p className="mt-8 text-sm">
        <Link
          href="/culture"
          className="font-semibold text-[var(--cm-green)] hover:underline"
        >
          {isFr ? "Lire les 4 aires culturelles →" : "Read the 4 cultural areas →"}
        </Link>
      </p>
    </PageShell>
  );
}
