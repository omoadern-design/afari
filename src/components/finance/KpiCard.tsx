import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: {
    value: number;    // percentage or absolute — display as-is
    isPositive: boolean;
  };
  icon: ReactNode;
  className?: string;
}

export function KpiCard({ title, value, subtitle, trend, icon, className }: KpiCardProps) {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 truncate">
              {title}
            </p>
            <p className="mt-1.5 text-2xl font-bold text-slate-900 tabular-nums truncate">
              {value}
            </p>
            {(subtitle || trend) && (
              <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                {trend && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 text-xs font-semibold",
                      trend.isPositive ? "text-emerald-600" : "text-red-500"
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
                  <span className="text-xs text-slate-500 truncate">{subtitle}</span>
                )}
              </div>
            )}
          </div>

          {/* Icon container */}
          <div className="shrink-0 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
