import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [, m] = key.split("-");
  return MONTH_LABELS[parseInt(m, 10) - 1];
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = session.user;
  if (role !== "FINANCE" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const periodParam = searchParams.get("period") ?? String(new Date().getFullYear());
  const departmentParam = searchParams.get("department") ?? "all";

  // Build date range from period (year)
  const year = parseInt(periodParam, 10) || new Date().getFullYear();
  const periodStart = new Date(`${year}-01-01T00:00:00.000Z`);
  const periodEnd = new Date(`${year + 1}-01-01T00:00:00.000Z`);

  // ── Fetch raw expenses in period ──────────────────────────────────────────
  const expenses = await prisma.expense.findMany({
    where: {
      transactionDate: { gte: periodStart, lt: periodEnd },
      status: { not: "DRAFT" },
      ...(departmentParam !== "all" ? { user: { department: departmentParam } } : {}),
    },
    include: { user: { select: { id: true, name: true, department: true } } },
    orderBy: { transactionDate: "asc" },
  });

  // ── Bookings in period ───────────────────────────────────────────────────
  const bookingWhereBase = {
    createdAt: { gte: periodStart, lt: periodEnd },
    status: { not: "DRAFT" },
  };

  const bookings = await prisma.booking.findMany({
    where: {
      ...bookingWhereBase,
      ...(departmentParam !== "all" ? { user: { department: departmentParam } } : {}),
    },
    include: { user: { select: { id: true, name: true, department: true } } },
    orderBy: { createdAt: "asc" },
  });

  // ── Pending approvals ────────────────────────────────────────────────────
  const pendingApprovals = await prisma.approvalRequest.count({
    where: { status: "PENDING" },
  });

  // ── Flagged expenses ─────────────────────────────────────────────────────
  const flaggedExpenses = await prisma.expense.count({
    where: {
      status: "FLAGGED",
      transactionDate: { gte: periodStart, lt: periodEnd },
    },
  });

  // ── Budget data ──────────────────────────────────────────────────────────
  const budgets = await prisma.budget.findMany({
    where: { period: { startsWith: periodParam } },
  });

  // ── Compute aggregate totals ─────────────────────────────────────────────
  const totalExpenseSpend = expenses.reduce((s, e) => s + e.amount, 0);
  const totalBookingSpend = bookings.reduce((s, b) => s + b.totalAmount, 0);
  const totalSpend = totalExpenseSpend + totalBookingSpend;
  const totalBudget = budgets.reduce((s, b) => s + b.totalAmount, 0);
  const utilizationPct = totalBudget > 0 ? Math.round((totalSpend / totalBudget) * 100) : 0;
  const avgTripCost = bookings.length > 0 ? Math.round(totalBookingSpend / bookings.length) : 0;

  // ── Monthly spend ────────────────────────────────────────────────────────
  // Build a map of monthKey -> spend for all 12 months
  const monthlySpendMap: Record<string, number> = {};
  const monthlyBudgetMap: Record<string, number> = {};

  // Init all 12 months
  for (let m = 1; m <= 12; m++) {
    const k = `${year}-${String(m).padStart(2, "0")}`;
    monthlySpendMap[k] = 0;
    monthlyBudgetMap[k] = 0;
  }

  for (const e of expenses) {
    const k = monthKey(new Date(e.transactionDate));
    if (monthlySpendMap[k] !== undefined) monthlySpendMap[k] += e.amount;
  }
  for (const b of bookings) {
    const k = monthKey(new Date(b.createdAt));
    if (monthlySpendMap[k] !== undefined) monthlySpendMap[k] += b.totalAmount;
  }

  // Distribute budgets evenly across their period (quarterly / monthly / annual)
  for (const budget of budgets) {
    const monthsInPeriod =
      budget.periodType === "MONTHLY"
        ? 1
        : budget.periodType === "QUARTERLY"
        ? 3
        : 12;
    const monthly = budget.totalAmount / monthsInPeriod;

    // Determine which months this budget covers
    // Period format: "2025-Q1", "2025-01", "2025"
    let startMonth = 1;
    if (budget.periodType === "QUARTERLY") {
      const q = parseInt(budget.period.split("Q")[1] ?? "1", 10);
      startMonth = (q - 1) * 3 + 1;
    } else if (budget.periodType === "MONTHLY") {
      startMonth = parseInt(budget.period.split("-")[1] ?? "1", 10);
    }

    for (let i = 0; i < monthsInPeriod; i++) {
      const m = startMonth + i;
      if (m >= 1 && m <= 12) {
        const k = `${year}-${String(m).padStart(2, "0")}`;
        if (monthlyBudgetMap[k] !== undefined) monthlyBudgetMap[k] += monthly;
      }
    }
  }

  // If no budget records, distribute totalBudget evenly (fallback)
  if (budgets.length === 0 && totalBudget === 0) {
    // leave as 0
  }

  const monthlySpend = Object.keys(monthlySpendMap)
    .sort()
    .map((k) => ({
      month: monthLabel(k),
      spend: Math.round(monthlySpendMap[k]),
      budget: Math.round(monthlyBudgetMap[k]),
    }));

  // ── By category ──────────────────────────────────────────────────────────
  const categoryMap: Record<string, { amount: number; count: number }> = {};
  for (const e of expenses) {
    if (!categoryMap[e.category]) categoryMap[e.category] = { amount: 0, count: 0 };
    categoryMap[e.category].amount += e.amount;
    categoryMap[e.category].count += 1;
  }
  // Include bookings by type
  for (const b of bookings) {
    const cat = b.type; // FLIGHT | HOTEL | CAR
    if (!categoryMap[cat]) categoryMap[cat] = { amount: 0, count: 0 };
    categoryMap[cat].amount += b.totalAmount;
    categoryMap[cat].count += 1;
  }

  const byCategory = Object.entries(categoryMap)
    .map(([category, { amount, count }]) => ({
      category,
      amount: Math.round(amount),
      count,
    }))
    .sort((a, b) => b.amount - a.amount);

  // ── By department ────────────────────────────────────────────────────────
  const deptSpendMap: Record<string, number> = {};
  for (const e of expenses) {
    const dept = e.user.department;
    deptSpendMap[dept] = (deptSpendMap[dept] ?? 0) + e.amount;
  }
  for (const b of bookings) {
    const dept = b.user.department;
    deptSpendMap[dept] = (deptSpendMap[dept] ?? 0) + b.totalAmount;
  }

  const deptBudgetMap: Record<string, number> = {};
  for (const budget of budgets) {
    deptBudgetMap[budget.department] =
      (deptBudgetMap[budget.department] ?? 0) + budget.totalAmount;
  }

  const byDepartment = Object.entries(deptSpendMap)
    .map(([department, spend]) => {
      const budget = deptBudgetMap[department] ?? 0;
      const utilization = budget > 0 ? Math.round((spend / budget) * 100) : 0;
      return { department, spend: Math.round(spend), budget: Math.round(budget), utilization };
    })
    .sort((a, b) => b.spend - a.spend);

  // ── Top spenders ─────────────────────────────────────────────────────────
  const userSpendMap: Record<
    string,
    { name: string; department: string; amount: number; tripCount: number }
  > = {};

  for (const e of expenses) {
    const uid = e.user.id;
    if (!userSpendMap[uid]) {
      userSpendMap[uid] = { name: e.user.name, department: e.user.department, amount: 0, tripCount: 0 };
    }
    userSpendMap[uid].amount += e.amount;
  }
  for (const b of bookings) {
    const uid = b.user.id;
    if (!userSpendMap[uid]) {
      userSpendMap[uid] = { name: b.user.name, department: b.user.department, amount: 0, tripCount: 0 };
    }
    userSpendMap[uid].amount += b.totalAmount;
    userSpendMap[uid].tripCount += 1;
  }

  const topSpenders = Object.values(userSpendMap)
    .map((u) => ({ ...u, amount: Math.round(u.amount) }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 10);

  // ── Recent anomalies ─────────────────────────────────────────────────────
  const anomalyExpenses = await prisma.expense.findMany({
    where: {
      aiAnomalyScore: { gt: 0.5 },
      transactionDate: { gte: periodStart, lt: periodEnd },
    },
    include: { user: { select: { name: true, department: true } } },
    orderBy: { aiAnomalyScore: "desc" },
    take: 10,
  });

  const recentAnomalies = anomalyExpenses.map((e) => ({
    id: e.id,
    userName: e.user.name,
    description: e.description,
    amount: e.amount,
    score: e.aiAnomalyScore ?? 0,
    reason: e.aiAnomalyReason ?? "Unusual spending pattern detected.",
  }));

  return NextResponse.json({
    totalSpend,
    totalBudget,
    utilizationPct,
    avgTripCost,
    pendingApprovals,
    flaggedExpenses,
    monthlySpend,
    byCategory,
    byDepartment,
    topSpenders,
    recentAnomalies,
  });
}
