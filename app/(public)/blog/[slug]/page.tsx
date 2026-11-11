import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Clock, Tag, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buildMetadata, JsonLd } from "@/lib/seo";
import { getLocale } from "@/lib/i18n/server";
import { getLocalizedSettings, withTranslations } from "@/lib/i18n/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { PageHero } from "@/components/public/page-hero";
import { Markdown } from "@/components/public/markdown";
import { BlogCard } from "@/components/public/blog-card";
import { SectionHeading } from "@/components/public/section-heading";
import { CtaBand } from "@/components/public/cta-band";
import { ReadingProgress, ShareButtons } from "@/components/public/share-buttons";
import { PreviewBanner } from "@/components/public/preview-banner";
import { isPreviewRequest } from "@/lib/preview";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getPost(slug: string, preview = false) {
  return prisma.blogPost.findFirst({
    where: {
      slug,
      deletedAt: null,
      ...(preview ? {} : { status: "PUBLISHED", publishedAt: { lte: new Date() } }),
    },
    include: {
      author: true,
      category: true,
      tags: { include: { tag: true } },
    },
  });
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const locale = await getLocale();
  const preview = await isPreviewRequest(query, "blog.manage");
  const post = await getPost(slug, preview);
  if (!post) return buildMetadata({ title: "Article not found", noindex: true });
  const [localized] = await withTranslations("blog", [post], locale, ["title", "excerpt"]);
  return buildMetadata({
    title: post.seoTitle || localized.title,
    description: post.seoDescription || localized.excerpt,
    image: post.ogImage || post.featuredImage,
    path: `/blog/${post.slug}`,
    type: "article",
    publishedTime: post.publishedAt?.toISOString(),
    noindex: preview,
  });
}

export default async function BlogArticlePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const locale = await getLocale();
  const t = getDictionary(locale);
  const preview = await isPreviewRequest(query, "blog.manage");
  const post = await getPost(slug, preview);
  if (!post) notFound();

  const [settings, relatedRaw, ctaRaw] = await Promise.all([
    getLocalizedSettings(),
    prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() },
        deletedAt: null,
        id: { not: post.id },
        ...(post.categoryId ? { categoryId: post.categoryId } : {}),
      },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: { category: true, author: true },
    }),
    prisma.homepageSection.findUnique({ where: { key: "cta" } }),
  ]);

  const sectionFields = ["title", "subtitle", "description", "buttonLabel", "secondaryLabel"];
  const [postCopy, categoryCopy, related, ctaRows, localizedTags] = await Promise.all([
    withTranslations("blog", [post], locale, ["title", "excerpt", "content"]),
    post.category
      ? withTranslations("blogCategory", [post.category], locale, ["name", "description"])
      : Promise.resolve([]),
    withTranslations("blog", relatedRaw, locale, ["title", "excerpt", "content"]),
    ctaRaw ? withTranslations("homepage", [ctaRaw], locale, sectionFields) : Promise.resolve([]),
    withTranslations("blogTag", post.tags.map((relation) => relation.tag), locale, ["name"]),
  ]);
  const tagNames = new Map(localizedTags.map((tag) => [tag.id, tag.name]));
  Object.assign(post, postCopy[0]);
  if (post.category && categoryCopy[0]) post.category.name = categoryCopy[0].name;
  const cta = ctaRows[0] || null;

  const relatedCategoryNames = new Map(
    await Promise.all(
      related
        .filter((item) => item.category)
        .map(async (item) => {
          const [localized] = await withTranslations("blogCategory", [item.category!], locale, ["name"]);
          return [item.category!.id, localized.name] as const;
        }),
    ),
  );
  const relatedView = related.map((item) =>
    item.category
      ? {
          ...item,
          category: { ...item.category, name: relatedCategoryNames.get(item.category.id) || item.category.name },
        }
      : item,
  );

  const base = process.env.APP_URL || "http://localhost:3333";
  const url = `${base}/blog/${post.slug}`;
  const authorName = post.author?.name || settings.siteName;

  return (
    <>
      {preview && <PreviewBanner editHref={`/admin/blog/${post.id}`} label={post.title} />}
      <ReadingProgress />
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.publishedAt?.toISOString(),
            dateModified: post.updatedAt.toISOString(),
            author: { "@type": "Person", name: authorName },
            publisher: {
              "@type": "Organization",
              name: settings.siteLegalName || settings.siteName,
              url: base,
            },
            mainEntityOfPage: url,
            ...(post.featuredImage
              ? { image: post.featuredImage.startsWith("http") ? post.featuredImage : `${base}${post.featuredImage}` }
              : {}),
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t.home, item: base },
              { "@type": "ListItem", position: 2, name: t.journalLabel, item: `${base}/blog` },
              { "@type": "ListItem", position: 3, name: post.title, item: url },
            ],
          },
        ]}
      />

      <PageHero
        eyebrow={post.category?.name || t.journalLabel}
        title={post.title}
        description={post.excerpt}
        breadcrumb={[{ label: t.journalLabel, href: "/blog" }, { label: post.title }]}
        homeLabel={t.home}
        image={post.featuredImage}
      />

      <article className="container-narrow py-14 lg:py-16">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 pb-5 text-xs text-muted-foreground">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <User className="size-3.5 text-accent" /> {authorName}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-3.5 text-accent" /> {formatDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-accent" /> {post.readingTime} {t.minutes}
            </span>
          </div>
          <ShareButtons url={url} title={post.title} />
        </div>

        <div className="mt-8">
          <Markdown content={post.content} />
        </div>

        {post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-border/70 pt-6">
            <Tag className="size-3.5 text-accent" />
            {post.tags.map((relation) => (
              <Link
                key={relation.tagId}
                href={`/blog?tag=${relation.tag.slug}`}
                className="border border-border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-accent/50 hover:text-primary"
              >
                #{tagNames.get(relation.tagId) || relation.tag.name}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-col gap-4 border border-border/70 bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[0.62rem] font-semibold tracking-[0.14em] text-accent uppercase">{t.writtenBy}</p>
            <p className="mt-1 font-display text-lg text-primary">{authorName}</p>
            {post.author?.bio && <p className="mt-1 max-w-lg text-sm text-muted-foreground">{post.author.bio}</p>}
          </div>
          <Link
            href="/blog"
            className="inline-flex shrink-0 items-center gap-2 text-xs font-medium text-primary hover:text-accent"
          >
            <ArrowLeft className="size-3.5 rtl:rotate-180" /> {t.backToJournal}
          </Link>
        </div>
      </article>

      {relatedView.length > 0 && (
        <section className="border-t border-border/70 bg-card/50">
          <div className="container-x py-16 lg:py-20">
            <SectionHeading
              eyebrow={t.continueReading}
              title={t.relatedArticles}
              linkHref="/blog"
              linkLabel={t.allArticles}
            />
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {relatedView.map((item) => (
                <BlogCard key={item.id} post={item} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

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
