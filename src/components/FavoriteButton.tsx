"use client";

import { Heart } from "lucide-react";
import clsx from "clsx";
import { useFavorites } from "./FavoritesProvider";

export function FavoriteButton({
  id,
  className,
  light = false,
}: {
  id: string;
  className?: string;
  light?: boolean;
}) {
  const { has, toggle, ready } = useFavorites();
  const active = ready && has(id);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(id);
      }}
      className={clsx(
        "inline-flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition",
        light
          ? active
            ? "bg-white text-rose-600"
            : "bg-black/35 text-white hover:bg-black/50"
          : active
            ? "bg-rose-50 text-rose-600 ring-1 ring-rose-200"
            : "bg-white/90 text-[var(--ink)] ring-1 ring-[var(--line)] hover:bg-white",
        className,
      )}
      aria-label={active ? "Remove from Top Picks" : "Add to Top Picks"}
      title={active ? "Top Picks" : "Top Picks"}
    >
      <Heart className={clsx("h-4 w-4", active && "fill-current")} />
    </button>
  );
}
