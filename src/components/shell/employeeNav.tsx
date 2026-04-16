import { Compass, Calendar, Receipt, Wallet, Settings } from "@/components/icons";
import type { ShellNavItem } from "./AppShell";

export function employeeNav(active: string): ShellNavItem[] {
  return [
    { href: "/home", label: "Home", icon: <Compass size={18} />, active: active === "home" },
    {
      href: "/trips/new",
      label: "Plan a trip",
      icon: <Calendar size={18} />,
      active: active === "new",
    },
    {
      href: "/trips",
      label: "My trips",
      icon: <Compass size={18} />,
      active: active === "trips",
    },
    {
      href: "/expenses",
      label: "Expenses",
      icon: <Receipt size={18} />,
      active: active === "expenses",
    },
    {
      href: "/wallet",
      label: "Wallet",
      icon: <Wallet size={18} />,
      active: active === "wallet",
    },
    {
      href: "/settings",
      label: "Settings",
      icon: <Settings size={18} />,
      active: active === "settings",
    },
  ];
}
