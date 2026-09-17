"use client";

import { useEffect, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export function LessonFrame({ children }: Props) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[80] flex justify-center bg-[#131f24] text-white">
      <div className="flex h-full w-full max-w-md flex-col">{children}</div>
    </div>
  );
}
