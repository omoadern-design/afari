import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function getPolicyBadgeConfig(result: string) {
  switch (result) {
    case "IN_POLICY":
      return {
        label: "In Policy",
        className: "bg-emerald-100 text-emerald-700 border-emerald-200",
      };
    case "OUT_OF_POLICY":
      return {
        label: "Out of Policy",
        className: "bg-amber-100 text-amber-700 border-amber-200",
      };
    case "REQUIRES_APPROVAL":
      return {
        label: "Needs Approval",
        className: "bg-orange-100 text-orange-700 border-orange-200",
      };
    case "BLOCKED":
      return {
        label: "Blocked",
        className: "bg-red-100 text-red-700 border-red-200",
      };
    default:
      return {
        label: result,
        className: "bg-slate-100 text-slate-700 border-slate-200",
      };
  }
}

export function getStatusBadgeConfig(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    DRAFT: { label: "Draft", className: "bg-slate-100 text-slate-600" },
    SUBMITTED: { label: "Submitted", className: "bg-blue-100 text-blue-700" },
    PENDING_APPROVAL: { label: "Pending Approval", className: "bg-amber-100 text-amber-700" },
    APPROVED: { label: "Approved", className: "bg-emerald-100 text-emerald-700" },
    CONFIRMED: { label: "Confirmed", className: "bg-emerald-100 text-emerald-700" },
    REJECTED: { label: "Rejected", className: "bg-red-100 text-red-700" },
    CANCELLED: { label: "Cancelled", className: "bg-slate-100 text-slate-500" },
    COMPLETED: { label: "Completed", className: "bg-indigo-100 text-indigo-700" },
    PAID: { label: "Paid", className: "bg-emerald-100 text-emerald-700" },
    FLAGGED: { label: "Flagged", className: "bg-red-100 text-red-700" },
    PENDING: { label: "Pending", className: "bg-amber-100 text-amber-700" },
    ESCALATED: { label: "Escalated", className: "bg-purple-100 text-purple-700" },
  };
  return map[status] ?? { label: status, className: "bg-slate-100 text-slate-600" };
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? singular + "s");
}
