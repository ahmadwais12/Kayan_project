"use client";

import { useSyncExternalStore } from "react";
import { LayoutGrid, LayoutList } from "lucide-react";
import { ProjectCard, type ProjectCardData } from "@/components/public/project-card";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

type ProjectItem = ProjectCardData & { id: string };
type View = "grid" | "masonry";

const STORAGE_KEY = "kayan:project-view";
const CHANGE_EVENT = "kayan:project-view-change";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

function getSnapshot(): View {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "masonry" ? "masonry" : "grid";
  } catch {
    return "grid";
  }
}

function getServerSnapshot(): View {
  return "grid";
}

export function ProjectBrowser({ projects, locale = "en" }: { projects: ProjectItem[]; locale?: Locale }) {
  const t = getDictionary(locale);
  const view = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function choose(next: View) {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be blocked by the browser; the layout still changes for this visit.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between gap-4 border-y border-border/70 py-3">
        <p className="text-[0.62rem] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
          {projects.length} {t.projects} · {t.onThisPage}
        </p>
        <div role="group" aria-label={t.projectLayout} className="flex items-center gap-1">
          {(
            [
              { value: "grid", label: t.grid, Icon: LayoutGrid },
              { value: "masonry", label: t.masonry, Icon: LayoutList },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => choose(option.value)}
              aria-label={`${option.label} ${t.projectLayout}`}
              aria-pressed={view === option.value}
              className={cn(
                "flex h-8 items-center gap-2 px-3 text-[0.62rem] font-semibold tracking-[0.14em] uppercase transition-colors",
                view === option.value
                  ? "bg-primary text-white"
                  : "text-muted-foreground hover:text-primary",
              )}
            >
              <option.Icon className="size-3.5" />
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div
        key={view}
        className={
          view === "grid"
            ? "grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
            : "columns-1 gap-6 sm:columns-2 lg:columns-3"
        }
      >
        {projects.map((project, index) => (
          <div
            key={project.id}
            className={cn(
              "animate-fade-up",
              view === "masonry" && "mb-6 break-inside-avoid",
            )}
            style={{ animationDelay: `${Math.min(index * 55, 330)}ms` }}
          >
            <ProjectCard
              project={project}
              index={index + 1}
              large={view === "masonry" && index % 3 === 1}
              locale={locale}
            />
          </div>
        ))}
      </div>
    </>
  );
}
