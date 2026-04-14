import Link from "next/link";
import {
  UtensilsCrossed,
  Hotel,
  Plane,
  Car,
  Laptop,
  Users,
  Phone,
  GraduationCap,
  MoreHorizontal,
  AlertTriangle,
} from "lucide-react";
import { cn, formatCurrency, formatDate, getPolicyBadgeConfig } from "@/lib/utils";
import { ExpenseStatusBadge } from "@/components/expenses/ExpenseStatusBadge";

interface ExpenseCardProps {
  expense: {
    id: string;
    category: string;
    status: string;
    amount: number;
    currency: string;
    description: string;
    merchantName?: string | null;
    transactionDate: Date | string;
    policyResult?: string | null;
    policyViolations?: string | null;
    aiAnomalyScore?: number | null;
    aiAnomalyReason?: string | null;
  };
}

const categoryIconMap: Record<string, React.ReactNode> = {
  MEALS: <UtensilsCrossed className="h-5 w-5" />,
  LODGING: <Hotel className="h-5 w-5" />,
  AIRFARE: <Plane className="h-5 w-5" />,
  GROUND_TRANSPORT: <Car className="h-5 w-5" />,
  OFFICE_SUPPLIES: <Laptop className="h-5 w-5" />,
  ENTERTAINMENT: <Users className="h-5 w-5" />,
  COMMUNICATION: <Phone className="h-5 w-5" />,
  CONFERENCE: <GraduationCap className="h-5 w-5" />,
  OTHER: <MoreHorizontal className="h-5 w-5" />,
};

const categoryColorMap: Record<string, string> = {
  MEALS: "bg-orange-100 text-orange-600",
  LODGING: "bg-blue-100 text-blue-600",
  AIRFARE: "bg-sky-100 text-sky-600",
  GROUND_TRANSPORT: "bg-slate-100 text-slate-600",
  OFFICE_SUPPLIES: "bg-violet-100 text-violet-600",
  ENTERTAINMENT: "bg-pink-100 text-pink-600",
  COMMUNICATION: "bg-cyan-100 text-cyan-600",
  CONFERENCE: "bg-amber-100 text-amber-600",
  OTHER: "bg-slate-100 text-slate-500",
};

function formatCategoryLabel(category: string): string {
  return category
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ExpenseCard({ expense }: ExpenseCardProps) {
  const icon = categoryIconMap[expense.category] ?? <MoreHorizontal className="h-5 w-5" />;
  const iconColor = categoryColorMap[expense.category] ?? "bg-slate-100 text-slate-500";
  const showAnomaly = typeof expense.aiAnomalyScore === "number" && expense.aiAnomalyScore > 0.3;
  const policyConfig = expense.policyResult ? getPolicyBadgeConfig(expense.policyResult) : null;

  return (
    <Link href={`/expenses/${expense.id}`} className="group block">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
        <div className="flex items-start gap-3">
          {/* Category icon */}
          <div className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg", iconColor)}>
            {icon}
          </div>

          {/* Main content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {expense.merchantName || formatCategoryLabel(expense.category)}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">{expense.description}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-bold text-slate-900">
                  {formatCurrency(expense.amount, expense.currency)}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {formatDate(expense.transactionDate)}
                </p>
              </div>
            </div>

            {/* Badges row */}
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <ExpenseStatusBadge status={expense.status} />

              {policyConfig && (
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                    policyConfig.className
                  )}
                >
                  {policyConfig.label}
                </span>
              )}

              {showAnomaly && (
                <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                  <AlertTriangle className="h-3 w-3" />
                  AI Flagged
                </span>
              )}
            </div>

            {/* Anomaly reason */}
            {showAnomaly && expense.aiAnomalyReason && (
              <p className="mt-1.5 text-xs text-red-500 leading-snug">
                {expense.aiAnomalyReason.split(";")[0].trim()}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
