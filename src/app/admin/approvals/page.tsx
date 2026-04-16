import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { adminNav } from "@/components/shell/adminNav";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { ArrowRight, Check, Close, Sparkles, Clock } from "@/components/icons";
import { store } from "@/lib/mock/store";
import { formatDateRange, formatMoney, relativeTime } from "@/lib/format";

export const metadata: Metadata = { title: "Approvals" };

export default function ApprovalsPage() {
  const me = store.currentUser();
  const pending = store.pendingApprovals();

  return (
    <AppShell
      scope="Admin"
      scopeName={store.org.name}
      nav={adminNav("approvals", pending.length)}
      user={{ name: `${me.firstName} ${me.lastName}`, jobTitle: me.jobTitle }}
    >
      <PageHeader
        eyebrow={`${pending.length} waiting`}
        title="Approval queue"
        subtitle="Each card has the context you need. No tab-switching, no email threads."
      />

      <div className="space-y-5">
        {pending.map((a) => {
          const trip = store.trip(a.tripId)!;
          const traveler = store.user(trip.travelerId)!;
          const manager = store.user(a.approverId)!;
          return (
            <Card key={a.id} className="overflow-hidden">
              <CardBody className="p-0">
                <div className="grid grid-cols-1 lg:grid-cols-3">
                  {/* Left: traveler + trip */}
                  <div className="p-6 lg:col-span-2 border-b lg:border-b-0 lg:border-r border-sand-200">
                    <div className="flex items-center gap-4">
                      <Avatar name={`${traveler.firstName} ${traveler.lastName}`} size={48} />
                      <div className="flex-1 min-w-0">
                        <div className="font-display text-xl text-navy-800">
                          {traveler.firstName} {traveler.lastName}
                        </div>
                        <div className="text-xs text-navy-500">
                          {traveler.jobTitle} · {traveler.department}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-navy-500 inline-flex items-center gap-1">
                          <Clock size={12} /> {relativeTime(a.createdAt)}
                        </div>
                        <div className="text-xs text-navy-500 mt-1">
                          {trip.reference}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-3 gap-4">
                      <Field label="Route" value={`${trip.originAirport} → ${trip.destinationAirport}`} />
                      <Field
                        label="Dates"
                        value={formatDateRange(trip.departureDate, trip.returnDate)}
                      />
                      <Field
                        label="Estimate"
                        value={formatMoney(trip.estimatedCost, trip.currency)}
                      />
                    </div>

                    <div className="mt-5 rounded-xl bg-sand-50 border border-sand-200 p-4 text-sm text-navy-700">
                      <span className="text-navy-500 text-xs uppercase tracking-[0.18em] block mb-1">
                        Purpose
                      </span>
                      {trip.purpose}
                    </div>

                    {trip.policyViolations && trip.policyViolations.length > 0 && (
                      <div className="mt-4 rounded-xl bg-amber-soft border border-amber/20 p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-amber-700 mb-1">
                          Policy advisories
                        </div>
                        <ul className="text-sm text-amber-700 space-y-1">
                          {trip.policyViolations.map((v) => (
                            <li key={v} className="flex items-start gap-2">
                              <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-amber" />
                              {v}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Right: AI context + actions */}
                  <div className="p-6 bg-sand-50 border-t lg:border-t-0 border-sand-200 flex flex-col">
                    <div className="text-xs uppercase tracking-[0.18em] text-navy-500 mb-2 inline-flex items-center gap-1">
                      <Sparkles size={12} className="text-terracotta-500" />
                      AFARI context
                    </div>
                    <ul className="text-sm text-navy-700 space-y-2 leading-relaxed">
                      <li>
                        Last 30 days: <strong>{traveler.firstName}</strong> took
                        2 trips, both within policy.
                      </li>
                      <li>
                        Department budget at <strong>69%</strong> with 2 months
                        remaining.
                      </li>
                      {trip.policyCompliant && (
                        <li>
                          Estimated cost is <strong>18% under</strong> the
                          policy ceiling for this route.
                        </li>
                      )}
                      <li>
                        Approver: <strong>{manager.firstName} {manager.lastName}</strong> ({manager.jobTitle})
                      </li>
                    </ul>

                    <div className="mt-auto pt-5 grid grid-cols-3 gap-2">
                      <Button size="sm" variant="ghost" iconLeft={<Close size={14} />}>
                        Decline
                      </Button>
                      <Button size="sm" variant="outline">
                        Suggest
                      </Button>
                      <Button size="sm" iconLeft={<Check size={14} />}>
                        Approve
                      </Button>
                    </div>
                    <div className="mt-3 text-center">
                      <Link
                        href={`/trips/${trip.id}`}
                        className="text-xs text-navy-500 hover:text-terracotta-500 inline-flex items-center gap-1"
                      >
                        Open full trip <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* History */}
      <Card className="mt-10">
        <CardHeader>
          <CardTitle>Recent decisions</CardTitle>
        </CardHeader>
        <CardBody className="p-0 divide-y divide-sand-200">
          {store
            .approvals()
            .filter((a) => a.status !== "pending")
            .map((a) => {
              const trip = store.trip(a.tripId)!;
              const traveler = store.user(trip.travelerId)!;
              return (
                <div key={a.id} className="p-5 flex items-center gap-4">
                  <Avatar
                    name={`${traveler.firstName} ${traveler.lastName}`}
                    size={36}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-navy-800 truncate">
                      {traveler.firstName} {traveler.lastName} ·{" "}
                      {trip.originAirport} → {trip.destinationAirport}
                    </div>
                    <div className="text-xs text-navy-500 truncate">
                      {a.decisionReason ?? "No reason given"}
                    </div>
                  </div>
                  <Badge tone={a.status === "approved" ? "emerald" : "ruby"} dot>
                    {a.status}
                  </Badge>
                  <span className="text-xs text-navy-500 hidden sm:inline">
                    {relativeTime(a.decidedAt ?? a.createdAt)}
                  </span>
                </div>
              );
            })}
        </CardBody>
      </Card>
    </AppShell>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.18em] text-navy-500">
        {label}
      </div>
      <div className="mt-1 font-display text-lg text-navy-800">{value}</div>
    </div>
  );
}
