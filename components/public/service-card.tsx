import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SmartImage } from "@/components/public/smart-image";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";

export type ServiceCardData = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  mainImage: string | null;
  category: { name: string } | null;
};

export function ServiceCard({ service, index, locale = "en" }: { service: ServiceCardData; index: number; locale?: Locale }) {
  const t = getDictionary(locale);

  return (
    <div className="h-full">
      <Link
        href={`/services/${service.slug}`}
        className="group relative flex h-full flex-col border border-border/70 bg-card transition-colors duration-300 hover:border-accent/50"
        data-card-type="SERVICE"
        data-card-id={service.id}
        data-card-title={service.title}
      >
        <div className="relative m-3 mb-0 aspect-[16/10] overflow-hidden bg-secondary">
          <SmartImage
            src={service.mainImage}
            alt={service.title}
            sizes="(min-width: 1024px) 33vw, 100vw"
            className="transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          <span className="absolute start-4 top-4 bg-primary/90 px-2.5 py-1 text-[0.6rem] font-semibold tracking-[0.14em] text-white uppercase">
            {service.category?.name || t.service}
          </span>
        </div>
        <div className="flex flex-1 flex-col px-4 pb-4 pt-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-xl leading-tight text-primary transition-colors group-hover:text-accent">
              {service.title}
            </h3>
            <span className="grid size-8 shrink-0 place-items-center border border-border bg-background text-primary transition-colors group-hover:border-accent group-hover:text-accent">
              <ArrowUpRight className="size-3.5 rtl:rotate-90" />
            </span>
          </div>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {service.shortDescription}
          </p>
          <span className="mt-4 text-[0.62rem] font-semibold tracking-[0.16em] text-muted-foreground/70 uppercase">
            {String(index + 1).padStart(2, "0")} / {t.service}
          </span>
        </div>
      </Link>
    </div>
  );
}
