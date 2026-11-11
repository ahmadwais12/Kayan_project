"use client";

import { useMemo, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { SocialIcon } from "@/components/public/social-icon";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

export function PlatformSelect({
  id,
  name,
  options,
  defaultValue,
}: {
  id?: string;
  name: string;
  options: Option[];
  defaultValue?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(defaultValue || options[0]?.value || "");
  const inputRef = useRef<HTMLInputElement>(null);

  const current = options.find((option) => option.value === selected);
  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(search) ||
        option.value.toLowerCase().includes(search),
    );
  }, [options, query]);

  function choose(value: string) {
    setSelected(value);
    setQuery("");
    setOpen(false);
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <input type="hidden" name={name} value={selected} />
      <Popover.Trigger asChild>
        <button
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          className={cn(
            "mt-1.5 flex h-11 w-full items-center gap-2.5 rounded-md border border-input bg-background px-3 text-sm outline-none transition-colors",
            "hover:border-primary/30 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/10",
            open && "border-primary/40 ring-2 ring-primary/10",
          )}
        >
          <span className="grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-primary">
            <SocialIcon platform={selected} className="size-3.5" />
          </span>
          <span className="min-w-0 flex-1 truncate text-left text-primary">
            {current?.label || selected}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-lg border border-border bg-card shadow-xl shadow-primary/10"
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <div className="flex items-center gap-2 border-b border-border/70 px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setOpen(false);
                if (event.key === "Enter" && filtered[0]) {
                  event.preventDefault();
                  choose(filtered[0].value);
                }
              }}
              placeholder="Search platforms or apps…"
              aria-label="Search platforms or apps"
              className="h-11 min-w-0 flex-1 bg-transparent text-sm text-primary outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Clear search"
                className="grid size-6 shrink-0 place-items-center rounded text-muted-foreground hover:bg-secondary hover:text-primary"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          <ul
            role="listbox"
            aria-label="Platforms and apps"
            className="admin-scroll max-h-[12rem] overflow-y-auto overscroll-contain p-1.5"
          >
            {filtered.length === 0 ? (
              <li className="px-3 py-8 text-center">
                <p className="text-sm font-medium text-primary">No matching platform</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Try “Instagram”, “WhatsApp” or “Website”.
                </p>
              </li>
            ) : (
              filtered.map((option) => {
                const active = option.value === selected;
                return (
                  <li key={option.value} role="option" aria-selected={active}>
                    <button
                      type="button"
                      onClick={() => choose(option.value)}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                        active
                          ? "bg-primary/5 text-primary"
                          : "text-foreground/80 hover:bg-secondary/70 hover:text-primary",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-full",
                          active ? "bg-primary text-accent" : "bg-secondary text-primary",
                        )}
                      >
                        <SocialIcon platform={option.value} className="size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1 truncate">{option.label}</span>
                      {active && <Check className="size-4 shrink-0 text-accent" />}
                    </button>
                  </li>
                );
              })
            )}
          </ul>

          <div className="flex items-center justify-between border-t border-border/70 bg-secondary/30 px-3 py-2 text-[0.65rem] text-muted-foreground">
            <span>
              {filtered.length} of {options.length} platforms
            </span>
            <span>Enter to select · Esc to close</span>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
