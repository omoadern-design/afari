import type { Metadata } from "next";
import { AppShell } from "@/components/shell/AppShell";
import { financeNav } from "@/components/shell/financeNav";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Filter, Download, Receipt } from "@/components/icons";
import { store } from "@/lib/mock/store";
import { formatDate, formatMoney } from "@/lib/format";

export const metadata: Metadata = { title: "Expense reports" };

export default function FinanceExpensesPage() {
  const me = store.user("usr_thandi")!;
  const reports = store.expenseReports();

  return (
    <AppShell
      scope="Finance"
      scopeName={store.org.name}
      nav={financeNav("expenses")}
      user={{ name: `${me.firstName} ${me.lastName}`, jobTitle: me.jobTitle }}
    >
      <PageHeader
        eyebrow={`${reports.length} reports this quarter`}
        title="Expense reports"
        subtitle="Review, approve, and queue for payout. Auto-flagged exceptions surface first."
        actions={
          <>
            <Button variant="outline" iconLeft={<Filter size={14} />}>
              Filter
            </Button>
            <Button variant="outline" iconLeft={<Download size={14} />}>
              Export
            </Button>
          </>
        }
      />

      <Card>
        <CardBody className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.18em] text-navy-500 border-b border-sand-200">
                <th className="px-5 py-3 font-medium">Report</th>
                <th className="px-5 py-3 font-medium">Person</th>
                <th className="px-5 py-3 font-medium">Trip</th>
                <th className="px-5 py-3 font-medium">Submitted</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Amount</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => {
                const u = store.user(r.userId)!;
                const trip = store.trip(r.tripId);
                return (
                  <tr
                    key={r.id}
                    className="border-b border-sand-200 last:border-0 hover:bg-sand-50"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-sand-100 text-navy-700 flex items-center justify-center">
                          <Receipt size={14} />
                        </div>
                        <div>
                          <div className="font-medium text-navy-800">
                            {r.reference}
                          </div>
                          <div className="text-xs text-navy-500">
                            {r.expenses.length} items
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={`${u.firstName} ${u.lastName}`} size={28} />
                        <span className="text-navy-700">
                          {u.firstName} {u.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-navy-600">
                      {trip ? `${trip.originCity} → ${trip.destinationCity}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-navy-600">
                      {r.submittedAt ? formatDate(r.submittedAt) : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        tone={
                          r.status === "submitted"
                            ? "amber"
                            : r.status === "reimbursed"
                            ? "emerald"
                            : r.status === "approved"
                            ? "navy"
                            : r.status === "rejected"
                            ? "ruby"
                            : "neutral"
                        }
                        dot
                      >
                        {r.status.replace("_", " ")}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-navy-800">
                      {formatMoney(r.totalAmount, r.currency)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {r.status === "submitted" && (
                        <Button size="sm">Review</Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </AppShell>
  );
}
