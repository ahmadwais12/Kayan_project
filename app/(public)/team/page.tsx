import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { getLocale } from "@/lib/i18n/server";
import { withTranslations } from "@/lib/i18n/content";
import { getDictionary } from "@/lib/i18n/dictionary";
import { PageHero } from "@/components/public/page-hero";
import { SmartTeamCard } from "@/components/public/team-card";
import { CtaBand } from "@/components/public/cta-band";
import { EmptyState } from "@/components/public/empty-state";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return buildMetadata({
    title: t.teamLabel,
    description: t.teamHeroDesc,
    path: "/team",
  });
}

export default async function TeamPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const locale = await getLocale();
  const t = getDictionary(locale);
  const department = (query.department || "").trim();

  const [departments, members, ctaRaw] = await Promise.all([
    prisma.department.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { members: { where: { isPublished: true, deletedAt: null } } } },
      },
    }),
    prisma.teamMember.findMany({
      where: {
        isPublished: true,
        deletedAt: null,
        ...(department ? { department: { slug: department } } : {}),
      },
      orderBy: { sortOrder: "asc" },
      include: { department: true },
    }),
    prisma.homepageSection.findUnique({ where: { key: "cta" } }),
  ]);

  const [ctaRows, localizedDepartments, localizedMembers] = await Promise.all([
    ctaRaw
      ? withTranslations("homepage", [ctaRaw], locale, ["title", "subtitle", "description", "buttonLabel", "secondaryLabel"])
      : Promise.resolve([]),
    withTranslations("department", departments, locale, ["name", "description"]),
    withTranslations("teamMember", members, locale, ["jobTitle", "bio", "skills", "education", "experience"]),
  ]);
  const cta = ctaRows[0] || null;
  const departmentNames = new Map(localizedDepartments.map((item) => [item.id, item.name]));
  const memberView = localizedMembers.map((member) =>
    member.department
      ? {
          ...member,
          department: { ...member.department, name: departmentNames.get(member.department.id) || member.department.name },
        }
      : member,
  );

  const visibleDepartments = localizedDepartments.filter((item) => item._count.members > 0);

  return (
    <>
      <PageHero
        eyebrow={t.peopleEyebrow}
        title={t.teamLabel}
        description={t.teamHeroDesc}
        breadcrumb={[{ label: t.teamLabel }]}
        homeLabel={t.home}
        compact
      />

      <section className="container-x py-16 lg:py-20">
        {visibleDepartments.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2">
            <Link
              href="/team"
              className={cn(
                "border px-4 py-2 text-xs font-medium transition-colors",
                !department
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary",
              )}
            >
              {t.everyone}
            </Link>
            {visibleDepartments.map((item) => (
              <Link
                key={item.id}
                href={`/team?department=${item.slug}`}
                className={cn(
                  "border px-4 py-2 text-xs font-medium transition-colors",
                  department === item.slug
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary",
                )}
              >
                {item.name} <span className="ms-1 opacity-60">{item._count.members}</span>
              </Link>
            ))}
          </div>
        )}

        {memberView.length > 0 ? (
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {memberView.map((member) => (
              <SmartTeamCard key={member.id} member={member} />
            ))}
          </div>
        ) : (
          <EmptyState
            title={t.teamEmptyTitle}
            description={t.teamEmptyDesc}
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
