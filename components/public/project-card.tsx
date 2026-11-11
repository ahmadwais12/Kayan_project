import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";
import { SmartImage } from "@/components/public/smart-image";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

export type ProjectCardData = {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  location: string;
  year: string | null;
  category: { name: string } | null;
};

export function ProjectCard({
  project,
  large = false,
  wide = false,
  index,
  locale = "en",
}: {
  project: ProjectCardData;
  large?: boolean;
  wide?: boolean;
  index?: number;
  locale?: Locale;
}) {
  const t = getDictionary(locale);
  const meta = [project.location, project.year].filter(Boolean).join(" · ");

  return (
    <div className="h-full">
      <Link
        href={`/projects/${project.slug}`}
        className="group relative flex h-full flex-col border border-border/70 bg-card transition-colors duration-300 hover:border-accent/60"
        data-card-type="PROJECT"
        data-card-id={project.id}
        data-card-title={project.title}
      >
        <div
          className={cn(
            "relative m-3 overflow-hidden bg-secondary",
            wide ? "aspect-[16/10] sm:aspect-[21/9]" : large ? "aspect-[4/5]" : "aspect-[4/3]",
          )}
        >
          <SmartImage
            src={project.coverImage}
            alt={project.title}
            sizes={wide ? "100vw" : large ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
            className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />

          {!project.coverImage && (
            <span
              aria-hidden="true"
              className="absolute inset-0 grid place-items-center font-display text-6xl text-primary/10"
            >
              K
            </span>
          )}

          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-b from-primary/25 via-transparent to-transparent"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-primary/70 via-primary/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />

          {project.category && (
            <span className="absolute start-4 top-4 border border-white/25 bg-primary/30 px-2.5 py-1 text-[0.58rem] font-semibold tracking-[0.18em] text-white uppercase backdrop-blur-sm">
              {project.category.name}
            </span>
          )}

          {typeof index === "number" && (
            <span className="absolute end-4 top-4 font-display text-xs tracking-[0.18em] text-white/70">
              {String(index).padStart(2, "0")}
            </span>
          )}

          <div className="absolute inset-x-0 bottom-0 flex translate-y-2 items-center justify-between p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="text-[0.6rem] font-semibold tracking-[0.2em] text-white uppercase">
              {t.viewProject}
            </span>
            <span className="grid size-9 place-items-center rounded-full bg-accent text-primary">
              <ArrowUpRight className="size-4" />
            </span>
          </div>
        </div>

        <div className="flex flex-1 items-start justify-between gap-4 px-4 pb-4">
          <div className="min-w-0">
            <h3
              className={cn(
                "font-display leading-tight text-primary transition-colors duration-300 group-hover:text-accent",
                wide || large ? "text-2xl" : "text-xl",
              )}
            >
              {project.title}
            </h3>
            {meta && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3 shrink-0" /> <span className="truncate">{meta}</span>
              </p>
            )}
          </div>
          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-border/80 bg-background text-primary transition-colors duration-300 group-hover:border-accent group-hover:bg-accent">
            <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:rotate-90 rtl:group-hover:-translate-x-0.5" />
          </span>
        </div>
      </Link>
    </div>
  );
}
