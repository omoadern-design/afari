import {
  Activity,
  Check,
  Compass,
  Users,
  Shield,
  Wallet,
  Settings,
} from "@/components/icons";
import type { ShellNavItem } from "./AppShell";

export function adminNav(active: string, pendingCount: number = 0): ShellNavItem[] {
  return [
    { href: "/admin/dashboard", label: "Movement", icon: <Activity size={18} />, active: active === "dashboard" },
    {
      href: "/admin/approvals",
      label: "Approvals",
      icon: <Check size={18} />,
      badge: pendingCount,
      active: active === "approvals",
    },
    {
      href: "/admin/trips",
      label: "All trips",
      icon: <Compass size={18} />,
      active: active === "trips",
    },
    {
      href: "/admin/employees",
      label: "Employees",
      icon: <Users size={18} />,
      active: active === "employees",
    },
    {
      href: "/admin/policies",
      label: "Policies",
      icon: <Shield size={18} />,
      active: active === "policies",
    },
    {
      href: "/admin/budgets",
      label: "Budgets",
      icon: <Wallet size={18} />,
      active: active === "budgets",
    },
    {
      href: "/admin/settings",
      label: "Settings",
      icon: <Settings size={18} />,
      active: active === "settings",
    },
  ];
}
