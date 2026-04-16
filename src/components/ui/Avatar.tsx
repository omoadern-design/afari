import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

const palette = [
  "bg-terracotta-200 text-terracotta-700",
  "bg-navy-100 text-navy-700",
  "bg-emerald-soft text-emerald-700",
  "bg-amber-soft text-amber-700",
  "bg-sand-200 text-sand-500",
];

function pickColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return palette[Math.abs(hash) % palette.length];
}

export function Avatar({
  name,
  size = 36,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const colorClasses = pickColor(name);
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-medium tracking-tight select-none",
        colorClasses,
        className
      )}
      style={{ width: size, height: size, fontSize: Math.max(11, size * 0.38) }}
      aria-label={name}
    >
      {initials(name)}
    </span>
  );
}

export function AvatarGroup({
  names,
  size = 28,
  max = 4,
}: {
  names: string[];
  size?: number;
  max?: number;
}) {
  const visible = names.slice(0, max);
  const overflow = names.length - visible.length;
  return (
    <div className="flex -space-x-2">
      {visible.map((n) => (
        <span key={n} className="ring-2 ring-white rounded-full">
          <Avatar name={n} size={size} />
        </span>
      ))}
      {overflow > 0 && (
        <span
          className="ring-2 ring-white rounded-full inline-flex items-center justify-center bg-sand-100 text-navy-700 text-xs font-medium"
          style={{ width: size, height: size }}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
