"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Lock, Volume2 } from "lucide-react";
import { PageHero, PageShell } from "@/components/PageShell";
import { useLocale } from "@/components/LocaleProvider";
import { GameTrackSwitch } from "@/components/games/GameTrackSwitch";
import { ProgressHud } from "@/components/games/ProgressHud";
import { MissionPlay } from "@/components/games/MissionPlay";
import { MedumbaWritePlay } from "@/components/games/MedumbaWritePlay";
import { MedumbaPath } from "@/components/games/MedumbaPath";
import { LessonFrame } from "@/components/games/LessonFrame";
import { useGameProgress } from "@/components/games/GameProgressProvider";
import { culturalAreas } from "@/data/cultural-areas";
import {
  LANGUAGE_AREAS,
  SKILL_LEVELS,
  missionById,
  missionsFor,
  survivalMissionId,
  travelMissionId,
  type SkillLevel,
} from "@/data/missions";
import { StayCityGate } from "@/components/games/StayCityGate";
import type { StayCity } from "@/data/stay-cities";
import type { LanguageTrackId } from "@/lib/types";
import { languageVoice } from "@/lib/cultural-voice";
import { speakCulturalPhrase, stopSpeaking } from "@/lib/speak";

export default function LanguageGamesPage() {
  const { locale, strings } = useLocale();
  const { progress } = useGameProgress();
  const isFr = locale === "fr";
  const [trackId, setTrackId] = useState<LanguageTrackId | null>(null);
  const [skill, setSkill] = useState<SkillLevel | null>(null);
  const [missionId, setMissionId] = useState<string | null>(null);
  const [overlay, setOverlay] = useState<
    null | "path" | "translate" | "practice" | "survival"
  >(null);
  const [stayCity, setStayCity] = useState<StayCity | null>(null);
  const [skipCity, setSkipCity] = useState(false);

  const pathLang = trackId === "medumba" || trackId === "mbouda";
  const area = LANGUAGE_AREAS.find((a) => a.id === trackId);
  const cultural = culturalAreas.find((c) => c.id === area?.areaId);
  const available = trackId && skill ? missionsFor(trackId, skill) : [];
  const mission = missionId ? missionById(missionId) : undefined;
  const voice = trackId ? languageVoice(trackId) : null;

  const unlockedSkill = useMemo(() => {
    if (!trackId) return { 1: true, 2: false, 3: false };
    const survival = survivalMissionId(trackId);
    const travel = travelMissionId(trackId);
    const hasSurvival = survival ? progress.missions.includes(survival) : false;
    const hasTravel = travel ? progress.missions.includes(travel) : false;
    return { 1: true, 2: hasSurvival, 3: hasTravel };
  }, [trackId, progress.missions]);

  const resetMission = () => setMissionId(null);
  const survivalId = trackId ? survivalMissionId(trackId) : undefined;
  const survivalMission = survivalId ? missionById(survivalId) : undefined;

  const startFromCity = (city: StayCity) => {
    setStayCity(city);
    setTrackId(city.langId);
    setSkill(null);
    setMissionId(null);
    setOverlay(city.langId === "medumba" || city.langId === "mbouda" ? "path" : null);
  };

  const showCityGate = !overlay && !mission && !trackId && !skipCity;

  return (
    <PageShell>
      <PageHero
        title={strings.games.language}
        subtitle={strings.games.languageLead}
      />
      {showCityGate ? null : <ProgressHud />}
      <GameTrackSwitch active="langue" />

      {overlay === "path" && trackId && (
        <MedumbaPath
          langId={trackId}
          onClose={() => setOverlay(null)}
          onStart={(lesson) => {
            if (lesson === "survival") {
              if (survivalId) setMissionId(survivalId);
              setOverlay("survival");
              return;
            }
            setOverlay(lesson === "practice" ? "practice" : "translate");
          }}
        />
      )}
      {overlay === "translate" && (
        <MedumbaWritePlay
          langId={trackId ?? "medumba"}
          onExit={() => setOverlay("path")}
        />
      )}
      {overlay === "practice" && (
        <MedumbaWritePlay
          langId={trackId ?? "medumba"}
          practice
          onExit={() => setOverlay("path")}
        />
      )}
      {overlay === "survival" && survivalMission && (
        <LessonFrame>
          <div className="flex justify-end p-3">
            <button
              type="button"
              className="text-slate-400"
              onClick={() => {
                setMissionId(null);
                setOverlay("path");
              }}
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-white p-4 text-[var(--ink)]">
            <MissionPlay
              mission={survivalMission}
              onExit={() => {
                setMissionId(null);
                setOverlay("path");
              }}
            />
          </div>
        </LessonFrame>
      )}

      {overlay ? null : mission && !pathLang ? (
        <MissionPlay mission={mission} onExit={resetMission} />
      ) : showCityGate ? (
        <StayCityGate onStart={startFromCity} onSkip={() => setSkipCity(true)} />
      ) : (
        <>
          {stayCity && trackId ? (
            <p className="mb-4 text-sm text-[var(--muted)]">
              {isFr ? "Ville :" : "City:"}{" "}
              <strong className="text-[var(--ink)]">
                {isFr ? stayCity.nameFr : stayCity.nameEn}
              </strong>{" "}
              · {stayCity.language}
              {" · "}
              <button
                type="button"
                className="font-semibold text-[var(--cm-green)] hover:underline"
                onClick={() => {
                  setTrackId(null);
                  setStayCity(null);
                  setSkipCity(false);
                  setSkill(null);
                  setMissionId(null);
                }}
              >
                {isFr ? "changer de ville" : "change city"}
              </button>
            </p>
          ) : null}
          {(!trackId || skipCity) && (
          <>
          <h2 className="section-title text-2xl">
            {isFr ? "1. Choisissez une langue de séjour" : "1. Choose a stay language"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
            {isFr
              ? "Une aire peut porter plusieurs langues. Yemba à Dschang, Shüpamom à Foumban, Medumba à Bangangté, Ngiemboon à Mbouda : même Grassfields, autre ton."
              : "One area can hold several languages. Yemba in Dschang, Shüpamom in Foumban, Medumba in Bangangté, Ngiemboon in Mbouda: same Grassfields, another tone."}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {LANGUAGE_AREAS.map((a) => {
              const selected = trackId === a.id;
              const meta = culturalAreas.find((c) => c.id === a.areaId);
              const v = languageVoice(a.id);
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    setTrackId(a.id);
                    setSkill(null);
                    setMissionId(null);
                    setOverlay(a.id === "medumba" || a.id === "mbouda" ? "path" : null);
                  }}
                  className="overflow-hidden rounded-2xl border bg-white text-left"
                  style={{
                    borderColor: selected ? "var(--cm-green)" : "var(--line)",
                  }}
                >
                  {meta && (
                    <div className="relative h-28">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={
                          a.id === "yemba"
                            ? "https://commons.wikimedia.org/wiki/Special:FilePath/Grande%20Case%20%C3%A0%20la%20chefferie%20Bandjoun.jpg?width=1600"
                            : a.id === "shupamom"
                              ? "https://commons.wikimedia.org/wiki/Special:FilePath/Sultanat%20Foumban.JPG?width=1600"
                              : a.id === "medumba"
                                ? "https://commons.wikimedia.org/wiki/Special:FilePath/Vue%20a%C3%A9rienne%20de%20Bangangt%C3%A9%20Vall%C3%A9e%20Ouest%20Cameroun.jpg?width=1600"
                                : a.id === "mbouda"
                                  ? "https://commons.wikimedia.org/wiki/Special:FilePath/Bafoussam.jpg?width=1600"
                                : meta.image
                        }
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--cm-green)]">
                      {a.language} · {isFr ? a.tagFr : a.tagEn}
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-display)] text-2xl">
                      {a.areaId === "Sudano-Sahelian"
                        ? isFr
                          ? "Soudano-sahélien"
                          : "Sudano-Sahelian"
                        : a.areaId}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                      {isFr ? v.toneFr : v.toneEn}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
          </>
          )}

          {trackId && voice && (
            <>
              <h2 className="section-title mt-10 text-2xl">
                {isFr ? "2. Choisissez un niveau" : "2. Choose a level"}
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
                {isFr ? voice.coachFr : voice.coachEn}
              </p>
              <button
                type="button"
                className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--cm-green)]"
                onClick={() => {
                  stopSpeaking();
                  speakCulturalPhrase({
                    langId: trackId,
                    phrase: voice.sample.phrase,
                    pronunciation: voice.sample.pronunciation,
                  });
                }}
              >
                <Volume2 className="h-4 w-4" />
                {isFr
                  ? `Écouter le ton ${voice.language}`
                  : `Hear the ${voice.language} tone`}
              </button>
              {trackId === "shupamom" && (
                <p className="mt-2 text-sm">
                  <Link
                    href="/studio/shupamom"
                    className="font-semibold text-[var(--cm-green)] hover:underline"
                  >
                    {isFr
                      ? "Studio locuteur — enregistrer le ton palais →"
                      : "Speaker studio — record the palace tone →"}
                  </Link>
                </p>
              )}
              {trackId === "medumba" && (
                <>
                  <p className="mt-2 text-sm">
                    <Link
                      href="/studio/medumba"
                      className="font-semibold text-[var(--cm-green)] hover:underline"
                    >
                      {isFr
                        ? "Fiche téléphone — enregistrer le medumba →"
                        : "Phone sheet — record Medumba →"}
                    </Link>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      stopSpeaking();
                      setOverlay("path");
                    }}
                    className="mt-5 w-full rounded-2xl border border-[var(--cm-green)] bg-[var(--accent-soft)] p-5 text-left"
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--cm-green)]">
                      {isFr ? "Parcours" : "Path"}
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-display)] text-2xl">
                      {isFr ? "Ouvrir le chemin d’apprentissage" : "Open the learning path"}
                    </p>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {isFr
                        ? "Étapes, leçons, traduction par pastilles — comme sur téléphone."
                        : "Steps, lessons, tap-to-translate — phone style."}
                    </p>
                  </button>
                </>
              )}
              {trackId === "mbouda" && (
                <>
                  <p className="mt-2 text-sm">
                    <Link
                      href="/studio/mbouda"
                      className="font-semibold text-[var(--cm-green)] hover:underline"
                    >
                      {isFr
                        ? "Fiche téléphone — enregistrer le mbouda →"
                        : "Phone sheet — record Mbouda →"}
                    </Link>
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      stopSpeaking();
                      setOverlay("path");
                    }}
                    className="mt-5 w-full rounded-2xl border border-[var(--cm-green)] bg-[var(--accent-soft)] p-5 text-left"
                  >
                    <p className="text-xs font-semibold uppercase tracking-widest text-[var(--cm-green)]">
                      {isFr ? "Parcours" : "Path"}
                    </p>
                    <p className="mt-1 font-[family-name:var(--font-display)] text-2xl">
                      {isFr ? "Ouvrir le chemin d’apprentissage" : "Open the learning path"}
                    </p>
                    <p className="mt-2 text-sm text-[var(--muted)]">
                      {isFr
                        ? "Écoute le locuteur, puis traduis en français par pastilles."
                        : "Listen to the speaker, then tap French chips to translate."}
                    </p>
                  </button>
                </>
              )}
              <div className="mt-4 grid gap-3 lg:grid-cols-3">
                {SKILL_LEVELS.map((lv) => {
                  const open = unlockedSkill[lv.id];
                  const selected = skill === lv.id;
                  return (
                    <button
                      key={lv.id}
                      type="button"
                      disabled={!open}
                      onClick={() => {
                        if (!open) return;
                        setSkill(lv.id);
                        setMissionId(null);
                      }}
                      className="rounded-2xl border p-5 text-left disabled:opacity-55"
                      style={{
                        borderColor: selected ? "var(--cm-green)" : "var(--line)",
                        background: selected ? "var(--accent-soft)" : "#fff",
                      }}
                    >
                      <p className="flex items-center gap-2 font-[family-name:var(--font-display)] text-xl">
                        {!open && <Lock className="h-4 w-4" />}
                        {isFr ? lv.titleFr : lv.titleEn}
                      </p>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        {isFr ? lv.bodyFr : lv.bodyEn}
                      </p>
                      {!open && (
                        <p className="mt-2 text-xs font-semibold text-[var(--cm-red)]">
                          {lv.id === 2
                            ? isFr
                              ? "Terminez d’abord la Survie de cette langue."
                              : "Finish Survival for this language first."
                            : isFr
                              ? "Terminez d’abord une mission Voyage."
                              : "Finish a Travel mission first."}
                        </p>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {area && skill && (
            <>
              <h2 className="section-title mt-10 text-2xl">
                {isFr ? "3. Mission Locale" : "3. Local Mission"}
              </h2>
              <p className="mt-2 text-sm text-[var(--muted)]">
                {isFr
                  ? "Le jeu principal : une situation réelle, l’audio au ton de la langue, puis « quand l’utiliser »."
                  : "The main game: a real situation, audio in the language’s tone, then “when to use it”."}
              </p>
              <div className="mt-4 grid gap-3">
                {available.map((m) => {
                  const done = progress.missions.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMissionId(m.id)}
                      className="rounded-2xl border border-[var(--line)] bg-white p-5 text-left hover:border-[var(--cm-green)]"
                    >
                      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--cm-red)]">
                        📍 {isFr ? m.codeFr : m.codeEn}
                        {done ? (isFr ? " · faite" : " · done") : ""}
                      </p>
                      <p className="mt-1 font-[family-name:var(--font-display)] text-2xl">
                        {isFr ? m.titleFr : m.titleEn}
                      </p>
                      <p className="mt-2 text-sm text-[var(--muted)]">
                        {isFr ? m.settingFr : m.settingEn}
                      </p>
                      <p className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--cm-green)]">
                        <Volume2 className="h-4 w-4" />
                        {isFr ? "Lancer la mission" : "Start mission"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      <p className="mt-8 text-sm">
        <Link href="/learn" className="font-semibold text-[var(--cm-green)] hover:underline">
          {isFr ? "Réviser les expressions →" : "Review the phrases →"}
        </Link>
        {cultural ? (
          <span className="text-[var(--muted)]">
            {" "}
            · {isFr ? cultural.nameFr : cultural.nameEn}
          </span>
        ) : null}
      </p>
    </PageShell>
  );
}
