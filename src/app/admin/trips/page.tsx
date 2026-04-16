import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { adminNav } from "@/components/shell/adminNav";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusPill } from "@/components/ui/StatusDot";
import { Avatar } from "@/components/ui/Avatar";
import { Filter, Download, ChevronRight } from "@/components/icons";
import { store } from "@/lib/mock/store";
import { formatDateRange, formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "All trips" };

export default function AllTripsPage() {
  const me = store.currentUser();
  const trips = store.trips();
  const pending = store.pendingApprovals();

  return (
    <AppShell
      scope="Admin"
      scopeName={store.org.name}
      nav={adminNav("trips", pending.length)}
      user={{ name: `${me.firstName} ${me.lastName}`, jobTitle: me.jobTitle }}
    >
      <PageHeader
        eyebrow={`${trips.length} trips on the books`}
        title="All trips"
        subtitle="Every booked, approved, in-flight and completed trip across the organization."
        actions={
          <>
            <Button variant="outline" iconLeft={<Filter size={14} />}>
              Filter
            </Button>
            <Button variant="outline" iconLeft={<Download size={14} />}>
              Export
            </Button>
          </>
        }
      />

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {[
          ["All", trips.length, true],
          ["Pending", trips.filter((t) => t.status === "pending_approval").length],
          ["Approved", trips.filter((t) => t.status === "approved").length],
          ["In transit", trips.filter((t) => t.status === "in_progress").length],
          ["Completed", trips.filter((t) => t.status === "completed").length],
          ["Drafts", trips.filter((t) => t.status === "draft").length],
        ].map(([label, count, active]) => (
          <button
            key={label as string}
            type="button"
            className={
              "rounded-full px-3 py-1.5 text-xs font-medium border " +
              (active
                ? "bg-navy-800 text-white border-navy-800"
                : "bg-white text-navy-700 border-sand-300 hover:border-navy-300")
            }
          >
            {label} <span className="opacity-70 ml-1">{count}</span>
          </button>
        ))}
      </div>

      <Card>
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-navy-500 border-b border-sand-200">
                <th className="px-5 py-3 font-medium">Traveler</th>
                <th className="px-5 py-3 font-medium">Route</th>
                <th className="px-5 py-3 font-medium">Dates</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Cost center</th>
                <th className="px-5 py-3 font-medium text-right">Cost</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {trips.map((t) => {
                const u = store.user(t.travelerId)!;
                return (
                  <tr
                    key={t.id}
                    className="border-b border-sand-200 last:border-0 hover:bg-sand-50"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/trips/${t.id}`}
                        className="flex items-center gap-3 group"
                      >
                        <Avatar name={`${u.firstName} ${u.lastName}`} size={32} />
                        <div className="min-w-0">
                          <div className="font-medium text-navy-800 truncate group-hover:text-terracotta-600">
                            {u.firstName} {u.lastName}
                          </div>
                          <div className="text-xs text-navy-500 truncate">
                            {u.department}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-navy-700">
                      {t.originAirport} → {t.destinationAirport}
                    </td>
                    <td className="px-5 py-3 text-navy-600">
                      {formatDateRange(t.departureDate, t.returnDate)}
                    </td>
                    <td className="px-5 py-3">
                      <StatusPill status={t.status} />
                    </td>
                    <td className="px-5 py-3">
                      <Badge tone="navy">{t.costCenter ?? "—"}</Badge>
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-navy-800">
                      {formatMoney(t.actualCost ?? t.estimatedCost, t.currency)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/trips/${t.id}`}
                        className="text-navy-400 hover:text-terracotta-500"
                      >
                        <ChevronRight size={18} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </AppShell>
  );
}
