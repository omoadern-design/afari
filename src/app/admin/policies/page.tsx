import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";
import { adminNav } from "@/components/shell/adminNav";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PlusCircle, Shield, Sparkles } from "@/components/icons";
import { store } from "@/lib/mock/store";
import { formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Policies" };

export default function PoliciesPage() {
  const me = store.currentUser();
  const policies = store.policies();
  const pending = store.pendingApprovals();

  return (
    <AppShell
      scope="Admin"
      scopeName={store.org.name}
      nav={adminNav("policies", pending.length)}
      user={{ name: `${me.firstName} ${me.lastName}`, jobTitle: me.jobTitle }}
    >
      <PageHeader
        eyebrow="Policy library"
        title="Travel policies that breathe."
        subtitle="Quietly enforced in the background. Visible. Auditable. Suggest alternatives, not blocks."
        actions={
          <>
            <Button variant="outline" iconLeft={<Sparkles size={14} />}>
              Draft with AI
            </Button>
            <Button iconLeft={<PlusCircle size={16} />}>New policy</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {policies.map((p) => (
          <Card key={p.id}>
            <CardHeader className="flex items-start justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-navy-500 mb-1">
                  Applies to
                </div>
                <CardTitle>{p.name}</CardTitle>
                <div className="mt-1 flex items-center gap-2">
                  <Badge tone="navy">{p.appliesToRole ?? "All roles"}</Badge>
                  <Badge tone="neutral">
                    {p.appliesToDepartment ?? "All departments"}
                  </Badge>
                </div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-navy-50 text-navy-700 flex items-center justify-center">
                <Shield size={18} />
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Stat label="Domestic flights ≤" value={formatMoney(p.maxFlightDomestic, "USD")} />
                <Stat label="Regional flights ≤" value={formatMoney(p.maxFlightRegional, "USD")} />
                <Stat label="International flights ≤" value={formatMoney(p.maxFlightIntl, "USD")} />
                <Stat label="Hotel per night ≤" value={formatMoney(p.maxHotelPerNight, "USD")} />
                <Stat label="Daily meals ≤" value={formatMoney(p.maxDailyMeals, "USD")} />
                <Stat label="Advance booking ≥" value={`${p.advanceBookingDays} days`} />
                <Stat label="Auto-approve <" value={formatMoney(p.autoApproveUnder, "USD")} />
                <Stat label="Approval req. >" value={formatMoney(p.requiresApprovalAbove, "USD")} />
              </div>
              <div className="rounded-xl bg-sand-50 border border-sand-200 p-4 text-sm">
                <div className="text-xs uppercase tracking-[0.18em] text-navy-500 mb-1">
                  Allowed cabin classes
                </div>
                <div className="flex flex-wrap gap-2">
                  {p.allowedCabinClasses.map((c) => (
                    <Badge key={c} tone="navy">
                      {c.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm">
                  Duplicate
                </Button>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-sand-200 p-3">
      <div className="text-[10px] uppercase tracking-[0.18em] text-navy-500">
        {label}
      </div>
      <div className="mt-1 font-display text-lg text-navy-800">{value}</div>
    </div>
  );
}
