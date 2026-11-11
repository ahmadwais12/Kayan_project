import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { getLocale } from "@/lib/i18n/server";
import { withTranslations } from "@/lib/i18n/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { PageHero } from "@/components/public/page-hero";
import { SmartImage } from "@/components/public/smart-image";
import { Markdown } from "@/components/public/markdown";
import { SmartTeamCard } from "@/components/public/team-card";
import { SectionHeading } from "@/components/public/section-heading";
import { CtaBand } from "@/components/public/cta-band";
import { SocialIcon } from "@/components/public/social-icon";
import { parseList } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const memberRaw = await prisma.teamMember.findFirst({
    where: { slug, isPublished: true, deletedAt: null },
  });
  if (!memberRaw) return buildMetadata({ title: "Profile not found", noindex: true });
  const [member] = await withTranslations("teamMember", [memberRaw], locale, ["jobTitle", "bio"]);
  return buildMetadata({
    title: `${member.name} — ${member.jobTitle}`,
    description: member.bio?.slice(0, 200) || `${member.name}, ${member.jobTitle}`,
    image: member.imageUrl,
    path: `/team/${member.slug}`,
  });
}

export default async function TeamMemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const t = getDictionary(locale);
  const memberRaw = await prisma.teamMember.findFirst({
    where: { slug, isPublished: true, deletedAt: null },
    include: { department: true },
  });
  if (!memberRaw) notFound();

  const [colleaguesRaw, ctaRaw] = await Promise.all([
    prisma.teamMember.findMany({
      where: { isPublished: true, deletedAt: null, id: { not: memberRaw.id } },
      orderBy: { sortOrder: "asc" },
      take: 4,
      include: { department: true },
    }),
    prisma.homepageSection.findUnique({ where: { key: "cta" } }),
  ]);

  const departments = [
    ...new Map(
      [memberRaw, ...colleaguesRaw]
        .filter((item) => item.department)
        .map((item) => [item.department!.id, item.department!]),
    ).values(),
  ];
  const [ctaRows, memberCopy, colleaguesCopy, departmentCopy] = await Promise.all([
    ctaRaw
      ? withTranslations("homepage", [ctaRaw], locale, ["title", "subtitle", "description", "buttonLabel", "secondaryLabel"])
      : Promise.resolve([]),
    withTranslations("teamMember", [memberRaw], locale, [
      "jobTitle",
      "bio",
      "skills",
      "education",
      "experience",
    ]),
    withTranslations("teamMember", colleaguesRaw, locale, ["jobTitle", "bio", "skills", "education", "experience"]),
    withTranslations("department", departments, locale, ["name", "description"]),
  ]);
  const cta = ctaRows[0] || null;
  const departmentNames = new Map(departmentCopy.map((department) => [department.id, department.name]));
  const member = {
    ...memberCopy[0],
    department: memberCopy[0].department
      ? {
          ...memberCopy[0].department,
          name: departmentNames.get(memberCopy[0].department.id) || memberCopy[0].department.name,
        }
      : null,
  };
  const colleagues = colleaguesCopy.map((item) =>
    item.department
      ? {
          ...item,
          department: { ...item.department, name: departmentNames.get(item.department.id) || item.department.name },
        }
      : item,
  );

  const socials = [
    { label: "LinkedIn", href: member.linkedinUrl, platform: "linkedin" },
    { label: "Instagram", href: member.instagramUrl, platform: "instagram" },
    { label: "Facebook", href: member.facebookUrl, platform: "facebook" },
    { label: "Website", href: member.websiteUrl, platform: "website" },
  ].filter((item) => item.href);

  return (
    <>
      <PageHero
        eyebrow={member.department?.name || t.teamLabel}
        title={member.name}
        description={member.jobTitle}
        breadcrumb={[{ label: t.teamLabel, href: "/team" }, { label: member.name }]}
        homeLabel={t.home}
        compact
      />

      <section className="container-x py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
              <SmartImage src={member.imageUrl} alt={member.name} sizes="(min-width: 1024px) 40vw, 100vw" />
            </div>
            <div className="mt-5 space-y-2 border border-border/70 bg-card p-5 text-sm">
              {member.email && (
                <a href={`mailto:${member.email}`} className="flex items-center gap-2.5 text-foreground/80 hover:text-primary">
                  <Mail className="size-4 text-accent" /> {member.email}
                </a>
              )}
              {socials.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {socials.map((social) => (
                    <a
                      key={social.label}
                      href={social.href!}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={social.label}
                      className="grid size-9 place-items-center border border-border text-muted-foreground hover:border-accent hover:text-accent"
                    >
                      <SocialIcon platform={social.platform} />
                    </a>
                  ))}
                </div>
              )}
              <Link href="/team" className="mt-3 flex items-center gap-2 text-xs text-muted-foreground hover:text-primary">
                <ArrowLeft className="size-3.5 rtl:rotate-180" /> {t.allTeamMembers}
              </Link>
            </div>
          </div>

          <div>
            {member.bio ? (
              <Markdown content={member.bio} />
            ) : (
              <p className="text-sm text-muted-foreground">{t.profileSoon}</p>
            )}

            {(() => {
              const skills = parseList(member.skills);
              return skills.length > 0 ? (
                <div className="mt-10">
                  <h2 className="font-display text-xl text-primary">{t.skills}</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span key={skill} className="border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null;
            })()}

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {member.education && (
                <div className="border-t border-border/80 pt-4">
                  <h3 className="text-[0.65rem] font-semibold tracking-[0.14em] text-accent uppercase">{t.education}</h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {member.education}
                  </p>
                </div>
              )}
              {member.experience && (
                <div className="border-t border-border/80 pt-4">
                  <h3 className="text-[0.65rem] font-semibold tracking-[0.14em] text-accent uppercase">{t.experience}</h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                    {member.experience}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {colleagues.length > 0 && (
        <section className="border-t border-border/70 bg-card/50">
          <div className="container-x py-16 lg:py-20">
            <SectionHeading eyebrow={t.theStudio} title={t.moreTeamProfiles} linkHref="/team" linkLabel={t.everyone} />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {colleagues.map((colleague) => (
                <SmartTeamCard key={colleague.id} member={colleague} />
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
