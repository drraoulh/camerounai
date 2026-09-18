import type { ReactNode } from "react";

export function PageShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`page-surface min-h-[60vh] pb-16 pt-8 ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">{children}</div>
    </div>
  );
}

export function PageHero({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <header className="mb-8 max-w-2xl sm:mb-10">
      <div className="cm-stripe mb-3 sm:mb-4" />
      <h1 className="section-title text-3xl text-[var(--ink)] sm:text-4xl md:text-5xl">
        {title}
      </h1>
      <p className="mt-3 text-base text-[var(--muted)] sm:text-lg">{subtitle}</p>
    </header>
  );
}
