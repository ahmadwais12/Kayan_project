import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

export function CtaBand({
  eyebrow,
  title,
  description,
  buttonLabel,
  buttonUrl,
  secondaryLabel,
  secondaryUrl,
  locale = "en",
}: {
  eyebrow?: string | null;
  title?: string | null;
  description?: string | null;
  buttonLabel?: string | null;
  buttonUrl?: string | null;
  secondaryLabel?: string | null;
  secondaryUrl?: string | null;
  locale?: Locale;
}) {
  const t = getDictionary(locale);

  return (
    <section className="bg-primary text-white">
      <div className="container-x relative overflow-hidden py-16 lg:py-20">
        <div className="paper-grain absolute inset-0 opacity-25" aria-hidden="true" />
        <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            {eyebrow && <p className="eyebrow text-accent">{eyebrow}</p>}
            <h2 className="mt-3 text-[clamp(1.9rem,3.5vw,2.8rem)] leading-[1.12] text-white">
              {title || t.ctaTitle}
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/55">
              {description || t.ctaDesc}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={buttonUrl || "/quote"}
              className="btn-shine inline-flex items-center gap-2 bg-accent px-6 py-3.5 text-[0.72rem] font-semibold tracking-[0.14em] text-primary uppercase transition-colors hover:bg-accent/85"
            >
              {buttonLabel || t.startProject} <ArrowRight className="size-4 rtl:rotate-180" />
            </Link>
            <Link
              href={secondaryUrl || "/contact"}
              className="inline-flex items-center gap-2 border border-white/25 px-6 py-3.5 text-[0.72rem] font-semibold tracking-[0.14em] text-white uppercase transition-colors hover:border-white hover:bg-white/5"
            >
              {secondaryLabel || t.contactStudio}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
