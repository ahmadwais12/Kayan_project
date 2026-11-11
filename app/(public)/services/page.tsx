import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { getLocale } from "@/lib/i18n/server";
import { localizeCategoryNames, withTranslations } from "@/lib/i18n/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { PageHero } from "@/components/public/page-hero";
import { ServiceCard } from "@/components/public/service-card";
import { CtaBand } from "@/components/public/cta-band";
import { EmptyState } from "@/components/public/empty-state";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const section = await prisma.homepageSection.findUnique({ where: { key: "services" } });
  const [localized] = section
    ? await withTranslations("homepage", [section], locale, ["title", "subtitle", "description"])
    : [];
  return buildMetadata({
    title: localized?.title || t.services,
    description: localized?.description || t.whatWeDo,
    path: "/services",
  });
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale);
  const activeCategory = (query.category || "").trim();

  const [categoriesRaw, servicesRaw, ctaRaw, introRaw] = await Promise.all([
    prisma.serviceCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: {
          select: { services: { where: { isPublished: true, deletedAt: null } } },
        },
      },
    }),
    prisma.service.findMany({
      where: {
        isPublished: true,
        deletedAt: null,
        ...(activeCategory ? { category: { slug: activeCategory } } : {}),
      },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      include: { category: true },
    }),
    prisma.homepageSection.findUnique({ where: { key: "cta" } }),
    prisma.homepageSection.findUnique({ where: { key: "services" } }),
  ]);

  const sectionFields = ["title", "subtitle", "description", "buttonLabel", "secondaryLabel"];
  const [categories, services, ctaRows, introRows] = await Promise.all([
    withTranslations("serviceCategory", categoriesRaw, locale, ["name", "description"]),
    withTranslations("service", servicesRaw, locale, ["title", "shortDescription", "description"]).then((rows) =>
      localizeCategoryNames("serviceCategory", rows, locale),
    ),
    ctaRaw ? withTranslations("homepage", [ctaRaw], locale, sectionFields) : Promise.resolve([]),
    introRaw ? withTranslations("homepage", [introRaw], locale, sectionFields) : Promise.resolve([]),
  ]);
  const cta = ctaRows[0] || null;
  const intro = introRows[0] || null;

  const visibleCategories = categories.filter((category) => category._count.services > 0);
  const active = visibleCategories.find((category) => category.slug === activeCategory);

  return (
    <>
      <PageHero
        eyebrow={intro?.subtitle || t.whatWeDo}
        title={intro?.title || t.services}
        description={intro?.description || undefined}
        breadcrumb={[{ label: t.services }]}
        homeLabel={t.home}
        compact
      />

      <section className="container-x py-16 lg:py-20">
        {visibleCategories.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2">
            <Link
              href="/services"
              className={cn(
                "border px-4 py-2 text-xs font-medium transition-colors",
                !active
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary",
              )}
            >
              {t.allServices} <span className="ms-1 opacity-60">{visibleCategories.reduce((sum, category) => sum + category._count.services, 0)}</span>
            </Link>
            {visibleCategories.map((category) => (
              <Link
                key={category.id}
                href={`/services?category=${category.slug}`}
                className={cn(
                  "border px-4 py-2 text-xs font-medium transition-colors",
                  active?.id === category.id
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary",
                )}
              >
                {category.name} <span className="ms-1 opacity-60">{category._count.services}</span>
              </Link>
            ))}
          </div>
        )}

        {active?.description && (
          <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">{active.description}</p>
        )}

        {services.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} index={index} locale={locale} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={t.servicesEmptyTitle}
            description={t.servicesEmptyDescription}
          />
        )}
      </section>

      <CtaBand
        eyebrow={cta?.subtitle || t.nextStep}
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
