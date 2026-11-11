import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumb,
  image,
  compact = false,
  homeLabel = "Home",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumb?: { label: string; href?: string }[];
  image?: string | null;
  compact?: boolean;
  homeLabel?: string;
}) {
  return (
    <section className={cn("relative overflow-hidden bg-primary text-white", compact ? "py-14" : "py-20 lg:py-24")}>
      {image && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="" className="absolute inset-0 size-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/85 to-primary/40" />
        </>
      )}
      <div className="paper-grain absolute inset-0 opacity-30" aria-hidden="true" />
      <div className="container-x relative">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="mb-5 flex flex-wrap items-center gap-1 text-[0.68rem] text-white/45" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-white">{homeLabel}</Link>
            {breadcrumb.map((item) => (
              <span key={item.label} className="flex items-center gap-1">
                <ChevronRight className="size-3" />
                {item.href ? (
                  <Link href={item.href} className="hover:text-white">{item.label}</Link>
                ) : (
                  <span className="text-white/70">{item.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <p className="eyebrow text-accent">{eyebrow}</p>}
        <h1 className="mt-4 max-w-4xl text-[clamp(2.3rem,5vw,4.2rem)] leading-[1.05] text-white">{title}</h1>
        {description && (
          <p className="mt-5 max-w-2xl text-[0.98rem] leading-relaxed text-white/60">{description}</p>
        )}
      </div>
    </section>
  );
}
