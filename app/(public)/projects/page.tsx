import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { getLocale } from "@/lib/i18n/server";
import { withTranslations } from "@/lib/i18n/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { ProjectBrowser } from "@/components/public/project-browser";
import { CtaBand } from "@/components/public/cta-band";
import { EmptyState } from "@/components/public/empty-state";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 9;

export async function generateMetadata() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const section = await prisma.homepageSection.findUnique({ where: { key: "projects" } });
  const [localized] = section
    ? await withTranslations("homepage", [section], locale, ["title", "subtitle", "description"])
    : [];
  return buildMetadata({
    title: localized?.title || t.projects,
    description: localized?.description || t.portfolio,
    path: "/projects",
  });
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale);
  const category = (query.category || "").trim();
  const q = (query.q || "").trim();
  const page = Math.max(1, Number(query.page) || 1);

  const where: Prisma.ProjectWhereInput = {
    isPublished: true,
    deletedAt: null,
    ...(category ? { category: { slug: category } } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q } },
            { location: { contains: q } },
            { description: { contains: q } },
          ],
        }
      : {}),
  };

  const [categories, projects, total, totalAll, ctaRaw, portfolioRaw] = await Promise.all([
    prisma.projectCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { projects: { where: { isPublished: true, deletedAt: null } } } },
      },
    }),
    prisma.project.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { category: true },
    }),
    prisma.project.count({ where }),
    prisma.project.count({ where: { isPublished: true, deletedAt: null } }),
    prisma.homepageSection.findUnique({ where: { key: "cta" } }),
    prisma.homepageSection.findUnique({ where: { key: "projects" } }),
  ]);

  const sectionFields = ["title", "subtitle", "description", "buttonLabel", "secondaryLabel"];
  const [localizedCategories, localizedProjects, cta, portfolio] = await Promise.all([
    withTranslations("projectCategory", categories, locale, ["name", "description"]),
    withTranslations("project", projects, locale, ["title", "location", "description"]),
    ctaRaw ? withTranslations("homepage", [ctaRaw], locale, sectionFields).then((rows) => rows[0]) : null,
    portfolioRaw ? withTranslations("homepage", [portfolioRaw], locale, sectionFields).then((rows) => rows[0]) : null,
  ]);
  const categoryNames = new Map(localizedCategories.map((item) => [item.id, item.name]));

  const visibleCategories = localizedCategories.filter((item) => item._count.projects > 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const filterClass = (active: boolean) =>
    cn(
      "relative inline-flex items-baseline pb-1 text-[0.7rem] font-semibold tracking-[0.14em] uppercase transition-colors",
      active ? "text-primary" : "text-muted-foreground hover:text-primary",
    );
  const filterUnderline = (active: boolean) =>
    cn(
      "absolute inset-x-0 -bottom-1 h-px origin-left bg-accent transition-transform duration-300",
      active ? "scale-x-100" : "scale-x-0",
    );

  function pageHref(target: number) {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    if (target > 1) params.set("page", String(target));
    const string = params.toString();
    return string ? `/projects?${string}` : "/projects";
  }

  return (
    <>
      <section className="relative overflow-hidden bg-primary text-white">
        <div className="paper-grain absolute inset-0 opacity-25" aria-hidden="true" />
        <div className="container-x relative py-14 lg:py-20">
          <nav
            className="flex flex-wrap items-center gap-1 text-[0.68rem] text-white/45"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-white">
              {t.home}
            </Link>
            <ChevronRight className="size-3 rtl:rotate-180" />
            <span className="text-white/70">{t.projects}</span>
          </nav>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
            <div>
              <p className="eyebrow text-accent">{portfolio?.subtitle || t.portfolio}</p>
              <h1 className="mt-5 max-w-3xl text-[clamp(2.6rem,6vw,5rem)] leading-[0.98] text-white">
                {portfolio?.title || t.projects}
              </h1>
              {portfolio?.description && (
                <p className="mt-6 max-w-xl text-[0.98rem] leading-relaxed text-white/60">
                  {portfolio.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6 border-t border-white/15 pt-6 lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0">
              <div>
                <p className="font-display text-3xl text-white">
                  {String(totalAll).padStart(2, "0")}
                </p>
                <p className="mt-1.5 text-[0.6rem] font-semibold tracking-[0.16em] text-white/40 uppercase">
                  {t.publishedProjects}
                </p>
              </div>
              <div>
                <p className="font-display text-3xl text-white">
                  {String(visibleCategories.length).padStart(2, "0")}
                </p>
                <p className="mt-1.5 text-[0.6rem] font-semibold tracking-[0.16em] text-white/40 uppercase">
                  {t.projectTypes}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-x py-12 lg:py-16">
        <div className="mb-10 flex flex-col gap-6 border-b border-border/70 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
            <Link
              href={q ? `/projects?q=${encodeURIComponent(q)}` : "/projects"}
              className={filterClass(!category)}
            >
              {t.allProjects}
              <span
                className={cn(
                  "ms-1.5 text-[0.6rem] tracking-normal",
                  category ? "text-muted-foreground/60" : "text-accent",
                )}
              >
                {totalAll}
              </span>
              <span className={filterUnderline(!category)} />
            </Link>
            {visibleCategories.map((item) => {
              const params = new URLSearchParams({ category: item.slug });
              if (q) params.set("q", q);
              return (
                <Link
                  key={item.id}
                  href={`/projects?${params.toString()}`}
                  className={filterClass(category === item.slug)}
                >
                  {item.name}
                  <span
                    className={cn(
                      "ms-1.5 text-[0.6rem] tracking-normal",
                      category === item.slug ? "text-accent" : "text-muted-foreground/60",
                    )}
                  >
                    {item._count.projects}
                  </span>
                  <span className={filterUnderline(category === item.slug)} />
                </Link>
              );
            })}
          </div>

          <form
            method="get"
            className="flex w-full max-w-xs items-center gap-2 border-b border-border pb-2"
          >
            {category && <input type="hidden" name="category" value={category} />}
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              name="q"
              defaultValue={q}
              placeholder={t.searchProjects}
              className="h-8 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
            />
            <button
              type="submit"
              aria-label={t.searchProjects}
              className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
            >
              <ArrowRight className="size-4 rtl:rotate-180" />
            </button>
          </form>
        </div>

        {projects.length > 0 ? (
          <>
            <ProjectBrowser
              projects={localizedProjects.map((project) => ({
                id: project.id,
                title: project.title,
                slug: project.slug,
                coverImage: project.coverImage,
                location: project.location,
                year: project.year,
                category: project.category
                  ? { name: categoryNames.get(project.category.id) || project.category.name }
                  : null,
              }))}
              locale={locale}
            />

            {totalPages > 1 && (
              <nav
                className="mt-14 flex items-center justify-center gap-6 border-t border-border/70 pt-7"
                aria-label="Pagination"
              >
                {page > 1 ? (
                  <Link
                    href={pageHref(page - 1)}
                    className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:text-primary"
                  >
                    <ChevronLeft className="size-3.5 rtl:rotate-180" /> {t.previous}
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold tracking-[0.14em] text-muted-foreground/35 uppercase">
                    <ChevronLeft className="size-3.5 rtl:rotate-180" /> {t.previous}
                  </span>
                )}

                <div className="flex items-center gap-1.5">
                  {Array.from({ length: totalPages }).map((_, index) => {
                    const target = index + 1;
                    return (
                      <Link
                        key={target}
                        href={pageHref(target)}
                        aria-current={target === page ? "page" : undefined}
                        className={cn(
                          "grid size-9 place-items-center border text-xs font-medium transition-colors",
                          target === page
                            ? "border-primary bg-primary text-white"
                            : "border-border bg-card text-muted-foreground hover:border-accent hover:text-primary",
                        )}
                      >
                        {target}
                      </Link>
                    );
                  })}
                </div>

                {page < totalPages ? (
                  <Link
                    href={pageHref(page + 1)}
                    className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase transition-colors hover:text-primary"
                  >
                    {t.next} <ChevronRight className="size-3.5 rtl:rotate-180" />
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold tracking-[0.14em] text-muted-foreground/35 uppercase">
                    {t.next} <ChevronRight className="size-3.5 rtl:rotate-180" />
                  </span>
                )}
              </nav>
            )}
          </>
        ) : (
          <EmptyState
            title={t.emptyProjectsTitle}
            description={q || category ? t.projectsEmptyFilterDesc : t.projectsEmptyDesc}
            action={
              q || category ? (
                <Link href="/projects" className="text-sm font-medium text-accent hover:underline">
                  {t.clearFilters}
                </Link>
              ) : undefined
            }
          />
        )}

        <p className="mt-6 text-[0.62rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          {total} {total === 1 ? t.projectInView : t.projectsInView}
        </p>
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
