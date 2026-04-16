"use client";

import { Bell, Search, Menu } from "lucide-react";
import { initials } from "@/lib/utils";

interface TopBarProps {
  user: { name: string; email: string; role: string; avatarUrl?: string | null };
  unreadNotifications?: number;
  title?: string;
  onMenuOpen?: () => void;
}

export function TopBar({ user, unreadNotifications = 0, title, onMenuOpen }: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#e5e5e5] bg-white px-4 lg:px-6">
      {/* Left */}
      <div className="flex flex-1 items-center gap-3">
        {/* Mobile hamburger */}
        <button
          onClick={onMenuOpen}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[#737373] transition-colors hover:bg-[#f0f0f0] hover:text-[#0a0a0a] lg:hidden"
          aria-label="Open navigation"
        >
          <Menu className="h-4 w-4" />
        </button>

        {title && <h1 className="text-sm font-semibold text-[#0a0a0a]">{title}</h1>}
        <div className="relative hidden max-w-xs flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#a3a3a3]" />
          <input
            type="search"
            placeholder="Search trips, expenses…"
            className="h-8 w-full rounded-lg border border-[#e5e5e5] bg-[#f7f7f7] pl-8 pr-3 text-xs text-[#0a0a0a] placeholder:text-[#a3a3a3] focus:border-[#0a0a0a]/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0a0a0a]/10 transition-colors"
          />
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-[#737373] hover:bg-[#f0f0f0] hover:text-[#0a0a0a] transition-colors">
          <Bell className="h-4 w-4" />
          {unreadNotifications > 0 && (
            <span className="absolute right-1 top-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[#0a0a0a] px-0.5 text-[9px] font-bold text-white">
              {unreadNotifications > 9 ? "9+" : unreadNotifications}
            </span>
          )}
        </button>
        <div className="h-5 w-px bg-[#e5e5e5]" />
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#0a0a0a] text-[11px] font-bold text-white">
            {initials(user.name)}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold leading-tight text-[#0a0a0a]">{user.name}</p>
            <p className="text-[11px] leading-tight text-[#a3a3a3]">{user.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
