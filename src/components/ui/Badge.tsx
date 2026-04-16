import * as React from "react";
import { cn } from "@/lib/cn";

type Tone =
  | "neutral"
  | "navy"
  | "terracotta"
  | "emerald"
  | "amber"
  | "ruby"
  | "sand";

const tones: Record<Tone, string> = {
  neutral: "bg-sand-100 text-navy-700 border-sand-200",
  navy: "bg-navy-50 text-navy-700 border-navy-100",
  terracotta: "bg-terracotta-50 text-terracotta-700 border-terracotta-100",
  emerald: "bg-emerald-soft text-emerald-700 border-emerald/20",
  amber: "bg-amber-soft text-amber-700 border-amber/20",
  ruby: "bg-ruby-soft text-ruby border-ruby/20",
  sand: "bg-sand-50 text-sand-500 border-sand-200",
};

export function Badge({
  tone = "neutral",
  className,
  children,
  dot = false,
  ...props
}: {
  tone?: Tone;
  dot?: boolean;
} & React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight",
        tones[tone],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            tone === "emerald" && "bg-emerald",
            tone === "amber" && "bg-amber",
            tone === "ruby" && "bg-ruby",
            tone === "terracotta" && "bg-terracotta-400",
            tone === "navy" && "bg-navy-500",
            tone === "neutral" && "bg-navy-400",
            tone === "sand" && "bg-sand-400"
          )}
        />
      )}
      {children}
    </span>
  );
}
