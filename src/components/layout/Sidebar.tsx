"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Plane, Receipt, CheckSquare,
  BarChart3, Shield, Users, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { AfariLogo } from "@/components/icons/AfariLogo";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
  badge?: number;
}

interface SidebarProps {
  role: string;
  pendingApprovals?: number;
}

export function Sidebar({ role, pendingApprovals }: SidebarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard",  icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/travel",    label: "Plan a Trip", icon: <Plane className="h-4 w-4" /> },
    { href: "/expenses",  label: "Expenses",    icon: <Receipt className="h-4 w-4" /> },
    {
      href: "/approvals", label: "Approvals",   icon: <CheckSquare className="h-4 w-4" />,
      roles: ["MANAGER", "FINANCE", "ADMIN"],   badge: pendingApprovals,
    },
    { href: "/finance",        label: "Finance",  icon: <BarChart3 className="h-4 w-4" />, roles: ["FINANCE", "ADMIN"] },
    { href: "/admin/policies", label: "Policies", icon: <Shield className="h-4 w-4" />,    roles: ["ADMIN"] },
    { href: "/admin/users",    label: "Users",    icon: <Users className="h-4 w-4" />,      roles: ["ADMIN"] },
  ];

  const visibleItems = navItems.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <aside className="flex h-screen w-[212px] shrink-0 flex-col bg-[#0a0a0a]">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-white/[0.07] px-5">
        <AfariLogo size={30} variant="dark" />
        <div className="leading-none">
          <p className="text-[14px] font-bold tracking-tight text-white">AFARI</p>
          <p className="text-[10px] text-white/30 mt-0.5">Work Smart. Travel Easy.</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col overflow-y-auto px-3 py-3">
        <div className="space-y-0.5">
          {visibleItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center justify-between gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-white/[0.10] text-white"
                    : "text-white/50 hover:bg-white/[0.05] hover:text-white/80"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-white" />
                )}
                <span className="flex items-center gap-2.5">
                  {item.icon}
                  {item.label}
                </span>
                {item.badge && item.badge > 0 ? (
                  <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-[#0a0a0a]">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto border-t border-white/[0.07] pt-3">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium text-white/40 transition-colors hover:bg-white/[0.05] hover:text-white/70"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Role pill */}
      <div className="border-t border-white/[0.07] px-5 py-3">
        <span className="text-[11px] font-medium text-white/25">
          {role.charAt(0) + role.slice(1).toLowerCase()} account
        </span>
      </div>
    </aside>
  );
}
