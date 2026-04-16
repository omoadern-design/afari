import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Settings, CheckCircle, XCircle, AlertCircle, Globe, Building2, Zap } from "lucide-react";

type IntegrationStatus = "connected" | "not_connected" | "degraded";

interface Integration {
  name: string;
  description: string;
  status: IntegrationStatus;
  category: string;
}

const INTEGRATIONS: Integration[] = [
  {
    name: "Duffel",
    description: "Flight inventory & ticketing across 300+ African and global carriers.",
    status: "connected",
    category: "Travel",
  },
  {
    name: "Amadeus GDS",
    description: "Backup inventory and corporate negotiated rates.",
    status: "not_connected",
    category: "Travel",
  },
  {
    name: "Paystack",
    description: "Local payment rails for Nigeria, Ghana, Kenya, and South Africa.",
    status: "connected",
    category: "Payments",
  },
  {
    name: "Flutterwave",
    description: "Pan-African payment processing and virtual cards.",
    status: "not_connected",
    category: "Payments",
  },
  {
    name: "QuickBooks Online",
    description: "Sync expense reports and reimbursements to your GL.",
    status: "not_connected",
    category: "Accounting",
  },
  {
    name: "Xero",
    description: "Export expense data to Xero accounting.",
    status: "not_connected",
    category: "Accounting",
  },
  {
    name: "Slack",
    description: "Approval pings and trip reminders in #travel channel.",
    status: "connected",
    category: "Collaboration",
  },
  {
    name: "Anthropic (Claude)",
    description: "Powers natural-language trip parsing and AI policy advisories.",
    status: "connected",
    category: "AI",
  },
];

const STATUS_ICON: Record<IntegrationStatus, React.ReactNode> = {
  connected:     <CheckCircle className="h-4 w-4 text-emerald-600" />,
  not_connected: <XCircle className="h-4 w-4 text-[#d4d4d4]" />,
  degraded:      <AlertCircle className="h-4 w-4 text-amber-500" />,
};

const STATUS_LABEL: Record<IntegrationStatus, string> = {
  connected:     "Connected",
  not_connected: "Not connected",
  degraded:      "Degraded",
};

const STATUS_CLASS: Record<IntegrationStatus, string> = {
  connected:     "bg-emerald-100 text-emerald-700",
  not_connected: "bg-[#f0f0f0] text-[#737373]",
  degraded:      "bg-amber-100 text-amber-700",
};

const CURRENCIES = ["USD", "NGN", "KES", "ZAR", "GHS", "EUR", "GBP", "XOF"];
const TIMEZONES  = ["Africa/Lagos", "Africa/Nairobi", "Africa/Johannesburg", "Africa/Accra", "Africa/Casablanca", "Africa/Cairo", "Europe/London", "UTC"];

