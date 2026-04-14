"use client";

import { Bell, Search } from "lucide-react";
import { initials } from "@/lib/utils";

interface TopBarProps {
  user: {
    name: string;
    email: string;
    role: string;
    avatarUrl?: string | null;
  };
  unreadNotifications?: number;
  title?: string;
}

export function TopBar({ user, unreadNotifications = 0, title }: TopBarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#e5e9f0] bg-white px-6">
      {/* Left — page title or search */}
      <div className="flex flex-1 items-center gap-4">
        {title && (
          <h1 className="text-sm font-semibold text-[#0c1d3d]">{title}</h1>
        )}
        {/* Search */}
        <div className="relative hidden max-w-xs flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9aa3b5]" />
          <input
            type="search"
            placeholder="Search trips, expenses…"
            className="h-8 w-full rounded-lg border border-[#e5e9f0] bg-[#f4f6f9] pl-8 pr-3 text-xs text-[#0c1d3d] placeholder:text-[#9aa3b5] transition-colors focus:border-[#1dbd80]/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1dbd80]/15"
          />
        </div>
      </div>

      {/* Right — notifications + user */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7a99] transition-colors hover:bg-[#f4f6f9] hover:text-[#0c1d3d]">
          <Bell className="h-4 w-4" />
          {unreadNotifications > 0 && (
            <span className="absolute right-1 top-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[#1dbd80] px-0.5 text-[9px] font-bold text-white">
              {unreadNotifications > 9 ? "9+" : unreadNotifications}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="h-5 w-px bg-[#e5e9f0]" />

        {/* User avatar + name */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1dbd80]/15 text-xs font-bold text-[#1dbd80]">
            {initials(user.name)}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold leading-tight text-[#0c1d3d]">{user.name}</p>
            <p className="text-[11px] leading-tight text-[#9aa3b5]">{user.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
