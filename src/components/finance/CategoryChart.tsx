"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface TooltipPayloadEntry {
  value?: number;
  payload?: CategoryDataPoint;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

interface CategoryDataPoint {
  category: string;
  amount: number;
  count: number;
}

interface CategoryChartProps {
  data: CategoryDataPoint[];
}

// Colour palette for up to ~12 categories
const COLORS = [
  "#3b82f6", // blue-500
  "#8b5cf6", // violet-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#06b6d4", // cyan-500
  "#f97316", // orange-500
  "#84cc16", // lime-500
  "#ec4899", // pink-500
  "#6366f1", // indigo-500
  "#14b8a6", // teal-500
  "#a78bfa", // violet-400
];

function labelCase(str: string): string {
  return str
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0]?.payload;
  return (
    <div className="rounded-lg border border-[#e5e5e5] bg-white p-3 shadow-lg text-sm">
      <p className="font-semibold text-[#0a0a0a] mb-1">{labelCase(label as string)}</p>
      <p className="text-[#0a0a0a]">
        <span className="font-medium">{formatCurrency(payload[0]?.value ?? 0)}</span>
      </p>
      {d && (
        <p className="text-[#737373] text-xs mt-0.5">
          {d.count} transaction{d.count !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}

export function CategoryChart({ data }: CategoryChartProps) {
  // Display at most 10 categories; horizontal bars look better when ordered desc
  const sorted = [...data].sort((a, b) => b.amount - a.amount).slice(0, 10);

  const maxAmount = sorted[0]?.amount ?? 1;

  const yAxisFormatter = (value: number): string => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
    return `$${value}`;
  };

  return (
    <ResponsiveContainer width="100%" height={Math.max(220, sorted.length * 38)}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />

        <XAxis
          type="number"
          tickFormatter={yAxisFormatter}
          tick={{ fontSize: 11, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          domain={[0, maxAmount * 1.05]}
        />

        <YAxis
          type="category"
          dataKey="category"
          tickFormatter={labelCase}
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          width={100}
        />

        <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />

        <Bar dataKey="amount" name="Amount" radius={[0, 4, 4, 0]} maxBarSize={22}>
          {sorted.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
