import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";
import { employeeNav } from "@/components/shell/employeeNav";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  Sparkles,
  ArrowRight,
  Plane,
  Calendar,
  MapPin,
  Briefcase,
  Check,
} from "@/components/icons";
import { store } from "@/lib/mock/store";

export const metadata: Metadata = { title: "Plan a trip" };

export default function NewTripPage() {
  const me = store.user("usr_femi")!;

  return (
    <AppShell
      scope="Employee"
      scopeName={store.org.name}
      nav={employeeNav("new")}
      user={{ name: `${me.firstName} ${me.lastName}`, jobTitle: me.jobTitle }}
    >
      <PageHeader
        eyebrow="Step 1 of 3 · Tell us the trip"
        title="Plan a trip"
        subtitle="Type a sentence — or fill the form. AFARI runs the policy check while you type."
      />

      {/* Natural language */}
      <Card className="mb-6">
        <CardBody className="p-2 lg:p-3">
          <div className="rounded-2xl bg-sand-50 border border-sand-200 p-2 flex flex-col lg:flex-row gap-2 lg:items-center">
            <div className="flex items-center gap-3 px-3 lg:px-4 flex-1">
              <Sparkles size={18} className="text-terracotta-500 shrink-0" />
              <input
                type="text"
                defaultValue="Lagos to Nairobi next Tuesday for a client meeting"
                className="flex-1 bg-transparent text-base outline-none text-navy-800 py-3"
              />
            </div>
            <Button iconLeft={<Sparkles size={16} />}>Parse with AI</Button>
          </div>

          <div className="mt-3 px-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-navy-500">Detected:</span>
            <Chip>Origin · LOS</Chip>
            <Chip>Destination · NBO</Chip>
            <Chip>Departure · Tue, Apr 21</Chip>
            <Chip>Purpose · Client meeting</Chip>
            <Badge tone="emerald" dot>
              Within policy
            </Badge>
          </div>
        </CardBody>
      </Card>

      {/* Form */}
      <Card>
        <CardBody className="p-6 lg:p-8 space-y-8">
          <Section title="Where & when" icon={<MapPin size={18} />}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Input
                label="From"
                defaultValue="Lagos (LOS)"
                iconLeft={<Plane size={16} />}
              />
              <Input
                label="To"
                defaultValue="Nairobi (NBO)"
                iconLeft={<Plane size={16} />}
              />
              <Input
                type="date"
                label="Departure"
                defaultValue="2026-04-21"
                iconLeft={<Calendar size={16} />}
              />
              <Input
                type="date"
                label="Return"
                defaultValue="2026-04-24"
                iconLeft={<Calendar size={16} />}
              />
            </div>
          </Section>

          <Section title="Why are you travelling?" icon={<Briefcase size={18} />}>
            <Textarea
              label="Purpose"
              defaultValue="Client meeting with Safaricom leadership — partnership kickoff."
              rows={3}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-4">
              <Select label="Cost center" defaultValue="WA-COMM">
                <option value="WA-COMM">WA-COMM · West Africa Commercial</option>
                <option value="EA-ENG">EA-ENG · East Africa Engineering</option>
                <option value="CORP-LEGAL">CORP-LEGAL · Corporate Legal</option>
              </Select>
              <Input label="Project code" defaultValue="SAF-2026" />
            </div>
          </Section>

          <PolicyPanel />
        </CardBody>
      </Card>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" href="/home">
          Cancel
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="outline">Save as draft</Button>
          <Button href="/trips/trp_001/book" iconRight={<ArrowRight size={16} />}>
            See booking options
          </Button>
        </div>
      </div>
    </AppShell>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-9 w-9 rounded-xl bg-sand-100 text-navy-700 flex items-center justify-center">
          {icon}
        </div>
        <h2 className="font-display text-xl text-navy-800">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-white border border-sand-200 px-2 py-1 text-navy-700">
      {children}
    </span>
  );
}

function PolicyPanel() {
  const checks = [
    { label: "Manager approval will be required (cost > $500)", ok: true },
    { label: "Booked 5 days in advance — meets 7+ day rule (waivable)", ok: false },
    { label: "Hotel ceiling: $220/night — within range", ok: true },
    { label: "Cabin: economy — allowed", ok: true },
  ];
  return (
    <div className="rounded-2xl bg-sand-50 border border-sand-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-navy-500">
            Live policy check
          </div>
          <div className="font-display text-xl text-navy-800 mt-1">
            Mostly compliant — one soft flag
          </div>
        </div>
        <Badge tone="amber" dot>
          1 advisory
        </Badge>
      </div>
      <ul className="mt-5 space-y-2.5">
        {checks.map((c) => (
          <li
            key={c.label}
            className="flex items-start gap-2.5 text-sm text-navy-700"
          >
            <span
              className={
                c.ok
                  ? "h-5 w-5 mt-0.5 rounded-full bg-emerald-soft text-emerald-700 inline-flex items-center justify-center"
                  : "h-5 w-5 mt-0.5 rounded-full bg-amber-soft text-amber-700 inline-flex items-center justify-center"
              }
            >
              <Check size={12} />
            </span>
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
