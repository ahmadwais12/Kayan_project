import Link from "next/link";
import { Search } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { getLocale } from "@/lib/i18n/server";
import { withTranslations } from "@/lib/i18n/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { PageHero } from "@/components/public/page-hero";
import { BlogCard } from "@/components/public/blog-card";
import { EmptyState } from "@/components/public/empty-state";
import { CtaBand } from "@/components/public/cta-band";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 9;

export async function generateMetadata() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const section = await prisma.homepageSection.findUnique({ where: { key: "blog" } });
  const [localized] = section
    ? await withTranslations("homepage", [section], locale, ["title", "subtitle", "description"])
    : [];
  return buildMetadata({
    title: localized?.title || t.journalLabel,
    description: localized?.description || t.notesFromStudio,
    path: "/blog",
  });
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale);
  const category = (query.category || "").trim();
  const tag = (query.tag || "").trim();
  const q = (query.q || "").trim();
  const page = Math.max(1, Number(query.page) || 1);
  const now = new Date();

  const where: Prisma.BlogPostWhereInput = {
    status: "PUBLISHED",
    publishedAt: { lte: now },
    deletedAt: null,
    ...(category ? { category: { slug: category } } : {}),
    ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { excerpt: { contains: q } },
            { content: { contains: q } },
          ],
        }
      : {}),
  };

  const [categoriesRaw, tags, postsRaw, total, ctaRaw, introRaw] = await Promise.all([
    prisma.blogCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: {
            posts: { where: { status: "PUBLISHED", publishedAt: { lte: now }, deletedAt: null } },
          },
        },
      },
    }),
    prisma.blogTag.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: {
            posts: { where: { post: { status: "PUBLISHED", publishedAt: { lte: now }, deletedAt: null } } },
          },
        },
      },
    }),
    prisma.blogPost.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { category: true, author: true },
    }),
    prisma.blogPost.count({ where }),
    prisma.homepageSection.findUnique({ where: { key: "cta" } }),
    prisma.homepageSection.findUnique({ where: { key: "blog" } }),
  ]);

  const sectionFields = ["title", "subtitle", "description", "buttonLabel", "secondaryLabel"];
  const [categories, posts, ctaRows, introRows, localizedTags] = await Promise.all([
    withTranslations("blogCategory", categoriesRaw, locale, ["name", "description"]),
    withTranslations("blog", postsRaw, locale, ["title", "excerpt", "content"]),
    ctaRaw ? withTranslations("homepage", [ctaRaw], locale, sectionFields) : Promise.resolve([]),
    introRaw ? withTranslations("homepage", [introRaw], locale, sectionFields) : Promise.resolve([]),
    withTranslations("blogTag", tags, locale, ["name"]),
  ]);
  const cta = ctaRows[0] || null;
  const intro = introRows[0] || null;

  const visibleCategories = categories.filter((item) => item._count.posts > 0);
  const visibleTags = localizedTags.filter((item) => item._count.posts > 0).slice(0, 12);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const categoryNames = new Map(categories.map((item) => [item.id, item.name]));
  const postsView = posts.map((post) =>
    post.category
      ? {
          ...post,
          category: { ...post.category, name: categoryNames.get(post.category.id) || post.category.name },
        }
      : post,
  );

  function pageHref(target: number) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (tag) params.set("tag", tag);
    if (q) params.set("q", q);
    if (target > 1) params.set("page", String(target));
    const string = params.toString();
    return string ? `/blog?${string}` : "/blog";
  }

  return (
    <>
      <PageHero
        eyebrow={intro?.subtitle || t.journalLabel}
        title={intro?.title || t.notesFromStudio}
        description={intro?.description || undefined}
        breadcrumb={[{ label: t.journalLabel }]}
        homeLabel={t.home}
        compact
      />

      <section className="container-x py-16 lg:py-20">
        <div className="mb-10 flex flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              <Link
                href={q ? `/blog?q=${encodeURIComponent(q)}` : "/blog"}
                className={cn(
                  "border px-4 py-2 text-xs font-medium transition-colors",
                  !category && !tag
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary",
                )}
              >
                {t.allArticles}
              </Link>
              {visibleCategories.map((item) => {
                const params = new URLSearchParams({ category: item.slug });
                if (q) params.set("q", q);
                return (
                  <Link
                    key={item.id}
                    href={`/blog?${params.toString()}`}
                    className={cn(
                      "border px-4 py-2 text-xs font-medium transition-colors",
                      category === item.slug
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary",
                    )}
                  >
                    {item.name} <span className="ms-1 opacity-60">{item._count.posts}</span>
                  </Link>
                );
              })}
            </div>

            <form method="get" className="flex w-full max-w-sm">
              {category && <input type="hidden" name="category" value={category} />}
              {tag && <input type="hidden" name="tag" value={tag} />}
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  name="q"
                  defaultValue={q}
                  placeholder={t.search}
                  className="h-10 w-full border border-input bg-card ps-9 pe-3 text-sm outline-none transition-colors focus:border-accent"
                />
              </div>
              <button
                type="submit"
                className="h-10 shrink-0 bg-primary px-4 text-[0.68rem] font-semibold tracking-[0.1em] text-white uppercase hover:bg-primary/90"
              >
                {t.search}
              </button>
            </form>
          </div>

          {visibleTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[0.62rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase">{t.topics}</span>
              {visibleTags.map((item) => (
                <Link
                  key={item.id}
                  href={`/blog?tag=${item.slug}`}
                  className={cn(
                    "border px-2.5 py-1 transition-colors",
                    tag === item.slug
                      ? "border-accent bg-accent/15 text-primary"
                      : "border-border text-muted-foreground hover:border-accent/50 hover:text-primary",
                  )}
                >
                  #{item.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {posts.length > 0 ? (
          <>
            <div className="grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {postsView.map((post) => (
                <BlogCard key={post.id} post={post} locale={locale} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
                {Array.from({ length: totalPages }).map((_, index) => {
                  const target = index + 1;
                  return (
                    <Link
                      key={target}
                      href={pageHref(target)}
                      className={cn(
                        "grid size-9 place-items-center border text-xs font-medium",
                        target === page
                          ? "border-primary bg-primary text-white"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary",
                      )}
                    >
                      {target}
                    </Link>
                  );
                })}
              </nav>
            )}
          </>
        ) : (
          <EmptyState
            title={t.emptyArticlesTitle}
            description={
              q || category || tag ? t.blogEmptyFilterDesc : t.blogEmptyDesc
            }
            action={
              q || category || tag ? (
                <Link href="/blog" className="text-sm font-medium text-accent hover:underline">
                  {t.clearFilters}
                </Link>
              ) : undefined
            }
          />
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
