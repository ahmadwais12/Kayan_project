import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { getLocale } from "@/lib/i18n/server";
import { withTranslations } from "@/lib/i18n/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { PageHero } from "@/components/public/page-hero";
import { TestimonialCarousel } from "@/components/public/testimonial-carousel";
import { EmptyState } from "@/components/public/empty-state";
import { CtaBand } from "@/components/public/cta-band";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const section = await prisma.homepageSection.findUnique({ where: { key: "testimonials" } });
  const [localized] = section
    ? await withTranslations("homepage", [section], locale, ["title", "subtitle", "description"])
    : [];
  return buildMetadata({
    title: localized?.title || t.testimonialsTitle,
    description: localized?.description || t.testimonialsDesc,
    path: "/testimonials",
  });
}

export default async function TestimonialsPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  const [rows, sectionRaw, ctaRaw] = await Promise.all([
    prisma.testimonial.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.homepageSection.findUnique({ where: { key: "testimonials" } }),
    prisma.homepageSection.findUnique({ where: { key: "cta" } }),
  ]);

  const fields = ["title", "subtitle", "description", "buttonLabel", "secondaryLabel"];
  const [sectionRows, ctaRows, localizedRows] = await Promise.all([
    sectionRaw ? withTranslations("homepage", [sectionRaw], locale, fields) : Promise.resolve([]),
    ctaRaw ? withTranslations("homepage", [ctaRaw], locale, fields) : Promise.resolve([]),
    withTranslations("testimonial", rows, locale, ["content", "clientTitle", "clientCompany"]),
  ]);
  const copy = sectionRows[0] || null;
  const cta = ctaRows[0] || null;

  return (
    <>
      <PageHero
        eyebrow={copy?.subtitle || t.testimonialsLabel}
        title={copy?.title || t.testimonialsTitle}
        description={copy?.description || t.testimonialsDesc}
        breadcrumb={[{ label: t.testimonialsLabel }]}
        homeLabel={t.home}
      />

      <section className="container-x py-16 lg:py-20">
        {localizedRows.length > 0 ? (
          <div className="mx-auto max-w-4xl">
            <TestimonialCarousel
              items={localizedRows.map((item) => ({
                id: item.id,
                content: item.content,
                clientName: item.clientName,
                clientTitle: item.clientTitle,
                clientCompany: item.clientCompany,
                photoUrl: item.photoUrl,
                rating: item.rating,
              }))}
              large
              autoplayMs={7000}
            />
          </div>
        ) : (
          <EmptyState title={t.testimonialsEmptyTitle} description={t.testimonialsEmptyDesc} />
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
