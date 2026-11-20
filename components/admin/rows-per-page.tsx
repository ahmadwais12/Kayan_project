"use client";

import { useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ROWS_OPTIONS } from "@/lib/pagination";

export function RowsPerPage({ value }: { value: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground">
      Rows per fetch
      <select
        value={value}
        disabled={pending}
        onChange={(event) => {
          const next = new URLSearchParams(searchParams.toString());
          next.set("rows", event.target.value);
          next.delete("page");
          startTransition(() => {
            router.push(`${pathname}?${next.toString()}`, { scroll: false });
          });
        }}
        className="rounded bg-transparent text-xs font-semibold text-primary outline-none disabled:opacity-60"
        aria-label="Rows per fetch"
      >
        {ROWS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
