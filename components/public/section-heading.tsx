import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  linkHref,
  linkLabel,
  align = "left",
  light = false,
  className,
}: {
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  linkHref?: string;
  linkLabel?: string;
  align?: "left" | "center";
  light?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center",
        className,
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <p className={cn("eyebrow", light && "text-accent")}>{eyebrow}</p>
        )}
        {title && (
          <h2
            className={cn(
              "mt-3 text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.12]",
              light ? "text-white" : "text-primary",
            )}
          >
            {title}
          </h2>
        )}
        {description && (
          <p
            className={cn(
              "mt-4 text-[0.95rem] leading-relaxed",
              light ? "text-white/60" : "text-muted-foreground",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {linkHref && linkLabel && (
        <Link
          href={linkHref}
          className={cn(
            "link-underline inline-flex shrink-0 items-center gap-2 text-[0.72rem] font-semibold tracking-[0.14em] uppercase",
            light ? "text-white" : "text-primary",
          )}
        >
          {linkLabel} <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}
