import Link from "next/link";
import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BookOpenText,
  Building2,
  Eye,
  Inbox,
  Layers,
  Newspaper,
  Plus,
  SlidersHorizontal,
  Users,
  type LucideIcon,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { hasPermission } from "@/lib/auth/permissions";
import { PageHeader } from "@/components/admin/page-header";
import {
  ActivityHeatmap,
  BarChart,
  CategoryChart,
  DashboardTrafficChart,
  FunnelChart,
  InquiryTrendChart,
  RankedBarChart,
  Sparkline,
} from "@/components/admin/charts";
import { InquiryStatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const RANGES = ["today", "week", "month", "year", "all", "7d", "30d", "90d", "6m", "custom"] as const;
type DashboardRange = (typeof RANGES)[number];

const RANGE_LABELS: Record<DashboardRange, string> = {
  today: "Today",
  week: "This week",
  month: "This month",
  year: "This year",
  all: "All time",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  "6m": "Last 6 months",
  custom: "Custom range",
};

const PRESET_RANGES: DashboardRange[] = ["today", "week", "month", "year", "all"];

const PIPELINE_STAGES = [
  { name: "Received", statuses: ["NEW", "CONTACTED", "IN_PROGRESS", "QUOTATION_SENT", "APPROVED", "COMPLETED"] },
  { name: "Contacted", statuses: ["CONTACTED", "IN_PROGRESS", "QUOTATION_SENT", "APPROVED", "COMPLETED"] },
  { name: "In progress", statuses: ["IN_PROGRESS", "QUOTATION_SENT", "APPROVED", "COMPLETED"] },
  { name: "Quotation sent", statuses: ["QUOTATION_SENT", "APPROVED", "COMPLETED"] },
  { name: "Approved", statuses: ["APPROVED", "COMPLETED"] },
  { name: "Completed", statuses: ["COMPLETED"] },
];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfWeek(date: Date) {
  const weekday = (date.getDay() + 6) % 7;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - weekday);
}

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function formatDateInput(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function parseDateInput(value?: string) {
  if (!value) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function comparisonText(current: number, previous: number) {
  const difference = current - previous;
  if (difference === 0) return "No change from the previous period";
  return `${difference > 0 ? "+" : ""}${difference} from the previous period`;
}

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  href,
  current,
  previous,
  trend,
}: {
  label: string;
  value: number;
  hint: string;
  icon: LucideIcon;
  href: string;
  current?: number;
  previous?: number;
  trend?: number[];
}) {
  const difference = current === undefined || previous === undefined ? null : current - previous;
  const TrendIcon = difference === null ? null : difference < 0 ? ArrowDownRight : difference > 0 ? ArrowUpRight : ArrowRight;
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-xl border border-border/80 bg-card p-5 shadow-sm shadow-primary/[0.025] transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
    >
      <span className="absolute inset-x-0 top-0 h-0.5 bg-accent/60 transition-opacity group-hover:opacity-100" />
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-10 place-items-center rounded-lg bg-accent/10 text-accent">
          <Icon className="size-[18px]" />
        </span>
        <span className="rounded-full border border-border/70 px-2 py-1 text-[0.65rem] font-medium text-muted-foreground">
          {hint}
        </span>
      </div>
      <p className="mt-5 font-display text-4xl leading-none tracking-tight text-primary">{value.toLocaleString()}</p>
      {trend && trend.length > 1 && (
        <Sparkline data={trend} ariaLabel={`${label} trend for the selected period`} className="mt-2 h-7 w-full" />
      )}
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
        {difference !== null && TrendIcon && (
          <span className={`inline-flex items-center gap-0.5 text-[0.68rem] font-medium ${difference < 0 ? "text-muted-foreground" : difference > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
            <TrendIcon className="size-3.5" /> {comparisonText(current!, previous!)}
          </span>
        )}
      </div>
    </Link>
  );
}

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string; range?: string; from?: string; to?: string }>;
}) {
  const session = await requireAdmin();
  const query = await searchParams;
  const now = new Date();
  const today = startOfDay(now);
  const range: DashboardRange = RANGES.includes(query.range as DashboardRange)
    ? (query.range as DashboardRange)
    : query.from || query.to
      ? "custom"
      : "month";

  let currentStart = addDays(today, -29);
  let currentEnd = now;
  let previousStart: Date | null = addDays(today, -59);

  if (range === "today") {
    currentStart = today;
    previousStart = addDays(today, -1);
  } else if (range === "week") {
    currentStart = startOfWeek(now);
    previousStart = addDays(currentStart, -7);
  } else if (range === "month") {
    currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
    previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  } else if (range === "year") {
    currentStart = new Date(now.getFullYear(), 0, 1);
    previousStart = new Date(now.getFullYear() - 1, 0, 1);
  } else if (range === "all") {
    currentStart = new Date(2000, 0, 1);
    previousStart = null;
  } else if (range === "6m") {
    currentStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    previousStart = new Date(now.getFullYear(), now.getMonth() - 11, 1);
  } else if (range === "90d") {
    currentStart = addDays(today, -89);
    previousStart = addDays(currentStart, -90);
  } else if (range === "7d") {
    currentStart = addDays(today, -6);
    previousStart = addDays(currentStart, -7);
  } else if (range === "custom") {
    const from = parseDateInput(query.from);
    const to = parseDateInput(query.to);
    let start = startOfDay(from ?? addDays(today, -29));
    let end = startOfDay(to ?? today);
    if (start > end) [start, end] = [end, start];
    if (end > today) end = today;
    if (start > end) start = end;
    currentStart = start;
    currentEnd = addDays(end, 1);
    previousStart = new Date(start.getTime() - (currentEnd.getTime() - start.getTime()));
  }

  const hasPrevious = previousStart !== null;

  const [
    totalProjects,
    publishedProjects,
    draftProjects,
    publishedServices,
    teamMembers,
    publishedPosts,
    activeSubscribers,
    currentContacts,
    previousContacts,
    currentQuotes,
    previousQuotes,
    currentViews,
    previousViews,
    categories,
    contactRecent,
    quoteRecent,
    logs,
    contactTrendRows,
    quoteTrendRows,
    viewRows,
    totalPosts,
    totalServices,
    totalTeamMembers,
    contactStatusRows,
    quoteStatusRows,
    topPageRows,
  ] = await Promise.all([
    prisma.project.count({ where: { deletedAt: null } }),
    prisma.project.count({ where: { deletedAt: null, isPublished: true } }),
    prisma.project.count({ where: { deletedAt: null, isPublished: false } }),
    prisma.service.count({ where: { deletedAt: null, isPublished: true } }),
    prisma.teamMember.count({ where: { deletedAt: null, isPublished: true } }),
    prisma.blogPost.count({ where: { deletedAt: null, status: "PUBLISHED" } }),
    prisma.newsletterSubscriber.count({ where: { isActive: true } }),
    prisma.contactInquiry.count({ where: { createdAt: { gte: currentStart, lt: currentEnd } } }),
    hasPrevious
      ? prisma.contactInquiry.count({ where: { createdAt: { gte: previousStart!, lt: currentStart } } })
      : Promise.resolve(0),
    prisma.quoteRequest.count({ where: { createdAt: { gte: currentStart, lt: currentEnd } } }),
    hasPrevious
      ? prisma.quoteRequest.count({ where: { createdAt: { gte: previousStart!, lt: currentStart } } })
      : Promise.resolve(0),
    prisma.pageView.count({ where: { createdAt: { gte: currentStart, lt: currentEnd } } }),
    hasPrevious
      ? prisma.pageView.count({ where: { createdAt: { gte: previousStart!, lt: currentStart } } })
      : Promise.resolve(0),
    prisma.projectCategory.findMany({
      include: { _count: { select: { projects: { where: { deletedAt: null } } } } },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.contactInquiry.findMany({
      where: { createdAt: { gte: currentStart, lt: currentEnd } },
      take: 6,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, status: true, createdAt: true },
    }),
    prisma.quoteRequest.findMany({
      where: { createdAt: { gte: currentStart, lt: currentEnd } },
      take: 6,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, status: true, createdAt: true },
    }),
    prisma.auditLog.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    }),
    prisma.contactInquiry.findMany({
      where: { createdAt: { gte: currentStart, lt: currentEnd } },
      select: { createdAt: true },
    }),
    prisma.quoteRequest.findMany({
      where: { createdAt: { gte: currentStart, lt: currentEnd } },
      select: { createdAt: true },
    }),
    prisma.pageView.findMany({
      where: { createdAt: { gte: currentStart, lt: currentEnd } },
      select: { createdAt: true, visitorId: true },
    }),
    prisma.blogPost.count({ where: { deletedAt: null } }),
    prisma.service.count({ where: { deletedAt: null } }),
    prisma.teamMember.count({ where: { deletedAt: null } }),
    prisma.contactInquiry.groupBy({
      by: ["status"],
      where: { createdAt: { gte: currentStart, lt: currentEnd } },
      _count: { _all: true },
    }),
    prisma.quoteRequest.groupBy({
      by: ["status"],
      where: { createdAt: { gte: currentStart, lt: currentEnd } },
      _count: { _all: true },
    }),
    prisma.pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: currentStart, lt: currentEnd } },
      _count: { _all: true },
      orderBy: { _count: { path: "desc" } },
      take: 5,
    }),
  ]);

  const earliestRow = [...contactTrendRows, ...quoteTrendRows, ...viewRows].reduce<Date | null>(
    (earliest, row) => (earliest === null || row.createdAt < earliest ? row.createdAt : earliest),
    null,
  );

  type Granularity = "hour" | "day" | "week" | "month";
  let granularity: Granularity = "day";
  let chartStart = currentStart;
  let bucketCount = 30;

  if (range === "today") {
    granularity = "hour";
    chartStart = today;
    bucketCount = 24;
  } else if (range === "week" || range === "7d") {
    granularity = "day";
    bucketCount = 7;
  } else if (range === "month") {
    granularity = "day";
    bucketCount = now.getDate();
  } else if (range === "year") {
    granularity = "month";
    bucketCount = now.getMonth() + 1;
  } else if (range === "6m") {
    granularity = "month";
    bucketCount = 6;
  } else if (range === "90d") {
    granularity = "week";
    bucketCount = 13;
  } else if (range === "all") {
    granularity = "month";
    const earliest = earliestRow ?? new Date(now.getFullYear(), now.getMonth() - 5, 1);
    chartStart = new Date(earliest.getFullYear(), earliest.getMonth(), 1);
    bucketCount =
      (now.getFullYear() - chartStart.getFullYear()) * 12 + (now.getMonth() - chartStart.getMonth()) + 1;
  } else if (range === "custom") {
    const spanDays = Math.ceil((currentEnd.getTime() - currentStart.getTime()) / 86400000);
    if (spanDays <= 2) {
      granularity = "hour";
      bucketCount = Math.max(1, Math.ceil((currentEnd.getTime() - currentStart.getTime()) / 3600000));
    } else if (spanDays <= 62) {
      granularity = "day";
      bucketCount = spanDays;
    } else {
      granularity = "month";
      chartStart = new Date(currentStart.getFullYear(), currentStart.getMonth(), 1);
      const lastMoment = new Date(currentEnd.getTime() - 1);
      bucketCount =
        (lastMoment.getFullYear() - chartStart.getFullYear()) * 12 +
        (lastMoment.getMonth() - chartStart.getMonth()) +
        1;
      bucketCount = Math.max(1, bucketCount);
    }
  }

  const multiYear = granularity === "month" && bucketCount > 12;
  const bucketKeyFor = (date: Date) => {
    if (granularity === "hour") return `${dayKey(date)}-${date.getHours()}`;
    if (granularity === "month") return monthKey(date);
    if (granularity === "week")
      return String(
        Math.floor((startOfDay(date).getTime() - startOfDay(chartStart).getTime()) / (7 * 86400000)),
      );
    return dayKey(date);
  };

  const buckets = Array.from({ length: bucketCount }, (_, index) => {
    let start: Date;
    let label: string;
    if (granularity === "hour") {
      start = new Date(chartStart.getFullYear(), chartStart.getMonth(), chartStart.getDate(), chartStart.getHours() + index);
      label = `${String(start.getHours()).padStart(2, "0")}:00`;
    } else if (granularity === "month") {
      start = new Date(chartStart.getFullYear(), chartStart.getMonth() + index, 1);
      label = multiYear
        ? start.toLocaleString("en-GB", { month: "short", year: "2-digit" })
        : start.toLocaleString("en-GB", { month: "short" });
    } else if (granularity === "week") {
      start = addDays(chartStart, index * 7);
      label = start.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    } else {
      start = addDays(chartStart, index);
      label =
        range === "7d" || range === "week"
          ? start.toLocaleString("en-GB", { weekday: "short" })
          : start.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    }
    return {
      key: bucketKeyFor(start),
      start,
      label,
      contact: 0,
      quotes: 0,
      views: 0,
      visitors: new Set<string>(),
    };
  });

  const bucketMap = new Map(buckets.map((bucket) => [bucket.key, bucket]));
  const bucketForDate = (date: Date) => bucketMap.get(bucketKeyFor(date));

  for (const item of contactTrendRows) {
    const bucket = bucketForDate(item.createdAt);
    if (!bucket) continue;
    bucket.contact += 1;
  }
  for (const item of quoteTrendRows) {
    const bucket = bucketForDate(item.createdAt);
    if (bucket) bucket.quotes += 1;
  }
  for (const item of viewRows) {
    const bucket = bucketForDate(item.createdAt);
    if (!bucket) continue;
    bucket.views += 1;
    bucket.visitors.add(item.visitorId);
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
    hasPermission(session, "projects.manage") && { label: "Add project", description: "Publish a new case study", href: "/admin/projects/new", icon: Building2 },
    hasPermission(session, "services.manage") && { label: "Add service", description: "Update the service list", href: "/admin/services/new", icon: Layers },
    hasPermission(session, "blog.manage") && { label: "Write article", description: "Create a journal post", href: "/admin/blog/new", icon: Newspaper },
    hasPermission(session, "team.manage") && { label: "Add team member", description: "Update the studio team", href: "/admin/team/new", icon: Users },
    hasPermission(session, "inquiries.manage") && { label: "View inquiries", description: "Respond to submissions", href: "/admin/inquiries", icon: Inbox },
    hasPermission(session, "users.manage") && { label: "Create user", description: "Add a dashboard account", href: "/admin/users/new", icon: Users },
  ].filter(Boolean) as { label: string; description: string; href: string; icon: LucideIcon }[];

  const totalInquiries = currentContacts + currentQuotes;
  const previousInquiries = previousContacts + previousQuotes;
  const chartData = buckets.map(({ label, contact, quotes }) => ({ label, contact, quotes }));
  const trafficData = buckets.map(({ label, views, visitors }) => ({ label, views, visitors: visitors.size }));

  const contentHealth = [
    { label: "Projects", published: publishedProjects, draft: draftProjects },
    { label: "Articles", published: publishedPosts, draft: Math.max(0, totalPosts - publishedPosts) },
    { label: "Services", published: publishedServices, draft: Math.max(0, totalServices - publishedServices) },
    { label: "Team", published: teamMembers, draft: Math.max(0, totalTeamMembers - teamMembers) },
  ];

  const statusTotals = new Map<string, number>();
  for (const row of [...contactStatusRows, ...quoteStatusRows]) {
    statusTotals.set(row.status, (statusTotals.get(row.status) ?? 0) + row._count._all);
  }
  const statusCount = (status: string) => statusTotals.get(status) ?? 0;
  const rejectedCount = statusCount("REJECTED");
  const pipelineStages = PIPELINE_STAGES.map((stage) => ({
    name: stage.name,
    value: stage.statuses.reduce((sum, status) => sum + statusCount(status), 0),
  }));
  const pipelineNote = rejectedCount
    ? `${rejectedCount.toLocaleString()} rejected ${rejectedCount === 1 ? "request is" : "requests are"} excluded. Stages show active requests at or past each step.`
    : "Stages show active requests at or past each step.";

  const heatmap = Array.from({ length: 7 }, () => Array<number>(6).fill(0));
  for (const row of viewRows) {
    const day = (row.createdAt.getDay() + 6) % 7;
    const block = Math.min(5, Math.floor(row.createdAt.getHours() / 4));
    heatmap[day][block] += 1;
  }

  const topPages = topPageRows.map((row) => ({
    label: row.path === "/" ? "Home" : row.path,
    value: row._count._all,
  }));

  const rangeLabel =
    range === "custom"
      ? `${formatDateInput(currentStart)} – ${formatDateInput(addDays(currentEnd, -1))}`
      : RANGE_LABELS[range];
  const metricHint = range === "custom" ? "Custom" : RANGE_LABELS[range];

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Good ${now.getHours() < 12 ? "morning" : now.getHours() < 18 ? "afternoon" : "evening"}, ${session.user.name.split(" ")[0]}.`}
        description="Your live overview of website performance, content, and customer activity."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/analytics">Analytics report <ArrowRight className="size-4" /></Link>
          </Button>
        }
      />

      {query.denied && (
        <div className="rounded-xl border border-amber-300/50 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-200">
          Your role does not include access to that section. Ask a Super Admin to update your permissions if you need it.
        </div>
      )}

      <Card className="border-primary/10">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                <SlidersHorizontal className="size-3.5 text-accent" /> Dashboard filters
              </p>
              <p className="mt-1 text-sm text-foreground">Pick a preset period or choose exact dates.</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-medium text-primary">{rangeLabel}</span>
            </p>
          </div>
          <form method="get" action="/admin" className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
            {query.denied && <input type="hidden" name="denied" value={query.denied} />}
            <div className="flex flex-wrap items-center gap-1.5">
              {PRESET_RANGES.map((item) => (
                <Button
                  key={item}
                  type="submit"
                  name="range"
                  value={item}
                  size="sm"
                  variant={range === item ? "default" : "outline"}
                  aria-pressed={range === item}
                >
                  {RANGE_LABELS[item]}
                </Button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex items-center gap-1.5 whitespace-nowrap text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                From
                <Input
                  type="date"
                  name="from"
                  defaultValue={range === "custom" ? formatDateInput(currentStart) : ""}
                  max={formatDateInput(today)}
                  aria-label="Start date"
                  className="h-9 w-36 px-2.5 text-xs"
                />
              </label>
              <label className="inline-flex items-center gap-1.5 whitespace-nowrap text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                To
                <Input
                  type="date"
                  name="to"
                  defaultValue={range === "custom" ? formatDateInput(addDays(currentEnd, -1)) : ""}
                  max={formatDateInput(today)}
                  aria-label="End date"
                  className="h-9 w-36 px-2.5 text-xs"
                />
              </label>
              <Button type="submit" name="range" value="custom" size="sm" variant={range === "custom" ? "default" : "secondary"}>
                Apply dates
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <section aria-label="Key performance indicators" className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        <MetricCard label="Inquiries" value={totalInquiries} hint={metricHint} icon={Inbox} href="/admin/inquiries" current={hasPrevious ? totalInquiries : undefined} previous={hasPrevious ? previousInquiries : undefined} trend={buckets.map((bucket) => bucket.contact + bucket.quotes)} />
        <MetricCard label="Quote requests" value={currentQuotes} hint={metricHint} icon={Building2} href="/admin/inquiries/quotes" current={hasPrevious ? currentQuotes : undefined} previous={hasPrevious ? previousQuotes : undefined} trend={buckets.map((bucket) => bucket.quotes)} />
        <MetricCard label="Page views" value={currentViews} hint={metricHint} icon={Eye} href="/admin/analytics" current={hasPrevious ? currentViews : undefined} previous={hasPrevious ? previousViews : undefined} trend={buckets.map((bucket) => bucket.views)} />
        <MetricCard label="Published projects" value={publishedProjects} hint={`${draftProjects} drafts`} icon={Layers} href="/admin/projects" />
      </section>

      <section aria-label="Content totals" className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <div className="rounded-xl border border-border/70 bg-card px-4 py-3.5">
          <p className="text-xl font-semibold text-primary">{publishedServices}</p>
          <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Published services</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card px-4 py-3.5">
          <p className="text-xl font-semibold text-primary">{publishedPosts}</p>
          <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Published articles</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card px-4 py-3.5">
          <p className="text-xl font-semibold text-primary">{teamMembers}</p>
          <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Team members</p>
        </div>
        <div className="rounded-xl border border-border/70 bg-card px-4 py-3.5">
          <p className="text-xl font-semibold text-primary">{activeSubscribers}</p>
          <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted-foreground">Active subscribers</p>
        </div>
      </section>

      <section aria-label="Dashboard charts" className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-start justify-between gap-3 border-b border-border/70 pb-4">
            <div>
              <CardTitle>Inquiry activity</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Contact and quote submissions · {rangeLabel.toLowerCase()}</p>
            </div>
            <Link href="/admin/inquiries" className="shrink-0 text-xs font-medium text-accent hover:underline">Manage</Link>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <InquiryTrendChart data={chartData} />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-start justify-between gap-3 border-b border-border/70 pb-4">
            <div>
              <CardTitle>Project categories</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Projects grouped by portfolio category</p>
            </div>
            <Link href="/admin/projects/categories" className="shrink-0 text-xs font-medium text-accent hover:underline">Categories</Link>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <CategoryChart data={categories.map((category) => ({ name: category.name, value: category._count.projects }))} />
          </CardContent>
        </Card>
      </section>

      <section aria-label="Content and pipeline charts" className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-start justify-between gap-3 border-b border-border/70 pb-4">
            <div>
              <CardTitle>Content health</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Published and unpublished content by type</p>
            </div>
            <Link href="/admin/projects" className="shrink-0 text-xs font-medium text-accent hover:underline">Manage content</Link>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <BarChart
              data={contentHealth}
              ariaLabel="Published and draft content by type"
              series={[
                { key: "published", name: "Published", color: "var(--chart-1)" },
                { key: "draft", name: "Draft", color: "var(--chart-3)" },
              ]}
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-start justify-between gap-3 border-b border-border/70 pb-4">
            <div>
              <CardTitle>Inquiry pipeline</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Requests at or past each stage · {rangeLabel.toLowerCase()}</p>
            </div>
            <Link href="/admin/inquiries" className="shrink-0 text-xs font-medium text-accent hover:underline">Inquiries</Link>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <FunnelChart
              data={pipelineStages}
              note={pipelineNote}
              ariaLabel="Active inquiries by pipeline stage"
              emptyText="No inquiries in this period yet."
            />
          </CardContent>
        </Card>
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-start justify-between gap-3 border-b border-border/70 pb-4">
          <div>
            <CardTitle>Website traffic</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Page views and estimated unique visitors · {rangeLabel.toLowerCase()}</p>
          </div>
          <Link href="/admin/analytics" className="shrink-0 text-xs font-medium text-accent hover:underline">Full report</Link>
        </CardHeader>
        <CardContent className="p-4 sm:p-5">
          <DashboardTrafficChart data={trafficData} />
        </CardContent>
      </Card>

      <section aria-label="Audience charts" className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-start justify-between gap-3 border-b border-border/70 pb-4">
            <div>
              <CardTitle>Visitor activity</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Page views by weekday and time of day · {rangeLabel.toLowerCase()}</p>
            </div>
            <Link href="/admin/analytics" className="shrink-0 text-xs font-medium text-accent hover:underline">Analytics</Link>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <ActivityHeatmap
              data={heatmap}
              ariaLabel="Page views by weekday and time of day"
              emptyText="Visitor activity will appear here once the site receives traffic."
            />
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/70 pb-4">
            <CardTitle>Top pages</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">Most viewed pages · {rangeLabel.toLowerCase()}</p>
          </CardHeader>
          <CardContent className="p-4 sm:p-5">
            <RankedBarChart
              data={topPages}
              ariaLabel="Most viewed pages"
              emptyText="Page views will appear here once visitors browse the site."
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid items-start gap-4 2xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.8fr)]">
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between gap-3 border-b border-border/70 pb-4">
            <div>
              <CardTitle>Recent inquiries</CardTitle>
              <p className="mt-1 text-xs text-muted-foreground">Latest submissions in {rangeLabel.toLowerCase()}</p>
            </div>
            <Button asChild variant="outline" size="sm"><Link href="/admin/inquiries">View all <ArrowRight className="size-3.5" /></Link></Button>
          </CardHeader>
          {recent.length ? (
            <div className="overflow-x-auto">
              <Table className="min-w-[620px]">
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
                        <Link href={item.href} className="font-medium text-primary hover:text-accent">{item.name}</Link>
                        <p className="mt-0.5 max-w-52 truncate text-xs text-muted-foreground">{item.email}</p>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.type}</TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</TableCell>
                      <TableCell><InquiryStatusBadge status={item.status} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="px-5 py-12 text-center">
              <span className="mx-auto grid size-11 place-items-center rounded-full bg-secondary text-primary"><Inbox className="size-5" /></span>
              <p className="mt-3 text-sm font-medium text-primary">No inquiries in this period</p>
              <p className="mt-1 text-xs text-muted-foreground">New contact and quote submissions will appear here.</p>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle>Quick actions</CardTitle></CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-1">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex min-w-0 items-center gap-3 rounded-lg border border-border/70 p-3 transition-colors hover:border-accent/40 hover:bg-accent/[0.04]"
                >
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-accent/10 text-accent"><action.icon className="size-4" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-primary">{action.label}</span>
                    <span className="mt-0.5 block truncate text-[0.68rem] text-muted-foreground">{action.description}</span>
                  </span>
                  <Plus className="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-accent" />
                </Link>
              ))}
              {!quickActions.length && <p className="text-sm text-muted-foreground">No quick actions available for your role.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-3 pb-3">
              <CardTitle>Recent activity</CardTitle>
              {hasPermission(session, "audit.view") && <Link href="/admin/audit" className="text-xs font-medium text-accent hover:underline">Audit log</Link>}
            </CardHeader>
            <CardContent>
              {logs.length ? (
                <ul className="space-y-3">
                  {logs.map((log) => (
                    <li key={log.id} className="flex items-start gap-3">
                      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-secondary text-muted-foreground"><Activity className="size-3.5" /></span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs leading-relaxed text-foreground/85">
                          <span className="font-medium text-primary">{log.user?.name || "System"}</span>{" "}
                          {log.action.replaceAll(".", " ").replaceAll("_", " ")}
                        </p>
                        <p className="mt-0.5 truncate text-[0.65rem] text-muted-foreground">{log.entity} · {formatDateTime(log.createdAt)}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="py-4 text-xs leading-relaxed text-muted-foreground">Activity appears as administrators make changes.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="flex flex-col gap-3 rounded-xl border border-primary/15 bg-primary px-5 py-5 text-white sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/10"><BookOpenText className="size-5 text-accent" /></span>
          <div>
            <p className="text-sm font-semibold">Content at a glance</p>
            <p className="mt-0.5 text-xs text-white/65">{totalProjects} projects · {publishedPosts} articles · {publishedServices} services · {teamMembers} team profiles</p>
          </div>
        </div>
        <Button asChild variant="accent" size="sm"><Link href="/admin/analytics">Open analytics <ArrowRight className="size-4" /></Link></Button>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Eye className="size-3.5" /> All figures come from live site data; no sample metrics are shown.
      </div>
    </div>
  );
}
