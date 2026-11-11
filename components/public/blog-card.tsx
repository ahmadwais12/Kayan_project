import Link from "next/link";
import { ArrowRight, CalendarDays, Clock } from "lucide-react";
import { SmartImage } from "@/components/public/smart-image";
import { getDictionary } from "@/lib/i18n/dictionary";
import type { Locale } from "@/lib/i18n/config";
import { formatDate } from "@/lib/utils";

export type BlogCardData = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string | null;
  publishedAt: Date | null;
  readingTime: number;
  category: { name: string } | null;
  author: { name: string } | null;
};

export function BlogCard({ post, compact = false, locale = "en" }: { post: BlogCardData; compact?: boolean; locale?: Locale }) {
  const t = getDictionary(locale);

  if (compact) {
    return (
      <Link
        href={`/blog/${post.slug}`}
        className="group flex gap-4 border-b border-border/70 py-4 last:border-0"
        data-card-type="ARTICLE"
        data-card-id={post.id}
        data-card-title={post.title}
      >
        <div className="relative aspect-square w-20 shrink-0 overflow-hidden bg-secondary">
          <SmartImage src={post.featuredImage} alt={post.title} sizes="80px" />
        </div>
        <div className="min-w-0">
          <p className="text-[0.62rem] font-semibold tracking-[0.14em] text-accent uppercase">
            {post.category?.name || t.journalLabel}
          </p>
          <h3 className="mt-1 line-clamp-2 font-display text-[1.05rem] leading-snug text-primary transition-colors group-hover:text-accent">
            {post.title}
          </h3>
          <p className="mt-1.5 flex items-center gap-1.5 text-[0.68rem] text-muted-foreground">
            <CalendarDays className="size-3" /> {formatDate(post.publishedAt)}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <div className="h-full">
      <Link
        href={`/blog/${post.slug}`}
        className="group relative flex h-full flex-col border border-border/70 bg-card transition-colors duration-300 hover:border-accent/50"
        data-card-type="ARTICLE"
        data-card-id={post.id}
        data-card-title={post.title}
      >
        <div className="image-reveal relative m-3 aspect-[3/2] bg-secondary">
          <SmartImage
            src={post.featuredImage}
            alt={post.title}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="transition-transform duration-700 group-hover:scale-[1.04]"
          />
        </div>
        <div className="flex flex-1 flex-col px-4 pb-4 pt-1">
          <div className="flex items-center gap-3 text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
            <span className="text-accent">{post.category?.name || t.journalLabel}</span>
            <span className="text-border">/</span>
            <span className="flex items-center gap-1">
              <Clock className="size-3" /> {post.readingTime} {t.minutes}
            </span>
          </div>
          <h3 className="mt-2 font-display text-[1.35rem] leading-snug text-primary transition-colors group-hover:text-accent">
            {post.title}
          </h3>
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
          <div className="mt-3 flex items-center justify-between text-[0.68rem] text-muted-foreground">
            <span>{formatDate(post.publishedAt)}</span>
            <span className="flex items-center gap-1 font-medium text-primary">
              {t.read} <ArrowRight className="size-3 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
