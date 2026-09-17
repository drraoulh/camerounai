import type { ReactNode } from "react";

export function PageShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`page-surface min-h-[60vh] pb-20 pt-10 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">{children}</div>
    </div>
  );
}

export function PageHero({
  title,
  subtitle,
  kicker,
}: {
  title: string;
  subtitle: string;
  kicker?: string;
}) {
  return (
    <header className="page-hero fade-up">
      {kicker ? <p className="section-kicker mb-3">{kicker}</p> : null}
      <div className="cm-stripe mb-4" />
      <h1 className="section-title text-4xl text-[var(--ink)] sm:text-5xl md:text-6xl">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--muted)] sm:text-lg">
        {subtitle}
      </p>
    </header>
  );
}
