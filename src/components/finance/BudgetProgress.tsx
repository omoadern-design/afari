import { cn, formatCurrency } from "@/lib/utils";

interface DepartmentBudget {
  department: string;
  spend: number;
  budget: number;
  utilization: number;
}

interface BudgetProgressProps {
  departments: DepartmentBudget[];
}

function barColor(utilization: number): string {
  if (utilization >= 90) return "bg-red-500";
  if (utilization >= 70) return "bg-amber-500";
  return "bg-emerald-500";
}

function utilizationBadgeStyle(utilization: number): string {
  if (utilization >= 90) return "text-red-700 bg-red-50";
  if (utilization >= 70) return "text-amber-700 bg-amber-50";
  return "text-emerald-700 bg-emerald-50";
}

export function BudgetProgress({ departments }: BudgetProgressProps) {
  if (departments.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-400">
        No budget data available.
      </p>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-slate-100">
      {departments.map((dept) => {
        const pct = Math.min(dept.utilization, 100);
        return (
          <div key={dept.department} className="py-4 first:pt-0 last:pb-0">
            {/* Header row */}
            <div className="flex items-center justify-between gap-3 mb-2">
              <span className="text-sm font-medium text-slate-800 truncate">
                {dept.department}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-slate-500">
                  {dept.budget > 0
                    ? `${formatCurrency(dept.spend)} / ${formatCurrency(dept.budget)}`
                    : formatCurrency(dept.spend)}
                </span>
                {dept.budget > 0 && (
                  <span
                    className={cn(
                      "text-xs font-semibold rounded-full px-1.5 py-0.5 tabular-nums",
                      utilizationBadgeStyle(dept.utilization)
                    )}
                  >
                    {dept.utilization}%
                  </span>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {dept.budget > 0 ? (
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn("h-full rounded-full transition-all duration-500", barColor(dept.utilization))}
                  style={{ width: `${pct}%` }}
                />
                {/* Danger marker at 90% */}
                <div
                  className="absolute top-0 h-full w-px bg-red-300 opacity-60"
                  style={{ left: "90%" }}
                />
              </div>
            ) : (
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-300 w-full opacity-30"
                />
              </div>
            )}

            {/* Over-budget warning */}
            {dept.utilization > 100 && (
              <p className="mt-1 text-xs font-medium text-red-600">
                Over budget by {formatCurrency(dept.spend - dept.budget)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
