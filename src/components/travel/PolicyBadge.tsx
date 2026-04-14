"use client";

import { useState } from "react";
import { CheckCircle, AlertTriangle, Clock, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import { cn, getPolicyBadgeConfig } from "@/lib/utils";
import type { PolicyResult } from "@/types/travel";

interface PolicyBadgeProps {
  result: PolicyResult;
  violations?: string[];
  size?: "sm" | "md";
}

const icons: Record<PolicyResult, React.ComponentType<{ className?: string }>> = {
  IN_POLICY: CheckCircle,
  OUT_OF_POLICY: AlertTriangle,
  REQUIRES_APPROVAL: Clock,
  BLOCKED: XCircle,
};

export function PolicyBadge({ result, violations = [], size = "md" }: PolicyBadgeProps) {
  const [expanded, setExpanded] = useState(false);
  const config = getPolicyBadgeConfig(result);
  const Icon = icons[result];
  const hasViolations = violations.length > 0;

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={hasViolations ? () => setExpanded((v) => !v) : undefined}
        className={cn(
          "inline-flex items-center gap-1 rounded-full border font-medium transition-colors",
          config.className,
          size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs",
          hasViolations ? "cursor-pointer hover:opacity-80" : "cursor-default"
        )}
        aria-expanded={hasViolations ? expanded : undefined}
      >
        <Icon className={cn(size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5")} />
        <span>{config.label}</span>
        {hasViolations && (
          expanded
            ? <ChevronUp className={cn(size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3")} />
            : <ChevronDown className={cn(size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3")} />
        )}
      </button>

      {hasViolations && expanded && (
        <div
          className={cn(
            "w-64 rounded-lg border bg-white p-3 shadow-lg",
            result === "BLOCKED"
              ? "border-red-200"
              : result === "REQUIRES_APPROVAL"
              ? "border-orange-200"
              : "border-amber-200"
          )}
        >
          <p className="mb-1.5 text-xs font-semibold text-slate-700">Policy Violations</p>
          <ul className="space-y-1">
            {violations.map((v, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
