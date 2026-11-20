"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { LayoutGrid, List } from "lucide-react";
import { ProjectCard, type ProjectCardData } from "@/components/public/project-card";
import { SmartImage } from "@/components/public/smart-image";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type ProjectItem = ProjectCardData & { id: string };
type View = "grid" | "table";

const STORAGE_KEY = "kayan:project-view:v2";
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
    return stored === "grid" ? "grid" : "table";
  } catch {
    return "table";
  }
}

function getServerSnapshot(): View {
  return "table";
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
              { value: "table", label: t.table, Icon: List },
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

      {view === "grid" ? (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <div key={project.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(index * 55, 330)}ms` }}>
              <ProjectCard project={project} index={index + 1} locale={locale} />
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border/80 bg-card">
          <Table className="min-w-[680px]">
            <TableHeader className="bg-secondary/30">
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="w-24">Year</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <Link href={`/projects/${project.slug}`} className="group flex items-center gap-3">
                      <span className="relative block size-14 shrink-0 overflow-hidden rounded-md bg-secondary">
                        <SmartImage src={project.coverImage} alt="" sizes="56px" />
                      </span>
                      <span className="font-medium text-primary transition-colors group-hover:text-accent-foreground">{project.title}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{project.category?.name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{project.location || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{project.year || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
