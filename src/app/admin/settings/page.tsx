import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";
import { adminNav } from "@/components/shell/adminNav";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { store } from "@/lib/mock/store";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  const me = store.currentUser();
  const pending = store.pendingApprovals();

  return (
    <AppShell
      scope="Admin"
      scopeName={store.org.name}
      nav={adminNav("settings", pending.length)}
      user={{ name: `${me.firstName} ${me.lastName}`, jobTitle: me.jobTitle }}
    >
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        subtitle="Identity, integrations, and posture for your AFARI workspace."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardBody className="space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <Input label="Workspace name" defaultValue={store.org.name} />
                <Input label="Workspace URL" defaultValue={`https://${store.org.slug}.afari.travel`} />
                <Select label="Base currency" defaultValue={store.org.baseCurrency}>
                  <option>USD</option>
                  <option>NGN</option>
                  <option>KES</option>
                  <option>ZAR</option>
                  <option>GHS</option>
                  <option>EUR</option>
                </Select>
                <Select label="Default timezone" defaultValue={store.org.timezone}>
                  <option>Africa/Lagos</option>
                  <option>Africa/Nairobi</option>
                  <option>Africa/Johannesburg</option>
                  <option>Africa/Accra</option>
                  <option>Africa/Casablanca</option>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button>Save changes</Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Integrations</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3">
              <Integration
                name="Duffel"
                description="Flight inventory & ticketing across African carriers."
                status="connected"
              />
              <Integration
                name="Amadeus GDS"
                description="Backup inventory and corporate negotiated rates."
                status="not_connected"
              />
              <Integration
                name="Paystack"
                description="Local payment rails for Nigeria, Ghana, Kenya, South Africa."
                status="connected"
              />
              <Integration
                name="QuickBooks Online"
                description="Sync expense reports and reimbursements to your GL."
                status="not_connected"
              />
              <Integration
                name="Slack"
                description="Approval pings and trip reminders in #travel."
                status="connected"
              />
              <Integration
                name="Anthropic (Claude)"
                description="Powers natural-language trip parsing and policy advisories."
                status="connected"
              />
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardBody className="space-y-3 text-sm">
              <Toggle label="Enforce MFA for admins & finance" enabled />
              <Toggle label="Require SSO for all employees" />
              <Toggle label="Lock account after 10 failed logins" enabled />
              <Toggle label="Encrypt PII at rest (AES-256)" enabled disabled />
              <Toggle label="Send anomaly alerts to admins" enabled />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plan</CardTitle>
            </CardHeader>
            <CardBody className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-navy-500">Tier</span>
                <Badge tone="terracotta">Growth</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-navy-500">Seats</span>
                <span className="text-navy-800 font-medium">8 of 25</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-navy-500">Renews</span>
                <span className="text-navy-800 font-medium">Jan 12, 2027</span>
              </div>
              <div className="pt-3">
                <Button variant="outline" className="w-full">
                  Manage billing
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Integration({
  name,
  description,
  status,
}: {
  name: string;
  description: string;
  status: "connected" | "not_connected";
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-sand-200 p-4">
      <div className="h-10 w-10 rounded-xl bg-navy-50 text-navy-700 flex items-center justify-center font-display font-semibold">
        {name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-navy-800">{name}</div>
        <div className="text-xs text-navy-500 truncate">{description}</div>
      </div>
      {status === "connected" ? (
        <Badge tone="emerald" dot>
          Connected
        </Badge>
      ) : (
        <Button size="sm" variant="outline">
          Connect
        </Button>
      )}
    </div>
  );
}

function Toggle({
  label,
  enabled,
  disabled,
}: {
  label: string;
  enabled?: boolean;
  disabled?: boolean;
}) {
  return (
    <label
      className={
        "flex items-center justify-between gap-3 cursor-pointer " +
        (disabled ? "opacity-60 cursor-not-allowed" : "")
      }
    >
      <span className="text-navy-700">{label}</span>
      <span
        className={
          "relative inline-flex h-6 w-10 items-center rounded-full transition-colors " +
          (enabled ? "bg-terracotta-400" : "bg-sand-200")
        }
      >
        <span
          className={
            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform " +
            (enabled ? "translate-x-4" : "translate-x-0.5")
          }
        />
      </span>
    </label>
  );
}
