import type { Metadata } from "next";
import { StubPage } from "@/components/shell/Stub";
import { financeNav } from "@/components/shell/financeNav";
import { store } from "@/lib/mock/store";

export const metadata: Metadata = { title: "Exports" };

export default function ExportsPage() {
  const me = store.user("usr_thandi")!;
  return (
    <StubPage
      scope="Finance"
      scopeName={store.org.name}
      nav={financeNav("exports")}
      user={{ name: `${me.firstName} ${me.lastName}`, jobTitle: me.jobTitle }}
      eyebrow="Exports & GL sync"
      title="Push to your accounting system"
      subtitle="QuickBooks, Xero, Sage, SAP."
      body="Phase 5 ships native two-way GL sync. Today, scheduled CSV / XLSX / PDF exports cover the same ground."
    />
  );
}
