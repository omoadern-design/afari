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
  Settings,
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

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-slate-200 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-700">
          <Compass className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="text-base font-bold text-slate-900">afari</span>
          <span className="ml-1 text-xs text-slate-400">travel</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {visibleItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <span className="flex items-center gap-3">
                  {item.icon}
                  {item.label}
                </span>
                {item.badge && item.badge > 0 ? (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-700 px-1.5 text-xs font-semibold text-white">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 border-t border-slate-100 pt-4">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Account
          </p>
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </nav>

      {/* Role badge */}
      <div className="border-t border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              role === "ADMIN"
                ? "bg-purple-500"
                : role === "FINANCE"
                ? "bg-emerald-500"
                : role === "MANAGER"
                ? "bg-blue-500"
                : "bg-slate-400"
            )}
          />
          <span className="text-xs text-slate-500 capitalize">{role.toLowerCase()}</span>
        </div>
      </div>
    </aside>
  );
}
