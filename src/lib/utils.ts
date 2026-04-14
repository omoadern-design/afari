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
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);
  if (diff < 60)    return "just now";
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function getPolicyBadgeConfig(result: string) {
  switch (result) {
    case "IN_POLICY":        return { label: "In Policy",      className: "bg-[#f0fdf4] text-[#16a34a]" };
    case "OUT_OF_POLICY":    return { label: "Out of Policy",  className: "bg-[#fefce8] text-[#d97706]" };
    case "REQUIRES_APPROVAL":return { label: "Needs Approval", className: "bg-[#fff7ed] text-[#ea580c]" };
    case "BLOCKED":          return { label: "Blocked",        className: "bg-[#fef2f2] text-[#dc2626]" };
    default:                 return { label: result,           className: "bg-[#f0f0f0]  text-[#737373]" };
  }
}

export function getStatusBadgeConfig(status: string) {
  const map: Record<string, { label: string; className: string }> = {
    DRAFT:            { label: "Draft",    className: "bg-[#f0f0f0] text-[#737373]"  },
    SUBMITTED:        { label: "Submitted",className: "bg-[#f0f0f0] text-[#0a0a0a]"  },
    PENDING_APPROVAL: { label: "Pending",  className: "bg-[#fefce8] text-[#d97706]"  },
    APPROVED:         { label: "Approved", className: "bg-[#f0fdf4] text-[#16a34a]"  },
    CONFIRMED:        { label: "Confirmed",className: "bg-[#f0fdf4] text-[#16a34a]"  },
    REJECTED:         { label: "Rejected", className: "bg-[#fef2f2] text-[#dc2626]"  },
    CANCELLED:        { label: "Cancelled",className: "bg-[#f0f0f0] text-[#a3a3a3]"  },
    COMPLETED:        { label: "Completed",className: "bg-[#f0f0f0] text-[#0a0a0a]"  },
    PAID:             { label: "Paid",     className: "bg-[#f0fdf4] text-[#16a34a]"  },
    FLAGGED:          { label: "Flagged",  className: "bg-[#fef2f2] text-[#dc2626]"  },
    PENDING:          { label: "Pending",  className: "bg-[#fefce8] text-[#d97706]"  },
    ESCALATED:        { label: "Escalated",className: "bg-[#fef2f2] text-[#dc2626]"  },
  };
  return map[status] ?? { label: status, className: "bg-[#f0f0f0] text-[#737373]" };
}

export function initials(name: string): string {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural ?? singular + "s");
}
