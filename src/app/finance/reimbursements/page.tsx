import type { Metadata } from "next";
import { StubPage } from "@/components/shell/Stub";
import { financeNav } from "@/components/shell/financeNav";
import { store } from "@/lib/mock/store";

export const metadata: Metadata = { title: "Reimbursements" };

export default function ReimbursementsPage() {
  const me = store.user("usr_thandi")!;
  return (
    <StubPage
      scope="Finance"
      scopeName={store.org.name}
      nav={financeNav("reimbursements")}
      user={{ name: `${me.firstName} ${me.lastName}`, jobTitle: me.jobTitle }}
      eyebrow="Payment queue"
      title="Reimbursements"
      subtitle="Approved expense reports queued for payout via Paystack, Flutterwave, or wire."
      body="Phase 3 wires this into your local payment rails. Today, AFARI hands off via SEPA / SWIFT instructions and a daily reconciliation file."
      cta={{ href: "/finance/expenses", label: "Open expense reports" }}
    />
  );
}
