import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Plane,
  Receipt,
  CheckSquare,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Plus,
} from "lucide-react";
import { formatCurrency, formatDate, getStatusBadgeConfig, getPolicyBadgeConfig } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const role = session.user.role;

  // Fetch recent bookings for this user
  const recentBookings = await prisma.booking.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Fetch recent expenses
  const recentExpenses = await prisma.expense.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Stats
  const thisMonth = new Date();
  thisMonth.setDate(1);
  thisMonth.setHours(0, 0, 0, 0);

  const [
    totalExpensesThisMonth,
    pendingExpenses,
    totalBookingsThisMonth,
    pendingApprovals,
    flaggedExpenses,
  ] = await Promise.all([
    prisma.expense.aggregate({
      where: {
        userId,
        status: { in: ["APPROVED", "PAID"] },
        transactionDate: { gte: thisMonth },
      },
      _sum: { amount: true },
    }),
    prisma.expense.count({
      where: { userId, status: "PENDING_APPROVAL" },
    }),
    prisma.booking.count({
      where: { userId, createdAt: { gte: thisMonth } },
    }),
    role !== "EMPLOYEE"
      ? prisma.approvalRequest.count({
          where: { currentApproverId: userId, status: "PENDING" },
        })
      : Promise.resolve(0),
    prisma.expense.count({
      where: { userId, status: "FLAGGED" },
    }),
  ]);

  const isManagerOrAbove = ["MANAGER", "FINANCE", "ADMIN"].includes(role);

  // Finance stats (for FINANCE/ADMIN)
  let orgTotalSpend = 0;
  let orgPendingApprovals = 0;
  if (["FINANCE", "ADMIN"].includes(role)) {
    const [spendResult, pendingCount] = await Promise.all([
      prisma.expense.aggregate({
        where: {
          status: { in: ["APPROVED", "PAID"] },
          transactionDate: { gte: thisMonth },
        },
        _sum: { amount: true },
      }),
      prisma.approvalRequest.count({ where: { status: "PENDING" } }),
    ]);
    orgTotalSpend = spendResult._sum.amount ?? 0;
    orgPendingApprovals = pendingCount;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Good {getGreeting()}, {session.user.name.split(" ")[0]}
        </h1>
        <p className="text-slate-500 mt-0.5 text-sm">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <StatCard
          title="Spend This Month"
          value={formatCurrency(totalExpensesThisMonth._sum.amount ?? 0)}
          icon={<TrendingUp className="h-5 w-5 text-blue-600" />}
          iconBg="bg-blue-50"
          href="/expenses"
        />
        <StatCard
          title="Pending Approval"
          value={String(pendingExpenses)}
          subtitle="expenses"
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          iconBg="bg-amber-50"
          href="/expenses"
          alert={pendingExpenses > 0}
        />
        <StatCard
          title="Trips This Month"
          value={String(totalBookingsThisMonth)}
          subtitle="bookings"
          icon={<Plane className="h-5 w-5 text-indigo-600" />}
          iconBg="bg-indigo-50"
          href="/travel"
        />
        {isManagerOrAbove ? (
          <StatCard
            title="Needs Your Action"
            value={String(pendingApprovals)}
            subtitle="approvals"
            icon={<CheckSquare className="h-5 w-5 text-emerald-600" />}
            iconBg="bg-emerald-50"
            href="/approvals"
            alert={pendingApprovals > 0}
          />
        ) : (
          <StatCard
            title="Flagged"
            value={String(flaggedExpenses)}
            subtitle="expenses"
            icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
            iconBg="bg-red-50"
            href="/expenses"
            alert={flaggedExpenses > 0}
          />
        )}
      </div>

      {/* Finance org-wide stats */}
      {["FINANCE", "ADMIN"].includes(role) && (
        <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Organization Overview — {new Date().toLocaleDateString("en-US", { month: "long" })}</p>
              <div className="flex gap-6 mt-2">
                <div>
                  <p className="text-2xl font-bold text-blue-900">{formatCurrency(orgTotalSpend)}</p>
                  <p className="text-xs text-blue-600">total org spend</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-900">{orgPendingApprovals}</p>
                  <p className="text-xs text-blue-600">pending approvals</p>
                </div>
              </div>
            </div>
            <Link
              href="/finance"
              className="flex items-center gap-1.5 rounded-lg bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800"
            >
              Finance Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/travel"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors shadow-sm"
          >
            <Plane className="h-4 w-4" />
            Book Travel
          </Link>
          <Link
            href="/expenses/new"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Submit Expense
          </Link>
          {isManagerOrAbove && (
            <Link
              href="/approvals"
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-colors shadow-sm"
            >
              <CheckSquare className="h-4 w-4" />
              Review Approvals
            </Link>
          )}
        </div>
      </div>

      {/* Two-column layout: bookings + expenses */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Bookings */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Recent Bookings</h3>
            <Link href="/travel" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentBookings.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Plane className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No bookings yet</p>
                <Link
                  href="/travel"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" /> Book your first trip
                </Link>
              </div>
            ) : (
              recentBookings.map((booking) => {
                const statusCfg = getStatusBadgeConfig(booking.status);
                const policyCfg = getPolicyBadgeConfig(booking.policyResult);
                let data: any = {};
                try {
                  if (booking.type === "FLIGHT" && booking.flightData) data = JSON.parse(booking.flightData);
                  if (booking.type === "HOTEL" && booking.hotelData) data = JSON.parse(booking.hotelData);
                  if (booking.type === "CAR" && booking.carData) data = JSON.parse(booking.carData);
                } catch {}
                return (
                  <div key={booking.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                        {booking.type === "FLIGHT" ? (
                          <Plane className="h-4 w-4 text-slate-500" />
                        ) : booking.type === "HOTEL" ? (
                          <Receipt className="h-4 w-4 text-slate-500" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {booking.type === "FLIGHT"
                            ? `${data.origin ?? ""} → ${data.destination ?? ""}`
                            : booking.type === "HOTEL"
                            ? data.hotelName ?? "Hotel"
                            : data.rentalCompany ?? "Car Rental"}
                        </p>
                        <p className="text-xs text-slate-400">{formatDate(booking.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusCfg.className}`}>
                        {statusCfg.label}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {formatCurrency(booking.totalAmount)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Recent Expenses</h3>
            <Link href="/expenses" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recentExpenses.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Receipt className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No expenses yet</p>
                <Link
                  href="/expenses/new"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" /> Submit an expense
                </Link>
              </div>
            ) : (
              recentExpenses.map((expense) => {
                const statusCfg = getStatusBadgeConfig(expense.status);
                return (
                  <div key={expense.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{expense.description}</p>
                      <p className="text-xs text-slate-400">
                        {expense.category.replace(/_/g, " ")} · {formatDate(expense.transactionDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {expense.status === "FLAGGED" && (
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                      )}
                      {expense.status === "APPROVED" && (
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusCfg.className}`}>
                        {statusCfg.label}
                      </span>
                      <span className="text-sm font-semibold text-slate-800">
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  href,
  alert,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  href: string;
  alert?: boolean;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
          {icon}
        </div>
        {alert && (
          <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
      <p className="text-xs font-medium text-slate-500 mt-1">{title}</p>
    </Link>
  );
}
