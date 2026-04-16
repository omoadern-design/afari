import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";
import { employeeNav } from "@/components/shell/employeeNav";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Plane,
  Hotel,
  ArrowRight,
  Sparkles,
  Check,
  Clock,
  MapPin,
} from "@/components/icons";
import { store, smartFlightOptions, smartHotelOptions } from "@/lib/mock/store";
import { formatDuration, formatMoney, formatTime } from "@/lib/format";

export const metadata: Metadata = { title: "Choose your bookings" };

export default function BookPage({ params }: { params: { id: string } }) {
  const trip = store.trip(params.id);
  if (!trip) notFound();
  const traveler = store.user(trip.travelerId)!;
  const flights = smartFlightOptions(trip);
  const hotels = smartHotelOptions(trip);

  return (
    <AppShell
      scope="Employee"
      scopeName={store.org.name}
      nav={employeeNav("trips")}
      user={{ name: `${traveler.firstName} ${traveler.lastName}`, jobTitle: traveler.jobTitle }}
    >
      <PageHeader
        eyebrow={`Step 2 of 3 · ${trip.reference}`}
        title="Three options. Not three hundred."
        subtitle="Curated against policy, your meeting schedule, and your preferences."
      />

      {/* Flight options */}
      <Section
        kicker="Flights"
        icon={<Plane size={18} />}
        title={`${trip.originCity} → ${trip.destinationCity}`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {flights.map((f, i) => (
            <FlightCard key={f.id} option={f} highlighted={i === 0} />
          ))}
        </div>
      </Section>

      {/* Hotel options */}
      <Section
        kicker="Hotels"
        icon={<Hotel size={18} />}
        title={`Where to stay in ${trip.destinationCity}`}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {hotels.map((h, i) => (
            <HotelCard key={h.id} option={h} highlighted={i === 0} />
          ))}
        </div>
      </Section>

      {/* Summary footer */}
      <Card className="mt-10">
        <CardBody className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-navy-500">
              Selected
            </div>
            <div className="font-display text-xl text-navy-800 mt-1">
              {flights[0].airlineName} {flights[0].flightNumber} · {hotels[0].name}
            </div>
            <div className="text-sm text-navy-600 mt-1">
              Total estimate{" "}
              <span className="font-medium text-navy-800">
                {formatMoney(flights[0].cost + hotels[0].nightlyRate * 3, "USD")}
              </span>
              {" · "}
              <Badge tone="emerald" dot>
                Within policy
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">Save selection</Button>
            <Button href={`/trips/${trip.id}`} iconRight={<ArrowRight size={16} />}>
              Confirm & book
            </Button>
          </div>
        </CardBody>
      </Card>
    </AppShell>
  );
}

function Section({
  kicker,
  title,
  icon,
  children,
}: {
  kicker: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-9 w-9 rounded-xl bg-navy-50 text-navy-700 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-navy-500">
            {kicker}
          </div>
          <div className="font-display text-xl text-navy-800">{title}</div>
        </div>
      </div>
      {children}
    </section>
  );
}

function FlightCard({
  option,
  highlighted,
}: {
  option: ReturnType<typeof smartFlightOptions>[number];
  highlighted?: boolean;
}) {
  return (
    <Card
      className={
        "p-6 relative transition-all " +
        (highlighted ? "ring-2 ring-terracotta-400/40 shadow-lift" : "")
      }
    >
      <div className="flex items-center justify-between">
        <Badge tone={highlighted ? "terracotta" : "navy"} dot>
          {option.label}
        </Badge>
        {option.policyCompliant ? (
          <Badge tone="emerald">In policy</Badge>
        ) : (
          <Badge tone="amber">Needs justification</Badge>
        )}
      </div>

      <div className="mt-5 grid grid-cols-3 items-center gap-3">
        <div>
          <div className="font-display text-2xl text-navy-800 leading-none">
            {formatTime(option.departureTime)}
          </div>
          <div className="text-xs text-navy-500 mt-1">Depart</div>
        </div>
        <div className="text-center text-navy-400">
          <Clock size={14} className="inline mb-1" />
          <div className="text-xs text-navy-600">{formatDuration(option.durationMinutes)}</div>
          <div className="text-[10px] uppercase tracking-widest text-navy-400">
            {option.stops === 0 ? "Direct" : `${option.stops} stop`}
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl text-navy-800 leading-none">
            {formatTime(option.arrivalTime)}
          </div>
          <div className="text-xs text-navy-500 mt-1">Arrive</div>
        </div>
      </div>

      <div className="mt-5 text-sm text-navy-700">
        <span className="font-medium">{option.airlineName}</span>{" "}
        <span className="text-navy-500">· {option.flightNumber}</span>
      </div>

      <p className="mt-3 text-sm text-navy-600 leading-relaxed">
        <Sparkles size={12} className="inline text-terracotta-500 mr-1.5" />
        {option.why}
      </p>

      <div className="mt-6 flex items-center justify-between">
        <div>
          <div className="font-display text-2xl text-navy-800">
            {formatMoney(option.cost, option.currency)}
          </div>
          <div className="text-xs text-navy-500">incl. taxes & fees</div>
        </div>
        <Button
          size="sm"
          variant={highlighted ? "primary" : "outline"}
          iconRight={highlighted ? <Check size={14} /> : <ArrowRight size={14} />}
        >
          {highlighted ? "Selected" : "Select"}
        </Button>
      </div>
    </Card>
  );
}

function HotelCard({
  option,
  highlighted,
}: {
  option: ReturnType<typeof smartHotelOptions>[number];
  highlighted?: boolean;
}) {
  return (
    <Card
      className={
        "p-6 relative transition-all " +
        (highlighted ? "ring-2 ring-terracotta-400/40 shadow-lift" : "")
      }
    >
      <div className="flex items-center justify-between">
        <Badge tone={highlighted ? "terracotta" : "navy"} dot>
          {option.label}
        </Badge>
        {option.policyCompliant ? (
          <Badge tone="emerald">In policy</Badge>
        ) : (
          <Badge tone="amber">Over policy</Badge>
        )}
      </div>
      <CardHeader className="px-0 pt-6 pb-2">
        <CardTitle className="text-xl">{option.name}</CardTitle>
        <div className="mt-1 text-sm text-navy-500 flex items-center gap-2">
          <MapPin size={14} /> {option.neighborhood} · {option.walkToMeeting}
        </div>
      </CardHeader>
      <div className="text-xs text-navy-500">
        ★ <span className="text-navy-700 font-medium">{option.rating.toFixed(1)}</span> rating
      </div>
      <p className="mt-3 text-sm text-navy-600 leading-relaxed">
        <Sparkles size={12} className="inline text-terracotta-500 mr-1.5" />
        {option.why}
      </p>
      <div className="mt-6 flex items-center justify-between">
        <div>
          <div className="font-display text-2xl text-navy-800">
            {formatMoney(option.nightlyRate, option.currency)}
          </div>
          <div className="text-xs text-navy-500">per night</div>
        </div>
        <Button
          size="sm"
          variant={highlighted ? "primary" : "outline"}
          iconRight={highlighted ? <Check size={14} /> : <ArrowRight size={14} />}
        >
          {highlighted ? "Selected" : "Select"}
        </Button>
      </div>
    </Card>
  );
}
