import Link from "next/link";
import { Play } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { getLocale } from "@/lib/i18n/server";
import { withTranslations } from "@/lib/i18n/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { PageHero } from "@/components/public/page-hero";
import { GalleryLightbox } from "@/components/public/gallery-lightbox";
import { EmptyState } from "@/components/public/empty-state";
import { CtaBand } from "@/components/public/cta-band";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return buildMetadata({
    title: t.galleryLabel,
    description: t.galleryHeroDesc,
    path: "/gallery",
  });
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale);
  const category = (query.category || "").trim();

  const [categories, media, ctaRaw] = await Promise.all([
    prisma.galleryCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { media: { where: { isPublished: true } } } },
      },
    }),
    prisma.galleryMedia.findMany({
      where: {
        isPublished: true,
        ...(category ? { category: { slug: category } } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: { category: true },
    }),
    prisma.homepageSection.findUnique({ where: { key: "cta" } }),
  ]);

  const [ctaRows, localizedCategories, localizedMedia] = await Promise.all([
    ctaRaw
      ? withTranslations("homepage", [ctaRaw], locale, ["title", "subtitle", "description", "buttonLabel", "secondaryLabel"])
      : Promise.resolve([]),
    withTranslations("galleryCategory", categories, locale, ["name"]),
    withTranslations("galleryMedia", media, locale, ["title", "caption"]),
  ]);
  const cta = ctaRows[0] || null;

  const visibleCategories = localizedCategories.filter((item) => item._count.media > 0);
  const images = localizedMedia
    .filter((item) => item.type !== "VIDEO")
    .map((item) => ({
      url: item.url,
      thumbnailUrl: item.thumbnailUrl,
      alt: item.title || item.caption || t.galleryImage,
      caption: item.caption || item.title,
    }));
  const videos = localizedMedia.filter((item) => item.type === "VIDEO");

  return (
    <>
      <PageHero
        eyebrow={t.visualRecord}
        title={t.galleryLabel}
        description={t.galleryHeroDesc}
        breadcrumb={[{ label: t.galleryLabel }]}
        homeLabel={t.home}
        compact
      />

      <section className="container-x py-16 lg:py-20">
        {visibleCategories.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2">
            <Link
              href="/gallery"
              className={cn(
                "border px-4 py-2 text-xs font-medium transition-colors",
                !category
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary",
              )}
            >
              {t.allMedia}
            </Link>
            {visibleCategories.map((item) => (
              <Link
                key={item.id}
                href={`/gallery?category=${item.slug}`}
                className={cn(
                  "border px-4 py-2 text-xs font-medium transition-colors",
                  category === item.slug
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary",
                )}
              >
                {item.name} <span className="ms-1 opacity-60">{item._count.media}</span>
              </Link>
            ))}
          </div>
        )}

        {images.length > 0 ? (
          <GalleryLightbox images={images} />
        ) : (
          <EmptyState
            title={t.galleryEmptyTitle}
            description={t.galleryEmptyDesc}
          />
        )}

        {videos.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-2xl text-primary">{t.films}</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {videos.map((video) => (
                <a
                  key={video.id}
                  href={video.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group border border-border/70 bg-card p-5 transition-colors hover:border-accent/50"
                >
                  <span className="grid size-10 place-items-center rounded-full bg-primary/5 text-primary">
                    <Play className="size-4" />
                  </span>
                  <p className="mt-4 font-display text-lg text-primary group-hover:text-accent">
                    {video.title || t.galleryFilm}
                  </p>
                  {video.caption && <p className="mt-1 text-sm text-muted-foreground">{video.caption}</p>}
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

      <CtaBand
        eyebrow={cta?.subtitle}
        title={cta?.title}
        description={cta?.description}
        buttonLabel={cta?.buttonLabel}
        buttonUrl={cta?.buttonUrl}
        secondaryLabel={cta?.secondaryLabel}
        secondaryUrl={cta?.secondaryUrl}
        locale={locale}
      />
    </>
  );
}
