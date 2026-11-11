"use client";

import { useState, useTransition } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronDown, Globe } from "lucide-react";
import { setLocale } from "@/actions/preferences";
import { LOCALES, LOCALE_META, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const t = getDictionary(locale);
  const current = LOCALE_META[locale];

  function choose(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    startTransition(() => {
      void setLocale(next);
    });
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={t.language}
          title={t.language}
          disabled={pending}
          className={cn(
            "inline-flex h-10 items-center gap-2 border border-primary/20 px-3 text-[0.72rem] font-semibold tracking-[0.08em] uppercase transition-colors hover:border-primary disabled:opacity-60",
            compact && "h-9 px-2.5",
          )}
        >
          <Globe className="size-4" />
          <span>{current.short}</span>
          <ChevronDown className="size-3 opacity-60" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          className="z-50 w-44 overflow-hidden rounded-md border border-border bg-card p-1 shadow-xl shadow-primary/10"
        >
          {LOCALES.map((item) => {
            const meta = LOCALE_META[item];
            const active = item === locale;
            return (
              <button
                key={item}
                type="button"
                onClick={() => choose(item)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-secondary/70 font-medium text-ink"
                    : "text-foreground/75 hover:bg-secondary/60 hover:text-ink",
                )}
              >
                <span className="flex items-baseline gap-2">
                  <span>{meta.native}</span>
                  <span className="text-[0.65rem] text-muted-foreground">{meta.label}</span>
                </span>
                {active && <Check className="size-3.5 text-accent" />}
              </button>
            );
          })}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
