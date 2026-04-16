import { cn } from "@/lib/cn";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between mb-8",
        className
      )}
    >
      <div>
        {eyebrow && (
          <div className="text-xs uppercase tracking-[0.2em] text-navy-500 mb-2">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-display-3 text-navy-800 text-balance">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-navy-600 text-base lg:text-lg max-w-2xl text-pretty">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 flex-wrap">{actions}</div>}
    </div>
  );
}
