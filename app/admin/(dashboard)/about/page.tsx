import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Layers,
  Milestone,
  Pencil,
  Users,
  MessageSquareQuote,
  Target,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function AboutContentPage() {
  await requirePermission("content.manage");

  const [about, milestones, stats, values, process, why, team] = await Promise.all([
    prisma.homepageSection.findUnique({ where: { key: "about" } }),
    prisma.companyMilestone.count(),
    prisma.companyStatistic.count({ where: { isActive: true } }),
    prisma.coreValue.count({ where: { isActive: true } }),
    prisma.processStep.count({ where: { isActive: true } }),
    prisma.whyChooseItem.count({ where: { isActive: true } }),
    prisma.teamMember.count({ where: { deletedAt: null, isPublished: true } }),
  ]);

  const sections = [
    {
      title: "Company timeline",
      description: "Dated milestones shown in the studio story on the About page.",
      count: milestones,
      label: "milestones",
      href: "/admin/timeline",
      icon: Milestone,
    },
    {
      title: "Statistics",
      description: "Headline figures such as projects delivered or years of practice.",
      count: stats,
      label: "active figures",
      href: "/admin/content#statistics",
      icon: Target,
    },
    {
      title: "Core values",
      description: "The principles that guide the practice, shown as a grid.",
      count: values,
      label: "active values",
      href: "/admin/content#values",
      icon: Layers,
    },
    {
      title: "Process steps",
      description: "How a project moves from first conversation to handover.",
      count: process,
      label: "active steps",
      href: "/admin/content#process",
      icon: Building2,
    },
    {
      title: "Why Kayan Land",
      description: "Differentiators presented beside the About story.",
      count: why,
      label: "active points",
      href: "/admin/content#why",
      icon: MessageSquareQuote,
    },
    {
      title: "Team profiles",
      description: "Published team members listed on the About and Team pages.",
      count: team,
      label: "published members",
      href: "/admin/team",
      icon: Users,
    },
  ];

  return (
    <div>
      <PageHeader
        title="About page"
        description="The About page combines the studio story, statistics, values, process, timeline, and team. Each part is managed in its own module."
        breadcrumb={[{ label: "Website Content" }, { label: "About" }]}
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/homepage#about">
              <Pencil className="size-4" /> Edit story section
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>Studio story</CardTitle>
              {about && (
                <Badge variant={about.isEnabled ? "secondary" : "outline"}>
                  {about.isEnabled ? "Visible" : "Hidden"}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {about ? (
              <div className="space-y-4">
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Subtitle
                  </p>
                  <p className="mt-1 text-sm text-foreground/85">{about.subtitle || "—"}</p>
                </div>
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Heading
                  </p>
                  <p className="mt-1 font-display text-xl text-primary">{about.title || "—"}</p>
                </div>
                <div>
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                    Introduction
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/80">
                    {about.description || "—"}
                  </p>
                </div>
                {about.imageUrl && (
                  <p className="text-xs text-muted-foreground">
                    Image: <span className="font-mono">{about.imageUrl}</span>
                  </p>
                )}
                <Button asChild variant="secondary" size="sm">
                  <Link href="/admin/homepage#about">
                    Edit in Home Page manager <ArrowUpRight className="size-3.5" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm font-medium text-primary">The story section is missing</p>
                <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                  Seed the database or create an &ldquo;about&rdquo; section in the Home Page manager.
                </p>
                <Button asChild variant="secondary" size="sm" className="mt-3">
                  <Link href="/admin/homepage">Open Home Page manager</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>What the About page shows</CardTitle></CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm text-muted-foreground">
              {[
                "Page introduction and studio story",
                "Headline statistics",
                "Mission and vision statements",
                "Core values",
                "The design and construction process",
                "Dated company timeline",
                "Why clients choose the practice",
                "Links to published team profiles",
                "A closing invitation to start a project",
              ].map((item, index) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-secondary text-[0.65rem] font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Nothing on the About page is hardcoded. If an item is empty or disabled in the
              admin console, that part is omitted from the public page.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map((section) => (
          <Link
            key={section.title}
            href={section.href}
            className="group rounded-lg border border-border/80 bg-card p-5 transition-colors hover:border-accent/40"
          >
            <div className="flex items-start justify-between">
              <span className="grid size-9 place-items-center rounded-md bg-primary/5 text-primary">
                <section.icon className="size-4" />
              </span>
              <ArrowUpRight className="size-4 text-muted-foreground/50 group-hover:text-accent" />
            </div>
            <p className="mt-4 font-display text-2xl leading-none text-primary">{section.count}</p>
            <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              {section.label}
            </p>
            <p className="mt-3 text-sm font-medium text-primary">{section.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{section.description}</p>
          </Link>
        ))}
      </div>

      <div className="mt-5 rounded-lg border border-border/80 bg-card p-5">
        <h2 className="text-base font-medium">Company details</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          The company name, tagline, description, and contact details come from the general and
          contact settings and appear throughout the public website.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/settings">General settings</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/settings/contact">Contact information</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/settings/theme">Theme colours</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
