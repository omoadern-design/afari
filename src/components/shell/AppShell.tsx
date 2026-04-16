import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Avatar } from "@/components/ui/Avatar";
import { Bell, Search } from "@/components/icons";
import { cn } from "@/lib/cn";

export type ShellNavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
  active?: boolean;
};

export function AppShell({
  scope,
  scopeName,
  nav,
  user,
  children,
}: {
  scope: "Employee" | "Admin" | "Finance";
  scopeName: string;
  nav: ShellNavItem[];
  user: { name: string; jobTitle: string };
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-paper">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-sand-200 bg-white sticky top-0 h-screen">
          <div className="px-6 py-6 border-b border-sand-200">
            <Logo />
            <div className="mt-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-navy-400">
                {scope}
              </div>
              <div className="mt-1 text-sm font-medium text-navy-800 truncate">
                {scopeName}
              </div>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                  item.active
                    ? "bg-navy-50 text-navy-800 font-medium"
                    : "text-navy-600 hover:bg-sand-50 hover:text-navy-800"
                )}
              >
                <span
                  className={cn(
                    item.active ? "text-terracotta-500" : "text-navy-400"
                  )}
                >
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs",
                      typeof item.badge === "number" && item.badge > 0
                        ? "bg-terracotta-100 text-terracotta-700"
                        : "bg-sand-100 text-navy-500"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          <div className="border-t border-sand-200 p-4">
            <Link
              href="/login"
              className="flex items-center gap-3 rounded-xl p-2 hover:bg-sand-50"
            >
              <Avatar name={user.name} size={36} />
              <div className="min-w-0">
                <div className="text-sm font-medium text-navy-800 truncate">
                  {user.name}
                </div>
                <div className="text-xs text-navy-500 truncate">
                  {user.jobTitle}
                </div>
              </div>
            </Link>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-20 bg-paper/80 backdrop-blur-md border-b border-sand-200">
            <div className="flex items-center justify-between px-6 lg:px-10 h-16">
              <div className="lg:hidden">
                <Logo />
              </div>
              <div className="flex-1 max-w-md hidden lg:block">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400"
                  />
                  <input
                    type="search"
                    placeholder="Search trips, travelers, expenses, policies"
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-white border border-sand-200 text-sm placeholder:text-navy-400 focus:outline-none focus:border-terracotta-300"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="relative h-10 w-10 inline-flex items-center justify-center rounded-xl border border-sand-200 bg-white text-navy-600 hover:text-navy-800"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-terracotta-400 ring-2 ring-paper" />
                </button>
                <Avatar name={user.name} size={36} />
              </div>
            </div>
          </header>
          <main className="px-6 lg:px-10 py-8 lg:py-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
