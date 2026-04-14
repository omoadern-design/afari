import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plane, Receipt, CheckSquare, TrendingUp, Clock, AlertTriangle, CheckCircle, ArrowRight, Plus, Car } from "lucide-react";
import { formatCurrency, formatDate, getStatusBadgeConfig } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { id: userId, role, name } = session.user;

  const [recentBookings, recentExpenses] = await Promise.all([
    prisma.booking.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 }),
    prisma.expense.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);

  const thisMonth = new Date();
  thisMonth.setDate(1); thisMonth.setHours(0, 0, 0, 0);

  const [totalExpenses, pendingExpenses, totalBookings, pendingApprovals, flaggedExpenses] =
    await Promise.all([
      prisma.expense.aggregate({
        where: { userId, status: { in: ["APPROVED", "PAID"] }, transactionDate: { gte: thisMonth } },
        _sum: { amount: true },
      }),
      prisma.expense.count({ where: { userId, status: "PENDING_APPROVAL" } }),
      prisma.booking.count({ where: { userId, createdAt: { gte: thisMonth } } }),
      ["MANAGER","FINANCE","ADMIN"].includes(role)
        ? prisma.approvalRequest.count({ where: { currentApproverId: userId, status: "PENDING" } })
        : Promise.resolve(0),
      prisma.expense.count({ where: { userId, status: "FLAGGED" } }),
    ]);

  const isManagerOrAbove = ["MANAGER","FINANCE","ADMIN"].includes(role);

  let orgTotalSpend = 0, orgPendingApprovals = 0;
  if (["FINANCE","ADMIN"].includes(role)) {
    const [spend, pending] = await Promise.all([
      prisma.expense.aggregate({ where: { status: { in: ["APPROVED","PAID"] }, transactionDate: { gte: thisMonth } }, _sum: { amount: true } }),
      prisma.approvalRequest.count({ where: { status: "PENDING" } }),
    ]);
    orgTotalSpend = spend._sum.amount ?? 0;
    orgPendingApprovals = pending;
  }

  const firstName = (name ?? "").split(" ")[0];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#0a0a0a]">Good {getGreeting()}, {firstName}</h1>
        <p className="text-sm text-[#737373] mt-0.5">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>

      {/* Movement pulse — admin/manager view */}
      {isManagerOrAbove && (
        <div className="mb-5 rounded-xl border border-[#e5e5e5] bg-[#0a0a0a] px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
            Movement Pulse · Today
          </p>
          <div className="mt-3 flex flex-wrap gap-8">
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">{totalBookings}</p>
              <p className="text-xs text-white/40">trips this month</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">{pendingApprovals}</p>
              <p className="text-xs text-white/40">awaiting approval</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white tabular-nums">{pendingExpenses}</p>
              <p className="text-xs text-white/40">expenses pending</p>
            </div>
          </div>
          {pendingApprovals > 0 && (
            <Link
              href="/approvals"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors"
            >
              Review {pendingApprovals} pending {pendingApprovals === 1 ? "request" : "requests"} <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 mb-6">
        <StatCard title="Spend this month" value={formatCurrency(totalExpenses._sum.amount ?? 0)}
          icon={<TrendingUp className="h-5 w-5" />} href="/expenses" />
        <StatCard title="Pending approval" value={String(pendingExpenses)} sub="expenses"
          icon={<Clock className="h-5 w-5" />} href="/expenses" alert={pendingExpenses > 0} />
        <StatCard title="Trips this month" value={String(totalBookings)} sub="bookings"
          icon={<Plane className="h-5 w-5" />} href="/travel" />
        {isManagerOrAbove
          ? <StatCard title="Needs action" value={String(pendingApprovals)} sub="approvals"
              icon={<CheckSquare className="h-5 w-5" />} href="/approvals" alert={pendingApprovals > 0} />
          : <StatCard title="Flagged" value={String(flaggedExpenses)} sub="expenses"
              icon={<AlertTriangle className="h-5 w-5" />} href="/expenses" alert={flaggedExpenses > 0} />}
      </div>

      {/* Finance banner */}
      {["FINANCE","ADMIN"].includes(role) && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-[#e5e5e5] bg-white px-5 py-4 shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#a3a3a3]">
              Organization · {new Date().toLocaleDateString("en-US", { month: "long" })}
            </p>
            <div className="mt-2 flex gap-8">
              <div>
                <p className="text-2xl font-bold text-[#0a0a0a]">{formatCurrency(orgTotalSpend)}</p>
                <p className="text-xs text-[#737373]">total spend</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#0a0a0a]">{orgPendingApprovals}</p>
                <p className="text-xs text-[#737373]">pending approvals</p>
              </div>
            </div>
          </div>
          <Link href="/finance" className="flex items-center gap-1.5 rounded-lg bg-[#0a0a0a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#262626] transition-colors">
            Finance <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Quick actions */}
      <div className="mb-6">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-[#a3a3a3]">Quick actions</p>
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/travel",    icon: <Plane className="h-4 w-4" />,       label: "Plan a Trip" },
            { href: "/expenses/new", icon: <Plus className="h-4 w-4" />,     label: "Submit Expense" },
            ...(isManagerOrAbove
              ? [{ href: "/approvals", icon: <CheckSquare className="h-4 w-4" />, label: "Review Approvals" }]
              : []),
          ].map((action) => (
            <Link key={action.href} href={action.href}
              className="flex items-center gap-2 rounded-lg border border-[#e5e5e5] bg-white px-4 py-2 text-sm font-medium text-[#0a0a0a] shadow-[0_1px_3px_rgba(0,0,0,0.05)] transition-all hover:shadow-md hover:border-[#0a0a0a]/20">
              {action.icon}{action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent data */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Bookings */}
        <SectionCard title="Recent Bookings" viewHref="/travel">
          {recentBookings.length === 0 ? (
            <EmptyState icon={<Plane className="h-7 w-7" />} label="No bookings yet"
              cta={{ href: "/travel", label: "Book your first trip" }} />
          ) : recentBookings.map((b) => {
            const cfg = getStatusBadgeConfig(b.status);
            let d: Record<string, string> = {};
            try {
              if (b.type === "FLIGHT" && b.flightData) d = JSON.parse(b.flightData);
              if (b.type === "HOTEL"  && b.hotelData)  d = JSON.parse(b.hotelData);
              if (b.type === "CAR"    && b.carData)     d = JSON.parse(b.carData);
            } catch {}
            return (
              <div key={b.id} className="flex items-center justify-between px-5 py-3 hover:bg-[#f9f9f9] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f0f0f0]">
                    {b.type === "FLIGHT" ? <Plane className="h-3.5 w-3.5 text-[#737373]" />
                     : b.type === "HOTEL" ? <Receipt className="h-3.5 w-3.5 text-[#737373]" />
                     : <Car className="h-3.5 w-3.5 text-[#737373]" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#0a0a0a]">
                      {b.type === "FLIGHT" ? `${d.origin ?? ""} → ${d.destination ?? ""}`
                       : b.type === "HOTEL" ? (d.hotelName ?? "Hotel")
                       : (d.rentalCompany ?? "Car Rental")}
                    </p>
                    <p className="text-xs text-[#a3a3a3]">{formatDate(b.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cfg.className}`}>{cfg.label}</span>
                  <span className="text-sm font-semibold text-[#0a0a0a] tabular-nums">{formatCurrency(b.totalAmount)}</span>
                </div>
              </div>
            );
          })}
        </SectionCard>

        {/* Expenses */}
        <SectionCard title="Recent Expenses" viewHref="/expenses">
          {recentExpenses.length === 0 ? (
            <EmptyState icon={<Receipt className="h-7 w-7" />} label="No expenses yet"
              cta={{ href: "/expenses/new", label: "Submit an expense" }} />
          ) : recentExpenses.map((e) => {
            const cfg = getStatusBadgeConfig(e.status);
            return (
              <div key={e.id} className="flex items-center justify-between px-5 py-3 hover:bg-[#f9f9f9] transition-colors">
                <div>
                  <p className="text-sm font-medium text-[#0a0a0a]">{e.description}</p>
                  <p className="text-xs text-[#a3a3a3]">{e.category.replace(/_/g, " ")} · {formatDate(e.transactionDate)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {e.status === "FLAGGED"   && <AlertTriangle className="h-3.5 w-3.5 text-[#dc2626]" />}
                  {e.status === "APPROVED"  && <CheckCircle   className="h-3.5 w-3.5 text-[#16a34a]" />}
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${cfg.className}`}>{cfg.label}</span>
                  <span className="text-sm font-semibold text-[#0a0a0a] tabular-nums">{formatCurrency(e.amount)}</span>
                </div>
              </div>
            );
          })}
        </SectionCard>
      </div>
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────────── */

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? "morning" : h < 17 ? "afternoon" : "evening";
}

function StatCard({ title, value, sub, icon, href, alert }: {
  title: string; value: string; sub?: string;
  icon: React.ReactNode; href: string; alert?: boolean;
}) {
  return (
    <Link href={href}
      className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-[0_1px_4px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-[0_4px_14px_rgba(0,0,0,0.09)]">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f0f0] text-[#0a0a0a]">{icon}</div>
        {alert && <span className="h-2 w-2 rounded-full bg-[#d97706] animate-pulse" />}
      </div>
      <p className="text-2xl font-bold text-[#0a0a0a] tabular-nums">{value}</p>
      {sub && <p className="text-xs text-[#a3a3a3]">{sub}</p>}
      <p className="mt-1 text-xs font-medium text-[#737373]">{title}</p>
    </Link>
  );
}

function SectionCard({ title, viewHref, children }: {
  title: string; viewHref: string; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[#e5e5e5] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between border-b border-[#f0f0f0] px-5 py-4">
        <h3 className="text-sm font-semibold text-[#0a0a0a]">{title}</h3>
        <Link href={viewHref} className="flex items-center gap-1 text-xs font-medium text-[#737373] hover:text-[#0a0a0a] transition-colors">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="divide-y divide-[#f7f7f7]">{children}</div>
    </div>
  );
}

function EmptyState({ icon, label, cta }: {
  icon: React.ReactNode; label: string; cta: { href: string; label: string };
}) {
  return (
    <div className="px-5 py-8 text-center">
      <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0f0f0] text-[#a3a3a3]">{icon}</div>
      <p className="text-sm text-[#a3a3a3]">{label}</p>
      <Link href={cta.href} className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#0a0a0a] hover:underline">
        <Plus className="h-3.5 w-3.5" />{cta.label}
      </Link>
    </div>
  );
}
