"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "./LocaleProvider";
import {
  HF_VOICES,
  getStoredVoiceId,
  setStoredVoiceId,
  whenVoicesReady,
  type BrowserVoiceOption,
} from "@/lib/speak";

export function VoiceSelect({
  value,
  onChange,
  className = "",
}: {
  value?: string;
  onChange?: (id: string) => void;
  className?: string;
}) {
  const { locale } = useLocale();
  const isFr = locale === "fr";
  const [browser, setBrowser] = useState<BrowserVoiceOption[]>([]);
  const [selected, setSelected] = useState(value ?? "");

  useEffect(() => {
    const id = value || getStoredVoiceId(locale);
    setSelected(id);
    setStoredVoiceId(id);
    void whenVoicesReady().then(setBrowser);
  }, [value, locale]);

  const grouped = useMemo(() => {
    const cameroonBrowser = browser.filter(
      (v) =>
        /cm|cameroon|cameroun/i.test(`${v.name} ${v.lang}`) ||
        v.lang.toLowerCase() === "fr-cm" ||
        v.lang.toLowerCase() === "en-cm",
    );
    const africa = browser.filter(
      (v) => v.group === "africa" && !cameroonBrowser.includes(v),
    );
    const fr = browser.filter((v) => v.group === "fr");
    const en = browser.filter((v) => v.group === "en");
    const other = browser.filter((v) => v.group === "other");
    return { cameroonBrowser, africa, fr, en, other };
  }, [browser]);

  const cameroonHf = HF_VOICES.filter((v) => v.group === "cameroon");
  const africaHf = HF_VOICES.filter((v) => v.group === "africa");

  const handle = (id: string) => {
    setSelected(id);
    setStoredVoiceId(id);
    onChange?.(id);
  };

  return (
    <select
      value={selected}
      onChange={(e) => handle(e.target.value)}
      className={
        className ||
        "max-w-[min(100%,300px)] rounded-full border border-[var(--cm-green)] bg-white px-2.5 py-1.5 text-[11px] font-semibold text-[var(--ink)] outline-none"
      }
      title={isFr ? "Voix camerounaise" : "Cameroon voice"}
    >
      <optgroup label={isFr ? "★ Recommandé (navigateur)" : "★ Recommended (browser)"}>
        <option value="browser:auto-fr">
          {isFr ? "Auto · Français (Cameroun)" : "Auto · French (Cameroon)"}
        </option>
        <option value="browser:auto-en">
          {isFr ? "Auto · English (Cameroon)" : "Auto · English (Cameroon)"}
        </option>
        {grouped.cameroonBrowser.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </optgroup>
      {grouped.fr.length > 0 && (
        <optgroup label={isFr ? "Navigateur · Français" : "Browser · French"}>
          {grouped.fr.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </optgroup>
      )}
      {grouped.en.length > 0 && (
        <optgroup label={isFr ? "Navigateur · English" : "Browser · English"}>
          {grouped.en.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </optgroup>
      )}
      {grouped.africa.length > 0 && (
        <optgroup label={isFr ? "Navigateur · Afrique" : "Browser · Africa"}>
          {grouped.africa.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </optgroup>
      )}
      {grouped.other.length > 0 && (
        <optgroup label={isFr ? "Navigateur · Autres" : "Browser · Other"}>
          {grouped.other.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </optgroup>
      )}
      {cameroonHf.length > 0 && (
        <optgroup
          label={
            isFr
              ? "Hugging Face (souvent indisponible)"
              : "Hugging Face (often unavailable)"
          }
        >
          {cameroonHf.map((v) => (
            <option key={v.id} value={v.id}>
              {isFr ? v.name : v.nameEn}
            </option>
          ))}
          {africaHf.map((v) => (
            <option key={v.id} value={v.id}>
              {isFr ? v.name : v.nameEn}
            </option>
          ))}
        </optgroup>
      )}
    </select>
  );
}
