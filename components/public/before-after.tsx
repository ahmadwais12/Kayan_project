"use client";

import { useState } from "react";
import { MoveHorizontal } from "lucide-react";

export function BeforeAfter({
  before,
  after,
  beforeLabel,
  afterLabel,
  compareHint,
}: {
  before: string;
  after: string;
  beforeLabel: string;
  afterLabel: string;
  compareHint: string;
}) {
  const [position, setPosition] = useState(50);

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] select-none overflow-hidden bg-secondary">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={after} alt={afterLabel} className="absolute inset-0 size-full object-cover" />
        <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={before}
            alt={beforeLabel}
            className="absolute inset-0 h-full object-cover"
            style={{ width: `${100 / (position / 100)}%`, maxWidth: "none" }}
          />
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-accent"
          style={{ left: `${position}%` }}
        >
          <span className="absolute left-1/2 top-1/2 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent text-primary shadow-lg">
            <MoveHorizontal className="size-4" />
          </span>
        </div>
        <span className="absolute left-3 top-3 bg-primary/80 px-2.5 py-1 text-[0.6rem] font-semibold tracking-[0.14em] text-white uppercase">
          {beforeLabel}
        </span>
        <span className="absolute right-3 top-3 bg-accent px-2.5 py-1 text-[0.6rem] font-semibold tracking-[0.14em] text-primary uppercase">
          {afterLabel}
        </span>
        <label htmlFor="before-after" className="sr-only">
          Drag to compare before and after
        </label>
        <input
          id="before-after"
          type="range"
          min={0}
          max={100}
          value={position}
          onChange={(event) => setPosition(Number(event.target.value))}
          className="absolute inset-0 size-full cursor-ew-resize opacity-0"
        />
      </div>
      <p className="text-xs text-muted-foreground">{compareHint}</p>
    </div>
  );
}
