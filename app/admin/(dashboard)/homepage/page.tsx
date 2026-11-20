import Link from "next/link";
import { Home } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { AdminFlash, flashFromQuery } from "@/components/admin/flash";
import { deleteHomepageSection } from "@/actions/content";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableFooter } from "@/components/admin/pagination";
import { DeleteButton } from "@/components/admin/delete-button";
import { ViewButton } from "@/components/admin/view-button";
import { Button } from "@/components/ui/button";
import { parseRows } from "@/lib/pagination";

export const dynamic = "force-dynamic";

const LABELS: Record<string, string> = {
  hero: "Hero",
  about: "About introduction",
  mission: "Mission",
  vision: "Vision",
  services: "Services",
  projects: "Featured projects",
  why: "Why choose us",
  stats: "Statistics",
  process: "Process",
  testimonials: "Testimonials",
  awards: "Awards & recognition",
  videos: "Project videos",
  blog: "Journal / blog",
  cta: "Call to action",
};

const OWNERS: Record<string, { label: string; href: string }> = {
  about: { label: "About page", href: "/admin/about" },
  mission: { label: "About page", href: "/admin/about#mission" },
  vision: { label: "About page", href: "/admin/about#mission" },
  services: { label: "Services", href: "/admin/services" },
  projects: { label: "Projects", href: "/admin/projects" },
  why: { label: "Process & values", href: "/admin/content" },
  stats: { label: "Process & values", href: "/admin/content" },
  process: { label: "Process & values", href: "/admin/content" },
  testimonials: { label: "Testimonials", href: "/admin/testimonials" },
  awards: { label: "Awards & recognition", href: "/admin/awards" },
  videos: { label: "Project videos", href: "/admin/videos" },
  blog: { label: "Blog posts", href: "/admin/blog" },
  team: { label: "Team members", href: "/admin/team" },
  gallery: { label: "Gallery", href: "/admin/gallery" },
  faq: { label: "FAQs", href: "/admin/faqs" },
  contact: { label: "Contact information", href: "/admin/settings/contact" },
  quote: { label: "Quote requests", href: "/admin/inquiries/quotes" },
  "about-values": { label: "Process & values", href: "/admin/content" },
  "about-process": { label: "Process & values", href: "/admin/content" },
  "about-timeline": { label: "Company timeline", href: "/admin/timeline" },
  "about-why": { label: "Process & values", href: "/admin/content" },
  "about-team": { label: "Team members", href: "/admin/team" },
  "quote-brief": { label: "Quote requests", href: "/admin/inquiries/quotes" },
  "quote-next": { label: "Quote requests", href: "/admin/inquiries/quotes" },
  "quote-talk": { label: "Contact information", href: "/admin/settings/contact" },
  "quote-inclusions": { label: "Quote requests", href: "/admin/inquiries/quotes" },
  privacy: { label: "General settings", href: "/admin/settings" },
  terms: { label: "General settings", href: "/admin/settings" },
};

export default async function HomepagePage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requirePermission("content.manage");
  const query = await searchParams;
  const rows = parseRows(query.rows, 10);
  const total = await prisma.homepageSection.count();
  const pageCount = Math.max(1, Math.ceil(total / rows));
  const page = Math.min(Math.max(1, Number(query.page) || 1), pageCount);
  const sections = await prisma.homepageSection.findMany({
    orderBy: [{ sortOrder: "asc" }, { key: "asc" }],
    skip: (page - 1) * rows,
    take: rows,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Home page" description="Review homepage sections in the table and open their dedicated editors as needed." breadcrumb={[{ label: "Home Page" }]} />
      <AdminFlash {...flashFromQuery(query)} />
      {total === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-16 text-center"><span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary"><Home className="size-5" /></span><p className="text-sm font-medium text-primary">No homepage sections found</p><p className="max-w-sm text-sm text-muted-foreground">Run the database seed to create the default homepage sections.</p></Card>
      ) : <>
        <section className="space-y-3">
          <div>
            <h2 className="font-display text-xl text-primary">Homepage sections</h2>
            <p className="mt-1 text-sm text-muted-foreground">Review the section content and open the right editor from this table.</p>
          </div>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table className="min-w-[720px]">
                <TableHeader className="bg-secondary/30">
                  <TableRow>
                    <TableHead>Section</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Managed in</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sections.map((section) => {
                    const homeOnly = ["hero", "cta", "about", "mission", "vision"].includes(section.key);
                    const owner = OWNERS[section.key];
                    const href = homeOnly || section.key === "testimonials" ? `/admin/homepage/${section.id}/edit` : owner?.href || "/admin/homepage";
                    return (
                      <TableRow key={section.id}>
                        <TableCell className="font-medium text-primary">{LABELS[section.key] || section.key}</TableCell>
                        <TableCell className="max-w-sm">
                          <p className="truncate text-sm text-primary">{section.title || "No title set"}</p>
                          {section.subtitle && <p className="truncate text-xs text-muted-foreground">{section.subtitle}</p>}
                        </TableCell>
                        <TableCell><Badge variant={section.isEnabled ? "success" : "secondary"}>{section.isEnabled ? "Enabled" : "Disabled"}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {section.key === "testimonials" ? (
                            <Link href="/admin/testimonials" className="underline-offset-4 hover:underline">Entries: Testimonials</Link>
                          ) : homeOnly ? "Home page" : owner?.label || "Home page"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <ViewButton href={`/admin/records/section/${section.id}`} name={LABELS[section.key] || section.key} />
                            <Button asChild size="sm" variant="ghost">
                              <Link href={href}>Edit</Link>
                            </Button>
                            <DeleteButton
                              id={section.id}
                              action={deleteHomepageSection}
                              title={`Delete ${LABELS[section.key] || section.key} section?`}
                              description="This permanently deletes the section and its saved content from the homepage settings."
                              label={`Delete ${LABELS[section.key] || section.key}`}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <TableFooter
              page={page}
              pageSize={rows}
              total={total}
              basePath="/admin/homepage"
              params={{ rows: String(rows) }}
              noun="sections"
            />
          </Card>
        </section>
      </>}
    </div>
  );
}
