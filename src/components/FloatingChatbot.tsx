"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Bot, MessageCircle, X } from "lucide-react";
import clsx from "clsx";
import { ChatAssistant } from "./ChatAssistant";
import { useLocale } from "./LocaleProvider";

export function FloatingChatbot() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const isFr = locale === "fr";
  const [open, setOpen] = useState(false);
  const hiddenOnPage = pathname.startsWith("/assistant");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (hiddenOnPage) return null;

  return (
    <div className="floating-chat">
      {open && (
        <div
          className="floating-chat__panel"
          role="dialog"
          aria-label={isFr ? "Assistant IA" : "AI Assistant"}
        >
          <div className="floating-chat__head">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="floating-chat__avatar" aria-hidden>
                <Bot className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  {isFr ? "Guide IA Visit Cameroon" : "Visit Cameroon AI Guide"}
                </p>
                <p className="truncate text-[11px] text-white/75">
                  {isFr ? "En ligne · FR / EN" : "Online · FR / EN"}
                </p>
              </div>
            </div>
            <button
              type="button"
              className="floating-chat__close"
              aria-label={isFr ? "Fermer" : "Close"}
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <Suspense
            fallback={
              <div className="flex flex-1 items-center justify-center p-6 text-sm text-[var(--muted)]">
                …
              </div>
            }
          >
            <ChatAssistant
              variant="widget"
              onClose={() => setOpen(false)}
            />
          </Suspense>
        </div>
      )}

      <button
        type="button"
        className={clsx("floating-chat__fab", open && "floating-chat__fab--open")}
        aria-expanded={open}
        aria-label={
          open
            ? isFr
              ? "Fermer le chat"
              : "Close chat"
            : isFr
              ? "Ouvrir l’assistant IA"
              : "Open AI assistant"
        }
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <X className="h-6 w-6" />
        ) : (
          <>
            <MessageCircle className="h-6 w-6" />
            <span className="floating-chat__fab-pulse" aria-hidden />
          </>
        )}
      </button>
    </div>
  );
}
