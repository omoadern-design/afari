"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";

interface DashboardShellProps {
  role: string;
  pendingApprovals: number;
  user: { name: string; email: string; role: string; avatarUrl?: string | null };
  unreadNotifications: number;
  children: React.ReactNode;
}

export function DashboardShell({
  role,
  pendingApprovals,
  user,
  unreadNotifications,
  children,
}: DashboardShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f7f7f7]">
      {/* Desktop sidebar — hidden on mobile */}
      <Sidebar role={role} pendingApprovals={pendingApprovals} />

      {/* Mobile nav drawer */}
      <MobileNav
        role={role}
        pendingApprovals={pendingApprovals}
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar
          user={user}
          unreadNotifications={unreadNotifications}
          onMenuOpen={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
