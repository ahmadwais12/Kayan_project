import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  href?: string;
}) {
  const content = (
    <div className="group relative overflow-hidden rounded-lg border border-border/80 bg-card p-5 transition-colors hover:border-primary/25">
      <div className="flex items-start justify-between">
        <div className="grid size-10 place-items-center rounded-md bg-primary/5 text-primary">
          <Icon className="size-[18px]" />
        </div>
        {href && (
          <ArrowUpRight className="size-4 text-muted-foreground/50 transition-colors group-hover:text-accent" />
        )}
      </div>
      <p className="mt-5 font-display text-[2rem] leading-none text-primary">{value}</p>
      <p className="mt-2 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground/80">{hint}</p>}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export function MiniStat({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className?: string;
}) {
  return (
    <div className={cn("rounded-md border border-border/70 bg-card px-4 py-3", className)}>
      <p className="text-lg font-semibold text-primary">{value}</p>
      <p className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
        {label}
      </p>
    </div>
  );
}
