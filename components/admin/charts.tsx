"use client";

import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const COLORS = ["#172B35", "#C49A68", "#343B3D", "#8A9A9E", "#B9AF9F", "#6E7F84"];

export function InquiryTrendChart({
  data,
}: {
  data: { label: string; contact: number; quotes: number }[];
}) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8e2d6" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#6b7476", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#6b7476", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 6,
              border: "1px solid #e3ddd0",
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="contact"
            name="Contact inquiries"
            stroke="#172B35"
            strokeWidth={2}
            dot={{ r: 3, fill: "#172B35" }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="quotes"
            name="Quote requests"
            stroke="#C49A68"
            strokeWidth={2}
            dot={{ r: 3, fill: "#C49A68" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  const filtered = data.filter((item) => item.value > 0);
  if (!filtered.length) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        Add projects to see the category distribution.
      </div>
    );
  }
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={filtered}
            dataKey="value"
            nameKey="name"
            innerRadius={58}
            outerRadius={92}
            paddingAngle={2}
          >
            {filtered.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              borderRadius: 6,
              border: "1px solid #e3ddd0",
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
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

  const series = [
    { key: "views", name: "Page views", color: "#172B35", dash: undefined },
    { key: "visitors", name: "Unique visitors", color: "#C49A68", dash: undefined },
    { key: "cardViews", name: "Card views", color: "#4F7A6A", dash: undefined },
    { key: "cardClicks", name: "Card clicks", color: "#8A9A9E", dash: "6 4" },
  ] as const;

  const width = 900;
  const height = 340;
  const padding = { top: 16, right: 16, bottom: 34, left: 46 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const peak = Math.max(
    1,
    ...data.flatMap((point) => [point.views, point.visitors, point.cardViews, point.cardClicks]),
  );
  const step = Math.max(1, Math.ceil(peak / 4));
  const top = step * 4;
  const ticks = Array.from({ length: 5 }, (_, index) => index * step);
  const pointX = (index: number) =>
    padding.left + (data.length === 1 ? innerWidth / 2 : (index / (data.length - 1)) * innerWidth);
  const pointY = (value: number) => padding.top + innerHeight - (value / top) * innerHeight;
  const labelEvery = Math.max(1, Math.ceil(data.length / 10));

  return (
    <div className="w-full">
      <div className="mb-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        {series.map((line) => (
          <span key={line.key} className="inline-flex items-center gap-1.5">
            <span
              className="h-0.5 w-4 rounded-full"
              style={{ backgroundColor: line.color }}
              aria-hidden
            />
            {line.name}
          </span>
        ))}
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="Page views, unique visitors, card views and card clicks"
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={pointY(tick)}
              y2={pointY(tick)}
              stroke="#e8e2d6"
              strokeDasharray={tick === 0 ? undefined : "3 3"}
            />
            <text
              x={padding.left - 10}
              y={pointY(tick) + 4}
              textAnchor="end"
              fontSize={11}
              fill="#6b7476"
            >
              {tick}
            </text>
          </g>
        ))}

        {data.map((point, index) =>
          index % labelEvery === 0 || index === data.length - 1 ? (
            <text
              key={`${point.label}-${index}`}
              x={pointX(index)}
              y={height - padding.bottom + 18}
              textAnchor="middle"
              fontSize={11}
              fill="#6b7476"
            >
              {point.label}
            </text>
          ) : null,
        )}

        {series.map((line) => {
          const points = data
            .map((point, index) => `${pointX(index)},${pointY(point[line.key])}`)
            .join(" ");
          return (
            <g key={line.key}>
              <polyline
                points={points}
                fill="none"
                stroke={line.color}
                strokeWidth={line.key === "views" ? 2.4 : 2}
                strokeDasharray={line.dash}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {data.map((point, index) => (
                <circle
                  key={`${line.key}-${index}`}
                  cx={pointX(index)}
                  cy={pointY(point[line.key])}
                  r={2.2}
                  fill={line.color}
                >
                  <title>{`${point.label} · ${line.name}: ${point[line.key]}`}</title>
                </circle>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
