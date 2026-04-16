import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";
import { adminNav } from "@/components/shell/adminNav";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusPill } from "@/components/ui/StatusDot";
import { Avatar } from "@/components/ui/Avatar";
import {
  Activity,
  Plane,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  ChevronRight,
} from "@/components/icons";
import {
  store,
  policyComplianceRate,
  spendByDepartment,
  estimatedTimeSavedHours,
  totalSpendThisQuarter,
} from "@/lib/mock/store";
import { formatCompact, formatDateRange, formatMoney, relativeTime } from "@/lib/format";

export const metadata: Metadata = { title: "Movement Dashboard" };

export default function AdminDashboard() {
  const me = store.currentUser();
  const trips = store.trips();
  const pending = store.pendingApprovals();
  const upcoming = store.upcomingTrips().slice(0, 6);
  const inTransit = store.travelersInTransit();
  const compliance = policyComplianceRate();
  const deptSpend = spendByDepartment();
  const budgets = store.budgets();
  const notifs = store.notificationsForUser(me.id);

  return (
    <AppShell
      scope="Admin"
      scopeName={store.org.name}
      nav={adminNav("dashboard", pending.length)}
      user={{ name: `${me.firstName} ${me.lastName}`, jobTitle: me.jobTitle }}
    >
      <PageHeader
        eyebrow="Today, Thursday Apr 16, 2026"
        title="Movement Dashboard"
        subtitle="Where your people are moving — and what needs your attention before lunch."
        actions={
          <div className="flex items-center gap-3">
            <Button variant="outline" iconLeft={<Activity size={14} />}>
              Live map
            </Button>
            <Button href="/admin/approvals" iconRight={<ArrowRight size={16} />}>
              Open approval queue
            </Button>
          </div>
        }
      />

      {/* Top KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KPI
          label="In transit now"
          value={String(inTransit.length)}
          accent="terracotta"
          hint={
            inTransit.length > 0
              ? `${inTransit[0]?.travelerId.replace("usr_", "")} · ${inTransit[0]?.destinationCity}`
              : "All clear"
          }
          icon={<Plane size={16} />}
          pulse
        />
        <KPI
          label="Pending approvals"
          value={String(pending.length)}
          accent="amber"
          hint="Median age 4h"
          delta={{ direction: "down", value: "−12% wk" }}
        />
        <KPI
          label="Q2 spend"
          value={formatMoney(totalSpendThisQuarter(), "USD")}
          accent="navy"
          hint="Across 4 departments"
          delta={{ direction: "down", value: "−12% vs plan" }}
        />
        <KPI
          label="Time saved"
          value={`${estimatedTimeSavedHours()}h`}
          accent="emerald"
          hint="vs legacy email + WhatsApp"
          delta={{ direction: "up", value: "+38% wk" }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approvals queue */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Approvals waiting on you</CardTitle>
              <p className="text-sm text-navy-500 mt-1">
                One-tap approve, suggest an alternative, or decline.
              </p>
            </div>
            <Link
              href="/admin/approvals"
              className="text-sm text-terracotta-500 hover:underline"
            >
              View all →
            </Link>
          </CardHeader>
          <CardBody className="p-0 divide-y divide-sand-200">
            {pending.length === 0 ? (
              <div className="p-10 text-center text-navy-500">
                You're all caught up.
              </div>
            ) : (
              pending.map((a) => {
                const trip = store.trip(a.tripId)!;
                const traveler = store.user(trip.travelerId)!;
                return (
                  <div key={a.id} className="p-5 flex items-center gap-4">
                    <Avatar
                      name={`${traveler.firstName} ${traveler.lastName}`}
                      size={44}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-navy-800 truncate">
                          {traveler.firstName} {traveler.lastName}
                        </span>
                        <span className="text-navy-500 text-sm">
                          → {trip.destinationCity}
                        </span>
                      </div>
                      <div className="text-xs text-navy-500 mt-0.5 truncate">
                        {trip.purpose}
                      </div>
                      <div className="mt-1.5 flex items-center gap-2 flex-wrap text-xs">
                        <span className="text-navy-700 font-medium">
                          {formatMoney(trip.estimatedCost, trip.currency)}
                        </span>
                        <span className="text-navy-400">·</span>
                        <span className="text-navy-500">
                          {formatDateRange(trip.departureDate, trip.returnDate)}
                        </span>
                        <span className="text-navy-400">·</span>
                        {trip.policyCompliant ? (
                          <Badge tone="emerald" dot>
                            Within policy
                          </Badge>
                        ) : (
                          <Badge tone="amber" dot>
                            {trip.policyViolations?.length ?? 0} flags
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" variant="ghost">
                        Decline
                      </Button>
                      <Button size="sm" variant="outline">
                        Suggest
                      </Button>
                      <Button size="sm">Approve</Button>
                    </div>
                  </div>
                );
              })
            )}
          </CardBody>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Live activity</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              {notifs.slice(0, 4).map((n) => (
                <div key={n.id} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 rounded-full bg-terracotta-400 ping shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-navy-800">
                      {n.title}
                    </div>
                    <div className="text-xs text-navy-500 mt-0.5">
                      {n.message}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-navy-400 mt-1">
                      {relativeTime(n.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>

          <Card className="bg-gradient-to-br from-terracotta-50 to-sand-50 border-terracotta-100">
            <CardBody className="p-5">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-terracotta-700">
                <Sparkles size={14} /> Insight
              </div>
              <p className="mt-3 text-sm leading-relaxed text-navy-800">
                Hotel rates in Johannesburg are up <strong>18%</strong> this week
                — likely due to the Mining Indaba. Tundé's trip flagged.
                Consider expanding preferred hotels.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <Button size="sm" variant="primary">
                  Adjust policy
                </Button>
                <Button size="sm" variant="ghost">
                  Dismiss
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Lower row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's movement</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="rounded-2xl bg-navy-800 text-white p-5 relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background:
                    "radial-gradient(circle at 70% 20%, rgba(217,116,73,0.5), transparent 50%)",
                }}
              />
              <div className="relative">
                <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                  Continental
                </div>
                <div className="font-display text-3xl mt-1">
                  {trips.length} trips this month
                </div>
                <div className="mt-1 text-sm text-white/70">
                  Across {Object.keys(deptSpend).length} departments · 8 markets
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
                  <MovementStat label="In transit" value={inTransit.length} />
                  <MovementStat label="Booked today" value={3} />
                  <MovementStat label="Returning" value={2} />
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {inTransit.map((t) => {
                const u = store.user(t.travelerId)!;
                return (
                  <Link
                    key={t.id}
                    href={`/admin/trips`}
                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-sand-50"
                  >
                    <Avatar name={`${u.firstName} ${u.lastName}`} size={28} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-navy-800 truncate">
                        {u.firstName} {u.lastName}
                      </div>
                      <div className="text-xs text-navy-500 truncate">
                        Now in {t.destinationCity}
                      </div>
                    </div>
                    <StatusPill status={t.status} pulse />
                  </Link>
                );
              })}
              {inTransit.length === 0 && (
                <p className="text-sm text-navy-500">Nobody airborne right now.</p>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming travel</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            {upcoming.map((t) => {
              const u = store.user(t.travelerId)!;
              return (
                <Link
                  key={t.id}
                  href={`/trips/${t.id}`}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-sand-50"
                >
                  <div className="text-center w-12 shrink-0">
                    <div className="font-display text-lg leading-none text-navy-800">
                      {new Date(t.departureDate).getUTCDate()}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-navy-400 mt-0.5">
                      {new Date(t.departureDate).toLocaleString("en-US", {
                        month: "short",
                      })}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-navy-800 truncate">
                      {u.firstName} {u.lastName}
                    </div>
                    <div className="text-xs text-navy-500 truncate">
                      {t.originAirport} → {t.destinationAirport} ·{" "}
                      {formatMoney(t.estimatedCost, t.currency)}
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-navy-400" />
                </Link>
              );
            })}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budgets</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            {budgets.map((b) => {
              const pct = Math.round((b.spent / b.amount) * 100);
              const tone =
                pct < 60
                  ? "bg-emerald"
                  : pct < 85
                  ? "bg-amber"
                  : "bg-ruby";
              return (
                <div key={b.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-navy-800">
                      {b.scopeName}
                    </span>
                    <span className="text-navy-500">
                      {formatCompact(b.spent)} / {formatCompact(b.amount)} {b.currency}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded-full bg-sand-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${tone}`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                  <div className="mt-1 text-xs text-navy-500">
                    {pct}% used · Q2 ends Jun 30
                  </div>
                </div>
              );
            })}
          </CardBody>
        </Card>
      </div>

      {/* Compliance footer card */}
      <Card className="mt-6">
        <CardBody className="p-6 grid grid-cols-1 lg:grid-cols-3 items-center gap-6">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-navy-500">
              Policy compliance
            </div>
            <div className="font-display text-3xl text-navy-800 mt-1">
              {Math.round(compliance.rate * 100)}%
            </div>
            <div className="text-sm text-navy-500">
              {compliance.compliant} of {compliance.total} trips clean
            </div>
          </div>
          <div className="lg:col-span-2 flex items-center gap-3 justify-end">
            <Button variant="ghost">View audit log</Button>
            <Button variant="outline" href="/admin/policies">
              Edit policies
            </Button>
            <Button href="/finance/dashboard" iconRight={<ArrowRight size={16} />}>
              Open finance view
            </Button>
          </div>
        </CardBody>
      </Card>
    </AppShell>
  );
}

function KPI({
  label,
  value,
  hint,
  accent,
  delta,
  icon,
  pulse,
}: {
  label: string;
  value: string;
  hint?: string;
  accent: "navy" | "terracotta" | "emerald" | "amber";
  delta?: { direction: "up" | "down"; value: string };
  icon?: React.ReactNode;
  pulse?: boolean;
}) {
  const accentBg: Record<string, string> = {
    navy: "bg-navy-50 text-navy-700",
    terracotta: "bg-terracotta-50 text-terracotta-700",
    emerald: "bg-emerald-soft text-emerald-700",
    amber: "bg-amber-soft text-amber-700",
  };
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${accentBg[accent]}`}>
          {icon ?? <Activity size={16} />}
        </div>
        {pulse && (
          <span className="relative h-2 w-2 rounded-full bg-terracotta-400 ping" />
        )}
      </div>
      <div className="mt-4 text-xs uppercase tracking-[0.18em] text-navy-500">
        {label}
      </div>
      <div className="mt-1 font-display text-3xl text-navy-800">{value}</div>
      {hint && <div className="mt-1 text-xs text-navy-500">{hint}</div>}
      {delta && (
        <div
          className={`mt-2 inline-flex items-center gap-1 text-xs ${
            delta.direction === "up" ? "text-emerald-700" : "text-emerald-700"
          }`}
        >
          {delta.direction === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {delta.value}
        </div>
      )}
    </Card>
  );
}

function MovementStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-3">
      <div className="text-[10px] uppercase tracking-widest text-white/60">
        {label}
      </div>
      <div className="font-display text-2xl mt-0.5">{value}</div>
    </div>
  );
}
