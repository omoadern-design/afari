"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Menu, Close } from "@/components/icons";
import type { ShellNavItem } from "./AppShell";
import { cn } from "@/lib/cn";

export function MobileNav({
  scope,
  scopeName,
  nav,
}: {
  scope: string;
  scopeName: string;
  nav: ShellNavItem[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setOpen(true)}
        className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-sand-200 bg-white text-navy-700 hover:text-navy-900"
      >
        <Menu size={18} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <aside
            className={cn(
              "absolute inset-y-0 left-0 w-[78%] max-w-sm bg-white border-r border-sand-200 shadow-lift flex flex-col",
              "animate-fade-in-up"
            )}
          >
            <div className="flex items-center justify-between px-5 py-5 border-b border-sand-200">
              <Logo href="#" />
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
                className="h-9 w-9 inline-flex items-center justify-center rounded-xl border border-sand-200 text-navy-700"
              >
                <Close size={16} />
              </button>
            </div>
            <div className="px-5 py-4 border-b border-sand-200">
              <div className="text-[10px] uppercase tracking-[0.18em] text-navy-400">
                {scope}
              </div>
              <div className="text-sm font-medium text-navy-800 truncate">
                {scopeName}
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-sm",
                    item.active
                      ? "bg-navy-50 text-navy-800 font-medium"
                      : "text-navy-600 hover:bg-sand-50"
                  )}
                >
                  <span
                    className={item.active ? "text-terracotta-500" : "text-navy-400"}
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
          </aside>
        </div>
      )}
    </>
  );
}
