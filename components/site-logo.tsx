import Link from "next/link";
import { cn } from "@/lib/utils";

export function SiteLogo({
  name = "Kayan Land",
  light = false,
  compact = false,
  hideTagline = false,
  logoUrl,
  className,
}: {
  name?: string;
  light?: boolean;
  compact?: boolean;
  hideTagline?: boolean;
  logoUrl?: string | null;
  className?: string;
}) {
  return (
    <Link
      href="/"
      aria-label={`${name} home`}
      className={cn("group inline-flex items-center gap-3", className)}
    >
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt=""
          className={cn(
            "h-10 w-auto max-w-[9rem] object-contain",
            compact && "max-w-9",
            light ? "brightness-0 invert" : "dark:brightness-0 dark:invert",
          )}
        />
      ) : (
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center border font-display text-[0.95rem] leading-none tracking-tight transition-colors",
            light
              ? "border-white/40 text-white group-hover:border-accent"
              : "border-primary/30 text-primary group-hover:border-accent",
          )}
        >
          KL
        </span>
      )}
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-lg tracking-[0.04em]",
              light ? "text-white" : "text-primary",
            )}
          >
            {name.toUpperCase()}
          </span>
          {!hideTagline && (
            <span
              className={cn(
                "mt-1 text-[0.55rem] font-semibold uppercase tracking-[0.28em]",
                light ? "text-white/60" : "text-muted-foreground",
              )}
            >
              Architecture & Construction
            </span>
          )}
        </span>
      )}
    </Link>
  );
}
