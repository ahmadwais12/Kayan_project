"use client";

import { Fragment } from "react";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

type TrendPoint = { label: string } & Record<string, string | number>;
type TrendSeries = {
  key: string;
  name: string;
  color: string;
  strokeWidth?: number;
  dashed?: boolean;
  area?: boolean;
};

const CHART_WIDTH = 900;
const CHART_PADDING = { top: 12, right: 16, bottom: 30, left: 42 };

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function valueOf(point: TrendPoint, key: string) {
  const value = point[key];
  return typeof value === "number" ? value : 0;
}

function smoothPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  if (points.length < 3)
    return points.map((point, index) => `${index === 0 ? "M" : "L"} ${round(point.x)} ${round(point.y)}`).join(" ");
  let path = `M ${round(points[0].x)} ${round(points[0].y)}`;
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] ?? points[index];
    const current = points[index];
    const next = points[index + 1];
    const after = points[index + 2] ?? next;
    const control1x = current.x + (next.x - previous.x) / 6;
    const control1y = current.y + (next.y - previous.y) / 6;
    const control2x = next.x - (after.x - current.x) / 6;
    const control2y = next.y - (after.y - current.y) / 6;
    path += ` C ${round(control1x)} ${round(control1y)}, ${round(control2x)} ${round(control2y)}, ${round(next.x)} ${round(next.y)}`;
  }
  return path;
}

