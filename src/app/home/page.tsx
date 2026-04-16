import Link from "next/link";
import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";
import { employeeNav } from "@/components/shell/employeeNav";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusPill } from "@/components/ui/StatusDot";
import {
  ArrowRight,
  Sparkles,
  Plane,
  Hotel,
  Calendar,
  Receipt,
  ChevronRight,
  Camera,
  Compass,
} from "@/components/icons";
import { store } from "@/lib/mock/store";
import { formatDateRange, formatMoney, formatTime } from "@/lib/format";

export const metadata: Metadata = { title: "Home" };

export default function EmployeeHome() {
  // For demo: surface as Femi, an employee with a pending trip and an upcoming one.
  const me = store.user("usr_femi")!;
  const trips = store.tripsForUser(me.id);
  const upcoming = trips.find((t) => ["approved", "booked", "in_progress"].includes(t.status));
  const pending = trips.find((t) => t.status === "pending_approval");
  const next = upcoming ?? pending ?? trips[0];

  return (
    <AppShell
      scope="Employee"
      scopeName={`${store.org.name}`}
      nav={employeeNav("home")}
      user={{ name: `${me.firstName} ${me.lastName}`, jobTitle: me.jobTitle }}
    >
      {/* Calm hero — single primary action */}
      <section className="rounded-3xl p-8 lg:p-12 hero-gradient border border-sand-200 mb-10">
        <div className="text-xs uppercase tracking-[0.2em] text-navy-500">
          Good morning, {me.firstName}
        </div>
        <h1 className="mt-2 font-display text-display-2 text-navy-800 text-balance max-w-3xl">
          Where to next?
        </h1>
        <p className="mt-3 text-navy-600 max-w-xl">
          Type a sentence. We'll handle policy, approvals, flights, hotels and
          expenses.
        </p>

        <div className="mt-7">
          <NaturalLanguageBar />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <SuggestionChip text="Lagos to Nairobi next Tuesday for a client meeting" />
          <SuggestionChip text="Day trip to Accra on Friday" />
          <SuggestionChip text="Book the same as my last trip" />
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Next trip */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-navy-500">
                Your next trip
              </div>
              <CardTitle className="mt-1">
                {next ? `${next.originCity} → ${next.destinationCity}` : "Nothing on the horizon"}
              </CardTitle>
            </div>
            {next && <StatusPill status={next.status} pulse={next.status === "in_progress"} />}
          </CardHeader>
          <CardBody>
            {next ? (
              <>
                <div className="grid grid-cols-3 gap-6">
                  <Stat label="Reference" value={next.reference} />
                  <Stat
                    label="Dates"
                    value={formatDateRange(next.departureDate, next.returnDate)}
                  />
                  <Stat
                    label="Estimated cost"
                    value={formatMoney(next.estimatedCost, next.currency)}
                  />
                </div>
                <p className="mt-6 text-sm text-navy-600">{next.purpose}</p>

                {next.flight && (
                  <div className="mt-6 rounded-2xl border border-sand-200 p-5">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-navy-500">
                      <Plane size={14} /> Flight · {next.flight.airlineName} {next.flight.flightNumber}
                    </div>
                    <div className="mt-3 grid grid-cols-3 items-center gap-2">
                      <FlightPoint code={next.flight.departureAirport} time={next.flight.departureTime} />
                      <FlightLine cabin={next.flight.cabinClass} />
                      <FlightPoint code={next.flight.arrivalAirport} time={next.flight.arrivalTime} alignRight />
                    </div>
                    <div className="mt-4 grid grid-cols-3 text-xs text-navy-500">
                      <div>PNR · <span className="text-navy-700 font-medium">{next.flight.pnr}</span></div>
                      <div className="text-center">Seat · <span className="text-navy-700 font-medium">{next.flight.seat ?? "—"}</span></div>
                      <div className="text-right">Ticket · <span className="text-navy-700 font-medium">{next.flight.ticketNumber}</span></div>
                    </div>
                  </div>
                )}

                {next.hotel && (
                  <div className="mt-4 rounded-2xl border border-sand-200 p-5 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-terracotta-50 text-terracotta-500 flex items-center justify-center">
                      <Hotel size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-navy-800 truncate">
                        {next.hotel.hotelName}
                      </div>
                      <div className="text-xs text-navy-500 truncate">
                        {next.hotel.hotelAddress} · {next.hotel.nights} nights
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-navy-800">
                        {formatMoney(next.hotel.totalCost, next.hotel.currency)}
                      </div>
                      <div className="text-xs text-navy-500">
                        {formatMoney(next.hotel.nightlyRate, next.hotel.currency)} / night
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex items-center gap-3">
                  <Button href={`/trips/${next.id}`} iconRight={<ArrowRight size={16} />}>
                    Open trip
                  </Button>
                  {next.status === "pending_approval" && (
                    <Badge tone="amber" dot>
                      Awaiting your manager
                    </Badge>
                  )}
                </div>
              </>
            ) : (
              <EmptyTrip />
            )}
          </CardBody>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <ActionRow
                href="/trips/new"
                icon={<Calendar size={18} />}
                title="Plan a new trip"
                hint="From a sentence — or a form"
              />
              <ActionRow
                href="/expenses"
                icon={<Camera size={18} />}
                title="Snap a receipt"
                hint="OCR + auto-categorize"
              />
              <ActionRow
                href="/trips"
                icon={<Compass size={18} />}
                title="View all trips"
                hint={`${trips.length} on your timeline`}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4">
              {trips
                .filter((t) => !["completed", "cancelled"].includes(t.status))
                .slice(0, 4)
                .map((t) => (
                  <Link
                    key={t.id}
                    href={`/trips/${t.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <div className="h-10 w-10 rounded-xl bg-sand-100 text-navy-700 flex items-center justify-center font-display text-sm">
                      {t.destinationAirport}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-navy-800 truncate group-hover:text-terracotta-600">
                        {t.originCity} → {t.destinationCity}
                      </div>
                      <div className="text-xs text-navy-500 truncate">
                        {formatDateRange(t.departureDate, t.returnDate)}
                      </div>
                    </div>
                    <StatusPill status={t.status} className="hidden sm:inline-flex" />
                    <ChevronRight size={16} className="text-navy-400" />
                  </Link>
                ))}
              {trips.filter((t) => !["completed", "cancelled"].includes(t.status))
                .length === 0 && (
                <p className="text-sm text-navy-500">Nothing scheduled.</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function NaturalLanguageBar() {
  return (
    <div className="rounded-2xl bg-white border border-sand-200 shadow-soft p-2 lg:p-3 flex flex-col lg:flex-row gap-2 lg:items-center">
      <div className="flex items-center gap-3 px-3 lg:px-4 flex-1">
        <Sparkles size={18} className="text-terracotta-500 shrink-0" />
        <input
          type="text"
          placeholder="“Lagos to Nairobi next Tuesday for a client meeting”"
          className="flex-1 bg-transparent text-base lg:text-lg outline-none placeholder:text-navy-400/80 text-navy-800 py-3"
        />
      </div>
      <Button size="lg" iconRight={<ArrowRight size={18} />} href="/trips/new">
        Plan trip
      </Button>
    </div>
  );
}

function SuggestionChip({ text }: { text: string }) {
  return (
    <button
      type="button"
      className="rounded-full border border-sand-300 bg-white px-3 py-1.5 text-xs text-navy-600 hover:border-navy-300 hover:text-navy-800"
    >
      “{text}”
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-[0.18em] text-navy-500">
        {label}
      </div>
      <div className="mt-1 font-display text-lg text-navy-800">{value}</div>
    </div>
  );
}

function FlightPoint({
  code,
  time,
  alignRight,
}: {
  code: string;
  time: string;
  alignRight?: boolean;
}) {
  return (
    <div className={alignRight ? "text-right" : ""}>
      <div className="font-display text-3xl text-navy-800 leading-none">{code}</div>
      <div className="mt-1 text-xs text-navy-500">{formatTime(time)}</div>
    </div>
  );
}

function FlightLine({ cabin }: { cabin: string }) {
  return (
    <div className="flex flex-col items-center text-navy-400">
      <div className="text-[10px] uppercase tracking-[0.18em] text-navy-500">
        {cabin.replace("_", " ")}
      </div>
      <div className="my-2 h-px w-full bg-sand-300 relative">
        <div className="absolute left-1/2 -translate-x-1/2 -top-1.5">
          <Plane size={14} />
        </div>
      </div>
    </div>
  );
}

function ActionRow({
  href,
  icon,
  title,
  hint,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-sand-200 bg-white px-4 py-3 hover:border-navy-300 transition-colors"
    >
      <div className="h-9 w-9 rounded-lg bg-sand-100 text-navy-700 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-navy-800">{title}</div>
        <div className="text-xs text-navy-500">{hint}</div>
      </div>
      <ChevronRight size={16} className="text-navy-400" />
    </Link>
  );
}

function EmptyTrip() {
  return (
    <div className="text-center py-12 text-navy-500">
      <p>You're all caught up. When you're ready, plan a trip in a sentence.</p>
      <div className="mt-5">
        <Button href="/trips/new" iconRight={<ArrowRight size={16} />}>
          Plan a trip
        </Button>
      </div>
    </div>
  );
}
