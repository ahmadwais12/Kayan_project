"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export function ChartDateFilter({
  days,
  rows,
  value,
  max,
  active,
}: {
  days: number;
  rows: number;
  value: string;
  max: string;
  active: boolean;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState(value);
  const [pending, startTransition] = useTransition();

  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-1 rounded-md border bg-card p-1 transition-colors",
        active ? "border-primary/40" : "border-border",
      )}
    >
      <CalendarDays className="ml-1.5 size-3.5 shrink-0 text-muted-foreground" />
      <input
        type="date"
        value={selected}
        max={max}
        aria-label="Choose a date for the chart"
        className="h-9 min-w-0 rounded bg-transparent px-1.5 text-xs text-primary outline-none [color-scheme:light]"
        onChange={(event) => {
          const date = event.target.value;
          if (!date) return;
          setSelected(date);
          startTransition(() => {
            router.push(`/admin/analytics?days=${days}&chart=date&rows=${rows}&date=${date}`, {
              scroll: false,
            });
          });
        }}
      />
      <span
        className={cn(
          "rounded px-2 py-1 text-[0.7rem] font-semibold transition-colors",
          active ? "bg-primary text-white" : "text-muted-foreground",
        )}
      >
        {pending ? "Loading…" : "Date"}
      </span>
    </label>
  );
}