const INPUT = "w-full rounded-lg border border-[#e5e5e5] bg-[#f7f7f7] px-3.5 py-2 text-sm text-[#0a0a0a] focus:border-[#0a0a0a]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/10 transition-colors";
const LABEL = "mb-1.5 block text-xs font-semibold uppercase tracking-widest text-[#737373]";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const categories = [...new Set(INTEGRATIONS.map((i) => i.category))];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f0f0]">
          <Settings className="h-5 w-5 text-[#0a0a0a]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#0a0a0a]">Workspace Settings</h1>
          <p className="text-sm text-[#737373]">Organization configuration and integrations</p>
        </div>
      </div>

      {/* Organization */}
      <div className="rounded-xl border border-[#e5e5e5] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b border-[#f0f0f0] px-5 py-4">
          <Building2 className="h-4 w-4 text-[#a3a3a3]" />
          <h2 className="text-sm font-semibold text-[#0a0a0a]">Organization</h2>
        </div>
        <div className="p-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={LABEL}>Workspace name</label>
            <input className={INPUT} defaultValue="AFARI Corp" />
          </div>
          <div>
            <label className={LABEL}>Workspace URL</label>
            <input className={INPUT} defaultValue="afari.travel/your-org" disabled />
          </div>
          <div>
            <label className={LABEL}>Base currency</label>
            <select className={INPUT} defaultValue="USD">
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL}>Default timezone</label>
            <select className={INPUT} defaultValue="Africa/Lagos">
              {TIMEZONES.map((tz) => <option key={tz} value={tz}>{tz}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL}>Country</label>
            <select className={INPUT} defaultValue="NG">
              <option value="NG">Nigeria</option>
              <option value="KE">Kenya</option>
              <option value="ZA">South Africa</option>
              <option value="GH">Ghana</option>
              <option value="ET">Ethiopia</option>
              <option value="EG">Egypt</option>
              <option value="MA">Morocco</option>
              <option value="CI">Côte d'Ivoire</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>Billing plan</label>
            <input className={INPUT} defaultValue="Growth" disabled />
          </div>
        </div>
        <div className="border-t border-[#f0f0f0] bg-[#f7f7f7] px-5 py-3 flex justify-end">
          <button className="rounded-lg bg-[#0a0a0a] px-4 py-2 text-xs font-semibold text-white hover:bg-[#262626] transition-colors">
            Save changes
          </button>
        </div>
      </div>

      {/* Integrations */}
      <div className="rounded-xl border border-[#e5e5e5] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b border-[#f0f0f0] px-5 py-4">
          <Zap className="h-4 w-4 text-[#a3a3a3]" />
          <h2 className="text-sm font-semibold text-[#0a0a0a]">Integrations</h2>
          <span className="ml-auto text-xs text-[#a3a3a3]">
            {INTEGRATIONS.filter((i) => i.status === "connected").length} of {INTEGRATIONS.length} connected
          </span>
        </div>

        {categories.map((cat) => (
          <div key={cat}>
            <div className="border-b border-[#f7f7f7] bg-[#fafafa] px-5 py-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-[#a3a3a3]">{cat}</span>
            </div>
            {INTEGRATIONS.filter((i) => i.category === cat).map((integration, idx, arr) => (
              <div
                key={integration.name}
                className={`flex items-center justify-between gap-4 px-5 py-4 ${idx < arr.length - 1 ? "border-b border-[#f7f7f7]" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{STATUS_ICON[integration.status]}</div>
                  <div>
                    <p className="text-sm font-semibold text-[#0a0a0a]">{integration.name}</p>
                    <p className="text-xs text-[#737373]">{integration.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_CLASS[integration.status]}`}>
                    {STATUS_LABEL[integration.status]}
                  </span>
                  <button className="rounded-lg border border-[#e5e5e5] px-3 py-1.5 text-xs font-medium text-[#0a0a0a] hover:bg-[#f7f7f7] transition-colors">
                    {integration.status === "connected" ? "Manage" : "Connect"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Domain & SSO */}
      <div className="rounded-xl border border-[#e5e5e5] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 border-b border-[#f0f0f0] px-5 py-4">
          <Globe className="h-4 w-4 text-[#a3a3a3]" />
          <h2 className="text-sm font-semibold text-[#0a0a0a]">Domain & SSO</h2>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className={LABEL}>Verified domain</label>
            <div className="flex gap-2">
              <input className={`${INPUT} flex-1`} placeholder="yourcompany.com" />
              <button className="rounded-lg border border-[#e5e5e5] px-4 py-2 text-xs font-medium text-[#0a0a0a] hover:bg-[#f7f7f7] transition-colors whitespace-nowrap">
                Verify domain
              </button>
            </div>
            <p className="mt-1.5 text-[11px] text-[#a3a3a3]">Employees with this email domain can auto-join your workspace.</p>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-[#e5e5e5] p-4">
            <div>
              <p className="text-sm font-semibold text-[#0a0a0a]">SAML SSO</p>
              <p className="text-xs text-[#737373]">Single sign-on via your identity provider (Okta, Google Workspace, Azure AD).</p>
            </div>
            <span className="rounded-full bg-[#f0f0f0] px-2.5 py-0.5 text-[11px] font-medium text-[#737373]">Enterprise plan</span>
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="rounded-xl border border-red-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-red-100 bg-red-50 px-5 py-4">
          <h2 className="text-sm font-semibold text-red-700">Danger zone</h2>
        </div>
        <div className="flex items-center justify-between gap-4 p-5">
          <div>
            <p className="text-sm font-semibold text-[#0a0a0a]">Delete workspace</p>
            <p className="text-xs text-[#737373]">Permanently delete this workspace and all data. This cannot be undone.</p>
          </div>
          <button className="rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap">
            Delete workspace
          </button>
        </div>
      </div>
    </div>
  );
}
