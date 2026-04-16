import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";
import { employeeNav } from "@/components/shell/employeeNav";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusDot";
import { Plane, ChevronRight, PlusCircle, Filter } from "@/components/icons";
import { store } from "@/lib/mock/store";
import { formatDateRange, formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "My trips" };

export default function MyTrips() {
  const me = store.user("usr_femi")!;
  const trips = store.tripsForUser(me.id);

  return (
    <AppShell
      scope="Employee"
      scopeName={store.org.name}
      nav={employeeNav("trips")}
      user={{ name: `${me.firstName} ${me.lastName}`, jobTitle: me.jobTitle }}
    >
      <PageHeader
        eyebrow="My trips"
        title="Everything you've moved through."
        subtitle="A clear timeline of every trip — past, present, and planned."
        actions={
          <>
            <Button variant="outline" iconLeft={<Filter size={14} />}>
              Filter
            </Button>
            <Button href="/trips/new" iconLeft={<PlusCircle size={16} />}>
              Plan a trip
            </Button>
          </>
        }
      />

      <Card>
        <CardBody className="p-0 divide-y divide-sand-200">
          {trips.map((t) => (
            <Link
              key={t.id}
              href={`/trips/${t.id}`}
              className="flex items-center gap-4 p-5 hover:bg-sand-50 transition-colors"
            >
              <div className="h-12 w-12 rounded-xl bg-sand-100 text-navy-700 flex items-center justify-center">
                <Plane size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg text-navy-800">
                    {t.originCity} → {t.destinationCity}
                  </span>
                  <StatusPill status={t.status} />
                </div>
                <div className="mt-1 text-sm text-navy-500 truncate">
                  {t.purpose}
                </div>
                <div className="mt-1 text-xs text-navy-500">
                  {t.reference} · {formatDateRange(t.departureDate, t.returnDate)}
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <div className="font-display text-lg text-navy-800">
                  {formatMoney(t.actualCost ?? t.estimatedCost, t.currency)}
                </div>
                <div className="text-xs text-navy-500">
                  {t.actualCost ? "Actual" : "Estimated"}
                </div>
              </div>
              <ChevronRight size={18} className="text-navy-400" />
            </Link>
          ))}
        </CardBody>
      </Card>
    </AppShell>
  );
}
