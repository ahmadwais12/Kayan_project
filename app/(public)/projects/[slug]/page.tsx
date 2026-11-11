import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  Download,
  MapPin,
  QrCode,
  Ruler,
  Tag,
  Wallet,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buildMetadata, JsonLd } from "@/lib/seo";
import { getLocale } from "@/lib/i18n/server";
import { getLocalizedSettings, localizeCategoryNames, withTranslations } from "@/lib/i18n/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { Markdown } from "@/components/public/markdown";
import { GalleryLightbox } from "@/components/public/gallery-lightbox";
import { BeforeAfter } from "@/components/public/before-after";
import { ProjectCard } from "@/components/public/project-card";
import { CtaBand } from "@/components/public/cta-band";
import { SectionHeading } from "@/components/public/section-heading";
import { SmartImage } from "@/components/public/smart-image";
import { PreviewBanner } from "@/components/public/preview-banner";
import { isPreviewRequest } from "@/lib/preview";
import { inquiryStatusLabel } from "@/lib/utils";

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
  const preview = await isPreviewRequest(query, "projects.manage");
  const project = await prisma.project.findFirst({
    where: { slug, deletedAt: null, ...(preview ? {} : { isPublished: true }) },
  });
  if (!project) return buildMetadata({ title: "Project not found", noindex: true });
  const [localized] = await withTranslations("project", [project], locale, ["title", "description"]);
  return buildMetadata({
    title: project.seoTitle || localized.title,
    description: project.seoDescription || localized.description.slice(0, 300),
    image: project.ogImage || project.coverImage,
    path: `/projects/${project.slug}`,
    noindex: preview,
  });
}