function TrendChart({
  data,
  series,
  height,
  ariaLabel,
}: {
  data: TrendPoint[];
  series: TrendSeries[];
  height: number;
  ariaLabel: string;
}) {
  const { top, right, bottom, left } = CHART_PADDING;
  const innerWidth = CHART_WIDTH - left - right;
  const innerHeight = height - top - bottom;
  const peak = Math.max(
    1,
    ...data.flatMap((point) => series.map((line) => valueOf(point, line.key))),
  );
  const step = Math.max(1, Math.ceil(peak / 4));
  const axisTop = step * 4;
  const ticks = Array.from({ length: 5 }, (_, index) => index * step);
  const baseline = top + innerHeight;
  const pointX = (index: number) =>
    left + (data.length <= 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth);
  const pointY = (value: number) => top + innerHeight - (value / axisTop) * innerHeight;
  const labelEvery = Math.max(1, Math.ceil(data.length / 8));

  return (
    <svg
      viewBox={`0 0 ${CHART_WIDTH} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label={ariaLabel}
    >
      {ticks.map((tick) => (
        <Fragment key={tick}>
          <line
            x1={left}
            x2={CHART_WIDTH - right}
            y1={pointY(tick)}
            y2={pointY(tick)}
            stroke="var(--chart-grid)"
            strokeDasharray={tick === 0 ? undefined : "3 3"}
          />
          <text x={left - 10} y={pointY(tick) + 4} textAnchor="end" fontSize={11} fill="var(--chart-tick)">
            {tick.toLocaleString()}
          </text>
        </Fragment>
      ))}

      {data.map((point, index) =>
        index % labelEvery === 0 || index === data.length - 1 ? (
          <text
            key={`${point.label}-${index}`}
            x={pointX(index)}
            y={height - bottom + 18}
            textAnchor="middle"
            fontSize={11}
            fill="var(--chart-tick)"
          >
            {point.label}
          </text>
        ) : null,
      )}

      {series.map((line) => {
        const points = data.map((point, index) => ({ x: pointX(index), y: pointY(valueOf(point, line.key)) }));
        const path = smoothPath(points);
        return (
          <g key={line.key}>
            {line.area && (
              <path
                d={`${path} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`}
                fill={line.color}
                fillOpacity={0.09}
              />
            )}
            <path
              d={path}
              fill="none"
              stroke={line.color}
              strokeWidth={line.strokeWidth ?? 2}
              strokeDasharray={line.dashed ? "6 4" : undefined}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {points.map((point, index) => (
              <circle key={`${line.key}-${index}`} cx={point.x} cy={point.y} r={2.2} fill={line.color}>
                <title>{`${data[index].label} · ${line.name}: ${valueOf(data[index], line.key).toLocaleString()}`}</title>
              </circle>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export function InquiryTrendChart({
  data,
}: {
  data: { label: string; contact: number; quotes: number }[];
}) {
  const totals = data.reduce(
    (result, item) => ({ contact: result.contact + item.contact, quotes: result.quotes + item.quotes }),
    { contact: 0, quotes: 0 },
  );

  return (
    <div className="w-full">
      <div className="mb-2 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-background/60 px-3 py-2.5">
          <span className="size-2.5 rounded-full bg-[var(--chart-1)]" />
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">Contact inquiries</span>
          <span className="text-sm font-semibold tabular-nums text-primary">{totals.contact.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-background/60 px-3 py-2.5">
          <span className="size-2.5 rounded-full bg-[var(--chart-2)]" />
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">Quote requests</span>
          <span className="text-sm font-semibold tabular-nums text-primary">{totals.quotes.toLocaleString()}</span>
        </div>
      </div>
      <TrendChart
        data={data}
        height={250}
        ariaLabel="Contact inquiries and quote requests over time"
        series={[
          { key: "contact", name: "Contact inquiries", color: "var(--chart-1)", strokeWidth: 2.75 },
          { key: "quotes", name: "Quote requests", color: "var(--chart-2)", strokeWidth: 2.75 },
        ]}
      />
    </div>
  );
}

export function ComboChart({
  data,
  height = 260,
  ariaLabel,
}: {
  data: { label: string; views: number; visitors: number }[];
  height?: number;
  ariaLabel: string;
}) {
  const { top, right, bottom, left } = CHART_PADDING;
  const innerWidth = CHART_WIDTH - left - right;
  const innerHeight = height - top - bottom;
  const peak = Math.max(1, ...data.map((point) => Math.max(point.views, point.visitors)));
  const step = Math.max(1, Math.ceil(peak / 4));
  const axisTop = step * 4;
  const ticks = Array.from({ length: 5 }, (_, index) => index * step);
  const baseline = top + innerHeight;
  const slot = innerWidth / Math.max(1, data.length);
  const barWidth = Math.min(26, slot * 0.5);
  const pointX = (index: number) => left + slot * index + slot / 2;
  const pointY = (value: number) => top + innerHeight - (value / axisTop) * innerHeight;
  const labelEvery = Math.max(1, Math.ceil(data.length / 8));
  const linePoints = data.map((point, index) => ({ x: pointX(index), y: pointY(point.visitors) }));
  const linePath = smoothPath(linePoints);

  return (
    <svg viewBox={`0 0 ${CHART_WIDTH} ${height}`} className="h-auto w-full" role="img" aria-label={ariaLabel}>
      {ticks.map((tick) => (
        <Fragment key={tick}>
          <line
            x1={left}
            x2={CHART_WIDTH - right}
            y1={pointY(tick)}
            y2={pointY(tick)}
            stroke="var(--chart-grid)"
            strokeDasharray={tick === 0 ? undefined : "3 3"}
          />
          <text x={left - 10} y={pointY(tick) + 4} textAnchor="end" fontSize={11} fill="var(--chart-tick)">
            {tick.toLocaleString()}
          </text>
        </Fragment>
      ))}

      {data.map((point, index) => {
        const barHeight = (point.views / axisTop) * innerHeight;
        return (
          <rect
            key={`bar-${index}`}
            x={pointX(index) - barWidth / 2}
            y={baseline - barHeight}
            width={barWidth}
            height={point.views > 0 ? Math.max(2, barHeight) : 0}
            rx={2}
            fill="var(--chart-1)"
            fillOpacity={0.8}
          >
            <title>{`${point.label} · Page views: ${point.views.toLocaleString()}`}</title>
          </rect>
        );
      })}

      {data.map((point, index) =>
        index % labelEvery === 0 || index === data.length - 1 ? (
          <text
            key={`label-${index}`}
            x={pointX(index)}
            y={height - bottom + 18}
            textAnchor="middle"
            fontSize={11}
            fill="var(--chart-tick)"
          >
            {point.label}
          </text>
        ) : null,
      )}

      <path d={linePath} fill="none" stroke="var(--chart-2)" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      {linePoints.map((point, index) => (
        <circle key={`visitor-${index}`} cx={point.x} cy={point.y} r={2.4} fill="var(--chart-2)">
          <title>{`${data[index].label} · Unique visitors: ${data[index].visitors.toLocaleString()}`}</title>
        </circle>
      ))}
    </svg>
  );
}

export function DashboardTrafficChart({
  data,
}: {
  data: { label: string; views: number; visitors: number }[];
}) {
  const totals = data.reduce(
    (result, item) => ({ views: result.views + item.views, visitors: result.visitors + item.visitors }),
    { views: 0, visitors: 0 },
  );

  return (
    <div className="w-full">
      <div className="mb-2 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-background/60 px-3 py-2.5">
          <span className="size-2.5 rounded-sm bg-[var(--chart-1)]" />
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">Page views</span>
          <span className="text-sm font-semibold tabular-nums text-primary">{totals.views.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2.5 rounded-lg border border-border/70 bg-background/60 px-3 py-2.5">
          <span className="size-2.5 rounded-full bg-[var(--chart-2)]" />
          <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">Unique visitors*</span>
          <span className="text-sm font-semibold tabular-nums text-primary">{totals.visitors.toLocaleString()}</span>
        </div>
      </div>
      <ComboChart data={data} height={245} ariaLabel="Page views as bars and unique visitors as a line over time" />
      <p className="mt-1 text-[0.65rem] text-muted-foreground">*Unique visitors are deduplicated within each chart interval.</p>
    </div>
  );
}

export function DonutChart({
  data,
  centerLabel,
  ariaLabel,
  emptyText,
}: {
  data: { name: string; value: number }[];
  centerLabel: string;
  ariaLabel: string;
  emptyText: string;
}) {
  const filtered = data.filter((item) => item.value > 0);
  if (!filtered.length) {
    return (
      <div className="flex h-[230px] items-center justify-center px-4 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }
  const total = filtered.reduce((sum, item) => sum + item.value, 0);
  const segments: { name: string; value: number; color: string; arc: number; dashOffset: number }[] = [];
  let runningPercent = 0;
  for (const [index, item] of filtered.entries()) {
    const percent = (item.value / total) * 100;
    const gap = Math.min(1.4, percent / 4);
    segments.push({
      name: item.name,
      value: item.value,
      color: COLORS[index % COLORS.length],
      arc: Math.max(0.4, percent - gap),
      dashOffset: -(runningPercent + gap / 2),
    });
    runningPercent += percent;
  }

  return (
    <div className="grid min-h-[230px] grid-cols-[minmax(110px,0.72fr)_minmax(0,1fr)] items-center gap-2 sm:gap-4">
      <div className="relative h-[190px] min-w-0">
        <svg viewBox="0 0 200 200" className="size-full" role="img" aria-label={ariaLabel}>
          {segments.map((segment) => (
            <circle
              key={segment.name}
              cx={100}
              cy={100}
              r={72}
              fill="none"
              stroke={segment.color}
              strokeWidth={30}
              pathLength={100}
              strokeDasharray={`${segment.arc} ${100 - segment.arc}`}
              strokeDashoffset={segment.dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 100 100)"
            >
              <title>{`${segment.name}: ${segment.value.toLocaleString()}`}</title>
            </circle>
          ))}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl leading-none text-primary">{total.toLocaleString()}</span>
          <span className="mt-1 text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{centerLabel}</span>
        </div>
      </div>
      <div className="grid min-w-0 gap-1">
        {filtered.map((item, index) => (
          <div key={item.name} className="flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-secondary/60">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
            <span className="min-w-0 flex-1 truncate text-[0.68rem] text-muted-foreground">{item.name}</span>
            <span className="text-xs font-semibold tabular-nums text-primary">{item.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CategoryChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <DonutChart
      data={data}
      centerLabel="projects"
      ariaLabel="Project category distribution"
      emptyText="Add projects to see the category distribution."
    />
  );
}

const BAR_WIDTH = 640;
const BAR_PADDING = { top: 16, right: 12, bottom: 30, left: 36 };

export function BarChart({
  data,
  series,
  height = 260,
  ariaLabel,
}: {
  data: TrendPoint[];
  series: { key: string; name: string; color: string }[];
  height?: number;
  ariaLabel: string;
}) {
  const { top, right, bottom, left } = BAR_PADDING;
  const innerWidth = BAR_WIDTH - left - right;
  const innerHeight = height - top - bottom;
  const peak = Math.max(1, ...data.flatMap((item) => series.map((line) => valueOf(item, line.key))));
  const step = Math.max(1, Math.ceil(peak / 4));
  const axisTop = step * 4;
  const ticks = Array.from({ length: 5 }, (_, index) => index * step);
  const groupWidth = innerWidth / Math.max(1, data.length);
  const barWidth = Math.min(40, (groupWidth * 0.62) / Math.max(1, series.length));
  const barGap = 6;
  const totals = series.map((line) => ({
    ...line,
    total: data.reduce((sum, item) => sum + valueOf(item, line.key), 0),
  }));

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        {totals.map((line) => (
          <span key={line.key} className="inline-flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm" style={{ backgroundColor: line.color }} aria-hidden />
            {line.name}
            <span className="font-semibold tabular-nums text-primary">{line.total.toLocaleString()}</span>
          </span>
        ))}
      </div>
      <svg viewBox={`0 0 ${BAR_WIDTH} ${height}`} className="h-auto w-full" role="img" aria-label={ariaLabel}>
        {ticks.map((tick) => {
          const y = top + innerHeight - (tick / axisTop) * innerHeight;
          return (
            <Fragment key={tick}>
              <line
                x1={left}
                x2={BAR_WIDTH - right}
                y1={y}
                y2={y}
                stroke="var(--chart-grid)"
                strokeDasharray={tick === 0 ? undefined : "3 3"}
              />
              <text x={left - 10} y={y + 4} textAnchor="end" fontSize={11} fill="var(--chart-tick)">
                {tick.toLocaleString()}
              </text>
            </Fragment>
          );
        })}
        {data.map((item, index) => {
          const groupCenter = left + groupWidth * index + groupWidth / 2;
          const barsWidth = series.length * barWidth + (series.length - 1) * barGap;
          const startX = groupCenter - barsWidth / 2;
          return (
            <g key={item.label}>
              {series.map((line, seriesIndex) => {
                const value = valueOf(item, line.key);
                const barHeight = (value / axisTop) * innerHeight;
                const x = startX + seriesIndex * (barWidth + barGap);
                return (
                  <rect
                    key={line.key}
                    x={x}
                    y={top + innerHeight - barHeight}
                    width={barWidth}
                    height={value > 0 ? Math.max(2, barHeight) : 0}
                    rx={2}
                    fill={line.color}
                    fillOpacity={0.9}
                  >
                    <title>{`${item.label} · ${line.name}: ${value.toLocaleString()}`}</title>
                  </rect>
                );
              })}
              <text x={groupCenter} y={height - bottom + 18} textAnchor="middle" fontSize={11} fill="var(--chart-tick)">
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function RankedBarChart({
  data,
  ariaLabel,
  emptyText,
}: {
  data: { label: string; value: number }[];
  ariaLabel: string;
  emptyText: string;
}) {
  if (!data.length) {
    return (
      <div className="flex h-[230px] items-center justify-center px-4 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }
  const max = Math.max(1, ...data.map((item) => item.value));

  return (
    <ol className="grid gap-3 py-1" aria-label={ariaLabel}>
      {data.map((item, index) => (
        <li key={`${item.label}-${index}`} className="grid grid-cols-[1.4rem_minmax(0,1fr)_auto] items-center gap-3">
          <span className="text-[0.68rem] font-semibold tabular-nums text-muted-foreground">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <span className="block truncate text-xs text-foreground/85" title={item.label}>{item.label}</span>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-[var(--chart-1)]"
                style={{ width: `${Math.max(3, (item.value / max) * 100)}%` }}
              />
            </div>
          </div>
          <span className="text-xs font-semibold tabular-nums text-primary">{item.value.toLocaleString()}</span>
        </li>
      ))}
    </ol>
  );
}

export function Sparkline({
  data,
  color = "var(--chart-1)",
  ariaLabel,
  className,
}: {
  data: number[];
  color?: string;
  ariaLabel: string;
  className?: string;
}) {
  if (data.length < 2) return null;
  const width = 140;
  const height = 32;
  const inset = 3;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = Math.max(1, max - min);
  const points = data.map((value, index) => ({
    x: inset + (index / (data.length - 1)) * (width - inset * 2),
    y: height - inset - ((value - min) / range) * (height - inset * 2),
  }));
  const line = smoothPath(points);
  const area = `${line} L ${points[points.length - 1].x} ${height - inset} L ${points[0].x} ${height - inset} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={className ?? "h-7 w-full"}
      role="img"
      aria-label={ariaLabel}
    >
      <path d={area} fill={color} fillOpacity={0.1} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={1.6}
        vectorEffect="non-scaling-stroke"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FunnelChart({
  data,
  note,
  ariaLabel,
  emptyText,
}: {
  data: { name: string; value: number }[];
  note?: string;
  ariaLabel: string;
  emptyText: string;
}) {
  const total = data[0]?.value ?? 0;
  if (!total) {
    return (
      <div className="flex h-[230px] items-center justify-center px-4 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="w-full">
      <ol className="grid gap-1.5" aria-label={ariaLabel}>
        {data.map((stage, index) => {
          const width = Math.max(6, (stage.value / total) * 100);
          const previous = index > 0 ? data[index - 1].value : stage.value;
          const conversion = previous > 0 ? Math.round((stage.value / previous) * 100) : 0;
          return (
            <li
              key={stage.name}
              className="grid grid-cols-[5.5rem_minmax(0,1fr)_2.5rem] items-center gap-2.5"
            >
              <div className="text-right leading-tight">
                <p className="text-[0.68rem] font-medium text-foreground/85">{stage.name}</p>
                {index > 0 && (
                  <p className="text-[0.58rem] text-muted-foreground">{conversion}% of previous</p>
                )}
              </div>
              <div className="h-7 overflow-hidden rounded-sm bg-secondary/60">
                <div
                  className="h-full rounded-sm"
                  style={{ width: `${width}%`, backgroundColor: COLORS[index % COLORS.length] }}
                />
              </div>
              <span className="text-right text-xs font-semibold tabular-nums text-primary">
                {stage.value.toLocaleString()}
              </span>
            </li>
          );
        })}
      </ol>
      {note && <p className="mt-3 border-t border-border/60 pt-2 text-[0.65rem] leading-relaxed text-muted-foreground">{note}</p>}
    </div>
  );
}

const HEATMAP_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HEATMAP_BLOCKS = ["00–04", "04–08", "08–12", "12–16", "16–20", "20–24"];

export function ActivityHeatmap({
  data,
  ariaLabel,
  emptyText,
}: {
  data: number[][];
  ariaLabel: string;
  emptyText: string;
}) {
  const max = Math.max(0, ...data.flat());
  if (!max) {
    return (
      <div className="flex h-[230px] items-center justify-center px-4 text-center text-sm text-muted-foreground">
        {emptyText}
      </div>
    );
  }

  const width = 640;
  const height = 216;
  const labelWidth = 38;
  const headerHeight = 18;
  const legendHeight = 18;
  const cellGap = 4;
  const cellWidth = (width - labelWidth - cellGap) / HEATMAP_BLOCKS.length;
  const cellHeight = (height - headerHeight - legendHeight - cellGap * (HEATMAP_DAYS.length - 1)) / HEATMAP_DAYS.length;
  const opacity = (value: number) => {
    if (value <= 0) return 0.05;
    const ratio = value / max;
    return ratio > 0.75 ? 0.9 : ratio > 0.5 ? 0.68 : ratio > 0.25 ? 0.46 : 0.26;
  };

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={ariaLabel}>
        {HEATMAP_BLOCKS.map((block, column) => (
          <text
            key={block}
            x={labelWidth + column * cellWidth + cellWidth / 2}
            y={11}
            textAnchor="middle"
            fontSize={10}
            fill="var(--chart-tick)"
          >
            {block}
          </text>
        ))}
        {HEATMAP_DAYS.map((day, row) => (
          <g key={day}>
            <text
              x={labelWidth - 8}
              y={headerHeight + row * (cellHeight + cellGap) + cellHeight / 2 + 4}
              textAnchor="end"
              fontSize={10}
              fill="var(--chart-tick)"
            >
              {day}
            </text>
            {HEATMAP_BLOCKS.map((block, column) => {
              const value = data[row]?.[column] ?? 0;
              return (
                <rect
                  key={`${day}-${block}`}
                  x={labelWidth + column * cellWidth}
                  y={headerHeight + row * (cellHeight + cellGap)}
                  width={cellWidth - cellGap}
                  height={cellHeight}
                  rx={3}
                  fill="var(--chart-1)"
                  fillOpacity={opacity(value)}
                >
                  <title>{`${day} · ${block}: ${value.toLocaleString()} views`}</title>
                </rect>
              );
            })}
          </g>
        ))}
      </svg>
      <div className="mt-1 flex items-center justify-end gap-1.5 text-[0.6rem] text-muted-foreground">
        <span>Low</span>
        {[0.26, 0.46, 0.68, 0.9].map((level) => (
          <span
            key={level}
            className="size-2.5 rounded-[2px]"
            style={{ backgroundColor: "var(--chart-1)", opacity: level }}
          />
        ))}
        <span>High</span>
      </div>
    </div>
  );
}

export function TrafficChart({
  data,
}: {
  data: {
    label: string;
    views: number;
    visitors: number;
    cardViews: number;
    cardClicks: number;
  }[];
}) {
  if (!data.length) return null;

  const series: TrendSeries[] = [
    { key: "views", name: "Page views", color: "var(--chart-1)", strokeWidth: 2.4 },
    { key: "visitors", name: "Unique visitors", color: "var(--chart-2)" },
    { key: "cardViews", name: "Card views", color: "var(--chart-3)" },
    { key: "cardClicks", name: "Card clicks", color: "var(--chart-4)", dashed: true },
  ];

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        {series.map((line) => (
          <span key={line.key} className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded-full" style={{ backgroundColor: line.color }} aria-hidden />
            {line.name}
          </span>
        ))}
      </div>
      <TrendChart
        data={data}
        series={series}
        height={340}
        ariaLabel="Page views, unique visitors, card views and card clicks"
      />
    </div>
  );
}
