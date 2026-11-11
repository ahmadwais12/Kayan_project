import { Quote } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { getLocale } from "@/lib/i18n/server";
import { getLocalizedSettings, withTranslations } from "@/lib/i18n/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { PageHero } from "@/components/public/page-hero";
import { SectionHeading } from "@/components/public/section-heading";
import { Reveal } from "@/components/public/reveal";
import { SmartImage } from "@/components/public/smart-image";
import { CtaBand } from "@/components/public/cta-band";
import { SmartTeamCard } from "@/components/public/team-card";
import { CountUp } from "@/components/public/count-up";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const section = await prisma.homepageSection.findUnique({ where: { key: "about" } });
  const [localized] = section
    ? await withTranslations("homepage", [section], locale, ["title", "subtitle", "description"])
    : [];
  return buildMetadata({
    title: localized?.title || t.aboutStudio,
    description: localized?.description || t.faqHeroDesc,
    path: "/about",
  });
}

export default async function AboutPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  const [
    settings,
    aboutRaw,
    stats,
    values,
    process,
    why,
    milestones,
    team,
    purposeRaw,
    ctaRaw,
    testimonial,
  ] = await Promise.all([
    getLocalizedSettings(),
    prisma.homepageSection.findUnique({ where: { key: "about" } }),
    prisma.companyStatistic.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.coreValue.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.processStep.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.whyChooseItem.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 4 }),
    prisma.companyMilestone.findMany({ where: { isPublished: true }, orderBy: [{ year: "asc" }, { sortOrder: "asc" }] }),
    prisma.teamMember.findMany({
      where: { isPublished: true, deletedAt: null },
      orderBy: { sortOrder: "asc" },
      take: 4,
      include: { department: true },
    }),
    prisma.homepageSection.findMany({
      where: { key: { in: ["mission", "vision"] }, isEnabled: true },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.homepageSection.findUnique({ where: { key: "cta" } }),
    prisma.testimonial.findFirst({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  const sectionFields = ["title", "subtitle", "description", "buttonLabel", "secondaryLabel"];
  const [aboutRows, purpose, ctaRows] = await Promise.all([
    aboutRaw ? withTranslations("homepage", [aboutRaw], locale, sectionFields) : Promise.resolve([]),
    withTranslations("homepage", purposeRaw, locale, sectionFields),
    ctaRaw ? withTranslations("homepage", [ctaRaw], locale, sectionFields) : Promise.resolve([]),
  ]);
  const about = aboutRows[0] || null;
  const cta = ctaRows[0] || null;

  const departmentRows = [
    ...new Map(team.filter((member) => member.department).map((member) => [member.department!.id, member.department!])).values(),
  ];
  const [
    localizedStats,
    localizedValues,
    localizedProcess,
    localizedWhy,
    localizedMilestones,
    localizedTeam,
    localizedDepartments,
    localizedTestimonial,
  ] = await Promise.all([
    withTranslations("statistic", stats, locale, ["label"]),
    withTranslations("coreValue", values, locale, ["title", "description"]),
    withTranslations("processStep", process, locale, ["title", "description"]),
    withTranslations("whyChoose", why, locale, ["title", "description"]),
    withTranslations("milestone", milestones, locale, ["title", "description"]),
    withTranslations("teamMember", team, locale, ["jobTitle", "bio", "skills", "education", "experience"]),
    withTranslations("department", departmentRows, locale, ["name", "description"]),
    testimonial
      ? withTranslations("testimonial", [testimonial], locale, ["content", "clientTitle", "clientCompany"])
      : Promise.resolve([]),
  ]);
  const departmentNames = new Map(localizedDepartments.map((department) => [department.id, department.name]));
  const teamView = localizedTeam.map((member) =>
    member.department
      ? {
          ...member,
          department: { ...member.department, name: departmentNames.get(member.department.id) || member.department.name },
        }
      : member,
  );
  const quote = localizedTestimonial[0] || null;

  return (
    <>
      <PageHero
        eyebrow={about?.subtitle || t.aboutLabel}
        title={about?.title || `${t.aboutLabel} ${settings.siteName}`}
        description={about?.description || settings.siteDescription}
        breadcrumb={[{ label: t.aboutLabel }]}
        homeLabel={t.home}
        image={about?.imageUrl}
      />

      {localizedStats.length > 0 && (
        <section className="border-b border-border/70 bg-card/50">
          <div className="container-x grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
            {localizedStats.map((stat) => (
              <div key={stat.id} className="text-center">
                <p className="font-display text-[clamp(2.2rem,4vw,3rem)] leading-none text-primary">
                  <CountUp value={stat.value} />
                  {stat.suffix && <span className="text-accent">{stat.suffix}</span>}
                </p>
                <p className="mt-2.5 text-[0.62rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {purpose.length > 0 && (
        <section className="container-x py-16 lg:py-20">
          <div className="grid gap-6 lg:grid-cols-2">
            {purpose.map((item, index) => (
              <Reveal key={item.id} delay={index * 0.08}>
                <div className="h-full border border-border/80 bg-card p-8">
                  <p className="eyebrow">{item.subtitle || (item.key === "mission" ? t.ourMission : t.ourVision)}</p>
                  <h2 className="mt-4 font-display text-[clamp(1.5rem,2.6vw,2rem)] leading-tight text-primary">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {localizedValues.length > 0 && (
        <section className="container-x py-20 lg:py-24">
          <SectionHeading
            eyebrow={t.valuesEyebrow}
            title={t.valuesTitle}
            description={t.valuesDesc}
          />
          <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {localizedValues.map((value, index) => (
              <Reveal key={value.id} delay={index * 0.04}>
                <div className="border-t border-border/80 pt-5">
                  <span className="font-display text-sm text-accent">{String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 font-display text-xl text-primary">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{value.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {localizedProcess.length > 0 && (
        <section className="border-y border-border/70 bg-card/50">
          <div className="container-x py-20 lg:py-24">
            <SectionHeading
              eyebrow={t.workEyebrow}
              title={t.processTitle}
              description={t.processDesc}
              align="center"
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {localizedProcess.map((step, index) => (
                <Reveal key={step.id} delay={index * 0.05}>
                  <div className="relative h-full border border-border/70 bg-background p-6">
                    <span className="font-display text-3xl text-accent/45">{String(index + 1).padStart(2, "0")}</span>
                    <h3 className="mt-3 font-display text-lg text-primary">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {localizedMilestones.length > 0 && (
        <section className="container-x py-20 lg:py-24">
          <SectionHeading
            eyebrow={t.timelineEyebrow}
            title={t.timelineTitle}
            description={t.timelineDesc}
          />
          <ol className="relative mt-12 border-l border-border pl-6 sm:pl-10">
            {localizedMilestones.map((milestone, index) => (
              <Reveal key={milestone.id} delay={index * 0.04}>
                <li className="relative pb-10 last:pb-0">
                  <span className="absolute -left-[calc(1.5rem+5px)] top-1.5 size-[9px] rounded-full border-2 border-accent bg-background sm:-left-[calc(2.5rem+5px)]" />
                  <p className="font-display text-2xl text-accent">{milestone.year}</p>
                  <h3 className="mt-1 font-display text-xl text-primary">{milestone.title}</h3>
                  {milestone.description && (
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{milestone.description}</p>
                  )}
                  {milestone.imageUrl && (
                    <div className="relative mt-4 aspect-[16/9] max-w-xl overflow-hidden bg-secondary">
                      <SmartImage src={milestone.imageUrl} alt={milestone.title} sizes="(min-width: 640px) 576px, 100vw" />
                    </div>
                  )}
                </li>
              </Reveal>
            ))}
          </ol>
        </section>
      )}

      {localizedWhy.length > 0 && (
        <section className="border-t border-border/70 bg-card/40">
          <div className="container-x py-20 lg:py-24">
            <SectionHeading
              eyebrow={t.whyKayan}
              title={t.whyTitle}
              description={t.whyDesc}
            />
            <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {localizedWhy.map((item, index) => (
                <Reveal key={item.id} delay={index * 0.05}>
                  <div className="flex gap-5 border-t border-border/80 pt-5">
                    <span className="font-display text-sm text-accent">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-display text-xl text-primary">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {quote && (
        <section className="bg-primary text-white">
          <div className="container-x py-16 lg:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <Quote className="mx-auto size-8 text-accent" />
              <blockquote className="mt-5 font-display text-[clamp(1.4rem,2.6vw,2rem)] leading-[1.4] text-white">
                “{quote.content}”
              </blockquote>
              <p className="mt-6 text-sm text-white/60">
                {quote.clientName}
                {[quote.clientTitle, quote.clientCompany].filter(Boolean).length > 0 &&
                  ` — ${[quote.clientTitle, quote.clientCompany].filter(Boolean).join(", ")}`}
              </p>
            </div>
          </div>
        </section>
      )}

      {teamView.length > 0 && (
        <section className="container-x py-20 lg:py-24">
          <SectionHeading
            eyebrow={t.peopleEyebrow}
            title={t.teamProfiles}
            description={t.teamDesc}
            linkHref="/team"
            linkLabel={t.meetTheTeam}
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {teamView.map((member, index) => (
              <Reveal key={member.id} delay={index * 0.05}>
                <SmartTeamCard member={member} />
              </Reveal>
            ))}
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
