"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  Search,
  X,
  Heart,
  ChevronDown,
  User,
  Shield,
} from "lucide-react";
import clsx from "clsx";
import { useLocale } from "./LocaleProvider";
import { SearchOverlay } from "./SearchOverlay";
import { useFavorites } from "./FavoritesProvider";
import { MegaMenuPanel } from "./MegaMenuPanel";
import { LangFlag } from "./LangFlag";
import { megaNav } from "@/data/mega-nav";

export function SiteHeader() {
  const pathname = usePathname();
  const { locale, setLocale, strings } = useLocale();
  const { ids } = useFavorites();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(true);
  const [activeMega, setActiveMega] = useState<string | null>(null);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const skipId = useId();
  const isFr = locale === "fr";

  useEffect(() => {
    try {
      if (sessionStorage.getItem("vc-banner-closed") === "1") {
        setBannerOpen(false);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const onChange = () => {
      if (!mq.matches) setActiveMega(null);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setActiveMega(null);
    setMobileSection(null);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveMega(null);
        setMenuOpen(false);
        setSearchOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) {
        setActiveMega(null);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const openMega = (id: string) => {
    if (typeof window !== "undefined" && window.innerWidth < 1280) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMega(id);
  };

  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setActiveMega(null), 180);
  };

  const closeBanner = () => {
    setBannerOpen(false);
    try {
      sessionStorage.setItem("vc-banner-closed", "1");
    } catch {
      /* ignore */
    }
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const spacerH = bannerOpen
    ? "calc(var(--banner-h) + var(--header-h) + var(--inst-h))"
    : "calc(var(--header-h) + var(--inst-h))";

  return (
    <>
      <a href={`#${skipId}`} className="skip-link">
        {isFr ? "Aller au contenu" : "Skip to content"}
      </a>
      <button
        type="button"
        className="skip-link skip-link--2"
        onClick={() => setSearchOpen(true)}
      >
        {isFr ? "Aller à la recherche" : "Skip to search"}
      </button>

      {bannerOpen && (
        <div className="site-banner full-bleed fixed inset-x-0 top-0 z-[60]">
          <div className="site-banner__inner">
            <Shield className="site-banner__icon" aria-hidden />
            <p className="site-banner__text">
              {isFr
                ? "Votre sécurité est notre priorité."
                : "Your safety is our priority."}{" "}
              <Link href="/travel-tips" className="site-banner__link">
                {isFr ? "Conseils de voyage" : "Travel advisory"}
              </Link>
            </p>
            <button
              type="button"
              className="site-banner__close"
              aria-label={isFr ? "Fermer" : "Close"}
              onClick={closeBanner}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {activeMega && (
        <button
          type="button"
          className="mega-backdrop"
          aria-label="Close menu"
          onClick={() => setActiveMega(null)}
        />
      )}

      {menuOpen && (
        <button
          type="button"
          className="mobile-backdrop"
          aria-label={isFr ? "Fermer le menu" : "Close menu"}
          onClick={() => setMenuOpen(false)}
        />
      )}

      <header
        ref={headerRef}
        className={clsx(
          "site-header fixed inset-x-0 z-50",
          bannerOpen ? "top-[var(--banner-h)]" : "top-0",
          activeMega && "site-header--mega-open",
          menuOpen && "site-header--menu-open",
        )}
        onMouseLeave={scheduleClose}
      >
        <div className="inst-strip">
          <div className="inst-strip__inner">
            <a
              href="https://www.mintour.gov.cm"
              target="_blank"
              rel="noopener noreferrer"
              className="inst-strip__link"
            >
              <span className="inst-dot" aria-hidden />
              <span className="inst-strip__full">
                {isFr
                  ? "Ministère du Tourisme et des Loisirs · MINTOUL"
                  : "Ministry of Tourism and Leisure · MINTOUL"}
              </span>
              <span className="inst-strip__short">MINTOUL</span>
            </a>
            <span className="inst-strip__badge">Cameroon AI Tourism</span>
          </div>
        </div>

        <div className="header-main">
          <Link
            href="/"
            className="brand-lockup"
            onMouseEnter={() => setActiveMega(null)}
          >
            <span className="brand-mark" aria-hidden>
              CM
            </span>
            <span className="brand-text">
              <span className="brand-wordmark">
                Visit <span className="text-[var(--cm-green)]">Cameroon</span>
              </span>
              <span className="brand-tagline">{strings.tagline}</span>
            </span>
          </Link>

          <nav className="header-nav" aria-label="Primary">
            <Link
              href="/"
              className="nav-item"
              data-active={pathname === "/"}
              onMouseEnter={() => setActiveMega(null)}
            >
              {strings.nav.home}
            </Link>
            {megaNav.map((section) => {
              const open = activeMega === section.id;
              return (
                <div
                  key={section.id}
                  className="nav-item-wrap"
                  onMouseEnter={() => openMega(section.id)}
                >
                  <Link
                    href={section.href}
                    className="nav-item"
                    data-active={isActive(section.href) || open}
                    data-open={open}
                    onFocus={() => openMega(section.id)}
                  >
                    {isFr ? section.navFr : section.navEn}
                    <ChevronDown
                      className={clsx(
                        "nav-chevron",
                        open && "nav-chevron--open",
                      )}
                      aria-hidden
                    />
                  </Link>
                </div>
              );
            })}
          </nav>

          <div className="header-utils">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="util-btn util-btn--search-solo"
              aria-label={isFr ? "Rechercher" : "Search"}
            >
              <Search className="h-4 w-4" />
            </button>

            <div className="util-cluster">
              <Link
                href="/favorites"
                className="util-btn"
                title="Top Picks"
                aria-label="Top Picks"
              >
                <Heart className="h-4 w-4" />
                <span className="util-btn__label">{isFr ? "Favoris" : "Picks"}</span>
                {ids.length > 0 && (
                  <span className="util-badge">{ids.length}</span>
                )}
              </Link>

              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="util-btn"
                aria-label={isFr ? "Rechercher" : "Search"}
              >
                <Search className="h-4 w-4" />
                <span className="util-btn__label">
                  {isFr ? "Rechercher" : "Search"}
                </span>
              </button>

              <div
                className="lang-switch"
                role="group"
                aria-label={isFr ? "Langue" : "Language"}
              >
                <button
                  type="button"
                  onClick={() => setLocale("fr")}
                  className="lang-switch__btn"
                  data-active={locale === "fr"}
                  aria-pressed={locale === "fr"}
                  title="Français"
                >
                  <LangFlag code="fr" />
                  <span className="sr-only">FR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLocale("en")}
                  className="lang-switch__btn"
                  data-active={locale === "en"}
                  aria-pressed={locale === "en"}
                  title="English"
                >
                  <LangFlag code="en" />
                  <span className="sr-only">EN</span>
                </button>
              </div>

              <button
                type="button"
                className="util-btn util-btn--login"
                title={
                  isFr ? "Compte bientôt disponible" : "Account coming soon"
                }
              >
                <User className="h-4 w-4" />
                <span className="util-btn__label util-btn__label--login">
                  {isFr ? "Connexion" : "Login"}
                </span>
              </button>
            </div>

            <button
              type="button"
              className="util-btn util-btn--menu"
              onClick={() => {
                setMenuOpen((v) => !v);
                setActiveMega(null);
              }}
              aria-label="Menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {activeMega && (
          <div
            className="mega-dropdown"
            onMouseEnter={() => activeMega && openMega(activeMega)}
            role="region"
            aria-label={
              isFr
                ? megaNav.find((s) => s.id === activeMega)?.labelFr
                : megaNav.find((s) => s.id === activeMega)?.labelEn
            }
          >
            <div className="mega-dropdown__inner">
              {megaNav
                .filter((s) => s.id === activeMega)
                .map((section) => (
                  <MegaMenuPanel
                    key={section.id}
                    section={section}
                    locale={locale}
                    onNavigate={() => setActiveMega(null)}
                  />
                ))}
            </div>
          </div>
        )}

        {menuOpen && (
          <div className="mobile-drawer">
            <div className="mobile-drawer__scroll">
              <Link
                href="/"
                className="mobile-drawer__link"
                data-active={pathname === "/"}
                onClick={() => setMenuOpen(false)}
              >
                {strings.nav.home}
              </Link>
              {megaNav.map((section) => {
                const expanded = mobileSection === section.id;
                return (
                  <div key={section.id} className="mobile-drawer__section">
                    <button
                      type="button"
                      className="mobile-drawer__toggle"
                      aria-expanded={expanded}
                      onClick={() =>
                        setMobileSection(expanded ? null : section.id)
                      }
                    >
                      <span>{isFr ? section.labelFr : section.labelEn}</span>
                      <ChevronDown
                        className={clsx(
                          "h-4 w-4 shrink-0 transition-transform duration-200",
                          expanded && "rotate-180",
                        )}
                      />
                    </button>
                    {expanded && (
                      <div className="mobile-drawer__panel">
                        <MegaMenuPanel
                          section={section}
                          locale={locale}
                          onNavigate={() => setMenuOpen(false)}
                          compact
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mobile-drawer__footer">
              <div
                className="lang-switch lang-switch--mobile"
                role="group"
                aria-label={isFr ? "Langue" : "Language"}
              >
                <button
                  type="button"
                  onClick={() => setLocale("fr")}
                  className="lang-switch__btn"
                  data-active={locale === "fr"}
                  aria-pressed={locale === "fr"}
                  title="Français"
                >
                  <LangFlag code="fr" />
                  <span className="lang-switch__name">Français</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLocale("en")}
                  className="lang-switch__btn"
                  data-active={locale === "en"}
                  aria-pressed={locale === "en"}
                  title="English"
                >
                  <LangFlag code="en" />
                  <span className="lang-switch__name">English</span>
                </button>
              </div>
              <button
                type="button"
                className="mobile-drawer__search"
                onClick={() => {
                  setMenuOpen(false);
                  setSearchOpen(true);
                }}
              >
                <Search className="h-4 w-4" />
                {isFr ? "Rechercher" : "Search"}
              </button>
              <Link
                href="/favorites"
                className="mobile-drawer__link"
                onClick={() => setMenuOpen(false)}
              >
                {isFr ? "Favoris" : "Top Picks"}
                {ids.length > 0 ? ` (${ids.length})` : ""}
              </Link>
            </div>
          </div>
        )}
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      <div
        id={skipId}
        className={clsx("header-spacer", !bannerOpen && "header-spacer--no-banner")}
        style={{ height: spacerH }}
        aria-hidden
      />
    </>
  );
}
