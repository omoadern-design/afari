import { cn } from "@/lib/cn";

type Status =
  | "draft"
  | "pending_approval"
  | "approved"
  | "declined"
  | "booking"
  | "booked"
  | "in_progress"
  | "completed"
  | "cancelled";

const labelMap: Record<Status, string> = {
  draft: "Draft",
  pending_approval: "Pending approval",
  approved: "Approved",
  declined: "Declined",
  booking: "Booking",
  booked: "Booked",
  in_progress: "In transit",
  completed: "Completed",
  cancelled: "Cancelled",
};

const toneMap: Record<
  Status,
  { dot: string; text: string; bg: string; border: string }
> = {
  draft: { dot: "bg-sand-400", text: "text-sand-500", bg: "bg-sand-50", border: "border-sand-200" },
  pending_approval: { dot: "bg-amber", text: "text-amber-700", bg: "bg-amber-soft", border: "border-amber/20" },
  approved: { dot: "bg-emerald", text: "text-emerald-700", bg: "bg-emerald-soft", border: "border-emerald/20" },
  declined: { dot: "bg-ruby", text: "text-ruby", bg: "bg-ruby-soft", border: "border-ruby/20" },
  booking: { dot: "bg-navy-400", text: "text-navy-700", bg: "bg-navy-50", border: "border-navy-100" },
  booked: { dot: "bg-navy-500", text: "text-navy-700", bg: "bg-navy-50", border: "border-navy-100" },
  in_progress: { dot: "bg-terracotta-400", text: "text-terracotta-700", bg: "bg-terracotta-50", border: "border-terracotta-100" },
  completed: { dot: "bg-navy-400", text: "text-navy-600", bg: "bg-sand-50", border: "border-sand-200" },
  cancelled: { dot: "bg-sand-400", text: "text-sand-500", bg: "bg-sand-50", border: "border-sand-200" },
};

export function StatusPill({
  status,
  className,
  pulse,
}: {
  status: Status;
  className?: string;
  pulse?: boolean;
}) {
  const t = toneMap[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        t.bg,
        t.text,
        t.border,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", t.dot, pulse && "animate-pulse-soft")} />
      {labelMap[status]}
    </span>
  );
}
