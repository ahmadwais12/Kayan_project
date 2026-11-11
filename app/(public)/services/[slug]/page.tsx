import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, MessageSquare, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buildMetadata, JsonLd } from "@/lib/seo";
import { getLocale } from "@/lib/i18n/server";
import { getLocalizedSettings, localizeCategoryNames, withTranslations } from "@/lib/i18n/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { PageHero } from "@/components/public/page-hero";
import { Markdown } from "@/components/public/markdown";
import { GalleryLightbox } from "@/components/public/gallery-lightbox";
import { FaqList } from "@/components/public/faq-list";
import { CtaBand } from "@/components/public/cta-band";
import { ServiceCard } from "@/components/public/service-card";
import { SectionHeading } from "@/components/public/section-heading";
import { PreviewBanner } from "@/components/public/preview-banner";
import { isPreviewRequest } from "@/lib/preview";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const locale = await getLocale();
  const preview = await isPreviewRequest(query, "services.manage");
  const service = await prisma.service.findFirst({
    where: { slug, deletedAt: null, ...(preview ? {} : { isPublished: true }) },
  });
  if (!service) return buildMetadata({ title: "Service not found", noindex: true });
  const [localized] = await withTranslations("service", [service], locale, ["title", "shortDescription"]);
  return buildMetadata({
    title: service.seoTitle || localized.title,
    description: service.seoDescription || localized.shortDescription,
    image: service.ogImage || service.mainImage,
    path: `/services/${service.slug}`,
    noindex: preview,
  });
}

