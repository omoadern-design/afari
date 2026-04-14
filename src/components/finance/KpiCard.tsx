import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: ReactNode;
  iconColor?: string;   // Tailwind text color class
  iconBg?: string;      // Tailwind bg color class
  className?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  iconColor = "text-[#1dbd80]",
  iconBg = "bg-[#1dbd80]/10",
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#e5e9f0] bg-white p-5 shadow-[0_1px_3px_rgba(12,29,61,0.06),0_1px_2px_rgba(12,29,61,0.04)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6b7a99] truncate">
            {title}
          </p>
          <p className="mt-2 text-2xl font-bold text-[#0c1d3d] tabular-nums truncate">
            {value}
          </p>
          {(subtitle || trend) && (
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              {trend && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-xs font-semibold",
                    trend.isPositive ? "text-[#1dbd80]" : "text-red-500"
                  )}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  {trend.value > 0 ? "+" : ""}
                  {trend.value}%
                </span>
              )}
              {subtitle && (
                <span className="text-xs text-[#6b7a99] truncate">{subtitle}</span>
              )}
            </div>
          )}
        </div>

        <div className={cn("shrink-0 flex h-11 w-11 items-center justify-center rounded-xl", iconBg, iconColor)}>
          {icon}
        </div>
      </div>
    </div>
  );
}
