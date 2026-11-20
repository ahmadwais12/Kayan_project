import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Compass,
  Layers,
  Ruler,
  Sparkles,
  Trophy,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getLocale } from "@/lib/i18n/server";
import { getLocalizedSettings, localizeCategoryNames, withTranslations } from "@/lib/i18n/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { buildMetadata, JsonLd } from "@/lib/seo";
import { SectionHeading } from "@/components/public/section-heading";
import { Reveal } from "@/components/public/reveal";
import { SmartImage } from "@/components/public/smart-image";
import { ProjectCard } from "@/components/public/project-card";
import { ServiceCard } from "@/components/public/service-card";
import { BlogCard } from "@/components/public/blog-card";
import { CtaBand } from "@/components/public/cta-band";
import { CountUp } from "@/components/public/count-up";
import { ScrollCue } from "@/components/public/scroll-cue";
import { TestimonialCarousel } from "@/components/public/testimonial-carousel";
import { VideoShowcase } from "@/components/public/video-showcase";
import { SmoothSlider } from "@/components/public/smooth-slider";
import { youtubeId } from "@/lib/video";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  return buildMetadata({ path: "/" });
}

const ICONS = [Compass, Ruler, Building2, Layers, Sparkles];

function iconAt(index: number) {
  const Icon = ICONS[index % ICONS.length];
  return Icon;
}