export default async function ProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const locale = await getLocale();
  const t = getDictionary(locale);
  const preview = await isPreviewRequest(query, "projects.manage");
  const project = await prisma.project.findFirst({
    where: { slug, deletedAt: null, ...(preview ? {} : { isPublished: true }) },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      specifications: { orderBy: { sortOrder: "asc" } },
      features: { orderBy: { sortOrder: "asc" } },
      videos: { orderBy: { sortOrder: "asc" } },
      tags: { include: { tag: true } },
    },
  });
  if (!project) notFound();

  const [settings, relatedRaw, ctaRaw] = await Promise.all([
    getLocalizedSettings(),
    prisma.project.findMany({
      where: {
        isPublished: true,
        deletedAt: null,
        id: { not: project.id },
        ...(project.categoryId ? { categoryId: project.categoryId } : {}),
      },
      orderBy: [{ sortOrder: "asc" }],
      take: 3,
      include: { category: true },
    }),
    prisma.homepageSection.findUnique({ where: { key: "cta" } }),
  ]);

  const sectionFields = ["title", "subtitle", "description", "buttonLabel", "secondaryLabel"];
  const [projectCopy, categoryCopy, related, ctaRows] = await Promise.all([
    withTranslations("project", [project], locale, [
      "title",
      "location",
      "description",
      "challenges",
      "solutions",
      "architecturalDetails",
      "constructionDetails",
    ]),
    withTranslations("projectCategory", [project.category], locale, ["name", "description"]),
    withTranslations("project", relatedRaw, locale, ["title", "location", "description"]),
    ctaRaw ? withTranslations("homepage", [ctaRaw], locale, sectionFields) : Promise.resolve([]),
  ]);
  Object.assign(project, projectCopy[0]);
  project.category.name = categoryCopy[0].name;
  const cta = ctaRows[0] || null;

  const [localizedFeatures, localizedSpecifications, localizedTags, localizedRelated] = await Promise.all([
    withTranslations("projectFeature", project.features, locale, ["title", "description"]),
    withTranslations("projectSpecification", project.specifications, locale, ["label", "value"]),
    withTranslations("projectTag", project.tags.map((relation) => relation.tag), locale, ["name"]),
    localizeCategoryNames("projectCategory", related, locale),
  ]);
  const tagNames = new Map(localizedTags.map((tag) => [tag.id, tag.name]));

  const gallery = project.images.map((image) => ({
    url: image.url,
    alt: image.alt || project.title,
    caption: image.caption,
  }));

  const statusLabel =
    {
      PLANNING: t.statusPlanning,
      IN_PROGRESS: t.statusInProgress,
      COMPLETED: t.statusCompleted,
      ON_HOLD: t.statusOnHold,
    }[project.status] || inquiryStatusLabel(project.status);

  const meta = [
    { icon: MapPin, label: t.location, value: project.location },
    { icon: CalendarDays, label: t.year, value: project.year },
    { icon: Ruler, label: t.status, value: statusLabel },
    ...(project.duration ? [{ icon: CalendarDays, label: t.duration, value: project.duration }] : []),
    ...(project.budget ? [{ icon: Wallet, label: t.budget, value: project.budget }] : []),
  ];

  const base = process.env.APP_URL || "http://localhost:3333";
  const narratives = [
    { title: t.challenge, content: project.challenges },
    { title: t.approach, content: project.solutions },
    { title: t.architecturalDetails, content: project.architecturalDetails },
    { title: t.constructionDetails, content: project.constructionDetails },
  ].filter((item) => item.content);

  return (
    <>
      {preview && <PreviewBanner editHref={`/admin/projects/${project.id}`} label={project.title} />}
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            name: project.title,
            description: project.description.slice(0, 500),
            url: `${base}/projects/${project.slug}`,
            ...(project.coverImage
              ? { image: project.coverImage.startsWith("http") ? project.coverImage : `${base}${project.coverImage}` }
              : {}),
            ...(project.year ? { dateCreated: project.year } : {}),
            creator: {
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
              { "@type": "ListItem", position: 2, name: t.projects, item: `${base}/projects` },
              { "@type": "ListItem", position: 3, name: project.title, item: `${base}/projects/${project.slug}` },
            ],
          },
        ]}
      />

      <section className="relative overflow-hidden bg-primary text-white">
        <SmartImage
          src={project.coverImage}
          alt=""
          sizes="100vw"
          priority
          className="opacity-55"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/35" />
        <div className="paper-grain absolute inset-0 opacity-20" aria-hidden="true" />

        <div className="container-x relative flex min-h-[58vh] flex-col py-8 lg:min-h-[66vh] lg:py-10">
          <nav
            className="flex flex-wrap items-center gap-1 text-[0.68rem] text-white/45"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="hover:text-white">
              {t.home}
            </Link>
            <ChevronRight className="size-3 rtl:rotate-180" />
            <Link href="/projects" className="hover:text-white">
              {t.projects}
            </Link>
            <ChevronRight className="size-3 rtl:rotate-180" />
            <span className="text-white/70">{project.title}</span>
          </nav>

          <div className="mt-auto max-w-4xl pt-24">
            <p className="eyebrow text-accent">{project.category.name}</p>
            <h1 className="mt-5 text-[clamp(2.4rem,5.5vw,4.8rem)] leading-[1.0] text-white">
              {project.title}
            </h1>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.66rem] font-semibold tracking-[0.14em] text-white/55 uppercase">
              {project.location && (
                <span className="flex items-center gap-2">
                  <MapPin className="size-3.5 text-accent" /> {project.location}
                </span>
              )}
              {project.year && (
                <span className="flex items-center gap-2">
                  <CalendarDays className="size-3.5 text-accent" /> {project.year}
                </span>
              )}
              <span className="flex items-center gap-2">
                <Ruler className="size-3.5 text-accent" /> {statusLabel}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/70 bg-card/60">
        <div className="container-x py-8">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-5">
            {meta.map((item) => (
              <div key={item.label} className="border-t border-border/70 pt-4">
                <dt className="flex items-center gap-2 text-[0.58rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                  <item.icon className="size-3.5 text-accent" /> {item.label}
                </dt>
                <dd className="mt-2 font-display text-base text-primary">{item.value || "—"}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="container-x py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr] lg:gap-16">
          <div>
            <Markdown content={project.description} />

            {narratives.length > 0 && (
              <div
                className="mt-14 space-y-9"
                data-card-type="PROJECT_PART"
                data-card-id={`${project.id}:story`}
                data-card-title={`${project.title} — Project story`}
              >
                {narratives.map((block, index) => (
                  <div key={block.title} className="border-t border-border/70 pt-6">
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-xs tracking-[0.16em] text-accent">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h2 className="font-display text-xl text-primary">{block.title}</h2>
                    </div>
                    <div className="mt-3 pl-8 text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                      {block.content}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {gallery.length > 0 && (
              <div
                className="mt-14 border-t border-border/70 pt-8"
                data-card-type="PROJECT_PART"
                data-card-id={`${project.id}:gallery`}
                data-card-title={`${project.title} — Gallery`}
              >
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="eyebrow">{t.gallery}</p>
                    <h2 className="mt-3 font-display text-2xl text-primary">{t.projectGallery}</h2>
                  </div>
                  <span className="text-[0.6rem] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                    {gallery.length} {gallery.length === 1 ? t.imageLabel : t.imagesLabel}
                  </span>
                </div>
                <div className="mt-6">
                  <GalleryLightbox images={gallery} />
                </div>
              </div>
            )}

            {project.showBeforeAfter && project.beforeImage && project.afterImage && (
              <div
                className="mt-14 border-t border-border/70 pt-8"
                data-card-type="PROJECT_PART"
                data-card-id={`${project.id}:before-after`}
                data-card-title={`${project.title} — Before & after`}
              >
                <h2 className="font-display text-2xl text-primary">{t.beforeAfter}</h2>
                <div className="mt-5">
                  <BeforeAfter
                    before={project.beforeImage}
                    after={project.afterImage}
                    beforeLabel={t.beforeLabel}
                    afterLabel={t.afterLabel}
                    compareHint={t.compareHint}
                  />
                </div>
              </div>
            )}

            {project.videos.length > 0 && (
              <div
                className="mt-14 border-t border-border/70 pt-8"
                data-card-type="PROJECT_PART"
                data-card-id={`${project.id}:film`}
                data-card-title={`${project.title} — Project film`}
              >
                <h2 className="font-display text-2xl text-primary">{t.projectFilm}</h2>
                <div className="mt-4 space-y-3">
                  {project.videos.map((video) => (
                    <a
                      key={video.id}
                      href={video.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between border border-border/70 bg-card px-4 py-3.5 text-sm text-primary transition-colors hover:border-accent/60"
                    >
                      <span>{video.title || t.watchFilm}</span>
                      <span className="flex items-center gap-2 text-xs text-muted-foreground">
                        {video.type}
                        <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            {localizedFeatures.length > 0 && (
              <div
                className="border border-border/80 bg-card p-6"
                data-card-type="PROJECT_PART"
                data-card-id={`${project.id}:features`}
                data-card-title={`${project.title} — Features`}
              >
                <h2 className="font-display text-lg text-primary">{t.projectFeatures}</h2>
                <ul className="mt-4 space-y-2.5">
                  {localizedFeatures.map((feature) => (
                    <li key={feature.id} className="flex items-start gap-2.5 text-sm text-foreground/80">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-accent" />
                      {feature.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {localizedSpecifications.length > 0 && (
              <div
                className="border border-border/80 bg-card p-6"
                data-card-type="PROJECT_PART"
                data-card-id={`${project.id}:specifications`}
                data-card-title={`${project.title} — Specifications`}
              >
                <h2 className="font-display text-lg text-primary">{t.specifications}</h2>
                <dl className="mt-4 divide-y divide-border/60">
                  {localizedSpecifications.map((spec) => (
                    <div key={spec.id} className="flex items-start justify-between gap-4 py-2.5 text-sm">
                      <dt className="text-muted-foreground">{spec.label}</dt>
                      <dd className="text-right text-primary">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {project.tags.length > 0 && (
              <div className="border border-border/80 bg-card p-6">
                <h2 className="flex items-center gap-2 font-display text-lg text-primary">
                  <Tag className="size-4 text-accent" /> {t.tags}
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {project.tags.map((relation) => (
                    <span key={relation.tagId} className="border border-border px-2.5 py-1 text-xs text-muted-foreground">
                      {tagNames.get(relation.tagId) || relation.tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="border border-border/80 bg-primary p-6 text-white">
              <p className="eyebrow text-accent">{t.startProject}</p>
              <h2 className="mt-3 font-display text-xl text-white">{t.planningSimilar}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/55">
                {t.quotePrompt}
              </p>
              <Link
                href="/quote"
                className="btn-shine mt-5 inline-flex w-full items-center justify-center gap-2 bg-accent px-5 py-3 text-[0.7rem] font-semibold tracking-[0.12em] text-primary uppercase hover:bg-accent/85"
              >
                {t.requestQuote} <ArrowUpRight className="size-3.5 rtl:-scale-x-100" />
              </Link>
            </div>

            <div
              className="border border-border/80 bg-card p-6"
              data-card-type="PROJECT_PART"
              data-card-id={`${project.id}:qr`}
              data-card-title={`${project.title} — QR code`}
            >
              <h2 className="flex items-center gap-2 font-display text-lg text-primary">
                <QrCode className="size-4 text-accent" /> {t.scanProject}
              </h2>
              <div className="mt-4 flex items-start gap-4">
                <div className="shrink-0 border border-border bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/projects/${project.slug}/qr`}
                    alt={`QR code linking to ${project.title}`}
                    width={128}
                    height={128}
                    className="size-32"
                    loading="lazy"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t.projectQrPrompt}
                  </p>
                  <p className="mt-3 truncate font-mono text-[0.62rem] text-muted-foreground/80">
                    {base.replace(/^https?:\/\//, "")}/projects/{project.slug}
                  </p>
                  <a
                    href={`/projects/${project.slug}/qr?download=1`}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-accent"
                  >
                    <Download className="size-3.5" /> {t.downloadQr}
                  </a>
                </div>
              </div>
            </div>

            <Link
              href="/projects"
              className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="size-3.5 rtl:rotate-180" /> {t.allProjects}
            </Link>
          </aside>
        </div>
      </section>

      {localizedRelated.length > 0 && (
        <section className="border-t border-border/70 bg-card/50">
          <div className="container-x py-16 lg:py-20">
            <SectionHeading eyebrow={t.continueLabel} title={t.relatedProjects} linkHref="/projects" linkLabel={t.allProjects} />
            <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {localizedRelated.map((item, index) => (
                <ProjectCard key={item.id} project={item} index={index + 1} locale={locale} />
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
