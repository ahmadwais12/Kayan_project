import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Eye,
  Inbox,
  Layers,
  Newspaper,
  Plus,
  UserPlus,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard, MiniStat } from "@/components/admin/stat-card";
import { CategoryChart, InquiryTrendChart } from "@/components/admin/charts";
import { InquiryStatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string }>;
}) {
  const session = await requireAdmin();
  const { denied } = await searchParams;
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);

  const [
    totalProjects,
    publishedProjects,
    draftProjects,
    publishedServices,
    teamMembers,
    publishedPosts,
    quoteTotal,
    newContact,
    newQuotes,
    monthlyContact,
    monthlyQuotes,
    categories,
    contactRecent,
    quoteRecent,
    logs,
    pageViews,
    subscribers,
  ] = await Promise.all([
    prisma.project.count({ where: { deletedAt: null } }),
    prisma.project.count({ where: { deletedAt: null, isPublished: true } }),
    prisma.project.count({ where: { deletedAt: null, isPublished: false } }),
    prisma.service.count({ where: { deletedAt: null, isPublished: true } }),
    prisma.teamMember.count({ where: { deletedAt: null, isPublished: true } }),
    prisma.blogPost.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
    prisma.quoteRequest.count(),
    prisma.contactInquiry.count({ where: { status: "NEW" } }),
    prisma.quoteRequest.count({ where: { status: "NEW" } }),
    prisma.contactInquiry.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.quoteRequest.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.projectCategory.findMany({
      include: {
        _count: { select: { projects: { where: { deletedAt: null } } } },
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.contactInquiry.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, status: true, createdAt: true },
    }),
    prisma.quoteRequest.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, status: true, createdAt: true },
    }),
    prisma.auditLog.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    prisma.pageView.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.newsletterSubscriber.count({ where: { isActive: true } }),
  ]);

  const trendSource = await Promise.all([
    prisma.contactInquiry.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prisma.quoteRequest.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
  ]);

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleString("en-GB", { month: "short" }),
      contact: 0,
      quotes: 0,
    };
  });
  for (const item of trendSource[0]) {
    const key = `${item.createdAt.getFullYear()}-${item.createdAt.getMonth()}`;
    const month = months.find((entry) => entry.key === key);
    if (month) month.contact += 1;
  }
  for (const item of trendSource[1]) {
    const key = `${item.createdAt.getFullYear()}-${item.createdAt.getMonth()}`;
    const month = months.find((entry) => entry.key === key);
    if (month) month.quotes += 1;
  }

  const recent = [
    ...contactRecent.map((item) => ({
      id: item.id,
      href: `/admin/inquiries/${item.id}`,
      type: "Contact",
      name: item.name,
      email: item.email,
      status: item.status,
      createdAt: item.createdAt,
    })),
    ...quoteRecent.map((item) => ({
      id: item.id,
      href: `/admin/inquiries/quotes/${item.id}`,
      type: "Quote",
      name: item.name,
      email: item.email,
      status: item.status,
      createdAt: item.createdAt,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);

  const quickActions = [
    hasPermission(session, "projects.manage") && { label: "Add project", href: "/admin/projects/new", icon: Building2 },
    hasPermission(session, "services.manage") && { label: "Add service", href: "/admin/services/new", icon: Layers },
    hasPermission(session, "blog.manage") && { label: "Write article", href: "/admin/blog/new", icon: Newspaper },
    hasPermission(session, "team.manage") && { label: "Add team member", href: "/admin/team/new", icon: Users },
    hasPermission(session, "inquiries.manage") && { label: "View inquiries", href: "/admin/inquiries", icon: Inbox },
    hasPermission(session, "users.manage") && { label: "Create user", href: "/admin/users/new", icon: UserPlus },
  ].filter(Boolean) as { label: string; href: string; icon: typeof Building2 }[];

  return (
    <div>
      <PageHeader
        title={`Good ${now.getHours() < 12 ? "morning" : now.getHours() < 18 ? "afternoon" : "evening"}, ${session.user.name.split(" ")[0]}.`}
        description="A live overview of the Kayan Land website, content, and customer inquiries."
      />

      {denied && (
        <div className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Your role does not include access to that section. Ask a Super Admin to
          update your permissions if you need it.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total projects" value={totalProjects} hint={`${publishedProjects} published · ${draftProjects} drafts`} icon={Building2} href="/admin/projects" />
        <StatCard label="New inquiries" value={newContact + newQuotes} hint={`${monthlyContact + monthlyQuotes} received this month`} icon={Inbox} href="/admin/inquiries" />
        <StatCard label="Published articles" value={publishedPosts} hint="Journal posts live on the website" icon={Newspaper} href="/admin/blog" />
        <StatCard label="Team members" value={teamMembers} hint="Published profiles" icon={Users} href="/admin/team" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniStat label="Published services" value={publishedServices} />
        <MiniStat label="Quote requests" value={quoteTotal} />
        <MiniStat label="Page views · 30 days" value={pageViews} />
        <MiniStat label="Newsletter subscribers" value={subscribers} />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.35fr_1fr]">
        <div className="rounded-lg border border-border/80 bg-card">
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
            <div>
              <h2 className="text-base font-medium">Inquiry trend</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Contact and quote forms, last six months</p>
            </div>
            <Link href="/admin/inquiries" className="text-xs font-medium text-accent hover:underline">
              Manage
            </Link>
          </div>
          <div className="p-4">
            <InquiryTrendChart data={months} />
          </div>
        </div>

        <div className="rounded-lg border border-border/80 bg-card">
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
            <div>
              <h2 className="text-base font-medium">Project categories</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Portfolio distribution</p>
            </div>
            <Link href="/admin/projects/categories" className="text-xs font-medium text-accent hover:underline">
              Categories
            </Link>
          </div>
          <div className="p-4">
            <CategoryChart data={categories.map((category) => ({ name: category.name, value: category._count.projects }))} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <div className="rounded-lg border border-border/80 bg-card">
          <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
            <h2 className="text-base font-medium">Recent inquiries</h2>
            <Link href="/admin/inquiries" className="text-xs font-medium text-accent hover:underline">
              View all
            </Link>
          </div>
          {recent.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((item) => (
                  <TableRow key={`${item.type}-${item.id}`}>
                    <TableCell>
                      <Link href={item.href} className="font-medium hover:text-accent">
                        {item.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">{item.email}</p>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{item.type}</TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                      {formatDateTime(item.createdAt)}
                    </TableCell>
                    <TableCell>
                      <InquiryStatusBadge status={item.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-muted-foreground">
              No inquiries yet. Submissions from the contact and quote forms will appear here.
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border/80 bg-card p-5">
            <h2 className="text-base font-medium">Quick actions</h2>
            <div className="mt-4 grid gap-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-3 rounded-md border border-border/70 px-3 py-2.5 text-sm transition-colors hover:border-accent/50 hover:bg-accent/5"
                >
                  <action.icon className="size-4 text-accent" />
                  <span className="flex-1">{action.label}</span>
                  <Plus className="size-3.5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border/80 bg-card p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-medium">Recent activity</h2>
              {hasPermission(session, "audit.view") && (
                <Link href="/admin/audit" className="text-xs font-medium text-accent hover:underline">
                  Audit log
                </Link>
              )}
            </div>
            {logs.length ? (
              <ul className="mt-3 space-y-3">
                {logs.map((log) => (
                  <li key={log.id} className="flex items-start gap-3 text-xs">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-accent" />
                    <div className="min-w-0">
                      <p className="text-foreground/85">
                        <span className="font-medium">{log.user?.name || "System"}</span>{" "}
                        {log.action.replaceAll(".", " ").replaceAll("_", " ")}
                      </p>
                      <p className="mt-0.5 text-muted-foreground">
                        {log.entity} · {formatDateTime(log.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                Activity appears here as administrators make changes.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between rounded-lg border border-border/80 bg-primary px-6 py-5 text-white">
        <div>
          <p className="text-sm font-medium">Website analytics</p>
          <p className="mt-1 text-xs text-white/60">
            {pageViews} page views in the last 30 days from first-party tracking.
          </p>
        </div>
        <Button asChild variant="accent" size="sm">
          <Link href="/admin/analytics">
            Open analytics <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Eye className="size-3.5" />
        All figures are read directly from MySQL. No sample analytics are displayed.
      </div>
    </div>
  );
}
