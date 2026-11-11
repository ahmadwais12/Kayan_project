"use client";

import { useSyncExternalStore, useTransition } from "react";
import { Moon, Sun } from "lucide-react";
import { setTheme } from "@/actions/preferences";
import type { Theme } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function ThemeToggle({
  theme,
  labels,
  className,
}: {
  theme?: Theme;
  labels?: { light: string; dark: string };
  className?: string;
}) {
  const value = useSyncExternalStore(subscribe, getSnapshot, () => theme ?? "light");
  const [, startTransition] = useTransition();

  const isDark = value === "dark";
  const label = isDark ? labels?.light || "Light mode" : labels?.dark || "Dark mode";

  function toggle() {
    const next: Theme = isDark ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    startTransition(() => {
      void setTheme(next);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      aria-pressed={isDark}
      className={cn(
        "inline-flex size-10 items-center justify-center border border-primary/20 text-ink transition-colors hover:border-primary",
        className,
      )}
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}
