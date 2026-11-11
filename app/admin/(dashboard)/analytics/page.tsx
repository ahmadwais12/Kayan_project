import Link from "next/link";
import {
  Activity,
  CalendarDays,
  Eye,
  Layers,
  MousePointerClick,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";import { requirePermission } from "@/lib/auth/guards";
import { PageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { ChartDateFilter } from "@/components/admin/chart-date-filter";
import { TrafficChart } from "@/components/admin/charts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

const RANGES = [7, 30, 90] as const;
type Range = (typeof RANGES)[number];

const ROW_OPTIONS = [5, 10, 20, 50, 100] as const;
type RowOption = (typeof ROW_OPTIONS)[number];

const CHART_MODES = ["all", "day", "week", "month", "date"] as const;
type ChartMode = (typeof CHART_MODES)[number];

const CHART_LABELS: Record<ChartMode, string> = {
  all: "All time",
  day: "Today",
  week: "This week",
  month: "This month",
  date: "Date",
};

type ChartGranularity = "hour" | "day" | "month";

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function addDays(value: Date, days: number) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate() + days);
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function dateInputValue(value: Date) {
  return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}-${pad2(value.getDate())}`;
}

function parseDateInput(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : null;
}

function chartRangeLabel(mode: ChartMode, selectedDate: Date, now: Date) {
  if (mode === "all") return "All time";
  if (mode === "day") return "Today";
  if (mode === "week") return "This week";
  if (mode === "month") return now.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  return selectedDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const PAGE_TYPE_LABELS: Record<string, string> = {
  page: "Page",
  project: "Project",
  service: "Service",
  article: "Article",
  "PROJECT_PART": "Project part",
  PROJECT: "Project",
  SERVICE: "Service",
  ARTICLE: "Article",
};

const TYPE_STYLES: Record<string, string> = {
  Project: "bg-primary text-white",
  "Project part": "bg-secondary text-primary",
  Service: "bg-amber-50 text-amber-800",
  Article: "bg-emerald-50 text-emerald-700",
  Page: "bg-muted text-muted-foreground",
};

function hostOf(referrer: string | null) {
  if (!referrer) return "Direct";
  try {
    const url = new URL(referrer);
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return "Local preview";
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "Direct";
  }
}

function TypeBadge({ label }: { label: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded px-2 py-0.5 text-[0.62rem] font-semibold tracking-[0.08em] uppercase",
        TYPE_STYLES[label] || TYPE_STYLES.Page,
      )}
    >
      {label}
    </span>
  );
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("analytics.view");
  const query = await searchParams;
  const days = RANGES.includes(Number(query.days) as Range) ? (Number(query.days) as Range) : 30;
  const now = new Date();
  const since = new Date(now.getTime() - (days - 1) * 86400000);
  since.setHours(0, 0, 0, 0);

  const chartMode: ChartMode = (CHART_MODES as readonly string[]).includes(query.chart || "")
    ? (query.chart as ChartMode)
    : "week";
  const today = startOfDay(now);
  const requestedDate = parseDateInput(query.date);
  const selectedDate = requestedDate && requestedDate <= today ? requestedDate : today;
  const rows: RowOption = ROW_OPTIONS.includes(Number(query.rows) as RowOption)
    ? (Number(query.rows) as RowOption)
    : 5;

  const [views, devices, countries, todayViews, weekViews, cardGroups, recentViews] = await Promise.all([
    prisma.pageView.findMany({
      where: { createdAt: { gte: since } },
      select: {
        path: true,
        title: true,
        pageType: true,
        visitorId: true,
        referrer: true,
        device: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.pageView.groupBy({
      by: ["device"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.pageView.groupBy({
      by: ["country"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
      orderBy: { _count: { country: "desc" } },
      take: 12,
    }),
    prisma.pageView.count({
      where: { createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } },
    }),
    prisma.pageView.count({
      where: { createdAt: { gte: new Date(now.getTime() - 7 * 86400000) } },
    }),
    prisma.cardEvent.groupBy({
      by: ["entityType", "entityId", "entityTitle", "eventType"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.pageView.findMany({
      where: { createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        path: true,
        title: true,
        pageType: true,
        visitorId: true,
        sessionId: true,
        userName: true,
        ipHash: true,
        device: true,
        country: true,
        createdAt: true,
      },
    }),
  ]);

  type ChartBucket = {
    key: string;
    label: string;
    views: number;
    visitors: Set<string>;
    cardViews: number;
    cardClicks: number;
  };

  let chartStart: Date;
  let chartEnd: Date;
  let chartGranularity: ChartGranularity;
  let chartPageRows: { createdAt: Date; visitorId: string }[];
  let chartCardRows: { createdAt: Date; eventType: string }[];

  if (chartMode === "all") {
    [chartPageRows, chartCardRows] = await Promise.all([
      prisma.pageView.findMany({
        select: { createdAt: true, visitorId: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.cardEvent.findMany({
        select: { createdAt: true, eventType: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);
    const earliest = [chartPageRows[0]?.createdAt, chartCardRows[0]?.createdAt]
      .filter((value): value is Date => Boolean(value))
      .reduce<Date | null>((min, value) => (!min || value < min ? value : min), null);
    const first = earliest ?? now;
    chartStart = new Date(first.getFullYear(), first.getMonth(), 1);
    chartEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    chartGranularity = "month";
  } else {
    if (chartMode === "day") {
      chartStart = today;
      chartEnd = addDays(today, 1);
      chartGranularity = "hour";
    } else if (chartMode === "week") {
      const mondayOffset = (today.getDay() + 6) % 7;
      chartStart = addDays(today, -mondayOffset);
      chartEnd = addDays(chartStart, 7);
      chartGranularity = "day";
    } else if (chartMode === "month") {
      chartStart = new Date(now.getFullYear(), now.getMonth(), 1);
      chartEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      chartGranularity = "day";
    } else {
      chartStart = selectedDate;
      chartEnd = addDays(selectedDate, 1);
      chartGranularity = "hour";
    }
    [chartPageRows, chartCardRows] = await Promise.all([
      prisma.pageView.findMany({
        where: { createdAt: { gte: chartStart, lt: chartEnd } },
        select: { createdAt: true, visitorId: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.cardEvent.findMany({
        where: { createdAt: { gte: chartStart, lt: chartEnd } },
        select: { createdAt: true, eventType: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);
  }

  const chartBuckets: ChartBucket[] = [];
  if (chartGranularity === "hour") {
    for (let hour = 0; hour < 24; hour += 1) {
      chartBuckets.push({
        key: `${dateInputValue(chartStart)} ${pad2(hour)}:00`,
        label: `${pad2(hour)}:00`,
        views: 0,
        visitors: new Set<string>(),
        cardViews: 0,
        cardClicks: 0,
      });
    }
  } else if (chartGranularity === "day") {
    for (let day = chartStart; day < chartEnd; day = addDays(day, 1)) {
      chartBuckets.push({
        key: dateInputValue(day),
        label: day.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" }),
        views: 0,
        visitors: new Set<string>(),
        cardViews: 0,
        cardClicks: 0,
      });
    }
  } else {
    for (
      let month = chartStart;
      month < chartEnd;
      month = new Date(month.getFullYear(), month.getMonth() + 1, 1)
    ) {
      chartBuckets.push({
        key: `${month.getFullYear()}-${pad2(month.getMonth() + 1)}`,
        label: month.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
        views: 0,
        visitors: new Set<string>(),
        cardViews: 0,
        cardClicks: 0,
      });
    }
  }

  const chartKeyOf = (value: Date) => {
    if (chartGranularity === "hour") {
      return `${dateInputValue(value)} ${pad2(value.getHours())}:00`;
    }
    if (chartGranularity === "day") return dateInputValue(value);
    return `${value.getFullYear()}-${pad2(value.getMonth() + 1)}`;
  };

  const chartBucketMap = new Map(chartBuckets.map((bucket) => [bucket.key, bucket]));
  for (const row of chartPageRows) {
    const bucket = chartBucketMap.get(chartKeyOf(row.createdAt));
    if (!bucket) continue;
    bucket.views += 1;
    bucket.visitors.add(row.visitorId);
  }
  for (const row of chartCardRows) {
    const bucket = chartBucketMap.get(chartKeyOf(row.createdAt));
    if (!bucket) continue;
    if (row.eventType === "CLICK") bucket.cardClicks += 1;
    else bucket.cardViews += 1;
  }

  const chartData = chartBuckets.map((bucket) => ({
    label: bucket.label,
    views: bucket.views,
    visitors: bucket.visitors.size,
    cardViews: bucket.cardViews,
    cardClicks: bucket.cardClicks,
  }));
  const chartViews = chartData.reduce((total, point) => total + point.views, 0);
  const chartCards = chartData.reduce(
    (total, point) => total + point.cardViews + point.cardClicks,
    0,
  );
  const chartHasData = chartViews + chartCards > 0;
  const chartPeriod = chartRangeLabel(chartMode, selectedDate, now);
  const uniqueVisitors = new Set(views.map((view) => view.visitorId)).size;

  const pageMap = new Map<string, { path: string; title: string; type: string; views: number }>();
  for (const view of views) {
    const existing = pageMap.get(view.path);
    if (existing) {
      existing.views += 1;
      if (!existing.title && view.title) existing.title = view.title;
      continue;
    }
    pageMap.set(view.path, {
      path: view.path,
      title: view.title || view.path,
      type: PAGE_TYPE_LABELS[view.pageType || "page"] || "Page",
      views: 1,
    });
  }
  const pageRows = [...pageMap.values()].sort((a, b) => b.views - a.views);

  type CardRow = {
    key: string;
    entityType: string;
    entityId: string;
    entityTitle: string;
    views: number;
    clicks: number;
  };
  const cardMap = new Map<string, CardRow>();
  for (const row of cardGroups) {
    const key = `${row.entityType}:${row.entityId}`;
    const entry =
      cardMap.get(key) ||
      {
        key,
        entityType: row.entityType,
        entityId: row.entityId,
        entityTitle: row.entityTitle,
        views: 0,
        clicks: 0,
      };
    if (row.eventType === "CLICK") entry.clicks += row._count._all;
    else entry.views += row._count._all;
    cardMap.set(key, entry);
  }
  const cardRows = [...cardMap.values()].sort(
    (a, b) => b.views + b.clicks - (a.views + a.clicks),
  );
  const topCards = cardRows;

  const partRows = cardRows
    .filter((row) => row.entityType === "PROJECT_PART")
    .map((row) => ({
      path: row.entityId,
      title: row.entityTitle,
      type: "Project part",
      views: row.views,
    }));
  const breakdownRows = [...pageRows, ...partRows].sort((a, b) => b.views - a.views);

  const mostViewedPage = pageRows[0];
  const totalCardViews = cardRows.reduce((total, row) => total + row.views, 0);
  const totalCardClicks = cardRows.reduce((total, row) => total + row.clicks, 0);

  const deviceRows = ["mobile", "tablet", "desktop"].map((device) => ({
    device,
    count:
      devices.find((row) => (row.device || "unknown").toLowerCase() === device)?._count._all ?? 0,
  }));
  const unknownDevices = devices.find((row) => !row.device)?._count._all ?? 0;
  const deviceTotal = Math.max(views.length, 1);

  const countryRows = countries
    .filter((row) => row.country)
    .map((row) => ({ country: row.country as string, count: row._count._all }));
  const unknownCountries = countries.find((row) => !row.country)?._count._all ?? 0;

  const referrerMap = new Map<string, number>();
  for (const view of views) {
    const host = hostOf(view.referrer);
    referrerMap.set(host, (referrerMap.get(host) || 0) + 1);
  }
  const referrers = [...referrerMap.entries()]
    .map(([host, count]) => ({ host, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="First-party activity tracking for the public website: page views, project sections, card engagement and visitor identity."
        breadcrumb={[{ label: "Analytics" }]}
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
              {RANGES.map((range) => (
                <Button
                  key={range}
                  asChild
                  variant={range === days ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(range === days && "bg-primary text-white hover:bg-primary/90")}
                >
                  <Link
                    href={`/admin/analytics?days=${range}&chart=${chartMode}&rows=${rows}${
                      chartMode === "date" ? `&date=${dateInputValue(selectedDate)}` : ""
                    }`}
                  >
                    {range} days
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={`Website visits · ${days} days`}
          value={views.length}
          hint={`${todayViews} today · ${weekViews} in the last 7 days`}
          icon={Eye}
        />
        <StatCard
          label="Unique visitors"
          value={uniqueVisitors}
          hint="Distinct visitor cookies in this period"
          icon={Users}
        />
        <StatCard
          label="Most viewed page"
          value={mostViewedPage ? mostViewedPage.views : 0}
          hint={mostViewedPage ? mostViewedPage.path : "No page views recorded yet"}
          icon={Activity}
        />
        <StatCard
          label="Card engagement"
          value={totalCardViews + totalCardClicks}
          hint={`${totalCardViews} views · ${totalCardClicks} clicks`}
          icon={MousePointerClick}
        />
      </div>

      <Card className="mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
          <div>
            <h2 className="text-base font-medium">Page &amp; project breakdown</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Every route and project section with at least one view in this period
            </p>
          </div>
          <span className="text-xs text-muted-foreground">{breakdownRows.length} entries</span>
        </div>
        {breakdownRows.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page / section</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breakdownRows.slice(0, rows).map((row) => {
                const share = Math.round((row.views / Math.max(views.length, 1)) * 100);
                return (
                  <TableRow key={`${row.type}-${row.path}`}>
                    <TableCell>
                      <span className="block max-w-[28rem] truncate font-medium text-primary">
                        {row.title}
                      </span>
                      {row.type !== "Project part" && (
                        <span className="block truncate font-mono text-[0.68rem] text-muted-foreground">
                          {row.path}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <TypeBadge label={row.type} />
                    </TableCell>
                    <TableCell className="text-right font-medium">{row.views}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{share}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">
            No page views recorded in this period. Open the public website in another tab to
            generate the first entries.
          </p>
        )}
      </Card>

      <Card className="mt-6 overflow-hidden">
        <div className="border-b border-border/70 px-5 py-4">
          <h2 className="text-base font-medium">Top viewed cards</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Projects, services and articles ranked by impressions and clicks
          </p>
        </div>
        {topCards.length ? (
          <Table
            containerClassName="admin-scroll max-h-[24.5rem] overflow-auto"
            className="min-w-[46rem]"
          >
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Card</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead className="text-right">CTR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topCards.map((row, index) => {
                const typeLabel = PAGE_TYPE_LABELS[row.entityType] || row.entityType;
                const ctr = row.views ? Math.round((row.clicks / row.views) * 100) : 0;
                return (
                  <TableRow key={row.key}>
                    <TableCell className="text-xs text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </TableCell>
                    <TableCell>
                      <span className="block max-w-[20rem] truncate font-medium text-primary">
                        {row.entityTitle}
                      </span>
                      <span className="mt-1 flex items-center gap-2">
                        <TypeBadge label={typeLabel} />
                        <span className="truncate font-mono text-[0.62rem] text-muted-foreground">
                          {row.entityId}
                        </span>
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">{row.views}</TableCell>
                    <TableCell className="text-right">{row.clicks}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{ctr}%</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">
            Card impressions appear once visitors scroll the project, service and article
            cards into view.
          </p>
        )}
      </Card>

      <Card className="mt-6">
        <div className="flex flex-col gap-3 border-b border-border/70 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-medium">Traffic</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Page views, unique visitors and card engagement · {chartPeriod}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap items-center gap-1 rounded-md border border-border bg-card p-1">
              {CHART_MODES.filter((mode) => mode !== "date").map((mode) => (
                <Button
                  key={mode}
                  asChild
                  variant={mode === chartMode ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(mode === chartMode && "bg-primary text-white hover:bg-primary/90")}
                >
                  <Link href={`/admin/analytics?days=${days}&chart=${mode}&rows=${rows}`}>
                    {CHART_LABELS[mode]}
                  </Link>
                </Button>
              ))}
            </div>
            <ChartDateFilter
              key={dateInputValue(selectedDate)}
              days={days}
              rows={rows}
              value={dateInputValue(selectedDate)}
              max={dateInputValue(today)}
              active={chartMode === "date"}
            />
          </div>
        </div>
        <div className="flex items-center justify-between px-5 pt-4 text-xs text-muted-foreground">
          <span>{chartPeriod}</span>
          <span>
            {chartViews} view{chartViews === 1 ? "" : "s"} · {chartCards} card event
            {chartCards === 1 ? "" : "s"}
          </span>
        </div>
        <div className="p-4">
          {chartHasData ? (
            <TrafficChart data={chartData} />
          ) : (
            <div className="flex h-[340px] flex-col items-center justify-center gap-2 text-center">
              <Eye className="size-6 text-muted-foreground/60" />
              <p className="text-sm font-medium text-primary">No activity recorded for {chartPeriod}</p>
              <p className="max-w-sm text-sm text-muted-foreground">
                Page views and card engagement appear here as visitors browse the public
                website. Choose another period or date to compare.
              </p>
            </div>
          )}
        </div>
      </Card>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="border-b border-border/70 px-5 py-4">
            <h2 className="text-base font-medium">Devices</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Approximate device type per view</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deviceRows.map((row) => (
                <TableRow key={row.device}>
                  <TableCell className="capitalize">{row.device}</TableCell>
                  <TableCell className="text-right font-medium">{row.count}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {Math.round((row.count / deviceTotal) * 100)}%
                  </TableCell>
                </TableRow>
              ))}
              {unknownDevices > 0 && (
                <TableRow>
                  <TableCell>Unknown</TableCell>
                  <TableCell className="text-right font-medium">{unknownDevices}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {Math.round((unknownDevices / deviceTotal) * 100)}%
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-border/70 px-5 py-4">
            <h2 className="text-base font-medium">Countries</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">From proxy geo headers, where supplied</p>
          </div>
          {countryRows.length || unknownCountries > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                  <TableHead className="text-right">Share</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {countryRows.slice(0, rows).map((row) => (
                  <TableRow key={row.country}>
                    <TableCell>{row.country}</TableCell>
                    <TableCell className="text-right font-medium">{row.count}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {Math.round((row.count / deviceTotal) * 100)}%
                    </TableCell>
                  </TableRow>
                ))}
                {unknownCountries > 0 && (
                  <TableRow>
                    <TableCell>Unknown</TableCell>
                    <TableCell className="text-right font-medium">{unknownCountries}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {Math.round((unknownCountries / deviceTotal) * 100)}%
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          ) : (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">
              No country data recorded. The hosting proxy must forward a geo country header.
            </p>
          )}
        </Card>
      </div>

      <Card className="mt-5 overflow-hidden">
        <div className="border-b border-border/70 px-5 py-4">
          <h2 className="text-base font-medium">Referrers</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Where visitors arrive from</p>
        </div>
        {referrers.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Referrer</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="text-right">Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrers.slice(0, rows).map((row) => (
                <TableRow key={row.host}>
                  <TableCell className="font-medium text-primary">{row.host}</TableCell>
                  <TableCell className="text-right font-medium">{row.count}</TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground">
                    {Math.round((row.count / deviceTotal) * 100)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No referrer data recorded yet.
          </p>
        )}
      </Card>

      <Card className="mt-6 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
          <div>
            <h2 className="text-base font-medium">Recent visitor log</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Latest tracked page views with visitor identity and session details
            </p>
          </div>
          <Layers className="size-4 text-muted-foreground" />
        </div>
        {recentViews.length ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Visitor</TableHead>
                <TableHead>Page</TableHead>
                <TableHead>Path</TableHead>
                <TableHead>Device</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>IP hash</TableHead>
                <TableHead className="text-right">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentViews.slice(0, rows).map((view) => (
                <TableRow key={view.id}>
                  <TableCell>
                    <span className="block max-w-[11rem] truncate text-sm font-medium text-primary">
                      {view.userName || `Guest · ${view.visitorId.slice(0, 8)}`}
                    </span>
                    {view.sessionId && (
                      <span className="block truncate font-mono text-[0.62rem] text-muted-foreground/70">
                        session {view.sessionId.slice(0, 8)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="block max-w-[18rem] truncate text-sm text-primary">
                      {view.title || view.path}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="block max-w-[16rem] truncate font-mono text-[0.68rem] text-muted-foreground">
                      {view.path}
                    </span>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs capitalize text-muted-foreground">
                    {view.device || "Unknown"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                    {view.country || "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap font-mono text-[0.62rem] text-muted-foreground/70">
                    {view.ipHash ? view.ipHash.slice(0, 8) : "—"}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right text-[0.68rem] text-muted-foreground">
                    {formatDateTime(view.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">
            No visits recorded in this period.
          </p>
        )}
      </Card>

      <p className="mt-4 flex items-start gap-1.5 text-xs text-muted-foreground">
        <CalendarDays className="mt-0.5 size-3.5 shrink-0" />
        First-party tracking only: no third-party analytics scripts. Anonymous visitors use a
        random cookie and a hashed IP; signed-in administrators are recorded by name. Counts are
        approximate and exclude known bots.
      </p>
    </div>
  );
}
