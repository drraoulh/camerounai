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
import {
  applyRewards,
  EMPTY_PROGRESS,
  parseProgress,
  STORAGE_KEY,
  type Achievement,
  type GameProgress,
  type Rank,
} from "@/lib/game-progress";

type Reward = {
  xp?: number;
  expressionId?: string;
  missionId?: string;
  regionId?: string;
  areaId?: string;
};

type Ctx = {
  progress: GameProgress;
  ready: boolean;
  reward: (r: Reward) => { newAchievements: Achievement[]; rankedUp: Rank | null };
};

const GameProgressContext = createContext<Ctx | null>(null);

export function GameProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<GameProgress>(EMPTY_PROGRESS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setProgress(parseProgress(localStorage.getItem(STORAGE_KEY)));
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      /* ignore */
    }
  }, [progress, ready]);

  const reward = useCallback(
    (r: Reward) => {
      const applied = applyRewards(progress, r);
      setProgress(applied.next);
      return {
        newAchievements: applied.newAchievements,
        rankedUp: applied.rankedUp,
      };
    },
    [progress],
  );

  const value = useMemo(
    () => ({ progress, ready, reward }),
    [progress, ready, reward],
  );

  return (
    <GameProgressContext.Provider value={value}>
      {children}
    </GameProgressContext.Provider>
  );
}

export function useGameProgress() {
  const ctx = useContext(GameProgressContext);
  if (!ctx) throw new Error("useGameProgress must be used within GameProgressProvider");
  return ctx;
}
