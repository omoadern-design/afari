import { getStatusBadgeConfig } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ExpenseStatusBadgeProps {
  status: string;
  className?: string;
}

export function ExpenseStatusBadge({ status, className }: ExpenseStatusBadgeProps) {
  const config = getStatusBadgeConfig(status);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
