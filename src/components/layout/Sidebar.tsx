"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plane,
  Receipt,
  CheckSquare,
  BarChart3,
  Shield,
  Users,
  LogOut,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

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
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      href: "/travel",
      label: "Book Travel",
      icon: <Plane className="h-4 w-4" />,
    },
    {
      href: "/expenses",
      label: "Expenses",
      icon: <Receipt className="h-4 w-4" />,
    },
    {
      href: "/approvals",
      label: "Approvals",
      icon: <CheckSquare className="h-4 w-4" />,
      roles: ["MANAGER", "FINANCE", "ADMIN"],
      badge: pendingApprovals,
    },
    {
      href: "/finance",
      label: "Finance",
      icon: <BarChart3 className="h-4 w-4" />,
      roles: ["FINANCE", "ADMIN"],
    },
    {
      href: "/admin/policies",
      label: "Policies",
      icon: <Shield className="h-4 w-4" />,
      roles: ["ADMIN"],
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: <Users className="h-4 w-4" />,
      roles: ["ADMIN"],
    },
  ];

  const mainItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  const roleLabel =
    role === "ADMIN"
      ? "Admin"
      : role === "FINANCE"
      ? "Finance"
      : role === "MANAGER"
      ? "Manager"
      : "Employee";

  return (
    <aside className="flex h-screen w-[220px] shrink-0 flex-col bg-[#0b1d35]">
      {/* ── Logo ── */}
      <div className="flex h-14 items-center gap-2.5 border-b border-white/[0.06] px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1dbd80]">
          <Compass className="h-4 w-4 text-white" />
        </div>
        <div className="leading-none">
          <span className="text-[15px] font-bold tracking-tight text-white">afari</span>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
        {/* Main items */}
        <div className="space-y-0.5">
          {mainItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-white/[0.08] text-white"
                    : "text-[#8da0bb] hover:bg-white/[0.04] hover:text-white/90"
                )}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full bg-[#1dbd80]" />
                )}
                <span className="flex items-center gap-2.5">
                  <span className={cn(isActive ? "text-[#1dbd80]" : "text-current")}>
                    {item.icon}
                  </span>
                  {item.label}
                </span>
                {item.badge && item.badge > 0 ? (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#1dbd80] px-1.5 text-[11px] font-bold text-white">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>

        {/* Spacer + bottom section */}
        <div className="mt-auto pt-4 border-t border-white/[0.06]">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-[#8da0bb] transition-all hover:bg-white/[0.04] hover:text-white/90"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </nav>

      {/* ── Role pill ── */}
      <div className="border-t border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              role === "ADMIN"
                ? "bg-purple-400"
                : role === "FINANCE"
                ? "bg-[#1dbd80]"
                : role === "MANAGER"
                ? "bg-blue-400"
                : "bg-slate-500"
            )}
          />
          <span className="text-[11px] font-medium text-[#4a5e80]">{roleLabel}</span>
        </div>
      </div>
    </aside>
  );
}
