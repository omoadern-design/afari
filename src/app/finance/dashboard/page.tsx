import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { financeNav } from "@/components/shell/financeNav";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Download,
  ArrowRight,
  Plane,
  Hotel,
  Coffee,
  Car,
  Receipt as ReceiptIcon,
  TrendingUp,
  TrendingDown,
} from "@/components/icons";
import {
  store,
  spendByCategory,
  spendByDepartment,
  topRoutes,
  totalSpendThisQuarter,
} from "@/lib/mock/store";
import { formatCompact, formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Finance overview" };

export default function FinanceDashboard() {
  const me = store.user("usr_thandi")!;
  const cats = spendByCategory();
  const depts = spendByDepartment();
  const routes = topRoutes();
  const total = totalSpendThisQuarter();
  const reports = store.expenseReports();

  const catTotal = Object.values(cats).reduce((s, v) => s + v, 0) || 1;

  const catMeta: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    flight: { label: "Flights", icon: <Plane size={14} />, color: "bg-navy-500" },
    hotel: { label: "Hotels", icon: <Hotel size={14} />, color: "bg-terracotta-400" },
    meals: { label: "Meals", icon: <Coffee size={14} />, color: "bg-emerald" },
    ground_transport: { label: "Ground", icon: <Car size={14} />, color: "bg-amber" },
    other: { label: "Other", icon: <ReceiptIcon size={14} />, color: "bg-sand-400" },
  };

  return (
    <AppShell
      scope="Finance"
      scopeName={store.org.name}
      nav={financeNav("dashboard")}
      user={{ name: `${me.firstName} ${me.lastName}`, jobTitle: me.jobTitle }}
    >
      <PageHeader
        eyebrow="Q2 2026 to date"
        title="Travel spend at a glance."
        subtitle="Where the money is moving — and where it shouldn't be."
        actions={
          <>
            <Button variant="outline" iconLeft={<Download size={14} />}>
              Export Q2
            </Button>
            <Button href="/finance/reports" iconRight={<ArrowRight size={16} />}>
              Build a custom report
            </Button>
          </>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <Card className="p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-navy-500">
            Total spend
          </div>
          <div className="font-display text-3xl text-navy-800 mt-1">
            {formatMoney(total, "USD")}
          </div>
          <div className="mt-2 text-xs text-emerald-700 inline-flex items-center gap-1">
            <TrendingDown size={12} /> 12% under plan
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-navy-500">
            Avg. trip cost
          </div>
          <div className="font-display text-3xl text-navy-800 mt-1">
            {formatMoney(Math.round(total / Math.max(1, store.trips().length)), "USD")}
          </div>
          <div className="mt-2 text-xs text-emerald-700 inline-flex items-center gap-1">
            <TrendingDown size={12} /> 8% lower vs Q1
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-navy-500">
            Reports awaiting payout
          </div>
          <div className="font-display text-3xl text-navy-800 mt-1">
            {reports.filter((r) => r.status === "approved" || r.status === "submitted").length}
          </div>
          <div className="mt-2 text-xs text-navy-500">
            Median age 1.4 days
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-xs uppercase tracking-[0.2em] text-navy-500">
            Policy compliance
          </div>
          <div className="font-display text-3xl text-navy-800 mt-1">
            {Math.round(
              (store.trips().filter((t) => t.policyCompliant).length /
                Math.max(1, store.trips().length)) *
                100
            )}%
          </div>
          <div className="mt-2 text-xs text-emerald-700 inline-flex items-center gap-1">
            <TrendingUp size={12} /> +6 pts this month
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Spend by category */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Spend by category</CardTitle>
              <p className="text-sm text-navy-500 mt-1">Quarter to date</p>
            </div>
            <Badge tone="navy">USD</Badge>
          </CardHeader>
          <CardBody>
            {/* Stacked bar */}
            <div className="h-3 rounded-full overflow-hidden flex bg-sand-100">
              {Object.entries(cats).map(([k, v]) => {
                const pct = (v / catTotal) * 100;
                if (pct === 0) return null;
                return (
                  <div
                    key={k}
                    className={catMeta[k]?.color ?? "bg-sand-300"}
                    style={{ width: `${pct}%` }}
                  />
                );
              })}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {Object.entries(cats).map(([k, v]) => (
                <div key={k} className="rounded-xl border border-sand-200 p-3">
                  <div className="flex items-center gap-1.5 text-xs text-navy-500">
                    <span className={`h-2.5 w-2.5 rounded-full ${catMeta[k]?.color ?? "bg-sand-300"}`} />
                    {catMeta[k]?.label ?? k}
                  </div>
                  <div className="mt-1 font-display text-lg text-navy-800">
                    {formatMoney(v, "USD")}
                  </div>
                  <div className="text-xs text-navy-500">
                    {Math.round((v / catTotal) * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top routes</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            {routes.map((r) => (
              <div
                key={r.route}
                className="flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium text-navy-800 truncate">
                    {r.route}
                  </div>
                  <div className="text-xs text-navy-500">
                    {r.count} trip{r.count > 1 ? "s" : ""}
                  </div>
                </div>
                <div className="text-sm font-medium text-navy-800">
                  {formatCompact(r.spend)}
                </div>
              </div>
            ))}
          </CardBody>
        </Card>

        {/* Spend by department */}
        <Card>
          <CardHeader>
            <CardTitle>Spend by department</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            {Object.entries(depts).map(([d, v]) => {
              const max = Math.max(...Object.values(depts));
              const pct = (v / max) * 100;
              return (
                <div key={d}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-navy-700">{d}</span>
                    <span className="text-navy-800 font-medium">
                      {formatMoney(v, "USD")}
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-sand-100 overflow-hidden">
                    <div
                      className="h-full bg-terracotta-400 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>

        {/* Reports awaiting action */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Expense reports awaiting action</CardTitle>
            <Link
              href="/finance/expenses"
              className="text-sm text-terracotta-500 hover:underline"
            >
              View all →
            </Link>
          </CardHeader>
          <CardBody className="p-0 divide-y divide-sand-200">
            {reports.map((r) => {
              const trip = store.trip(r.tripId);
              const u = store.user(r.userId)!;
              return (
                <div key={r.id} className="p-5 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-sand-100 text-navy-700 flex items-center justify-center">
                    <ReceiptIcon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-navy-800 truncate">
                      {r.reference} · {u.firstName} {u.lastName}
                    </div>
                    <div className="text-xs text-navy-500 truncate">
                      {trip?.originCity} → {trip?.destinationCity}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-navy-800">
                      {formatMoney(r.totalAmount, r.currency)}
                    </div>
                    <Badge
                      tone={
                        r.status === "submitted"
                          ? "amber"
                          : r.status === "reimbursed"
                          ? "emerald"
                          : "neutral"
                      }
                      className="mt-1"
                    >
                      {r.status.replace("_", " ")}
                    </Badge>
                  </div>
                  {r.status === "submitted" && (
                    <Button size="sm">Approve & pay</Button>
                  )}
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>
    </AppShell>
  );
}
