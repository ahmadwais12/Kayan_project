import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, Building2, Layers, MessageSquareQuote, Milestone, Target, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { AboutWorkflow, type AboutPhase } from "@/components/admin/about-workflow";
import { HomepageSectionForm } from "@/components/admin/homepage-section-form";
import { finishAboutUpdate } from "@/actions/content";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";

export const dynamic = "force-dynamic";

function PreviewField({ label, value, multiline = false }: { label: string; value: string | number | null | undefined; multiline?: boolean }) {
  const displayValue = value === null || value === undefined || value === "" ? "—" : String(value);
  return <div className="space-y-1.5"><Label className="text-xs text-muted-foreground">{label}</Label>{multiline ? <Textarea readOnly value={displayValue} rows={3} className="resize-none bg-muted/30" /> : <Input readOnly value={displayValue} className="bg-muted/30" />}</div>;
}

export default async function AboutContentPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePermission("content.manage");
  const [query, about, missionVision, cta, media, milestones, stats, values, process, why, team, sectionBlocks, featuredTestimonial] = await Promise.all([
    searchParams,
    prisma.homepageSection.findUnique({ where: { key: "about" } }),
    prisma.homepageSection.findMany({ where: { key: { in: ["mission", "vision"] } }, orderBy: { key: "asc" } }),
    prisma.homepageSection.findUnique({ where: { key: "cta" } }),
    prisma.media.findMany({ orderBy: { createdAt: "desc" }, take: 100, select: { id: true, url: true, alt: true } }),
    prisma.companyMilestone.findMany({ where: { isPublished: true }, orderBy: [{ year: "asc" }, { sortOrder: "asc" }] }),
    prisma.companyStatistic.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.coreValue.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.processStep.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.whyChooseItem.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" }, take: 4 }),
    prisma.teamMember.findMany({ where: { deletedAt: null, isPublished: true }, orderBy: { sortOrder: "asc" }, take: 4, include: { department: true } }),
    prisma.homepageSection.findMany({ where: { key: { in: ["about-values", "about-process", "about-timeline", "about-why", "about-team"] }, isEnabled: true }, orderBy: { sortOrder: "asc" } }),
    prisma.testimonial.findFirst({ where: { isPublished: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  const contentModules = [
    { title: "Statistics", description: "Headline figures shown on the About page.", count: stats.length, href: "/admin/content", icon: Target },
    { title: "Core values", description: "Principles that guide the practice.", count: values.length, href: "/admin/content", icon: Layers },
    { title: "Process steps", description: "How projects move from briefing to handover.", count: process.length, href: "/admin/content", icon: Building2 },
    { title: "Why choose Kayan", description: "The points that explain the studio’s approach.", count: why.length, href: "/admin/content", icon: MessageSquareQuote },
  ];
  const sectionBlock = (key: string) => sectionBlocks.find((section) => section.key === key);

  const phases: AboutPhase[] = [
    {
      label: "Introduction", hint: "Story and image", title: "Studio introduction",
      description: "Set the About page heading, introduction text, image, order, and visibility.",
    },
    {
      label: "Purpose", hint: "Mission and vision", title: "Mission & vision",
      description: "Edit the purpose statements displayed on the public About page.",
    },
    {
      label: "Content", hint: "Values and details", title: "Supporting content",
      description: "Add, edit, and organize the reusable content blocks that make up the rest of the About page.",
    },
    {
      label: "People & timeline", hint: "History and team", title: "Timeline, team & closing call to action",
      description: "Manage the company history and team shown on the About page, then review the closing invitation.",
    },
    {
      label: "Preview", hint: "Review before publishing", title: "Preview the About page",
      description: "Review all About page information in read-only input fields before finishing. This is a content preview, not the public website.",
    },
  ];

  const parsedPhase = Number(query.phase);
  const currentPhase = Number.isInteger(parsedPhase) ? Math.max(0, Math.min(phases.length - 1, parsedPhase)) : 0;

  const phaseContent = (phaseIndex: number): ReactNode => {
    switch (phaseIndex) {
      case 0:
        return about ? <HomepageSectionForm section={about} media={media} returnTo="/admin/about?phase=0" /> : <p className="text-sm text-muted-foreground">The About introduction section is missing. Seed the database to create it.</p>;
      case 1:
        return <div className="grid gap-5">{missionVision.map((section) => <HomepageSectionForm key={section.id} section={section} media={media} returnTo="/admin/about?phase=1" />)}{missionVision.length === 0 && <p className="text-sm text-muted-foreground">Mission and vision sections are missing. Seed the database to create them.</p>}</div>;
      case 2:
        return <div className="grid gap-3 sm:grid-cols-2">{contentModules.map((item) => <Link key={item.title} href={item.href} className="group rounded-lg border border-border/80 bg-card p-4 transition-colors hover:border-accent/50"><div className="flex items-start justify-between"><span className="grid size-9 place-items-center rounded-md bg-primary/5 text-primary"><item.icon className="size-4" /></span><ArrowUpRight className="size-4 text-muted-foreground group-hover:text-accent" /></div><p className="mt-3 text-xl font-semibold text-primary">{item.count} entries</p><p className="mt-1 text-sm font-medium">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.description}</p></Link>)}</div>;
      case 3:
        return <div className="space-y-5"><div className="grid gap-3 sm:grid-cols-2">{[
          { title: "Company timeline", description: "Dated company milestones.", count: milestones.length, href: "/admin/timeline", icon: Milestone },
          { title: "Team profiles", description: "People featured on the About and Team pages.", count: team.length, href: "/admin/team", icon: Users },
        ].map((item) => <Link key={item.title} href={item.href} className="group rounded-lg border border-border/80 bg-card p-4 transition-colors hover:border-accent/50"><div className="flex items-start justify-between"><span className="grid size-9 place-items-center rounded-md bg-primary/5 text-primary"><item.icon className="size-4" /></span><ArrowUpRight className="size-4 text-muted-foreground group-hover:text-accent" /></div><p className="mt-3 text-xl font-semibold text-primary">{item.count} entries</p><p className="mt-1 text-sm font-medium">{item.title}</p><p className="mt-1 text-xs text-muted-foreground">{item.description}</p></Link>)}</div>{cta && <HomepageSectionForm section={cta} media={media} returnTo="/admin/about?phase=3" />}</div>;
      default:
        return <div className="space-y-5">
        <section className="space-y-3"><h3 className="font-display text-lg text-primary">Studio introduction</h3><div className="grid gap-3 sm:grid-cols-2"><PreviewField label="Subtitle" value={about?.subtitle} /><PreviewField label="Heading" value={about?.title} /><PreviewField label="Story image" value={about?.imageUrl} /><PreviewField label="Display order" value={about?.sortOrder} /><div className="sm:col-span-2"><PreviewField label="Introduction" value={about?.description} multiline /></div></div></section>
        <section className="space-y-3"><h3 className="font-display text-lg text-primary">Mission & vision</h3><div className="grid gap-4 lg:grid-cols-2">{missionVision.map((item) => <div key={item.id} className="space-y-3 rounded-lg border border-border/70 p-4"><p className="text-sm font-medium capitalize text-primary">{item.key}</p><PreviewField label="Subtitle" value={item.subtitle} /><PreviewField label="Heading" value={item.title} /><PreviewField label="Statement" value={item.description} multiline /></div>)}</div></section>
        <section className="space-y-3"><h3 className="font-display text-lg text-primary">Statistics</h3><div className="grid gap-3 sm:grid-cols-2">{stats.map((item) => <div key={item.id} className="space-y-3 rounded-lg border border-border/70 p-4"><PreviewField label="Value" value={`${item.value}${item.suffix || ""}`} /><PreviewField label="Label" value={item.label} /></div>)}</div>{stats.length === 0 && <p className="text-sm text-muted-foreground">No active statistics.</p>}</section>
        <section className="space-y-3"><h3 className="font-display text-lg text-primary">Core values</h3><div className="grid gap-3 sm:grid-cols-2">{values.map((item) => <div key={item.id} className="space-y-3 rounded-lg border border-border/70 p-4"><PreviewField label="Title" value={item.title} /><PreviewField label="Description" value={item.description} multiline /></div>)}</div>{values.length === 0 && <p className="text-sm text-muted-foreground">No active values.</p>}</section>
        <section className="space-y-3"><h3 className="font-display text-lg text-primary">Process steps</h3><div className="grid gap-3 sm:grid-cols-2">{process.map((item) => <div key={item.id} className="space-y-3 rounded-lg border border-border/70 p-4"><PreviewField label="Title" value={item.title} /><PreviewField label="Description" value={item.description} multiline /></div>)}</div>{process.length === 0 && <p className="text-sm text-muted-foreground">No active process steps.</p>}</section>
        <section className="space-y-3"><h3 className="font-display text-lg text-primary">Company timeline</h3><div className="grid gap-3 sm:grid-cols-2">{milestones.map((item) => <div key={item.id} className="space-y-3 rounded-lg border border-border/70 p-4"><PreviewField label="Year" value={item.year} /><PreviewField label="Title" value={item.title} /><PreviewField label="Image" value={item.imageUrl} /><PreviewField label="Description" value={item.description} multiline /></div>)}</div>{milestones.length === 0 && <p className="text-sm text-muted-foreground">No published timeline milestones.</p>}</section>
        <section className="space-y-3"><h3 className="font-display text-lg text-primary">Why choose Kayan</h3><div className="grid gap-3 sm:grid-cols-2">{why.map((item) => <div key={item.id} className="space-y-3 rounded-lg border border-border/70 p-4"><PreviewField label="Title" value={item.title} /><PreviewField label="Description" value={item.description} multiline /></div>)}</div>{why.length === 0 && <p className="text-sm text-muted-foreground">No active items.</p>}</section>
        {(["about-values", "about-process", "about-timeline", "about-why", "about-team"] as const).map((key) => { const item = sectionBlock(key); return item ? <section key={key} className="space-y-3"><h3 className="font-display text-lg text-primary">{key.replace("about-", "").replace(/^./, (letter) => letter.toUpperCase())} section heading</h3><div className="grid gap-3 sm:grid-cols-2"><PreviewField label="Eyebrow" value={item.subtitle} /><PreviewField label="Heading" value={item.title} /><div className="sm:col-span-2"><PreviewField label="Section description" value={item.description} multiline /></div></div></section> : null; })}
        <section className="space-y-3"><h3 className="font-display text-lg text-primary">Team profiles</h3><div className="grid gap-3 sm:grid-cols-2">{team.map((item) => <div key={item.id} className="space-y-3 rounded-lg border border-border/70 p-4"><PreviewField label="Name" value={item.name} /><PreviewField label="Job title" value={item.jobTitle} /><PreviewField label="Department" value={item.department?.name} /><PreviewField label="Portrait" value={item.imageUrl} /><PreviewField label="Biography" value={item.bio} multiline /></div>)}</div>{team.length === 0 && <p className="text-sm text-muted-foreground">No published team profiles.</p>}</section>
        {featuredTestimonial && <section className="space-y-3"><h3 className="font-display text-lg text-primary">Featured testimonial</h3><div className="grid gap-3 sm:grid-cols-2"><PreviewField label="Client" value={featuredTestimonial.clientName} /><PreviewField label="Title" value={featuredTestimonial.clientTitle} /><div className="sm:col-span-2"><PreviewField label="Quote" value={featuredTestimonial.content} multiline /></div></div></section>}
        <section className="space-y-3"><h3 className="font-display text-lg text-primary">Closing call to action</h3><div className="grid gap-3 sm:grid-cols-2"><PreviewField label="Eyebrow" value={cta?.subtitle} /><PreviewField label="Heading" value={cta?.title} /><PreviewField label="Primary button" value={cta?.buttonLabel} /><PreviewField label="Primary link" value={cta?.buttonUrl} /><PreviewField label="Secondary button" value={cta?.secondaryLabel} /><PreviewField label="Secondary link" value={cta?.secondaryUrl} /><div className="sm:col-span-2"><PreviewField label="Description" value={cta?.description} multiline /></div></div></section>
        <form action={finishAboutUpdate} className="flex justify-end border-t border-border/70 pt-4"><Button type="submit">Save / Update About page</Button></form>
        </div>;
    }
  };

  return <div className="space-y-5"><PageHeader title="About page editor" description="Work through the About page content in phases. The final phase gives you a live preview." breadcrumb={[{ label: "Website Content" }, { label: "About" }]} /><AdminFlash {...flashFromQuery(query)} /><AboutWorkflow phases={phases} current={currentPhase} content={phaseContent(currentPhase)} /><Card><CardContent className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="text-sm font-medium">Need company-wide details?</p><p className="text-xs text-muted-foreground">Contact and general settings appear across the whole website.</p></div><div className="flex gap-2"><Button asChild variant="outline" size="sm"><Link href="/admin/settings">General settings</Link></Button><Button asChild variant="outline" size="sm"><Link href="/admin/settings/contact">Contact details</Link></Button></div></CardContent></Card></div>;
}
