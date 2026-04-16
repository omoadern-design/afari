import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";
import { adminNav } from "@/components/shell/adminNav";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PlusCircle, Wallet, TrendingUp, TrendingDown } from "@/components/icons";
import { store } from "@/lib/mock/store";
import { formatDate, formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Budgets" };

export default function BudgetsPage() {
  const me = store.currentUser();
  const budgets = store.budgets();
  const pending = store.pendingApprovals();

  return (
    <AppShell
      scope="Admin"
      scopeName={store.org.name}
      nav={adminNav("budgets", pending.length)}
      user={{ name: `${me.firstName} ${me.lastName}`, jobTitle: me.jobTitle }}
    >
      <PageHeader
        eyebrow={`Q2 2026 · ${budgets.length} active budgets`}
        title="Budgets"
        subtitle="Quarterly travel envelopes by department, project, or team. AFARI keeps spend honest in real time."
        actions={<Button iconLeft={<PlusCircle size={16} />}>New budget</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {budgets.map((b) => {
          const pct = Math.round((b.spent / b.amount) * 100);
          const remaining = b.amount - b.spent;
          const tone = pct < 60 ? "emerald" : pct < 85 ? "amber" : "ruby";
          const bar = tone === "emerald" ? "bg-emerald" : tone === "amber" ? "bg-amber" : "bg-ruby";
          return (
            <Card key={b.id}>
              <CardHeader className="flex items-start justify-between">
                <div>
                  <CardTitle>{b.name}</CardTitle>
                  <div className="mt-1 text-xs text-navy-500">
                    {formatDate(b.startDate)} → {formatDate(b.endDate)}
                  </div>
                </div>
                <Badge tone={tone === "emerald" ? "emerald" : tone === "amber" ? "amber" : "ruby"} dot>
                  {pct}% used
                </Badge>
              </CardHeader>
              <CardBody>
                <div className="flex items-end justify-between">
                  <div>
                    <div className="font-display text-3xl text-navy-800">
                      {formatMoney(b.spent, b.currency)}
                    </div>
                    <div className="text-xs text-navy-500">
                      of {formatMoney(b.amount, b.currency)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-navy-800">
                      {formatMoney(remaining, b.currency)}
                    </div>
                    <div className="text-xs text-navy-500">remaining</div>
                  </div>
                </div>
                <div className="mt-4 h-2 rounded-full bg-sand-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${bar}`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3 text-xs text-navy-500">
                  <Mini icon={<Wallet size={12} />} label="Scope" value={b.scopeName} />
                  <Mini icon={<TrendingUp size={12} />} label="Pace" value="On track" />
                  <Mini icon={<TrendingDown size={12} />} label="vs. Q1" value="−8%" />
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}

function Mini({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-sand-200 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-navy-500">
        {icon} {label}
      </div>
      <div className="mt-1 text-sm font-medium text-navy-800 truncate">{value}</div>
    </div>
  );
}