export default async function HomePage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const [
    settings,
    sectionsRaw,
    servicesRaw,
    projectsRaw,
    why,
    stats,
    processSteps,
    testimonials,
    awards,
    videos,
    postsRaw,
    projectCount,
    serviceCount,
    teamCount,
  ] = await Promise.all([
    getLocalizedSettings(),
    prisma.homepageSection.findMany({ where: { isEnabled: true }, orderBy: { sortOrder: "asc" } }),
    prisma.service.findMany({
      where: { isPublished: true, deletedAt: null },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
      take: 4,
      include: { category: true },
    }),
    prisma.project.findMany({
      where: { isPublished: true, deletedAt: null },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      take: 4,
      include: { category: true },
    }),
    prisma.whyChooseItem.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 4 }),
    prisma.companyStatistic.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.processStep.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.testimonial.findMany({ where: { isPublished: true }, orderBy: { sortOrder: "asc" }, take: 3 }),
    prisma.award.findMany({ where: { isPublished: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], take: 6 }),
    prisma.showcaseVideo.findMany({ where: { isPublished: true }, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], take: 6 }),
    prisma.blogPost.findMany({
      where: { status: "PUBLISHED", publishedAt: { lte: new Date() }, deletedAt: null },
      orderBy: { publishedAt: "desc" },
      take: 3,
      include: { category: true, author: true },
    }),
    prisma.project.count({ where: { isPublished: true, deletedAt: null } }),
    prisma.service.count({ where: { isPublished: true, deletedAt: null } }),
    prisma.teamMember.count({ where: { isPublished: true, deletedAt: null } }),
  ]);

  const [sections, services, projects, posts, whyItems, statsItems, processItems, testimonialItems, awardItems, videoItems] =
    await Promise.all([
      withTranslations("homepage", sectionsRaw, locale, [
        "title",
        "subtitle",
        "description",
        "buttonLabel",
        "secondaryLabel",
      ]),
      withTranslations("service", servicesRaw, locale, ["title", "shortDescription"]).then((rows) =>
        localizeCategoryNames("serviceCategory", rows, locale),
      ),
      withTranslations("project", projectsRaw, locale, ["title", "location", "description"]).then((rows) =>
        localizeCategoryNames("projectCategory", rows, locale),
      ),
      withTranslations("blog", postsRaw, locale, ["title", "excerpt"]).then((rows) =>
        localizeCategoryNames("blogCategory", rows, locale),
      ),
      withTranslations("whyChoose", why, locale, ["title", "description"]),
      withTranslations("statistic", stats, locale, ["label"]),
      withTranslations("processStep", processSteps, locale, ["title", "description"]),
      withTranslations("testimonial", testimonials, locale, ["content", "clientTitle", "clientCompany"]),
      withTranslations("award", awards, locale, ["title", "issuer", "description"]),
      withTranslations("showcaseVideo", videos, locale, ["title", "description"]),
    ]);

  const section = (key: string) => sections.find((item) => item.key === key);
  const hero = section("hero");
  const about = section("about");
  const servicesCopy = section("services");
  const projectsCopy = section("projects");
  const whyCopy = section("why");
  const statsCopy = section("stats");
  const processCopy = section("process");
  const testimonialsCopy = section("testimonials");
  const awardsCopy = section("awards");
  const videosCopy = section("videos");
  const blogCopy = section("blog");
  const cta = section("cta");
  const marqueeHalf = [...services, ...services].map((service, index) => ({
    id: `${service.id}-${index}`,
    title: service.title,
  }));
  const heroCounters = [
    { label: t.publishedProjects, value: projectCount },
    { label: t.services, value: serviceCount },
    { label: t.teamProfiles, value: teamCount },
  ].filter((item) => item.value > 0);
  const visibleStats = statsItems.filter((stat) => /\d/.test(String(stat.value ?? "")));

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: settings.siteName,
          url: process.env.APP_URL || "http://localhost:3333",
          description: settings.siteDescription,
        }}
      />

      {/* Hero */}
      <section className="relative grid min-h-[82vh] bg-primary lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative z-10 flex flex-col justify-center px-6 py-20 sm:px-10 lg:px-16 lg:py-24">
          <div className="paper-grain absolute inset-0 opacity-20" aria-hidden="true" />
          <div className="relative max-w-xl">
            <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
              <p className="eyebrow text-accent">{hero?.subtitle || settings.siteName}</p>
              <h1 className="mt-5 text-[clamp(2.6rem,5vw,4.6rem)] leading-[1.03] text-white">
                {hero?.title || settings.tagline}
              </h1>
              <p className="mt-6 max-w-lg text-[0.98rem] leading-relaxed text-white/60">
                {hero?.description || settings.siteDescription}
              </p>
            </div>
            <div className="animate-fade-up" style={{ animationDelay: "220ms" }}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Link
                  href={hero?.buttonUrl || "/projects"}
                  className="btn-shine inline-flex items-center gap-2 bg-accent px-6 py-3.5 text-[0.72rem] font-semibold tracking-[0.14em] text-primary uppercase transition-colors hover:bg-accent/85"
                >
                  {hero?.buttonLabel || t.exploreProjects} <ArrowRight className="size-4 rtl:rotate-180" />
                </Link>
                <Link
                  href={hero?.secondaryUrl || "/quote"}
                  className="inline-flex items-center gap-2 border border-white/25 px-6 py-3.5 text-[0.72rem] font-semibold tracking-[0.14em] text-white uppercase transition-colors hover:border-white hover:bg-white/5"
                >
                  {hero?.secondaryLabel || t.startYourProject}
                </Link>
              </div>
            </div>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: "360ms" }}>
            {heroCounters.length > 0 && (
              <div className="relative mt-14 flex max-w-lg flex-wrap items-start gap-x-12 gap-y-4 border-t border-white/12 pt-6">
                {heroCounters.map((item) => (
                  <div key={item.label}>
                    <CountUp value={String(item.value).padStart(2, "0")} className="font-display text-2xl text-white" />
                    <p className="mt-1 text-[0.6rem] font-semibold tracking-[0.12em] text-white/40 uppercase">{item.label}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-9">
              <ScrollCue href="#studio" label={t.discoverStudio} />
            </div>
          </div>
        </div>

        <div className="relative min-h-[420px] overflow-hidden bg-primary/40">
          <SmartImage
            src={hero?.imageUrl}
            alt={hero?.title || settings.siteName}
            sizes="(min-width: 1024px) 52vw, 100vw"
            priority
            className="animate-hero-zoom opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-transparent to-transparent lg:bg-gradient-to-r" />
          <div className="absolute bottom-5 right-5 hidden border border-white/20 bg-primary/50 px-4 py-3 backdrop-blur-sm lg:block">
            <p className="text-[0.6rem] font-semibold tracking-[0.16em] text-white/50 uppercase">{t.architectureConstruction}</p>
            <p className="mt-1 font-display text-sm text-white">{settings.siteLegalName}</p>
          </div>
        </div>
      </section>

      {marqueeHalf.length > 0 && (
        <div
          className="marquee overflow-hidden border-b border-border/70 bg-card py-3.5"
          aria-hidden="true"
        >
          <div className="marquee-track flex w-max items-center gap-10">
            {[...marqueeHalf, ...marqueeHalf].map((item, position) => (
              <span
                key={`${item.id}-${position}`}
                className="flex items-center gap-10 whitespace-nowrap text-[0.62rem] font-semibold tracking-[0.22em] text-muted-foreground/70 uppercase"
              >
                {item.title}
                <span className="size-1 rounded-full bg-accent/60" />
              </span>
            ))}
          </div>
        </div>
      )}

      {/* About */}
      {about && (about.title || about.description) && (
        <section id="studio" className="container-x py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <Reveal>
              <div className="relative">
                <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
                  {settings.logoUrl ? (
                    <>
                      <div aria-hidden="true" className="paper-grain absolute inset-0 opacity-40" />
                      <div className="absolute inset-0 grid place-items-center p-10 sm:p-14">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={settings.logoUrl}
                          alt={settings.siteName}
                          className="size-full max-w-[19rem] object-contain dark:brightness-0 dark:invert"
                        />
                      </div>
                    </>
                  ) : (
                    <SmartImage src={about.imageUrl} alt={about.title || t.aboutStudio} sizes="(min-width: 1024px) 50vw, 100vw" />
                  )}
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="eyebrow">{about.subtitle || t.aboutStudio}</p>
              <h2 className="mt-4 text-[clamp(2rem,3.6vw,3rem)] leading-[1.1] text-primary">
                {about.title}
              </h2>
              <p className="mt-5 text-[0.95rem] leading-relaxed text-muted-foreground">{about.description}</p>
              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                {whyItems.slice(0, 4).map((item, index) => {
                  const Icon = iconAt(index);
                  return (
                    <div key={item.id} className="flex items-start gap-3 border-t border-border/70 pt-4">
                      <Icon className="mt-0.5 size-4 shrink-0 text-accent" />
                      <div>
                        <p className="text-sm font-medium text-primary">{item.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <Link
                href={about.buttonUrl || "/about"}
                className="link-underline mt-8 inline-flex items-center gap-2 text-[0.72rem] font-semibold tracking-[0.14em] text-primary uppercase"
              >
                {about.buttonLabel || t.aboutStudio} <ArrowRight className="size-3.5 rtl:rotate-180" />
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* Services */}
      {servicesCopy && services.length > 0 && (
        <section className="border-y border-border/70 bg-card/50">
          <div className="container-x py-20 lg:py-24">
            <SectionHeading
              eyebrow={servicesCopy.subtitle || t.whatWeDo}
              title={servicesCopy.title}
              description={servicesCopy.description}
              linkHref="/services"
              linkLabel={t.allServices}
            />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {services.map((service, index) => (
                <Reveal key={service.id} delay={index * 0.05}>
                  <ServiceCard service={service} index={index} locale={locale} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Projects */}
      {projectsCopy && projects.length > 0 && (
        <section id="portfolio" className="container-x py-20 lg:py-28">
          <SectionHeading
            eyebrow={projectsCopy.subtitle || t.portfolio}
            title={projectsCopy.title}
            description={projectsCopy.description}
            linkHref="/projects"
            linkLabel={t.viewAllProjects}
          />
          <div className="mt-10">
            <Reveal>
              <ProjectCard project={projects[0]} index={1} wide locale={locale} />
            </Reveal>
            {projects.length > 1 && (
              <div className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
                {projects.slice(1).map((project, index) => (
                  <Reveal key={project.id} delay={index * 0.05}>
                    <ProjectCard project={project} index={index + 2} locale={locale} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Why */}
      {whyCopy && whyItems.length > 0 && (
        <section className="bg-primary text-white">
          <div className="container-x py-20 lg:py-24">
            <SectionHeading
              eyebrow={whyCopy.subtitle || t.whyKayan}
              title={whyCopy.title}
              description={whyCopy.description}
              light
            />
            <div className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {whyItems.map((item, index) => {
                const Icon = iconAt(index);
                return (
                  <Reveal key={item.id} delay={index * 0.06}>
                    <div className="border-t border-white/15 pt-5">
                      <span className="font-display text-sm text-accent">{String(index + 1).padStart(2, "0")}</span>
                      <Icon className="mt-4 size-5 text-accent" />
                      <h3 className="mt-4 font-display text-xl text-white">{item.title}</h3>
                      <p className="mt-2.5 text-sm leading-relaxed text-white/55">{item.description}</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      {statsCopy && visibleStats.length > 0 && (
        <section className="border-b border-border/70 bg-background">
          <div className="container-x py-14 lg:py-16">
            {statsCopy.title && (
              <p className="mb-8 text-center text-[0.68rem] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
                {statsCopy.title}
              </p>
            )}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {visibleStats.map((stat) => (
                <div key={stat.id} className="text-center">
                  <p className="font-display text-[clamp(2.4rem,4vw,3.4rem)] leading-none text-primary">
                    <CountUp value={stat.value} />
                    {stat.suffix && <span className="text-accent">{stat.suffix}</span>}
                  </p>
                  <p className="mt-3 text-[0.65rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Project videos */}
      {videosCopy && videoItems.length > 0 && (
        <section className="border-y border-border/70 bg-card/50">
          <div className="container-x py-20 lg:py-24">
            <SectionHeading
              eyebrow={videosCopy.subtitle || t.videosLabel}
              title={videosCopy.title}
              description={videosCopy.description}
            />
            <div className="mt-10">
              <VideoShowcase
                items={videoItems.map((video) => ({
                  id: video.id,
                  title: video.title,
                  description: video.description,
                  youtubeId: youtubeId(video.youtubeUrl),
                  videoUrl: video.videoUrl,
                  thumbnailUrl: video.thumbnailUrl,
                }))}
              />
            </div>
          </div>
        </section>
      )}

      {/* Process */}
      {processCopy && processItems.length > 0 && (
        <section className="container-x py-20 lg:py-24">
          <SectionHeading
            eyebrow={processCopy.subtitle || t.processLabel}
            title={processCopy.title}
            description={processCopy.description}
            align="center"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {processItems.map((step, index) => (
              <Reveal key={step.id} delay={index * 0.05}>
                <div className="relative border-t-2 border-primary/10 pt-6">
                  <span className="absolute -top-3 left-0 grid size-6 place-items-center rounded-full bg-accent text-[0.6rem] font-semibold text-primary">
                    {index + 1}
                  </span>
                  <h3 className="font-display text-lg text-primary">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Journal */}
      {blogCopy && posts.length > 0 && (
        <section className="container-x py-20 lg:py-24">
          <SectionHeading
            eyebrow={blogCopy.subtitle || t.journalLabel}
            title={blogCopy.title}
            description={blogCopy.description}
            linkHref="/blog"
            linkLabel={t.allArticles}
          />
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post, index) => (
              <Reveal key={post.id} delay={index * 0.05}>
                <BlogCard post={{ ...post, excerpt: post.excerpt, category: post.category, author: post.author }} locale={locale} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonialsCopy && testimonialItems.length > 0 && (
        <section className="border-y border-border/70 bg-card/50">
          <div className="container-x py-20 lg:py-24">
            <SectionHeading
              eyebrow={testimonialsCopy.subtitle || t.testimonialsLabel}
              title={testimonialsCopy.title}
              description={testimonialsCopy.description}
              linkHref="/testimonials"
              linkLabel={t.allTestimonials}
            />
            <div className="mt-10">
              <TestimonialCarousel
                items={testimonialItems.map((testimonial) => ({
                  id: testimonial.id,
                  content: testimonial.content,
                  clientName: testimonial.clientName,
                  clientTitle: testimonial.clientTitle,
                  clientCompany: testimonial.clientCompany,
                  photoUrl: testimonial.photoUrl,
                  rating: testimonial.rating,
                }))}
                autoplayMs={7000}
              />
            </div>
          </div>
        </section>
      )}

      {/* Awards */}
      {awardsCopy && awardItems.length > 0 && (
        <section className="container-x py-20 lg:py-24">
          <SectionHeading
            eyebrow={awardsCopy.subtitle || t.awardsLabel}
            title={awardsCopy.title}
            description={awardsCopy.description}
            align="center"
          />
          <div className="mt-12">
            <SmoothSlider ariaLabel="Awards and recognition" autoplayMs={7000} slideClassName="sm:flex-[0_0_50%]">
              {awardItems.map((award) => (
                <article key={award.id} className="flex h-full flex-col gap-4 border border-border/70 bg-card p-6">
                  <div className="flex items-center justify-between gap-3">
                    <span className="relative grid size-12 place-items-center overflow-hidden rounded-full bg-secondary text-accent-foreground">
                      {award.imageUrl ? (
                        <SmartImage src={award.imageUrl} alt={award.title} fill sizes="48px" className="rounded-full object-cover" />
                      ) : (
                        <Trophy className="size-5" />
                      )}
                    </span>
                    {award.year ? (
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{award.year}</span>
                    ) : null}
                  </div>
                  <div>
                    <h3 className="font-display text-lg leading-snug text-primary">{award.title}</h3>
                    {award.issuer && <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">{award.issuer}</p>}
                  </div>
                  {award.description && <p className="text-sm leading-relaxed text-muted-foreground">{award.description}</p>}
                </article>
              ))}
            </SmoothSlider>
          </div>
        </section>
      )}

      {cta && (
        <CtaBand
          eyebrow={cta.subtitle}
          title={cta.title}
          description={cta.description}
          buttonLabel={cta.buttonLabel}
          buttonUrl={cta.buttonUrl}
          secondaryLabel={cta.secondaryLabel}
          secondaryUrl={cta.secondaryUrl}
          locale={locale}
        />
      )}
    </>
  );
}