export default async function ServiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const locale = await getLocale();
  const t = getDictionary(locale);
  const preview = await isPreviewRequest(query, "services.manage");
  const service = await prisma.service.findFirst({
    where: { slug, deletedAt: null, ...(preview ? {} : { isPublished: true }) },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      features: { orderBy: { sortOrder: "asc" } },
      faqs: { orderBy: { sortOrder: "asc" } },
    },
  });
  if (!service) notFound();

  const [settings, relatedRaw, ctaRaw] = await Promise.all([
    getLocalizedSettings(),
    prisma.service.findMany({
      where: {
        isPublished: true,
        deletedAt: null,
        id: { not: service.id },
        ...(service.categoryId ? { categoryId: service.categoryId } : {}),
      },
      orderBy: [{ sortOrder: "asc" }],
      take: 3,
      include: { category: true },
    }),
    prisma.homepageSection.findUnique({ where: { key: "cta" } }),
  ]);

  const sectionFields = ["title", "subtitle", "description", "buttonLabel", "secondaryLabel"];
  const [serviceCopy, categoryCopy, related, ctaRows] = await Promise.all([
    withTranslations("service", [service], locale, [
      "title",
      "shortDescription",
      "description",
      "seoTitle",
      "seoDescription",
    ]),
    service.category
      ? withTranslations("serviceCategory", [service.category], locale, ["name", "description"])
      : Promise.resolve([]),
    withTranslations("service", relatedRaw, locale, ["title", "shortDescription"]),
    ctaRaw ? withTranslations("homepage", [ctaRaw], locale, sectionFields) : Promise.resolve([]),
  ]);
  Object.assign(service, serviceCopy[0]);
  if (service.category && categoryCopy[0]) service.category.name = categoryCopy[0].name;
  const cta = ctaRows[0] || null;

  const [localizedFeatures, localizedFaqs, localizedRelated] = await Promise.all([
    withTranslations("serviceFeature", service.features, locale, ["title", "description"]),
    withTranslations("serviceFAQ", service.faqs, locale, ["question", "answer"]),
    localizeCategoryNames("serviceCategory", related, locale),
  ]);

  const gallery = service.images.length
    ? service.images.map((image) => ({
        url: image.url,
        alt: image.alt || service.title,
        caption: image.alt,
      }))
    : service.mainImage
      ? [{ url: service.mainImage, alt: service.title, caption: null }]
      : [];

  const base = process.env.APP_URL || "http://localhost:3333";

  return (
    <>
      {preview && <PreviewBanner editHref={`/admin/services/${service.id}`} label={service.title} />}
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: service.title,
            description: service.shortDescription,
            url: `${base}/services/${service.slug}`,
            ...(service.category ? { category: service.category.name } : {}),
            provider: {
              "@type": "Organization",
              name: settings.siteLegalName || settings.siteName,
              url: base,
            },
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: t.home, item: base },
              { "@type": "ListItem", position: 2, name: t.services, item: `${base}/services` },
              { "@type": "ListItem", position: 3, name: service.title, item: `${base}/services/${service.slug}` },
            ],
          },
        ]}
      />

      <PageHero
        eyebrow={service.category?.name || t.service}
        title={service.title}
        description={service.shortDescription}
        breadcrumb={[{ label: t.services, href: "/services" }, { label: service.title }]}
        homeLabel={t.home}
        image={service.mainImage}
        compact
      />

      <section className="container-x py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <div>
            <Markdown content={service.description} />

            {localizedFeatures.length > 0 && (
              <div className="mt-12">
                <h2 className="font-display text-2xl text-primary">{t.whatIncludes}</h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {localizedFeatures.map((feature) => (
                    <li key={feature.id} className="flex items-start gap-3 border border-border/70 bg-card p-4">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                      <div>
                        <p className="text-sm font-medium text-primary">{feature.title}</p>
                        {feature.description && (
                          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{feature.description}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {gallery.length > 0 && (
              <div className="mt-12">
                <h2 className="font-display text-2xl text-primary">{t.gallery}</h2>
                <div className="mt-5">
                  <GalleryLightbox images={gallery} columns={2} />
                </div>
              </div>
            )}

            {localizedFaqs.length > 0 && (
              <div className="mt-12">
                <h2 className="font-display text-2xl text-primary">{t.questions}</h2>
                <div className="mt-4">
                  <FaqList items={localizedFaqs.map((faq) => ({ id: faq.id, question: faq.question, answer: faq.answer }))} />
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-5">
            <div className="border border-border/80 bg-card p-6">
              <h2 className="font-display text-xl text-primary">{t.discussService}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t.discussPrompt}
              </p>
              <div className="mt-5 flex flex-col gap-2">
                <Link
                  href="/quote"
                  className="inline-flex items-center justify-center gap-2 bg-primary px-5 py-3 text-[0.7rem] font-semibold tracking-[0.12em] text-white uppercase transition-colors hover:bg-accent hover:text-primary"
                >
                  {t.requestQuote} <ArrowRight className="size-3.5 rtl:rotate-180" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 border border-primary/25 px-5 py-3 text-[0.7rem] font-semibold tracking-[0.12em] text-primary uppercase transition-colors hover:border-primary"
                >
                  <MessageSquare className="size-3.5" /> {t.contactStudio}
                </Link>
              </div>
              {settings.phone && (
                <a
                  href={`tel:${settings.phone.replace(/\s+/g, "")}`}
                  className="mt-4 flex items-center gap-2 text-xs text-muted-foreground hover:text-primary"
                >
                  <Phone className="size-3.5 text-accent" /> {settings.phone}
                </a>
              )}
            </div>

            {localizedRelated.length > 0 && (
              <div className="border border-border/80 bg-card p-6">
                <h2 className="font-display text-lg text-primary">{t.relatedServices}</h2>
                <ul className="mt-4 divide-y divide-border/60">
                  {localizedRelated.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/services/${item.slug}`}
                        className="group flex items-center justify-between gap-3 py-3 text-sm text-foreground/80 hover:text-primary"
                      >
                        <span>{item.title}</span>
                        <ArrowRight className="size-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>

      {localizedRelated.length > 0 && (
        <section className="border-t border-border/70 bg-card/50">
          <div className="container-x py-16 lg:py-20">
            <SectionHeading eyebrow={t.continueLabel} title={t.moreServices} linkHref="/services" linkLabel={t.allServices} />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {localizedRelated.map((item, index) => (
                <ServiceCard key={item.id} service={item} index={index} locale={locale} />
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
