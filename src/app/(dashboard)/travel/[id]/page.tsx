import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Plane, Hotel, Car, Clock, Calendar,
  CheckCircle, XCircle, AlertTriangle, Receipt,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PolicyBadge } from "@/components/travel/PolicyBadge";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT:       { label: "Draft",             className: "bg-[#f0f0f0] text-[#737373]" },
  CONFIRMED:   { label: "Confirmed",         className: "bg-emerald-100 text-emerald-700" },
  CANCELLED:   { label: "Cancelled",         className: "bg-red-100 text-red-600" },
};

const TYPE_ICON: Record<string, React.ReactNode> = {
  FLIGHT: <Plane className="h-5 w-5" />,
  HOTEL:  <Hotel className="h-5 w-5" />,
  CAR:    <Car className="h-5 w-5" />,
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[#e5e5e5] bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-[#737373]">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-[#f7f7f7] last:border-0">
      <span className="text-xs text-[#737373]">{label}</span>
      <span className="text-sm font-medium text-[#0a0a0a]">{value}</span>
    </div>
  );
}

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      user: true,
      policy: true,
      approvalRequest: {
        include: {
          actions: {
            include: { actor: true },
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!booking) notFound();

  // Only the owner or manager/finance/admin can view
  const canView =
    booking.userId === session.user.id ||
    ["MANAGER", "FINANCE", "ADMIN"].includes(session.user.role);
  if (!canView) notFound();

  const status = STATUS_CONFIG[booking.status] ?? { label: booking.status, className: "bg-[#f0f0f0] text-[#737373]" };
  const flightData = booking.flightData as any;
  const hotelData  = booking.hotelData  as any;
  const carData    = booking.carData    as any;
  const violations: string[] = JSON.parse(booking.policyViolations ?? "[]");

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Back */}
      <Link
        href="/travel"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-[#737373] hover:text-[#0a0a0a] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to travel
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f0f0f0] text-[#737373]">
            {TYPE_ICON[booking.type] ?? <Receipt className="h-5 w-5" />}
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#0a0a0a]">
              {booking.type.charAt(0) + booking.type.slice(1).toLowerCase()} Booking
            </h1>
            <p className="text-xs text-[#a3a3a3]">Ref: {booking.confirmationRef ?? booking.id.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.className}`}>
            {status.label}
          </span>
          <PolicyBadge result={booking.policyResult as any} violations={violations} size="sm" />
        </div>
      </div>

      <div className="space-y-4">
        {/* Overview */}
        <Section title="Overview">
          <Row label="Booking type"   value={booking.type} />
          <Row label="Total amount"   value={formatCurrency(booking.totalAmount, booking.currency)} />
          <Row label="Created"        value={formatDate(booking.createdAt.toISOString())} />
          {booking.startDate && <Row label="Start date"  value={formatDate(booking.startDate.toISOString())} />}
          {booking.endDate   && <Row label="End date"    value={formatDate(booking.endDate.toISOString())} />}
          {booking.purpose   && <Row label="Purpose"     value={booking.purpose} />}
        </Section>

        {/* Flight details */}
        {booking.type === "FLIGHT" && flightData && (
          <Section title="Flight details">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#0a0a0a]">{flightData.departureTime}</p>
                <p className="text-sm font-medium text-[#737373]">{flightData.origin}</p>
              </div>
              <div className="flex flex-1 flex-col items-center gap-1">
                <p className="text-xs text-[#a3a3a3]">
                  <Clock className="inline h-3 w-3 mr-0.5" />
                  {Math.floor(flightData.duration / 60)}h {flightData.duration % 60}m
                </p>
                <div className="relative flex w-full items-center">
                  <div className="h-px flex-1 bg-slate-200" />
                  <Plane className="mx-1 h-3.5 w-3.5 rotate-90 text-[#a3a3a3]" />
                  <div className="h-px flex-1 bg-slate-200" />
                </div>
                <p className="text-xs text-[#a3a3a3]">{flightData.stops === 0 ? "Nonstop" : `${flightData.stops} stop`}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#0a0a0a]">{flightData.arrivalTime}</p>
                <p className="text-sm font-medium text-[#737373]">{flightData.destination}</p>
              </div>
            </div>
            <Row label="Airline"       value={flightData.airline ?? "—"} />
            <Row label="Flight number" value={flightData.flightNumber ?? "—"} />
            <Row label="Cabin class"   value={flightData.cabinClass ?? "—"} />
            {flightData.passengers && <Row label="Passengers" value={flightData.passengers} />}
          </Section>
        )}

        {/* Hotel details */}
        {booking.type === "HOTEL" && hotelData && (
          <Section title="Hotel details">
            <Row label="Hotel"         value={hotelData.hotelName ?? "—"} />
            <Row label="Address"       value={hotelData.address ?? "—"} />
            <Row label="City"          value={hotelData.city ?? "—"} />
            <Row label="Check-in"      value={hotelData.checkIn ? formatDate(hotelData.checkIn) : "—"} />
            <Row label="Check-out"     value={hotelData.checkOut ? formatDate(hotelData.checkOut) : "—"} />
            <Row label="Nights"        value={hotelData.nights ?? "—"} />
            <Row label="Room type"     value={hotelData.roomType ?? "—"} />
            <Row label="Nightly rate"  value={hotelData.nightlyRate ? formatCurrency(hotelData.nightlyRate, booking.currency) : "—"} />
          </Section>
        )}

        {/* Car details */}
        {booking.type === "CAR" && carData && (
          <Section title="Car rental details">
            <Row label="Rental company"  value={carData.rentalCompany ?? "—"} />
            <Row label="Car class"       value={carData.carClass ?? "—"} />
            {carData.model && <Row label="Model" value={carData.model} />}
            <Row label="Pickup location" value={carData.pickupLocation ?? "—"} />
            <Row label="Pickup date"     value={carData.pickupDate ? formatDate(carData.pickupDate) : "—"} />
            <Row label="Dropoff date"    value={carData.dropoffDate ? formatDate(carData.dropoffDate) : "—"} />
            <Row label="Days"            value={carData.days ?? "—"} />
            <Row label="Daily rate"      value={carData.dailyRate ? formatCurrency(carData.dailyRate, booking.currency) : "—"} />
          </Section>
        )}

        {/* Policy violations */}
        {violations.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Policy violations</p>
                <ul className="mt-1 space-y-0.5">
                  {violations.map((v, i) => (
                    <li key={i} className="text-xs text-amber-700">{v}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Approval history */}
        {booking.approvalRequest && (
          <Section title="Approval history">
            <div className="space-y-3">
              {booking.approvalRequest.actions.length === 0 ? (
                <p className="text-sm text-[#a3a3a3]">Pending review…</p>
              ) : (
                booking.approvalRequest.actions.map((a) => (
                  <div key={a.id} className="flex items-start gap-2.5">
                    {a.action === "APPROVE" ? (
                      <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-[#0a0a0a]">
                        {a.action === "APPROVE" ? "Approved" : "Rejected"} by {a.actor.name}
                      </p>
                      {a.comment && <p className="mt-0.5 text-xs text-[#737373]">&ldquo;{a.comment}&rdquo;</p>}
                      <p className="mt-0.5 text-xs text-[#a3a3a3]">
                        <Calendar className="inline h-3 w-3 mr-0.5" />
                        {formatDate(a.createdAt.toISOString())}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Section>
        )}

        {/* Justification */}
        {booking.justification && (
          <Section title="Justification">
            <p className="text-sm text-[#737373] italic">&ldquo;{booking.justification}&rdquo;</p>
          </Section>
        )}
      </div>
    </div>
  );
}
