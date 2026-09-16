"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { destinations as localDestinations } from "@/data/destinations";
import type { Destination } from "@/lib/types";

type PlacesContextValue = {
  places: Destination[];
  source: "supabase" | "local" | "loading";
  ready: boolean;
  refresh: () => Promise<void>;
  getById: (id: string) => Destination | undefined;
};

const PlacesContext = createContext<PlacesContextValue | null>(null);

export function PlacesProvider({ children }: { children: ReactNode }) {
  const [places, setPlaces] = useState<Destination[]>([]);
  const [source, setSource] = useState<"supabase" | "local" | "loading">(
    "loading",
  );
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/places?full=1");
      if (!res.ok) throw new Error("places api failed");
      const data = (await res.json()) as {
        places?: Destination[];
        source?: string;
      };
      if (data.places?.length) {
        setPlaces(data.places);
        setSource(data.source === "supabase" ? "supabase" : "local");
      } else {
        setPlaces(localDestinations);
        setSource("local");
      }
    } catch {
      setPlaces(localDestinations);
      setSource("local");
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const getById = useCallback(
    (id: string) => places.find((p) => p.id === id),
    [places],
  );

  const value = useMemo(
    () => ({ places, source, ready, refresh, getById }),
    [places, source, ready, refresh, getById],
  );

  return (
    <PlacesContext.Provider value={value}>{children}</PlacesContext.Provider>
  );
}

export function usePlaces() {
  const ctx = useContext(PlacesContext);
  if (!ctx) throw new Error("usePlaces must be used within PlacesProvider");
  return ctx;
}
