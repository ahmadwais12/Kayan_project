"use client";

import { useEffect } from "react";

export function SplashScreen({ siteName, logoUrl }: { siteName: string; logoUrl?: string | null }) {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("splash-lock");
    const timer = window.setTimeout(() => root.classList.remove("splash-lock"), 3000);
    return () => {
      window.clearTimeout(timer);
      root.classList.remove("splash-lock");
    };
  }, []);

  return (
    <div className="splash-root fixed inset-0 z-[100] grid place-items-center bg-primary" aria-hidden="true">
      <div className="paper-grain absolute inset-0 opacity-20" />
      <div className="splash-intro relative flex flex-col items-center gap-6 px-6 text-center">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt=""
            className="h-16 w-auto max-w-[14rem] object-contain brightness-0 invert"
          />
        ) : (
          <span className="grid size-16 place-items-center border border-white/40 font-display text-xl text-white">
            {siteName.slice(0, 2).toUpperCase()}
          </span>
        )}
        <span className="font-display text-2xl uppercase tracking-[0.3em] text-white">{siteName}</span>
        <span className="splash-line" />
      </div>
    </div>
  );
}
