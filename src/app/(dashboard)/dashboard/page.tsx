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
  Car,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getStatusBadgeConfig,
} from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const role = session.user.role;

  const recentBookings = await prisma.booking.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const recentExpenses = await prisma.expense.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

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
      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#0c1d3d]">
          Good {getGreeting()}, {session.user.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-[#6b7a99] mt-0.5">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-6">
        <StatCard
          title="Spend this month"
          value={formatCurrency(totalExpensesThisMonth._sum.amount ?? 0)}
          icon={<TrendingUp className="h-5 w-5" />}
          iconBg="bg-[#1dbd80]/10"
          iconColor="text-[#1dbd80]"
          href="/expenses"
        />
        <StatCard
          title="Pending approval"
          value={String(pendingExpenses)}
          subtitle="expenses"
          icon={<Clock className="h-5 w-5" />}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          href="/expenses"
          alert={pendingExpenses > 0}
        />
        <StatCard
          title="Trips this month"
          value={String(totalBookingsThisMonth)}
          subtitle="bookings"
          icon={<Plane className="h-5 w-5" />}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          href="/travel"
        />
        {isManagerOrAbove ? (
          <StatCard
            title="Needs your action"
            value={String(pendingApprovals)}
            subtitle="approvals"
            icon={<CheckSquare className="h-5 w-5" />}
            iconBg="bg-[#1dbd80]/10"
            iconColor="text-[#1dbd80]"
            href="/approvals"
            alert={pendingApprovals > 0}
          />
        ) : (
          <StatCard
            title="Flagged"
            value={String(flaggedExpenses)}
            subtitle="expenses"
            icon={<AlertTriangle className="h-5 w-5" />}
            iconBg="bg-red-50"
            iconColor="text-red-500"
            href="/expenses"
            alert={flaggedExpenses > 0}
          />
        )}
      </div>

      {/* ── Finance org banner ── */}
      {["FINANCE", "ADMIN"].includes(role) && (
        <div className="mb-6 rounded-xl border border-[#1dbd80]/20 bg-[#1dbd80]/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-[#0c1d3d]">
                Organization overview —{" "}
                {new Date().toLocaleDateString("en-US", { month: "long" })}
              </p>
              <div className="flex gap-6 mt-2">
                <div>
                  <p className="text-2xl font-bold text-[#0c1d3d]">
                    {formatCurrency(orgTotalSpend)}
                  </p>
                  <p className="text-xs text-[#6b7a99]">total org spend</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0c1d3d]">
                    {orgPendingApprovals}
                  </p>
                  <p className="text-xs text-[#6b7a99]">pending approvals</p>
                </div>
              </div>
            </div>
            <Link
              href="/finance"
              className="flex items-center gap-1.5 rounded-lg bg-[#1dbd80] px-3.5 py-2 text-sm font-semibold text-white hover:bg-[#19a870] transition-colors"
            >
              Finance Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* ── Quick actions ── */}
      <div className="mb-6">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#9aa3b5]">
          Quick actions
        </p>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/travel"
            className="flex items-center gap-2 rounded-lg border border-[#e5e9f0] bg-white px-4 py-2 text-sm font-medium text-[#0c1d3d] shadow-sm transition-all hover:border-[#1dbd80]/40 hover:shadow-md"
          >
            <Plane className="h-4 w-4 text-[#1dbd80]" />
            Book Travel
          </Link>
          <Link
            href="/expenses/new"
            className="flex items-center gap-2 rounded-lg border border-[#e5e9f0] bg-white px-4 py-2 text-sm font-medium text-[#0c1d3d] shadow-sm transition-all hover:border-[#1dbd80]/40 hover:shadow-md"
          >
            <Plus className="h-4 w-4 text-[#1dbd80]" />
            Submit Expense
          </Link>
          {isManagerOrAbove && (
            <Link
              href="/approvals"
              className="flex items-center gap-2 rounded-lg border border-[#e5e9f0] bg-white px-4 py-2 text-sm font-medium text-[#0c1d3d] shadow-sm transition-all hover:border-[#1dbd80]/40 hover:shadow-md"
            >
              <CheckSquare className="h-4 w-4 text-[#1dbd80]" />
              Review Approvals
            </Link>
          )}
        </div>
      </div>

      {/* ── Two-column: recent bookings + expenses ── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Recent Bookings */}
        <div className="rounded-xl border border-[#e5e9f0] bg-white shadow-[0_1px_3px_rgba(12,29,61,0.06)]">
          <div className="flex items-center justify-between border-b border-[#e5e9f0] px-5 py-4">
            <h3 className="text-sm font-semibold text-[#0c1d3d]">Recent Bookings</h3>
            <Link
              href="/travel"
              className="flex items-center gap-1 text-xs font-medium text-[#1dbd80] hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#f4f6f9]">
            {recentBookings.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Plane className="h-8 w-8 text-[#c4cdd8] mx-auto mb-2" />
                <p className="text-sm text-[#9aa3b5]">No bookings yet</p>
                <Link
                  href="/travel"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#1dbd80] hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" /> Book your first trip
                </Link>
              </div>
            ) : (
              recentBookings.map((booking) => {
                const statusCfg = getStatusBadgeConfig(booking.status);
                let data: Record<string, string> = {};
                try {
                  if (booking.type === "FLIGHT" && booking.flightData)
                    data = JSON.parse(booking.flightData);
                  if (booking.type === "HOTEL" && booking.hotelData)
                    data = JSON.parse(booking.hotelData);
                  if (booking.type === "CAR" && booking.carData)
                    data = JSON.parse(booking.carData);
                } catch {}
                return (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-[#f9fafb]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f4f6f9]">
                        {booking.type === "FLIGHT" ? (
                          <Plane className="h-3.5 w-3.5 text-[#6b7a99]" />
                        ) : booking.type === "HOTEL" ? (
                          <Receipt className="h-3.5 w-3.5 text-[#6b7a99]" />
                        ) : (
                          <Car className="h-3.5 w-3.5 text-[#6b7a99]" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#0c1d3d]">
                          {booking.type === "FLIGHT"
                            ? `${data.origin ?? ""} → ${data.destination ?? ""}`
                            : booking.type === "HOTEL"
                            ? (data.hotelName ?? "Hotel")
                            : (data.rentalCompany ?? "Car Rental")}
                        </p>
                        <p className="text-xs text-[#9aa3b5]">
                          {formatDate(booking.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusCfg.className}`}
                      >
                        {statusCfg.label}
                      </span>
                      <span className="text-sm font-semibold text-[#0c1d3d] tabular-nums">
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
        <div className="rounded-xl border border-[#e5e9f0] bg-white shadow-[0_1px_3px_rgba(12,29,61,0.06)]">
          <div className="flex items-center justify-between border-b border-[#e5e9f0] px-5 py-4">
            <h3 className="text-sm font-semibold text-[#0c1d3d]">Recent Expenses</h3>
            <Link
              href="/expenses"
              className="flex items-center gap-1 text-xs font-medium text-[#1dbd80] hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="divide-y divide-[#f4f6f9]">
            {recentExpenses.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <Receipt className="h-8 w-8 text-[#c4cdd8] mx-auto mb-2" />
                <p className="text-sm text-[#9aa3b5]">No expenses yet</p>
                <Link
                  href="/expenses/new"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#1dbd80] hover:underline"
                >
                  <Plus className="h-3.5 w-3.5" /> Submit an expense
                </Link>
              </div>
            ) : (
              recentExpenses.map((expense) => {
                const statusCfg = getStatusBadgeConfig(expense.status);
                return (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-[#f9fafb]"
                  >
                    <div>
                      <p className="text-sm font-medium text-[#0c1d3d]">
                        {expense.description}
                      </p>
                      <p className="text-xs text-[#9aa3b5]">
                        {expense.category.replace(/_/g, " ")} ·{" "}
                        {formatDate(expense.transactionDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {expense.status === "FLAGGED" && (
                        <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
                      )}
                      {expense.status === "APPROVED" && (
                        <CheckCircle className="h-3.5 w-3.5 text-[#1dbd80]" />
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusCfg.className}`}
                      >
                        {statusCfg.label}
                      </span>
                      <span className="text-sm font-semibold text-[#0c1d3d] tabular-nums">
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
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  iconColor,
  href,
  alert,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  href: string;
  alert?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-[#e5e9f0] bg-white p-5 shadow-[0_1px_3px_rgba(12,29,61,0.06)] transition-shadow hover:shadow-[0_4px_12px_rgba(12,29,61,0.1)]"
    >
      <div className="mb-3 flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}>
          {icon}
        </div>
        {alert && (
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
        )}
      </div>
      <p className="text-2xl font-bold text-[#0c1d3d] tabular-nums">{value}</p>
      {subtitle && <p className="text-xs text-[#9aa3b5]">{subtitle}</p>}
      <p className="mt-1 text-xs font-medium text-[#6b7a99]">{title}</p>
    </Link>
  );
}
