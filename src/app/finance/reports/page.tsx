import type { Metadata } from "next";
import { StubPage } from "@/components/shell/Stub";
import { financeNav } from "@/components/shell/financeNav";
import { store } from "@/lib/mock/store";

export const metadata: Metadata = { title: "Reporting" };

export default function FinanceReportsPage() {
  const me = store.user("usr_thandi")!;
  return (
    <StubPage
      scope="Finance"
      scopeName={store.org.name}
      nav={financeNav("reports")}
      user={{ name: `${me.firstName} ${me.lastName}`, jobTitle: me.jobTitle }}
      eyebrow="Custom reporting"
      title="Build the report you need."
      subtitle="Slice spend by traveler, route, project, cost center, or policy compliance."
      body="The full report builder is coming in Phase 4 — natural-language queries pivoted on top of ClickHouse. For now, you can export Q2 in CSV or XLSX from the overview."
      cta={{ href: "/finance/dashboard", label: "Back to overview" }}
    />
  );
}
