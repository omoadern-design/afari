import {
  Activity,
  Receipt,
  Wallet,
  TrendingUp,
  Download,
} from "@/components/icons";
import type { ShellNavItem } from "./AppShell";

export function financeNav(active: string): ShellNavItem[] {
  return [
    { href: "/finance/dashboard", label: "Overview", icon: <Activity size={18} />, active: active === "dashboard" },
    {
      href: "/finance/expenses",
      label: "Expense reports",
      icon: <Receipt size={18} />,
      active: active === "expenses",
    },
    {
      href: "/finance/reimbursements",
      label: "Reimbursements",
      icon: <Wallet size={18} />,
      active: active === "reimbursements",
    },
    {
      href: "/finance/reports",
      label: "Reporting",
      icon: <TrendingUp size={18} />,
      active: active === "reports",
    },
    {
      href: "/finance/exports",
      label: "Exports",
      icon: <Download size={18} />,
      active: active === "exports",
    },
  ];
}
