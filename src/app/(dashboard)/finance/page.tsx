import { redirect } from "next/navigation";
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  Plane,
  BarChart3,
  AlertCircle,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KpiCard } from "@/components/finance/KpiCard";
import { SpendChart } from "@/components/finance/SpendChart";
import { CategoryChart } from "@/components/finance/CategoryChart";
import { BudgetProgress } from "@/components/finance/BudgetProgress";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonthlyPoint { month: string; spend: number; budget: number }
interface CategoryPoint { category: string; amount: number; count: number }
interface DeptPoint { department: string; spend: number; budget: number; utilization: number }
interface TopSpender { name: string; department: string; amount: number; tripCount: number }
interface Anomaly { id: string; userName: string; description: string; amount: number; score: number; reason: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function labelCase(str: string): string {
  return str.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Data fetching (server-side) ───────────────────────────────────────────────

async function getFinanceData(year: number) {
  const periodStart = new Date(`${year}-01-01T00:00:00.000Z`);
  const periodEnd   = new Date(`${year + 1}-01-01T00:00:00.000Z`);

  const [expenses, bookings, pendingApprovals, flaggedCount, budgets, anomalyExpenses] =
    await Promise.all([
      prisma.expense.findMany({
        where: { transactionDate: { gte: periodStart, lt: periodEnd }, status: { not: "DRAFT" } },
        include: { user: { select: { id: true, name: true, department: true } } },
        orderBy: { transactionDate: "asc" },
      }),
      prisma.booking.findMany({
        where: { createdAt: { gte: periodStart, lt: periodEnd }, status: { not: "DRAFT" } },
        include: { user: { select: { id: true, name: true, department: true } } },
        orderBy: { createdAt: "asc" },
      }),
      prisma.approvalRequest.count({ where: { status: "PENDING" } }),
      prisma.expense.count({ where: { status: "FLAGGED", transactionDate: { gte: periodStart, lt: periodEnd } } }),
      prisma.budget.findMany({ where: { period: { startsWith: String(year) } } }),
      prisma.expense.findMany({
        where: { aiAnomalyScore: { gt: 0.5 }, transactionDate: { gte: periodStart, lt: periodEnd } },
        include: { user: { select: { name: true, department: true } } },
        orderBy: { aiAnomalyScore: "desc" },
        take: 8,
      }),
    ]);

  // ── Totals ──
  const totalExpenseSpend = expenses.reduce((s, e) => s + e.amount, 0);
  const totalBookingSpend = bookings.reduce((s, b) => s + b.totalAmount, 0);
  const totalSpend  = totalExpenseSpend + totalBookingSpend;
  const totalBudget = budgets.reduce((s, b) => s + b.totalAmount, 0);
  const utilizationPct = totalBudget > 0 ? Math.round((totalSpend / totalBudget) * 100) : 0;
  const avgTripCost = bookings.length > 0 ? Math.round(totalBookingSpend / bookings.length) : 0;

  // ── Monthly spend ──
  const monthlySpendMap: Record<string, number> = {};
  const monthlyBudgetMap: Record<string, number> = {};
  for (let m = 1; m <= 12; m++) {
    const k = `${year}-${String(m).padStart(2, "0")}`;
    monthlySpendMap[k] = 0;
    monthlyBudgetMap[k] = 0;
  }
  for (const e of expenses) {
    const k = monthKey(new Date(e.transactionDate));
    if (k in monthlySpendMap) monthlySpendMap[k] += e.amount;
  }
  for (const b of bookings) {
    const k = monthKey(new Date(b.createdAt));
    if (k in monthlySpendMap) monthlySpendMap[k] += b.totalAmount;
  }
  for (const budget of budgets) {
    const months = budget.periodType === "MONTHLY" ? 1 : budget.periodType === "QUARTERLY" ? 3 : 12;
    const monthly = budget.totalAmount / months;
    let start = 1;
    if (budget.periodType === "QUARTERLY") {
      const q = parseInt(budget.period.split("Q")[1] ?? "1", 10);
      start = (q - 1) * 3 + 1;
    } else if (budget.periodType === "MONTHLY") {
      start = parseInt(budget.period.split("-")[1] ?? "1", 10);
    }
    for (let i = 0; i < months; i++) {
      const m = start + i;
      if (m >= 1 && m <= 12) {
        const k = `${year}-${String(m).padStart(2, "0")}`;
        if (k in monthlyBudgetMap) monthlyBudgetMap[k] += monthly;
      }
    }
  }
  const monthlySpend: MonthlyPoint[] = Object.keys(monthlySpendMap).sort().map((k) => ({
    month: MONTH_LABELS[parseInt(k.split("-")[1], 10) - 1],
    spend: Math.round(monthlySpendMap[k]),
    budget: Math.round(monthlyBudgetMap[k]),
  }));

  // ── By category ──
  const catMap: Record<string, { amount: number; count: number }> = {};
  for (const e of expenses) {
    if (!catMap[e.category]) catMap[e.category] = { amount: 0, count: 0 };
    catMap[e.category].amount += e.amount;
    catMap[e.category].count += 1;
  }
  for (const b of bookings) {
    if (!catMap[b.type]) catMap[b.type] = { amount: 0, count: 0 };
    catMap[b.type].amount += b.totalAmount;
    catMap[b.type].count += 1;
  }
  const byCategory: CategoryPoint[] = Object.entries(catMap)
    .map(([category, { amount, count }]) => ({ category, amount: Math.round(amount), count }))
    .sort((a, b) => b.amount - a.amount);

  // ── By department ──
  const deptSpend: Record<string, number> = {};
  for (const e of expenses) {
    deptSpend[e.user.department] = (deptSpend[e.user.department] ?? 0) + e.amount;
  }
  for (const b of bookings) {
    deptSpend[b.user.department] = (deptSpend[b.user.department] ?? 0) + b.totalAmount;
  }
  const deptBudget: Record<string, number> = {};
  for (const bud of budgets) {
    deptBudget[bud.department] = (deptBudget[bud.department] ?? 0) + bud.totalAmount;
  }
  const byDepartment: DeptPoint[] = Object.entries(deptSpend)
    .map(([department, spend]) => {
      const budget = deptBudget[department] ?? 0;
      return { department, spend: Math.round(spend), budget: Math.round(budget), utilization: budget > 0 ? Math.round((spend / budget) * 100) : 0 };
    })
    .sort((a, b) => b.spend - a.spend);

  // ── Top spenders ──
  const userMap: Record<string, { name: string; department: string; amount: number; tripCount: number }> = {};
  for (const e of expenses) {
    if (!userMap[e.user.id]) userMap[e.user.id] = { name: e.user.name, department: e.user.department, amount: 0, tripCount: 0 };
    userMap[e.user.id].amount += e.amount;
  }
  for (const b of bookings) {
    if (!userMap[b.user.id]) userMap[b.user.id] = { name: b.user.name, department: b.user.department, amount: 0, tripCount: 0 };
    userMap[b.user.id].amount += b.totalAmount;
    userMap[b.user.id].tripCount += 1;
  }
  const topSpenders: TopSpender[] = Object.values(userMap)
    .map((u) => ({ ...u, amount: Math.round(u.amount) }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  // ── Anomalies ──
  const recentAnomalies: Anomaly[] = anomalyExpenses.map((e) => ({
    id: e.id,
    userName: e.user.name,
    description: e.description,
    amount: e.amount,
    score: e.aiAnomalyScore ?? 0,
    reason: e.aiAnomalyReason ?? "Unusual spending pattern detected.",
  }));

  return {
    totalSpend, totalBudget, utilizationPct, avgTripCost,
    pendingApprovals, flaggedExpenses: flaggedCount,
    monthlySpend, byCategory, byDepartment, topSpenders, recentAnomalies,
  };
}

// ─── Anomaly score bar ────────────────────────────────────────────────────────

function AnomalyScoreBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? "bg-red-500" : pct >= 60 ? "bg-amber-500" : "bg-yellow-400";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-semibold tabular-nums text-slate-600 w-8 text-right">{pct}%</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; department?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "FINANCE" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const params = await searchParams;
  const year = parseInt(params.period ?? String(new Date().getFullYear()), 10) || new Date().getFullYear();

  const data = await getFinanceData(year);

  const budgetPctDisplay = `${data.utilizationPct}%`;
  const utilizationTrend = {
    value: data.utilizationPct > 100 ? data.utilizationPct - 100 : data.utilizationPct,
    isPositive: data.utilizationPct < 80,
  };

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Finance Overview</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Fiscal year {year} &mdash; all departments
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <BarChart3 className="h-4 w-4" />
          <span>Live data</span>
        </div>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          title="Total Spend"
          value={formatCurrency(data.totalSpend)}
          subtitle={`of ${formatCurrency(data.totalBudget)} budget`}
          trend={utilizationTrend}
          icon={<DollarSign className="h-5 w-5" />}
        />
        <KpiCard
          title="Budget Utilization"
          value={budgetPctDisplay}
          subtitle={data.utilizationPct >= 90 ? "Approaching limit" : "On track"}
          trend={{ value: data.utilizationPct, isPositive: data.utilizationPct < 80 }}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <KpiCard
          title="Avg Trip Cost"
          value={formatCurrency(data.avgTripCost)}
          subtitle={`across ${data.topSpenders.reduce((s, t) => s + t.tripCount, 0)} trips`}
          icon={<Plane className="h-5 w-5" />}
        />
        <KpiCard
          title="Pending Reviews"
          value={String(data.pendingApprovals)}
          subtitle={`${data.flaggedExpenses} flagged expense${data.flaggedExpenses !== 1 ? "s" : ""}`}
          trend={data.pendingApprovals > 0 ? { value: data.pendingApprovals, isPositive: false } : undefined}
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      {/* ── Charts row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Spend vs Budget area chart — 2/3 width */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Monthly Spend vs Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <SpendChart data={data.monthlySpend} />
          </CardContent>
        </Card>

        {/* Category breakdown — 1/3 width */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Spend by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryChart data={data.byCategory} />
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Budget progress — 1/3 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Department Budgets</CardTitle>
          </CardHeader>
          <CardContent>
            <BudgetProgress departments={data.byDepartment} />
          </CardContent>
        </Card>

        {/* Top Spenders table — 1/3 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Top Spenders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {data.topSpenders.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-slate-400">No spend data yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-5 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Employee
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Spend
                      </th>
                      <th className="px-5 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Trips
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {data.topSpenders.map((spender, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-2.5">
                          <div className="font-medium text-slate-800 truncate max-w-[130px]">
                            {spender.name}
                          </div>
                          <div className="text-xs text-slate-400 truncate">{spender.department}</div>
                        </td>
                        <td className="px-3 py-2.5 text-right font-semibold text-slate-900 tabular-nums">
                          {formatCurrency(spender.amount)}
                        </td>
                        <td className="px-5 py-2.5 text-right text-slate-500">
                          {spender.tripCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Anomalies — 1/3 */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>AI Anomaly Flags</CardTitle>
              {data.recentAnomalies.length > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-100 px-1.5 text-xs font-bold text-red-700">
                  {data.recentAnomalies.length}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {data.recentAnomalies.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-5 pb-6 pt-4 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                  <AlertCircle className="h-5 w-5 text-emerald-400" />
                </div>
                <p className="text-sm text-slate-500">No anomalies detected.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {data.recentAnomalies.map((anomaly) => (
                  <div key={anomaly.id} className="px-5 py-3 hover:bg-slate-50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                          <span className="text-sm font-medium text-slate-800 truncate">
                            {anomaly.userName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {anomaly.description}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-bold text-slate-900 tabular-nums">
                        {formatCurrency(anomaly.amount)}
                      </span>
                    </div>
                    <div className="mt-1.5">
                      <AnomalyScoreBar score={anomaly.score} />
                    </div>
                    <p className="mt-1 text-xs text-slate-400 italic line-clamp-2">
                      {anomaly.reason}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
