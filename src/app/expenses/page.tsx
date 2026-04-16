import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { employeeNav } from "@/components/shell/employeeNav";
import { PageHeader } from "@/components/shell/PageHeader";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Camera,
  Receipt,
  ChevronRight,
  Plane,
  Hotel,
  Coffee,
  Car,
  Sparkles,
  Check,
  Download,
} from "@/components/icons";
import { store } from "@/lib/mock/store";
import { formatDate, formatMoney } from "@/lib/format";
import type { ExpenseCategory } from "@/lib/mock/types";

export const metadata: Metadata = { title: "Expenses" };

const categoryIcons: Record<ExpenseCategory, React.ReactNode> = {
  flight: <Plane size={16} />,
  hotel: <Hotel size={16} />,
  meals: <Coffee size={16} />,
  ground_transport: <Car size={16} />,
  other: <Receipt size={16} />,
};

const categoryLabels: Record<ExpenseCategory, string> = {
  flight: "Flights",
  hotel: "Hotels",
  meals: "Meals",
  ground_transport: "Ground transport",
  other: "Other",
};

export default function ExpensesPage() {
  // Show as Aminata, who has a submitted report.
  const me = store.user("usr_aminata")!;
  const reports = store.expenseReportsForUser(me.id);
  const open = reports.find((r) => r.status === "submitted") ?? reports[0];

  return (
    <AppShell
      scope="Employee"
      scopeName={store.org.name}
      nav={employeeNav("expenses")}
      user={{ name: `${me.firstName} ${me.lastName}`, jobTitle: me.jobTitle }}
    >
      <PageHeader
        eyebrow="Expenses"
        title="Snap. File. Done."
        subtitle="Drop in a receipt — AFARI handles the merchant, the currency, the category, and the right report."
        actions={
          <>
            <Button variant="outline" iconLeft={<Download size={14} />}>
              Export CSV
            </Button>
            <Button iconLeft={<Camera size={16} />}>Scan a receipt</Button>
          </>
        }
      />

      {/* Drop zone */}
      <Card className="mb-8 border-dashed border-sand-300 bg-sand-50">
        <CardBody className="p-8 lg:p-10 flex flex-col lg:flex-row items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-white border border-sand-200 flex items-center justify-center text-terracotta-500">
            <Camera size={28} />
          </div>
          <div className="flex-1 text-center lg:text-left">
            <div className="font-display text-xl text-navy-800">
              Drop a receipt or take a photo
            </div>
            <p className="text-sm text-navy-600 mt-1">
              We'll extract amount, date, merchant and currency — and file it
              against the right trip automatically.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline">Upload PDF</Button>
            <Button iconLeft={<Camera size={16} />}>Scan receipt</Button>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {open && (
            <Card>
              <CardHeader className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.2em] text-navy-500">
                    {open.reference}
                  </div>
                  <CardTitle className="mt-1">
                    Trip · {store.trip(open.tripId)?.originCity} → {store.trip(open.tripId)?.destinationCity}
                  </CardTitle>
                </div>
                <Badge tone={statusTone(open.status)} dot>
                  {open.status.replace("_", " ")}
                </Badge>
              </CardHeader>
              <CardBody className="space-y-3">
                {open.expenses.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center gap-4 p-3 rounded-xl border border-sand-200 hover:border-navy-300 transition-colors"
                  >
                    <div className="h-10 w-10 rounded-lg bg-sand-100 text-navy-700 flex items-center justify-center">
                      {categoryIcons[e.category]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-navy-800 truncate">
                        {e.merchant}
                      </div>
                      <div className="text-xs text-navy-500 truncate">
                        {categoryLabels[e.category]} · {formatDate(e.expenseDate)}
                        {e.description && ` · ${e.description}`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-navy-800">
                        {formatMoney(e.amount, e.currency)}
                      </div>
                      {e.policyCompliant ? (
                        <div className="text-xs text-emerald-700 flex items-center gap-1 justify-end">
                          <Check size={12} /> In policy
                        </div>
                      ) : (
                        <div className="text-xs text-amber-700 flex items-center gap-1 justify-end">
                          Over policy
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </CardBody>
              <div className="border-t border-sand-200 px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-navy-500">
                  Total{" "}
                  <span className="text-navy-800 font-medium">
                    {formatMoney(open.totalAmount, open.currency)}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline">Save</Button>
                  <Button>Submit report</Button>
                </div>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Recent reports</CardTitle>
            </CardHeader>
            <CardBody className="p-0 divide-y divide-sand-200">
              {reports.map((r) => {
                const trip = store.trip(r.tripId);
                return (
                  <Link
                    key={r.id}
                    href="#"
                    className="flex items-center gap-4 p-5 hover:bg-sand-50"
                  >
                    <div className="h-10 w-10 rounded-xl bg-sand-100 text-navy-700 flex items-center justify-center">
                      <Receipt size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-navy-800 truncate">
                        {r.reference} · {trip?.originCity} → {trip?.destinationCity}
                      </div>
                      <div className="text-xs text-navy-500">
                        {r.expenses.length} items
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-navy-800">
                        {formatMoney(r.totalAmount, r.currency)}
                      </div>
                      <Badge tone={statusTone(r.status)} className="mt-1">
                        {r.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <ChevronRight size={16} className="text-navy-400" />
                  </Link>
                );
              })}
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>How AFARI files receipts</CardTitle>
            </CardHeader>
            <CardBody className="space-y-4 text-sm text-navy-600">
              <Step n={1} title="OCR extracts the data">
                Merchant, amount, currency, tax, date — pulled from the
                receipt with AWS Textract.
              </Step>
              <Step n={2} title="Categorize automatically">
                Our classifier picks meals, transport, lodging, or other —
                then you confirm with one tap.
              </Step>
              <Step n={3} title="Convert at the day's FX">
                Multi-currency settled to your base currency using the
                day's mid-market rate.
              </Step>
              <Step n={4} title="File to the right trip">
                Matched by date, location, and traveler. No manual sorting.
              </Step>
            </CardBody>
          </Card>

          <Card className="bg-navy-800 text-white border-navy-800">
            <CardBody className="p-6">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-terracotta-300" />
                <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                  Tip
                </div>
              </div>
              <p className="mt-3 text-white/85 text-sm leading-relaxed">
                Forward receipts to{" "}
                <span className="text-terracotta-300 font-medium">
                  receipts@{store.org.slug}.afari.travel
                </span>{" "}
                — AFARI files them while you're still in the meeting.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="h-7 w-7 rounded-full bg-terracotta-50 text-terracotta-700 flex items-center justify-center text-xs font-medium shrink-0">
        {n}
      </div>
      <div>
        <div className="text-sm font-medium text-navy-800">{title}</div>
        <div className="mt-0.5 text-xs leading-relaxed text-navy-500">{children}</div>
      </div>
    </div>
  );
}

type Tone = "neutral" | "amber" | "emerald" | "navy" | "ruby";
function statusTone(status: string): Tone {
  switch (status) {
    case "submitted":
    case "under_review":
      return "amber";
    case "approved":
    case "reimbursed":
      return "emerald";
    case "rejected":
      return "ruby";
    default:
      return "neutral";
  }
}
