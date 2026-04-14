import Link from "next/link";
import { redirect } from "next/navigation";
import { Receipt, Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { ExpenseCard } from "@/components/expenses/ExpenseCard";

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

const FILTER_TABS = [
  { key: "ALL", label: "All" },
  { key: "DRAFT", label: "Draft" },
  { key: "SUBMITTED", label: "Submitted" },
  { key: "PENDING_APPROVAL", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
] as const;

type FilterKey = (typeof FILTER_TABS)[number]["key"];

export default async function ExpensesPage({ searchParams }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { filter: rawFilter } = await searchParams;
  const filter: FilterKey =
    (FILTER_TABS.find((t) => t.key === rawFilter?.toUpperCase())?.key as FilterKey) ?? "ALL";

  // Fetch all user expenses
  const allExpenses = await prisma.expense.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // Summary stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalThisMonth = allExpenses
    .filter(
      (e) =>
        new Date(e.transactionDate) >= startOfMonth &&
        (e.status === "APPROVED" || e.status === "PAID")
    )
    .reduce((sum, e) => sum + e.amount, 0);

  const pendingCount = allExpenses.filter(
    (e) => e.status === "PENDING_APPROVAL" || e.status === "SUBMITTED"
  ).length;

  const flaggedCount = allExpenses.filter(
    (e) => typeof e.aiAnomalyScore === "number" && e.aiAnomalyScore > 0.3
  ).length;

  // Filtered list
  const filtered =
    filter === "ALL"
      ? allExpenses
      : allExpenses.filter((e) => e.status === filter);

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Expenses</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track, submit, and manage your expense reports
          </p>
        </div>
        <Link
          href="/expenses/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          New Expense
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total This Month
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {formatCurrency(totalThisMonth)}
          </p>
          <p className="mt-1 text-xs text-slate-500">Approved &amp; paid expenses</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Pending Approval
          </p>
          <p className="mt-2 text-2xl font-bold text-amber-600">{pendingCount}</p>
          <p className="mt-1 text-xs text-slate-500">
            {pendingCount === 1 ? "expense" : "expenses"} awaiting review
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Flagged by AI
          </p>
          <p className="mt-2 text-2xl font-bold text-red-600">{flaggedCount}</p>
          <p className="mt-1 text-xs text-slate-500">
            {flaggedCount === 1 ? "expense" : "expenses"} with anomaly warnings
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200">
        {FILTER_TABS.map((tab) => {
          const count =
            tab.key === "ALL"
              ? allExpenses.length
              : allExpenses.filter((e) => e.status === tab.key).length;
          const isActive = filter === tab.key;

          return (
            <Link
              key={tab.key}
              href={tab.key === "ALL" ? "/expenses" : `/expenses?filter=${tab.key}`}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "border-blue-700 text-blue-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              {tab.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                  isActive
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Expense list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
            <Receipt className="h-7 w-7 text-slate-400" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-slate-700">No expenses found</h3>
          <p className="mt-1 text-sm text-slate-400">
            {filter === "ALL"
              ? "You haven't submitted any expenses yet."
              : `No expenses with status "${filter.toLowerCase().replace(/_/g, " ")}".`}
          </p>
          {filter === "ALL" && (
            <Link
              href="/expenses/new"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Submit Your First Expense
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((expense) => (
            <ExpenseCard key={expense.id} expense={expense} />
          ))}
        </div>
      )}
    </div>
  );
}
