"use client";

import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface TooltipPayloadEntry {
  dataKey?: string | number;
  name?: string;
  value?: number;
  color?: string;
}

interface CustomTooltipBaseProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

interface SpendDataPoint {
  month: string;
  spend: number;
  budget: number;
}

interface SpendChartProps {
  data: SpendDataPoint[];
}

function CustomTooltip({ active, payload, label }: CustomTooltipBaseProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-[#e5e5e5] bg-white p-3 shadow-lg text-sm">
      <p className="mb-2 font-semibold text-[#0a0a0a]">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color ?? "#3b82f6" }}
          />
          <span className="capitalize text-[#737373]">{entry.name}:</span>
          <span className="font-medium text-[#0a0a0a]">
            {formatCurrency(entry.value ?? 0)}
          </span>
        </div>
      ))}
    </div>
  );
}

function yAxisFormatter(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
  return `$${value}`;
}

export function SpendChart({ data }: SpendChartProps) {
  const hasBudget = data.some((d) => d.budget > 0);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          dy={6}
        />

        <YAxis
          tickFormatter={yAxisFormatter}
          tick={{ fontSize: 12, fill: "#94a3b8" }}
          axisLine={false}
          tickLine={false}
          width={52}
        />

        <Tooltip content={<CustomTooltip />} />

        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
          formatter={(value) => (
            <span className="capitalize text-[#737373]">{value}</span>
          )}
        />

        {/* Spend — filled area */}
        <Area
          type="monotone"
          dataKey="spend"
          name="Spend"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#spendGrad)"
          dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#3b82f6" }}
        />

        {/* Budget — dashed line (only when data exists) */}
        {hasBudget && (
          <Line
            type="monotone"
            dataKey="budget"
            name="Budget"
            stroke="#ef4444"
            strokeWidth={1.5}
            strokeDasharray="5 4"
            dot={false}
            activeDot={{ r: 4, fill: "#ef4444" }}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
