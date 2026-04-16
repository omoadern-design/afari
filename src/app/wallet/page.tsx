import type { Metadata } from "next";
import { StubPage } from "@/components/shell/Stub";
import { employeeNav } from "@/components/shell/employeeNav";
import { store } from "@/lib/mock/store";

export const metadata: Metadata = { title: "Wallet" };

export default function WalletPage() {
  const me = store.user("usr_femi")!;
  return (
    <StubPage
      scope="Employee"
      scopeName={store.org.name}
      nav={employeeNav("wallet")}
      user={{ name: `${me.firstName} ${me.lastName}`, jobTitle: me.jobTitle }}
      eyebrow="Wallet"
      title="Cards, per-diems, and reimbursements."
      subtitle="A single place for everything financial about your travel."
      body="Phase 5 brings virtual corporate cards, instant per-diem load, and direct deposit reimbursements via Paystack and Flutterwave."
      cta={{ href: "/expenses", label: "Open expenses" }}
    />
  );
}
