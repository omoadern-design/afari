import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";
import { employeeNav } from "@/components/shell/employeeNav";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusPill } from "@/components/ui/StatusDot";
import {
  ArrowRight,
  Plane,
  Hotel,
  Car,
  Calendar,
  Receipt,
  ChevronRight,
  Clock,
  Check,
} from "@/components/icons";
import { store } from "@/lib/mock/store";
import { formatDateRange, formatMoney, formatTime, formatDate } from "@/lib/format";

export const metadata: Metadata = { title: "Trip" };

export default function TripDetail({ params }: { params: { id: string } }) {
  const trip = store.trip(params.id);
  if (!trip) notFound();
  const traveler = store.user(trip.travelerId)!;

  return (
    <AppShell
      scope="Employee"
      scopeName={store.org.name}
      nav={employeeNav("trips")}
      user={{ name: `${traveler.firstName} ${traveler.lastName}`, jobTitle: traveler.jobTitle }}
    >
      <PageHeader
        eyebrow={trip.reference}
        title={`${trip.originCity} → ${trip.destinationCity}`}
        subtitle={trip.purpose}
        actions={
          <div className="flex items-center gap-3">
            <StatusPill status={trip.status} pulse={trip.status === "in_progress"} />
            {trip.status === "draft" && (
              <Button href={`/trips/${trip.id}/book`} iconRight={<ArrowRight size={16} />}>
                Continue booking
              </Button>
            )}
            {trip.status === "approved" && (
              <Button iconRight={<ArrowRight size={16} />}>Book now</Button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Itinerary</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              {trip.flight && (
                <div className="rounded-2xl border border-sand-200 p-5">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-navy-500">
                    <Plane size={14} /> {trip.flight.airlineName} · {trip.flight.flightNumber}
                  </div>
                  <div className="mt-4 grid grid-cols-3 items-center gap-4">
                    <div>
                      <div className="font-display text-3xl text-navy-800 leading-none">
                        {trip.flight.departureAirport}
                      </div>
                      <div className="mt-1 text-xs text-navy-500">
                        {formatDate(trip.flight.departureTime)} ·{" "}
                        {formatTime(trip.flight.departureTime)}
                      </div>
                    </div>
                    <div className="flex flex-col items-center text-navy-400">
                      <Plane size={18} />
                      <div className="my-2 h-px w-full bg-sand-300" />
                      <div className="text-[10px] uppercase tracking-[0.18em] text-navy-500">
                        {trip.flight.cabinClass.replace("_", " ")} · seat {trip.flight.seat ?? "—"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-3xl text-navy-800 leading-none">
                        {trip.flight.arrivalAirport}
                      </div>
                      <div className="mt-1 text-xs text-navy-500">
                        {formatDate(trip.flight.arrivalTime)} ·{" "}
                        {formatTime(trip.flight.arrivalTime)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-navy-500">
                      PNR · <span className="text-navy-700 font-medium">{trip.flight.pnr}</span>
                    </span>
                    <span className="text-navy-500">
                      Ticket ·{" "}
                      <span className="text-navy-700 font-medium">{trip.flight.ticketNumber}</span>
                    </span>
                    <span className="text-navy-700 font-medium">
                      {formatMoney(trip.flight.cost, trip.flight.currency)}
                    </span>
                  </div>
                </div>
              )}

              {trip.hotel && (
                <div className="rounded-2xl border border-sand-200 p-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-terracotta-50 text-terracotta-500 flex items-center justify-center">
                      <Hotel size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-navy-800">
                        {trip.hotel.hotelName}
                      </div>
                      <div className="text-xs text-navy-500">
                        {trip.hotel.hotelAddress}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-navy-800">
                        {formatMoney(trip.hotel.totalCost, trip.hotel.currency)}
                      </div>
                      <div className="text-xs text-navy-500">
                        {trip.hotel.nights} nights ·{" "}
                        {formatMoney(trip.hotel.nightlyRate, trip.hotel.currency)}/night
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-3 text-xs text-navy-500">
                    <span>
                      Check-in <span className="text-navy-700 font-medium">{formatDate(trip.hotel.checkInDate)}</span>
                    </span>
                    <span>·</span>
                    <span>
                      Check-out <span className="text-navy-700 font-medium">{formatDate(trip.hotel.checkOutDate)}</span>
                    </span>
                    <span>·</span>
                    <span>
                      Confirmation{" "}
                      <span className="text-navy-700 font-medium">{trip.hotel.confirmationNumber}</span>
                    </span>
                  </div>
                </div>
              )}

              {!trip.flight && !trip.hotel && (
                <div className="text-sm text-navy-500 p-6 text-center">
                  No bookings yet. Continue to the booking flow to see three
                  curated options.
                </div>
              )}

              <div className="rounded-2xl border border-dashed border-sand-300 p-5 flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-sand-100 text-navy-700 flex items-center justify-center">
                  <Car size={18} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-navy-700">
                    Add airport transfer
                  </div>
                  <div className="text-xs text-navy-500">
                    Yango, Bolt, hotel shuttle — pre-booked and reimbursed.
                  </div>
                </div>
                <Button size="sm" variant="outline">
                  Add
                </Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardBody>
              <Timeline trip={trip} />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trip details</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4 text-sm">
              <Row label="Dates" value={formatDateRange(trip.departureDate, trip.returnDate)} />
              <Row
                label="Estimated"
                value={formatMoney(trip.estimatedCost, trip.currency)}
              />
              {trip.actualCost !== undefined && (
                <Row
                  label="Actual"
                  value={formatMoney(trip.actualCost, trip.currency)}
                />
              )}
              <Row label="Cost center" value={trip.costCenter ?? "—"} />
              <Row label="Project" value={trip.projectCode ?? "—"} />
              <Row label="Compliant" value={trip.policyCompliant ? "Yes" : "Exceptions"} />
              {trip.policyViolations && trip.policyViolations.length > 0 && (
                <div className="rounded-xl bg-amber-soft p-3 text-amber-700 text-xs">
                  <div className="font-medium mb-1">Policy advisories</div>
                  <ul className="list-disc list-inside space-y-1">
                    {trip.policyViolations.map((v) => (
                      <li key={v}>{v}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <ActionLink
                href="/expenses"
                title="File a receipt"
                hint="Auto-categorize against this trip"
                icon={<Receipt size={16} />}
              />
              <ActionLink
                href={`/trips/${trip.id}/book`}
                title="Modify booking"
                hint="Change flight, hotel, or transfers"
                icon={<Plane size={16} />}
              />
              <ActionLink
                href="#"
                title="Cancel trip"
                hint="Free up the budget"
                icon={<Calendar size={16} />}
              />
            </CardBody>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-navy-500">{label}</span>
      <span className="text-navy-800 font-medium">{value}</span>
    </div>
  );
}

function ActionLink({
  href,
  title,
  hint,
  icon,
}: {
  href: string;
  title: string;
  hint: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-sand-200 px-3 py-2.5 hover:border-navy-300"
    >
      <div className="h-8 w-8 rounded-lg bg-sand-100 text-navy-700 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-navy-800">{title}</div>
        <div className="text-xs text-navy-500">{hint}</div>
      </div>
      <ChevronRight size={14} className="text-navy-400" />
    </Link>
  );
}

function Timeline({ trip }: { trip: ReturnType<typeof store.trip> }) {
  if (!trip) return null;
  const steps: { label: string; date?: string; done: boolean; icon: React.ReactNode }[] = [
    { label: "Trip requested", date: trip.createdAt, done: true, icon: <Clock size={14} /> },
    {
      label: trip.status === "pending_approval" ? "Awaiting approval" : "Approved",
      date: trip.status === "pending_approval" ? undefined : trip.createdAt,
      done: trip.status !== "pending_approval" && trip.status !== "draft",
      icon: <Check size={14} />,
    },
    {
      label: "Booked",
      done: !!trip.flight,
      icon: <Plane size={14} />,
    },
    {
      label: "In transit",
      done: trip.status === "in_progress" || trip.status === "completed",
      icon: <Plane size={14} />,
    },
    {
      label: "Expenses reconciled",
      done: trip.status === "completed",
      icon: <Receipt size={14} />,
    },
  ];

  return (
    <ol className="relative">
      <div className="absolute left-3.5 top-2 bottom-2 w-px bg-sand-200" />
      {steps.map((s) => (
        <li key={s.label} className="relative pl-10 py-2">
          <span
            className={
              "absolute left-1.5 top-2 h-6 w-6 rounded-full flex items-center justify-center " +
              (s.done
                ? "bg-emerald text-white"
                : "bg-sand-100 text-navy-400 border border-sand-200")
            }
          >
            {s.icon}
          </span>
          <div
            className={
              "text-sm font-medium " +
              (s.done ? "text-navy-800" : "text-navy-500")
            }
          >
            {s.label}
          </div>
          {s.date && (
            <div className="text-xs text-navy-500">{formatDate(s.date)}</div>
          )}
        </li>
      ))}
    </ol>
  );
}

