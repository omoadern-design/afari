import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: { value: number; isPositive: boolean };
  icon: ReactNode;
  iconBg?: string;
  iconColor?: string;
  className?: string;
}

export function KpiCard({
  title, value, subtitle, trend, icon,
  iconBg    = "bg-[#f0f0f0]",
  iconColor = "text-[#0a0a0a]",
  className,
}: KpiCardProps) {
  return (
    <div className={cn(
      "rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.05)]",
      className
    )}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#a3a3a3] truncate">{title}</p>
          <p className="mt-2 text-2xl font-bold text-[#0a0a0a] tabular-nums truncate">{value}</p>
          {(subtitle || trend) && (
            <div className="mt-1.5 flex items-center gap-2 flex-wrap">
              {trend && (
                <span className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-semibold",
                  trend.isPositive ? "text-[#16a34a]" : "text-[#dc2626]"
                )}>
                  {trend.isPositive
                    ? <TrendingUp className="h-3.5 w-3.5" />
                    : <TrendingDown className="h-3.5 w-3.5" />}
                  {trend.value > 0 ? "+" : ""}{trend.value}%
                </span>
              )}
              {subtitle && <span className="text-xs text-[#737373] truncate">{subtitle}</span>}
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
